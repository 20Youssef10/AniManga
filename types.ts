// --- MangaDex Types (For Reader & Chapters) ---

export interface MangaDexMangaAttributes {
  title: Record<string, string>;
  description: Record<string, string>;
  links: Record<string, string>;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
}

export interface MangaDexManga {
  id: string;
  type: 'manga';
  attributes: MangaDexMangaAttributes;
  relationships: Array<{
    id: string;
    type: string;
    related?: string;
    attributes?: Record<string, unknown>;
  }>;
}

export interface MangaDexChapter {
  id: string;
  type: 'chapter';
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    publishAt: string;
    pages: number;
    externalUrl: string | null;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: Record<string, unknown>;
  }>;
}

export interface MangaDexResponse<T> {
  result: 'ok' | 'error';
  data: T;
  limit?: number;
  offset?: number;
  total?: number;
}

export interface AtHomeResponse {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface MangaDexTag {
  id: string;
  type: 'tag';
  attributes: {
    name: Record<string, string>;
    group: string;
  };
}

// --- AniList Types (Main UI) ---

export interface AniListCharacter {
  role: string;
  node: {
    name: { full: string };
    image: { medium: string };
  }
}

export interface AniListManga {
  id: number; // Integer ID
  idMal?: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  averageScore?: number;
  favourites?: number;
  status?: string;
  format?: string;
  genres?: string[];
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color?: string;
  };
  bannerImage?: string;
  characters?: {
    edges: AniListCharacter[];
  };
  // App specific extension to link to Reader
  mangadexId?: string; 
}

// --- App Types ---

export interface SearchOptions {
  search?: string;
  genres?: string[];
  sort?: 'TRENDING_DESC' | 'POPULARITY_DESC' | 'SCORE_DESC' | 'FAVOURITES_DESC' | 'UPDATED_AT_DESC';
  page?: number;
  perPage?: number;
}

export type ReaderMode = 'vertical' | 'single';
export type ReaderQuality = 'data' | 'dataSaver';

export type ReadingStatus = 'reading' | 'completed' | 'plan_to_read' | 'dropped' | 'on_hold';

export interface LibraryEntry {
  mangaId: string; // Can be AniList ID (stringified number) or MD ID
  title: string;
  coverUrl?: string;
  status: ReadingStatus;
  currentChapterId?: string;
  currentChapterNumber?: string;
  currentPage?: number;
  malScore?: number;
  updatedAt?: any; 
}
