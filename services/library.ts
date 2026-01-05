import { LibraryEntry } from '../types';

// LocalStorage Keys
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
  const lib = getLocalLib();
  const existingIdx = lib.findIndex(e => e.mangaId === entry.mangaId);
  const newEntry = { ...entry, updatedAt: new Date().toISOString() };
  
  if (existingIdx > -1) {
    lib[existingIdx] = { ...lib[existingIdx], ...newEntry };
  } else {
    lib.push(newEntry as LibraryEntry);
  }
  setLocalLib(lib);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
};

export const updateReadingProgress = async (mangaId: string, chapterId: string, chapterNumber: string, page: number) => {
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
      title: 'Unknown (Sync)', 
      status: 'reading',
      currentChapterId: chapterId,
      currentChapterNumber: chapterNumber,
      currentPage: page,
      updatedAt: new Date().toISOString()
    } as LibraryEntry);
    setLocalLib(lib);
  }
};

export const removeFromLibrary = async (mangaId: string) => {
  const lib = getLocalLib().filter(e => e.mangaId !== mangaId);
  setLocalLib(lib);
  await new Promise(resolve => setTimeout(resolve, 200));
};

export const fetchLibrary = async (): Promise<LibraryEntry[]> => {
  return getLocalLib();
};

export const fetchLibraryEntry = async (mangaId: string): Promise<LibraryEntry | null> => {
  const lib = getLocalLib();
  return lib.find(e => e.mangaId === mangaId) || null;
};