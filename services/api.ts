import axios from 'axios';
import { 
  MangaDexResponse, 
  MangaDexManga, 
  MangaDexChapter,
  AtHomeResponse,
  AniListManga,
  SearchOptions,
  MangaDexTag
} from '../types';

// --- Clients ---

// Custom serializer for MangaDex (requires array[]=value)
const mangaDexParamsSerializer = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  for (const key in params) {
    const value = params[key];
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(`${key}[]`, v));
    } else if (typeof value === 'object' && !(value instanceof Date)) {
       // Handle nested objects like 'order[relevance]=desc'
       for (const subKey in value) {
         if (value[subKey]) {
            searchParams.append(`${key}[${subKey}]`, value[subKey]);
         }
       }
    } else {
      searchParams.append(key, value.toString());
    }
  }
  return searchParams.toString();
};

export const mangaDexClient = axios.create({
  baseURL: 'https://api.mangadex.org',
  timeout: 15000,
  paramsSerializer: {
    serialize: mangaDexParamsSerializer
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

// --- GraphQL Queries ---

const ANILIST_MEDIA_FIELDS = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  description
  averageScore
  favourites
  status
  format
  genres
`;

const QUERY_SEARCH = `
query ($search: String, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page (page: $page, perPage: $perPage) {
    media (search: $search, type: MANGA, sort: $sort) {
      ${ANILIST_MEDIA_FIELDS}
    }
  }
}
`;

const QUERY_TRENDING = `
query ($page: Int, $perPage: Int) {
  Page (page: $page, perPage: $perPage) {
    media (sort: TRENDING_DESC, type: MANGA) {
      ${ANILIST_MEDIA_FIELDS}
    }
  }
}
`;

const QUERY_DETAIL = `
query ($id: Int) {
  Media (id: $id, type: MANGA) {
    ${ANILIST_MEDIA_FIELDS}
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

// --- AniList API Functions ---

export const searchAniList = async (options: SearchOptions = {}): Promise<AniListManga[]> => {
  const { search, page = 1, perPage = 20, sort = 'POPULARITY_DESC' } = options;
  
  const variables: any = { page, perPage };
  
  // If no search term, use Trending/Popular query logic
  let query = QUERY_SEARCH;
  
  if (search) {
    variables.search = search;
    variables.sort = [sort]; // Search relevance is default, but we can override
  } else {
    // If just browsing, use the sort provided or default to trending
    variables.sort = [sort];
  }

  const response = await aniListClient.post('', { query, variables });
  return response.data.data.Page.media;
};

export const fetchTrendingManga = async (): Promise<AniListManga[]> => {
  const response = await aniListClient.post('', { 
    query: QUERY_TRENDING,
    variables: { page: 1, perPage: 10 }
  });
  return response.data.data.Page.media;
};

export const fetchAniListDetail = async (id: number): Promise<AniListManga> => {
  const response = await aniListClient.post('', {
    query: QUERY_DETAIL,
    variables: { id }
  });
  return response.data.data.Media;
};

// --- MangaDex Bridge Functions ---

/**
 * Finds a MangaDex ID based on the AniList title.
 * This is the critical "Link" between the two APIs.
 */
export const findMangaDexId = async (title: string): Promise<string | null> => {
  if (!title) return null;
  try {
    const response = await mangaDexClient.get<MangaDexResponse<MangaDexManga[]>>('/manga', {
      params: {
        title: title,
        limit: 1,
        contentRating: ['safe', 'suggestive', 'erotica'],
        order: { relevance: 'desc' }
      }
    });
    
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id;
    }
    return null;
  } catch (error) {
    console.error("Failed to find MangaDex ID", error);
    return null;
  }
};

/**
 * Used for the Reader/Chapter list. 
 */
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

// --- Combined / Utility ---

/**
 * Main detail fetcher.
 * Handles:
 * 1. If ID is number -> Fetch AniList -> Find MangaDex ID
 * 2. If ID is UUID -> Fetch MangaDex -> (Optional: Fetch AniList by title, but for now just map MD to AniList shape)
 */
export const fetchSmartMangaDetail = async (id: string): Promise<AniListManga> => {
  const isAniListId = /^\d+$/.test(id);

  if (isAniListId) {
    // Primary Flow: AniList Source
    const aniListManga = await fetchAniListDetail(parseInt(id));
    
    // Try to resolve MangaDex ID for reading
    const searchTitle = aniListManga.title.english || aniListManga.title.romaji || aniListManga.title.native;
    const mdId = await findMangaDexId(searchTitle);
    
    return {
      ...aniListManga,
      mangadexId: mdId || undefined
    };
  } else {
    // Legacy/Direct Flow: MangaDex Source (e.g. from Latest Updates page)
    const mdResponse = await mangaDexClient.get<MangaDexResponse<MangaDexManga>>(`/manga/${id}`, {
      params: { includes: ['cover_art'] }
    });
    const mdManga = mdResponse.data.data;
    
    // Convert MD to AniList Shape for consistent UI
    const coverRel = mdManga.relationships.find(r => r.type === 'cover_art');
    // Fix: Handle unknown type from Record<string, unknown> safely
    const attributes = coverRel?.attributes;
    const fileName = (attributes && typeof attributes.fileName === 'string') 
      ? attributes.fileName 
      : undefined;
    
    const coverUrl = fileName ? `https://uploads.mangadex.org/covers/${id}/${fileName}.256.jpg` : '';
    const largeCoverUrl = fileName ? `https://uploads.mangadex.org/covers/${id}/${fileName}` : '';

    const titleEn = mdManga.attributes.title.en;
    const titleAlt = Object.values(mdManga.attributes.title)[0] || 'Unknown Title';

    return {
      id: parseInt(id.substring(0, 6), 16), // Fake ID for types
      mangadexId: id, // The real ID needed for reader
      title: {
        english: titleEn || titleAlt,
        romaji: titleAlt,
        native: ''
      },
      description: mdManga.attributes.description.en || '',
      coverImage: {
        large: largeCoverUrl,
        extraLarge: largeCoverUrl,
        medium: coverUrl
      },
      status: mdManga.attributes.status,
      genres: [],
      favourites: 0,
      averageScore: 0
    };
  }
};

// Re-export this for legacy hooks if needed, or update hooks
export const fetchMangaDexTags = async (): Promise<MangaDexTag[]> => {
  const response = await mangaDexClient.get<MangaDexResponse<MangaDexTag[]>>('/manga/tag');
  return response.data.data;
};

// Keep for Latest Updates Page
export const fetchRecentChapters = async (limit = 20, offset = 0) => {
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
  return response.data.data;
};