import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { 
  searchAniList,
  fetchTrendingManga,
  fetchSmartMangaDetail,
  fetchMangaFeed,
  fetchMangaDexTags,
  fetchRecentChapters
} from '../services/api';
import { AniListManga, SearchOptions, MangaDexTag, MangaDexChapter } from '../types';

export const useMangaSearch = (options: SearchOptions) => {
  return useQuery<AniListManga[], Error>({
    queryKey: ['mangaSearch', options],
    queryFn: () => searchAniList(options),
    staleTime: 1000 * 60 * 5, 
  });
};

export const usePopularManga = () => {
  return useQuery<AniListManga[], Error>({
    queryKey: ['mangaPopular'],
    queryFn: () => searchAniList({ sort: 'POPULARITY_DESC', page: 1, perPage: 20 }),
    staleTime: 1000 * 60 * 60,
  });
};

export const useTrendingManga = () => {
  return useQuery<AniListManga[], Error>({
    queryKey: ['mangaTrending'],
    queryFn: fetchTrendingManga,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useMangaDetail = (id: string) => {
  return useQuery<AniListManga, Error>({
    queryKey: ['manga', id],
    queryFn: () => fetchSmartMangaDetail(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
};

export const useMangaFeed = (mangaId?: string) => {
  return useQuery<MangaDexChapter[], Error>({
    queryKey: ['mangaFeed', mangaId],
    queryFn: () => fetchMangaFeed(mangaId!),
    enabled: !!mangaId,
  });
};

// Legacy support for Latest Updates page
export const useRecentChapters = () => {
  return useInfiniteQuery({
    queryKey: ['recentChapters'],
    queryFn: ({ pageParam = 0 }) => fetchRecentChapters(20, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useMangaTags = () => {
  return useQuery<MangaDexTag[], Error>({
    queryKey: ['mangaTags'],
    queryFn: fetchMangaDexTags,
    staleTime: 1000 * 60 * 60 * 24, 
  });
};