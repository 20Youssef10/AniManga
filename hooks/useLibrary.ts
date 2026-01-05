import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../services/firebase';
import { fetchLibrary, fetchLibraryEntry, addToLibrary, updateReadingProgress, removeFromLibrary } from '../services/library';
import { LibraryEntry } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';

// Hook to check if user is authenticated for queries
export const useAuthUser = () => {
  // 1. If auth is null (Firebase failed/disabled), use Demo User immediately.
  // 2. If auth exists but loading, start as null.
  // 3. If auth exists and cached user exists, use it.
  const [user, setUser] = useState<User | { uid: string; isAnonymous: boolean } | null>(() => {
    if (!auth) return { uid: 'demo-user', isAnonymous: true };
    return auth.currentUser;
  });

  useEffect(() => {
    if (!auth) {
      // Double check in case of race conditions, though initial state handles it
      setUser({ uid: 'demo-user', isAnonymous: true });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
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