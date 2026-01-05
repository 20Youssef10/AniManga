import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1, // Limit retries to avoid slamming APIs
      staleTime: 1000 * 60 * 5, // Data stale after 5 minutes
    },
  },
});