import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { 
  searchManga, 
  fetchMangaByIdWithMal, 
  fetchMangaDexTags,
  fetchMangaFeed,
  fetchMangaCharacters,
  fetchTrendingManga,
  fetchRecentChapters
} from '../services/api';
import { EnrichedManga, SearchOptions, MangaDexTag, MangaDexChapter, JikanCharacter, MangaDexManga } from '../types';

export const useMangaSearch = (options: SearchOptions) => {
  return useQuery<EnrichedManga[], Error>({
    queryKey: ['mangaSearch', options],
    queryFn: () => searchManga(options),
    staleTime: 1000 * 60 * 5, 
  });
};

export const useTrendingManga = () => {
  return useQuery<EnrichedManga[], Error>({
    queryKey: ['mangaTrending'],
    queryFn: () => fetchTrendingManga(10),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useRecentChapters = () => {
  return useInfiniteQuery({
    queryKey: ['recentChapters'],
    queryFn: ({ pageParam = 0 }) => fetchRecentChapters(20, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 mins
  });
};

export const useMangaTags = () => {
  return useQuery<MangaDexTag[], Error>({
    queryKey: ['mangaTags'],
    queryFn: fetchMangaDexTags,
    staleTime: 1000 * 60 * 60 * 24, 
  });
};

export const useMangaDetail = (id: string) => {
  return useQuery<EnrichedManga, Error>({
    queryKey: ['manga', id],
    queryFn: () => fetchMangaByIdWithMal(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
};

export const useMangaFeed = (mangaId: string) => {
  return useQuery<MangaDexChapter[], Error>({
    queryKey: ['mangaFeed', mangaId],
    queryFn: () => fetchMangaFeed(mangaId),
    enabled: !!mangaId,
  });
};

export const useMangaCharacters = (malId?: number) => {
  return useQuery<JikanCharacter[], Error>({
    queryKey: ['mangaCharacters', malId],
    queryFn: () => fetchMangaCharacters(malId!),
    enabled: !!malId,
    retry: false, 
  });
};

export const usePopularManga = () => {
  return useMangaSearch({ limit: 12, offset: 0 });
};