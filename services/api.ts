import axios from 'axios';
import { 
  MangaDexResponse, 
  MangaDexManga, 
  JikanResponse, 
  JikanManga, 
  EnrichedManga,
  MangaDexCover,
  MangaDexTag,
  SearchOptions,
  MangaDexChapter,
  AtHomeResponse,
  JikanCharacter
} from '../types';

// --- Axios Instances ---

export const mangaDexClient = axios.create({
  baseURL: 'https://api.mangadex.org',
  timeout: 10000,
});

export const jikanClient = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  timeout: 10000,
});

// Helper to delay execution (respect Jikan rate limits: 3 req/sec generally)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    includes: ['cover_art', 'author'], // Added author for better display
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
  return enrichMangaList(mdResponse.data.data);
};

// Trending / Seasonal
export const fetchTrendingManga = async (limit = 10): Promise<EnrichedManga[]> => {
  // MangaDex doesn't have a direct "trending" endpoint, but we can approximate with followedCount + createdAt recency
  // or use their /manga?order[followedCount]=desc&createdAtSince=...
  // For simplicity, we use popular new titles
  const params = {
    limit,
    includes: ['cover_art'],
    order: { followedCount: 'desc' },
    contentRating: ['safe', 'suggestive'],
    hasAvailableChapters: 'true',
  };
  const response = await mangaDexClient.get<MangaDexResponse<MangaDexManga[]>>('/manga', { params });
  return enrichMangaList(response.data.data);
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

  const chapters = response.data.data;
  
  // The 'manga' relationship in chapter response is minimal. 
  // We might want to fetch full manga details or just rely on the relationship data if it has attributes (it usually doesn't in list view).
  // However, `includes: ['manga']` populates the relationship array but NOT attributes in the /chapter endpoint usually.
  // Actually, for /chapter, includes=['manga'] DOES populate relationships.
  
  return chapters.map(ch => {
    const mangaRel = ch.relationships.find(r => r.type === 'manga');
    // We create a partial manga object
    const mangaObj = {
      id: mangaRel?.id || '',
      type: 'manga',
      attributes: mangaRel?.attributes || {}, // Note: Attributes might be missing depending on API version/flags
      relationships: [] 
    } as unknown as MangaDexManga;

    return {
      chapter: ch,
      manga: mangaObj
    };
  });
};

// Enrichment Helper
const enrichMangaList = async (mangaList: MangaDexManga[]): Promise<EnrichedManga[]> => {
  const enrichedPromises = mangaList.map(async (manga, index) => {
    let malData: JikanManga | null = null;
    const malIdStr = manga.attributes.links?.mal;

    const coverRel = manga.relationships.find(r => r.type === 'cover_art');
    let coverUrl: string | undefined;
    if (coverRel && coverRel.attributes) {
        const coverAttributes = coverRel.attributes as unknown as { fileName: string };
        if (coverAttributes?.fileName) {
             coverUrl = getCoverUrl(manga.id, coverAttributes.fileName);
        }
    }

    // Rate limit optimization: Only fetch MAL for top 3 items or specific views to save quota
    // Or skip MAL enrichment for lists to speed up UI
    if (malIdStr && index < 3) { 
      try {
        // Very conservative delay
        await delay(index * 250); 
        const malResponse = await jikanClient.get<JikanResponse<JikanManga>>(`/manga/${malIdStr}`);
        malData = malResponse.data.data;
      } catch (error) {
        // Silently ignore
      }
    }

    return {
      mangadex: manga,
      mal: malData,
      coverUrl,
    };
  });

  return Promise.all(enrichedPromises);
}

export const fetchMangaByIdWithMal = async (id: string): Promise<EnrichedManga> => {
  const mdResponse = await mangaDexClient.get<MangaDexResponse<MangaDexManga>>(`/manga/${id}`, {
    params: { includes: ['cover_art', 'author', 'artist'] }
  });
  
  const manga = mdResponse.data.data;
  const malIdStr = manga.attributes.links?.mal;
  let malData: JikanManga | null = null;

   const coverRel = manga.relationships.find(r => r.type === 'cover_art');
   let coverUrl: string | undefined;
   if (coverRel && coverRel.attributes) {
       const coverAttributes = coverRel.attributes as unknown as { fileName: string };
       if (coverAttributes?.fileName) {
            coverUrl = getCoverUrl(manga.id, coverAttributes.fileName);
       }
   }

  if (malIdStr) {
    try {
      const malResponse = await jikanClient.get<JikanResponse<JikanManga>>(`/manga/${malIdStr}`);
      malData = malResponse.data.data;
    } catch (e) {
      console.warn("MAL fetch failed", e);
    }
  }

  return {
    mangadex: manga,
    mal: malData,
    coverUrl
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

export const fetchMangaCharacters = async (malId: number): Promise<JikanCharacter[]> => {
  const response = await jikanClient.get<JikanResponse<JikanCharacter[]>>(`/manga/${malId}/characters`);
  return response.data.data.slice(0, 15);
};

export const fetchChapterPages = async (chapterId: string): Promise<AtHomeResponse> => {
  const response = await mangaDexClient.get<AtHomeResponse>(`/at-home/server/${chapterId}`);
  return response.data;
};