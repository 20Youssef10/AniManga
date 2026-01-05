import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMangaDetail } from '../hooks/useManga';
import { useLibraryEntry, useLibraryMutation } from '../hooks/useLibrary';
import { ChapterList } from './ChapterList';
import { CharacterList } from './CharacterList';
import { ReadingStatus } from '../types';

export const MangaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading, isError } = useMangaDetail(id!);
  
  // Library Logic
  const { data: libraryEntry } = useLibraryEntry(id!);
  const { add } = useLibraryMutation();
  const [status, setStatus] = useState<ReadingStatus | null>(null);

  useEffect(() => {
    if (libraryEntry) {
      setStatus(libraryEntry.status);
    }
  }, [libraryEntry]);

  const handleStatusChange = async (newStatus: ReadingStatus) => {
    if (!manga) return;
    setStatus(newStatus);
    
    const title = manga.title.english || manga.title.romaji || manga.title.native;
    
    add.mutate({
      mangaId: manga.id.toString(), // Store as string for consistency
      title: title,
      coverUrl: manga.coverImage.large,
      status: newStatus,
      malScore: manga.averageScore
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl mb-8"></div>
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
      </div>
    );
  }

  if (isError || !manga) {
    return <div className="p-8 text-center text-red-600">Manga not found</div>;
  }

  const title = manga.title.english || manga.title.romaji || manga.title.native;
  const description = (manga.description || 'No description available.').replace(/<[^>]+>/g, '');
  const bannerImage = manga.bannerImage || manga.coverImage.extraLarge;
  const coverUrl = manga.coverImage.extraLarge || manga.coverImage.large;

  return (
    <div className="min-h-screen pb-12">
       {/* Banner Area */}
       <div className="relative w-full h-48 md:h-80 bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {bannerImage ? (
              <img src={bannerImage} alt="" className="w-full h-full object-cover opacity-80" />
          ) : (
              <div className="w-full h-full bg-gradient-to-r from-brand-900 to-gray-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
       </div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/90 shadow-sm">
             <Link to="/" className="hover:text-brand-300 font-bold">Home</Link>
             <span>/</span>
             <span className="line-clamp-1">{title}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            {/* Left Column: Cover & Actions */}
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden shadow-2xl aspect-[2/3] bg-gray-800 border-4 border-white dark:border-gray-800">
                {coverUrl ? (
                  <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No Cover</div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Library Status</label>
                 <select 
                   value={status || ""} 
                   onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                   className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                 >
                   <option value="" disabled>Add to Library</option>
                   <option value="reading">Reading</option>
                   <option value="plan_to_read">Plan to Read</option>
                   <option value="completed">Completed</option>
                   <option value="on_hold">On Hold</option>
                   <option value="dropped">Dropped</option>
                 </select>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                 <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                   <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                   <span className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-200">{manga.status}</span>
                 </div>
                 {manga.averageScore && (
                   <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                     <span className="text-sm text-gray-500 dark:text-gray-400">Score</span>
                     <div className="flex items-center gap-1">
                       <span className="text-brand-600 dark:text-brand-400 font-bold">{manga.averageScore}%</span>
                       <span className="text-xs text-gray-400">({manga.favourites?.toLocaleString()} favs)</span>
                     </div>
                   </div>
                 )}
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-500 dark:text-gray-400">Format</span>
                   <span className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-200">{manga.format}</span>
                 </div>
              </div>
            </div>

            {/* Right Column: Info & Content */}
            <div className="pt-2 md:pt-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">{title}</h1>
              {manga.title.native && (
                <h2 className="text-xl text-gray-500 mb-6">{manga.title.native}</h2>
              )}

              {/* Genres */}
              {manga.genres && (
                  <div className="flex flex-wrap gap-2 mb-6">
                      {manga.genres.map(g => (
                          <span key={g} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                              {g}
                          </span>
                      ))}
                  </div>
              )}

              <div className="mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Synopsis</h3>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                   {description}
                </div>
              </div>

              {manga.characters?.edges && (
                <CharacterList characters={manga.characters.edges.map(e => ({ role: e.role, ...e.node })) as any} />
              )}

              {/* Chapter Feed */}
              {manga.mangadexId ? (
                <ChapterList mangaId={manga.mangadexId} />
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-yellow-700">
                    <p className="font-bold">Reader Unavailable</p>
                    <p className="text-sm mt-1">
                        We could not automatically find this series on MangaDex. 
                        It might not be licensed or available for reading yet.
                    </p>
                </div>
              )}
            </div>
          </div>
       </div>
    </div>
  );
};