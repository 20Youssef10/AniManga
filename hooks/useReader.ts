import { useQuery } from '@tanstack/react-query';
import { fetchChapterPages } from '../services/api';
import { AtHomeResponse } from '../types';

export const useChapterPages = (chapterId: string) => {
  return useQuery<AtHomeResponse, Error>({
    queryKey: ['chapterPages', chapterId],
    queryFn: () => fetchChapterPages(chapterId),
    enabled: !!chapterId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
