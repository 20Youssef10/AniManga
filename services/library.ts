import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { LibraryEntry } from '../types';

// LocalStorage Fallback Keys
const LS_LIB_KEY = 'animanga_library_demo';

// Helper for LS
const getLocalLib = (): LibraryEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_LIB_KEY) || '[]');
  } catch {
    return [];
  }
};
const setLocalLib = (lib: LibraryEntry[]) => localStorage.setItem(LS_LIB_KEY, JSON.stringify(lib));

export const addToLibrary = async (entry: Omit<LibraryEntry, 'updatedAt'>) => {
  // Fallback if Firebase is disabled
  if (!db || !auth) {
    const lib = getLocalLib();
    const existingIdx = lib.findIndex(e => e.mangaId === entry.mangaId);
    const newEntry = { ...entry, updatedAt: new Date().toISOString() };
    
    if (existingIdx > -1) {
      lib[existingIdx] = { ...lib[existingIdx], ...newEntry };
    } else {
      lib.push(newEntry as LibraryEntry);
    }
    setLocalLib(lib);
    return;
  }

  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const ref = doc(db, 'users', user.uid, 'library', entry.mangaId);
  await setDoc(ref, {
    ...entry,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const updateReadingProgress = async (mangaId: string, chapterId: string, chapterNumber: string, page: number) => {
  // Fallback if Firebase is disabled
  if (!db || !auth) {
    const lib = getLocalLib();
    const idx = lib.findIndex(e => e.mangaId === mangaId);
    if (idx > -1) {
      lib[idx] = { 
        ...lib[idx], 
        currentChapterId: chapterId,
        currentChapterNumber: chapterNumber,
        currentPage: page,
        status: lib[idx].status || 'reading',
        updatedAt: new Date().toISOString()
      };
      setLocalLib(lib);
    } else {
      // Create partial entry if not exists (sync behavior)
      lib.push({
        mangaId,
        title: 'Unknown (Sync)', // We might not have title here if pure sync
        status: 'reading',
        currentChapterId: chapterId,
        currentChapterNumber: chapterNumber,
        currentPage: page,
        updatedAt: new Date().toISOString()
      } as LibraryEntry);
      setLocalLib(lib);
    }
    return;
  }

  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, 'users', user.uid, 'library', mangaId);
  await setDoc(ref, {
    mangaId,
    currentChapterId: chapterId,
    currentChapterNumber: chapterNumber,
    currentPage: page,
    status: 'reading',
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const removeFromLibrary = async (mangaId: string) => {
  if (!db || !auth) {
    const lib = getLocalLib().filter(e => e.mangaId !== mangaId);
    setLocalLib(lib);
    return;
  }

  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  await deleteDoc(doc(db, 'users', user.uid, 'library', mangaId));
};

export const fetchLibrary = async (): Promise<LibraryEntry[]> => {
  if (!db || !auth) {
    return getLocalLib();
  }

  const user = auth.currentUser;
  if (!user) return [];

  const q = query(collection(db, 'users', user.uid, 'library'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as LibraryEntry);
};

export const fetchLibraryEntry = async (mangaId: string): Promise<LibraryEntry | null> => {
  if (!db || !auth) {
    const lib = getLocalLib();
    return lib.find(e => e.mangaId === mangaId) || null;
  }

  const user = auth.currentUser;
  if (!user) return null;

  const snap = await getDoc(doc(db, 'users', user.uid, 'library', mangaId));
  if (snap.exists()) {
    return snap.data() as LibraryEntry;
  }
  return null;
};