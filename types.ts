// --- MangaDex Types ---

export interface MangaDexMangaAttributes {
  title: Record<string, string>;
  altTitles: Record<string, string>[];
  description: Record<string, string>;
  isLocked: boolean;
  links: Record<string, string>; // e.g., { mal: "12345", al: "12345", amz: "..." }
  originalLanguage: string;
  lastVolume: string | null;
  lastChapter: string | null;
  publicationDemographic: 'shounen' | 'shoujo' | 'josei' | 'seinen' | null;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  year: number | null;
  contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
  tags: Array<{
    id: string;
    type: 'tag';
    attributes: {
      name: Record<string, string>;
      group: string;
      version: number;
    };
  }>;
  state: 'published' | 'unpublished';
  createdAt: string;
  updatedAt: string;
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

export interface MangaDexTag {
  id: string;
  type: 'tag';
  attributes: {
    name: Record<string, string>;
    group: string;
    version: number;
  };
}

export interface MangaDexChapterAttributes {
  volume: string | null;
  chapter: string | null;
  title: string | null;
  translatedLanguage: string;
  externalUrl: string | null;
  publishAt: string;
  readableAt: string;
  createdAt: string;
  updatedAt: string;
  pages: number;
  version: number;
}

export interface MangaDexChapter {
  id: string;
  type: 'chapter';
  attributes: MangaDexChapterAttributes;
  relationships: Array<{
    id: string;
    type: string;
  }>;
}

export interface MangaDexResponse<T> {
  result: 'ok' | 'error';
  response: 'collection' | 'entity';
  data: T;
  limit?: number;
  offset?: number;
  total?: number;
}

export interface MangaDexCoverAttributes {
  description: string;
  volume: string;
  fileName: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface MangaDexCover {
  id: string;
  type: 'cover_art';
  attributes: MangaDexCoverAttributes;
}

export interface AtHomeResponse {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

// --- AniList Types ---

export interface AniListCharacter {
  name: {
    full: string;
  };
  image: {
    medium: string;
  };
  role?: string; // Mapped from edges
}

export interface AniListManga {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  averageScore: number;
  favourites: number;
  coverImage?: {
    large: string;
    extraLarge: string;
  };
  bannerImage?: string;
  characters?: {
    nodes: AniListCharacter[];
    edges: { role: string }[];
  };
}

// --- Combined / App Types ---

export interface EnrichedManga {
  mangadex: MangaDexManga;
  anilist?: AniListManga | null;
  coverUrl?: string;
}

export interface SearchOptions {
  title?: string;
  includedTags?: string[];
  limit?: number;
  offset?: number;
}

export type ReaderMode = 'vertical' | 'single';
export type ReaderQuality = 'data' | 'dataSaver';

// --- Library / User Types ---

export type ReadingStatus = 'reading' | 'completed' | 'plan_to_read' | 'dropped' | 'on_hold';

export interface LibraryEntry {
  mangaId: string;
  title: string;
  coverUrl?: string;
  status: ReadingStatus;
  currentChapterId?: string;
  currentChapterNumber?: string;
  currentPage?: number;
  malId?: number; // Kept for legacy compatibility
  malScore?: number; // Normalized score (0-10 or 0-100 depending on source)
  updatedAt?: any; 
}