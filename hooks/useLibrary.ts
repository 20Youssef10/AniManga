import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../services/firebase';
import { fetchLibrary, fetchLibraryEntry, addToLibrary, updateReadingProgress, removeFromLibrary } from '../services/library';
import { LibraryEntry } from '../types';
import { onAuthStateChanged } from 'firebase/auth';

// Hook to check if user is authenticated for queries
export const useAuthUser = () => {
  // If auth is null (disabled), we simulate a Demo User
  const [user, setUser] = useState<any>(auth?.currentUser || (auth === null ? { uid: 'demo-user', isAnonymous: true } : null));

  useEffect(() => {
    if (!auth) {
      // Keep demo user
      return;
    }
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

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