import { Timestamp } from 'firebase/firestore';

// --- MangaDex Types ---

export interface MangaDexMangaAttributes {
  title: Record<string, string>;
  altTitles: Record<string, string>[];
  description: Record<string, string>;
  isLocked: boolean;
  links: Record<string, string>; // e.g., { mal: "12345", amz: "..." }
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

// --- Jikan (MAL) Types ---

export interface JikanManga {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  approved: boolean;
  titles: Array<{ type: string; title: string }>;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string;
  chapters: number | null;
  volumes: number | null;
  status: string;
  publishing: boolean;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  genres: Array<{ mal_id: number; type: string; name: string; url: string }>;
}

export interface JikanCharacter {
  character: {
    mal_id: number;
    url: string;
    images: {
      jpg: {
        image_url: string;
      };
      webp: {
        image_url: string;
        small_image_url: string;
      };
    };
    name: string;
  };
  role: string;
}

export interface JikanResponse<T> {
  data: T;
}

// --- Combined / App Types ---

export interface EnrichedManga {
  mangadex: MangaDexManga;
  mal?: JikanManga | null;
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
  malId?: number; // Used for MAL Sync
  malScore?: number;
  updatedAt?: any; // Firestore Timestamp
}
