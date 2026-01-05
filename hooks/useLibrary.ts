import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLibrary, fetchLibraryEntry, addToLibrary, updateReadingProgress, removeFromLibrary } from '../services/library';
import { LibraryEntry } from '../types';

// Mock User Interface
interface MockUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string;
}

// Hook to check if user is authenticated for queries
// Now strictly returns a Demo User
export const useAuthUser = () => {
  const [user] = useState<MockUser>({ 
    uid: 'demo-user', 
    isAnonymous: true,
    displayName: 'Demo User'
  });
  return user;
};

export const useLibrary = () => {
  const user = useAuthUser();
  return useQuery({
    queryKey: ['library', user?.uid],
    queryFn: fetchLibrary,
    enabled: !!user,
  });
};

export const useLibraryEntry = (mangaId: string) => {
  const user = useAuthUser();
  return useQuery({
    queryKey: ['libraryEntry', user?.uid, mangaId],
    queryFn: () => fetchLibraryEntry(mangaId),
    enabled: !!user && !!mangaId,
  });
};

export const useLibraryMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  const add = useMutation({
    mutationFn: (entry: Omit<LibraryEntry, 'updatedAt'>) => addToLibrary(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['libraryEntry'] });
    }
  });

  const remove = useMutation({
    mutationFn: (mangaId: string) => removeFromLibrary(mangaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['libraryEntry'] });
    }
  });

  return { add, remove };
};

// --- Progress Sync Hook ---

export const useSyncProgress = (
  mangaId: string | null,
  chapterId: string | undefined,
  chapterNumber: string | undefined,
  page: number
) => {
  const user = useAuthUser();

  useEffect(() => {
    if (!user || !mangaId || !chapterId) return;

    // Debounce the save operation
    const timeoutId = setTimeout(() => {
      updateReadingProgress(mangaId, chapterId, chapterNumber || '?', page)
        .catch(err => console.error("Failed to sync progress:", err));
    }, 2000); // Save after 2 seconds of inactivity on page change

    return () => clearTimeout(timeoutId);
  }, [user, mangaId, chapterId, chapterNumber, page]);
};