import axios from 'axios';
import { 
  MangaDexResponse, 
  MangaDexManga, 
  EnrichedManga,
  MangaDexTag,
  SearchOptions,
  MangaDexChapter,
  AtHomeResponse,
  AniListManga,
  AniListCharacter
} from '../types';

// --- Axios Instances ---

// MangaDex requires array params to be serialized as 'key[]=value'
export const mangaDexClient = axios.create({
  baseURL: 'https://api.mangadex.org',
  timeout: 15000,
  paramsSerializer: {
    indexes: null // Result: ids[]=1&ids[]=2
  }
});

export const aniListClient = axios.create({
  baseURL: 'https://graphql.anilist.co',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// --- API Functions ---

export const getCoverUrl = (mangaId: string, fileName: string): string => {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
};

export const getOriginalCoverUrl = (mangaId: string, fileName: string): string => {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
};

export const fetchMangaDexTags = async (): Promise<MangaDexTag[]> => {
  const response = await mangaDexClient.get<MangaDexResponse<MangaDexTag[]>>('/manga/tag');
  return response.data.data;
};

// Search / Discovery
export const searchManga = async (options: SearchOptions = {}): Promise<EnrichedManga[]> => {
  const { title, includedTags, limit = 12, offset = 0 } = options;

  const params: Record<string, any> = {
    limit,
    offset,
    includes: ['cover_art', 'author'], 
    contentRating: ['safe', 'suggestive'], 
    hasAvailableChapters: 'true',
  };

  if (title && title.trim().length > 0) {
    params.title = title;
  }
  
  if (!title && (!includedTags || includedTags.length === 0)) {
     params.order = { followedCount: 'desc' };
  }

  if (includedTags && includedTags.length > 0) {
    params.includedTags = includedTags;
  }

  const mdResponse = await mangaDexClient.get<MangaDexResponse<MangaDexManga[]>>('/manga', { params });
  // We do NOT enrich lists with external data to prevent N+1 and rate limits.
  return mapMangaList(mdResponse.data.data);
};

// Trending
export const fetchTrendingManga = async (limit = 10): Promise<EnrichedManga[]> => {
  const params = {
    limit,
    includes: ['cover_art'],
    order: { followedCount: 'desc' },
    contentRating: ['safe', 'suggestive'],
    hasAvailableChapters: 'true',
    createdAtSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 30 days
  };
  
  const response = await mangaDexClient.get<MangaDexResponse<MangaDexManga[]>>('/manga', { params });
  
  // For trending (Hero Carousel), we CAN enrich a few items to show nice stats
  const enriched = await enrichMangaList(response.data.data.slice(0, 5));
  const rest = mapMangaList(response.data.data.slice(5));
  
  return [...enriched, ...rest];
};

export const fetchRecentChapters = async (limit = 20, offset = 0): Promise<{ chapter: MangaDexChapter, manga: MangaDexManga }[]> => {
  const response = await mangaDexClient.get<MangaDexResponse<MangaDexChapter[]>>('/chapter', {
    params: {
      limit,
      offset,
      translatedLanguage: ['en'],
      order: { readableAt: 'desc' },
      includes: ['manga', 'scanlation_group'],
      contentRating: ['safe', 'suggestive'],
    }
  });

  return response.data.data.map(ch => {
    // The manga relationship typically comes with minimal attributes in list view
    // We try to extract what we can
    const mangaRel = ch.relationships.find(r => r.type === 'manga');
    
    // Create a mock manga object from the relationship data
    const mangaObj = {
      id: mangaRel?.id || '',
      type: 'manga',
      attributes: mangaRel?.attributes || { title: { en: 'Unknown Series' } },
      relationships: [] 
    } as unknown as MangaDexManga;

    return {
      chapter: ch,
      manga: mangaObj
    };
  });
};

// --- Helper: Basic Mapping (No External Calls) ---
const mapMangaList = (mangaList: MangaDexManga[]): EnrichedManga[] => {
    return mangaList.map(manga => {
        const coverRel = manga.relationships.find(r => r.type === 'cover_art');
        let coverUrl: string | undefined;
        if (coverRel && coverRel.attributes) {
            const coverAttributes = coverRel.attributes as unknown as { fileName: string };
            if (coverAttributes?.fileName) {
                coverUrl = getCoverUrl(manga.id, coverAttributes.fileName);
            }
        }
        return {
            mangadex: manga,
            coverUrl,
            anilist: null
        };
    });
};

// --- Helper: Full Enrichment (With AniList) ---
const enrichMangaList = async (mangaList: MangaDexManga[]): Promise<EnrichedManga[]> => {
  return Promise.all(mangaList.map(async (manga) => {
      const basic = mapMangaList([manga])[0];
      const alIdStr = manga.attributes.links?.al;
      
      let anilistData: AniListManga | null = null;

      if (alIdStr) {
          try {
              anilistData = await fetchAniListMangaData(parseInt(alIdStr));
          } catch (e) {
              console.warn(`Failed to fetch AniList for ${manga.id}`);
          }
      }

      return {
          ...basic,
          anilist: anilistData
      };
  }));
}

// --- Detail Fetching ---

export const fetchMangaByIdWithMal = async (id: string): Promise<EnrichedManga> => {
  const mdResponse = await mangaDexClient.get<MangaDexResponse<MangaDexManga>>(`/manga/${id}`, {
    params: { includes: ['cover_art', 'author', 'artist'] }
  });
  
  const manga = mdResponse.data.data;
  const basic = mapMangaList([manga])[0];
  
  // Prefer AniList (al), fallback to MAL (mal) -> AniList search? No, keep simple.
  const alIdStr = manga.attributes.links?.al;
  let anilistData: AniListManga | null = null;

  if (alIdStr) {
    try {
        anilistData = await fetchAniListMangaData(parseInt(alIdStr));
    } catch (e) {
        console.error("AniList Fetch Error", e);
    }
  }

  return {
    ...basic,
    anilist: anilistData
  };
};

export const fetchMangaFeed = async (mangaId: string, limit = 100, offset = 0): Promise<MangaDexChapter[]> => {
  const response = await mangaDexClient.get<MangaDexResponse<MangaDexChapter[]>>(`/manga/${mangaId}/feed`, {
    params: {
      limit,
      offset,
      translatedLanguage: ['en'],
      order: { volume: 'desc', chapter: 'desc' },
      contentRating: ['safe', 'suggestive', 'erotica'],
      includes: ['scanlation_group']
    }
  });
  return response.data.data;
};

export const fetchChapterPages = async (chapterId: string): Promise<AtHomeResponse> => {
  const response = await mangaDexClient.get<AtHomeResponse>(`/at-home/server/${chapterId}`);
  return response.data;
};

// --- AniList GraphQL ---

const fetchAniListMangaData = async (id: number): Promise<AniListManga> => {
    const query = `
    query ($id: Int) {
      Media (id: $id, type: MANGA) {
        id
        title {
          romaji
          english
          native
        }
        description
        averageScore
        favourites
        bannerImage
        characters (sort: ROLE, perPage: 10) {
          edges {
             role
             node {
               name { full }
               image { medium }
             }
          }
        }
      }
    }
    `;
    
    const response = await aniListClient.post('', {
        query,
        variables: { id }
    });

    const media = response.data.data.Media;
    
    // Map characters to flat structure
    const characters = {
        nodes: media.characters.edges.map((edge: any) => ({
            ...edge.node,
            role: edge.role
        })),
        edges: []
    };

    return {
        ...media,
        characters
    };
}