import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMangaDetail } from '../hooks/useManga';
import { useLibraryEntry, useLibraryMutation } from '../hooks/useLibrary';
import { ChapterList } from './ChapterList';
import { CharacterList } from './CharacterList';
import { ReadingStatus } from '../types';

export const MangaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useMangaDetail(id!);
  
  // Library Logic
  const { data: libraryEntry, isLoading: isLibLoading } = useLibraryEntry(id!);
  const { add } = useLibraryMutation();
  const [status, setStatus] = useState<ReadingStatus | null>(null);

  useEffect(() => {
    if (libraryEntry) {
      setStatus(libraryEntry.status);
    }
  }, [libraryEntry]);

  const handleStatusChange = async (newStatus: ReadingStatus) => {
    if (!data) return;
    setStatus(newStatus);
    
    // Construct the entry
    // We use the first title or English title
    const title = data.mangadex.attributes.title.en || Object.values(data.mangadex.attributes.title)[0];
    
    add.mutate({
      mangaId: data.mangadex.id,
      title: title,
      coverUrl: data.coverUrl,
      status: newStatus,
      malId: data.mal?.mal_id,
      malScore: data.mal?.score || undefined
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2"></div>
      </div>
    );
  }

  if (isError || !data) {
    return <div className="p-8 text-center text-red-600">Manga not found</div>;
  }

  const { mangadex, mal, coverUrl } = data;
  const title = mangadex.attributes.title.en || Object.values(mangadex.attributes.title)[0];
  const description = mangadex.attributes.description.en || 'No description available.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link to="/" className="text-brand-600 hover:underline">Home</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 line-clamp-1">{title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Left Column: Cover & Stats */}
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden shadow-lg aspect-[2/3] bg-gray-100 relative">
            {coverUrl && (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            )}
          </div>
          
          {/* Library Actions */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Library Status</label>
             <select 
               value={status || ""} 
               onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
               className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
             >
               <option value="" disabled>Add to Library</option>
               <option value="reading">Reading</option>
               <option value="plan_to_read">Plan to Read</option>
               <option value="completed">Completed</option>
               <option value="on_hold">On Hold</option>
               <option value="dropped">Dropped</option>
             </select>
             {libraryEntry && (
                <div className="mt-3 text-xs text-center text-gray-500">
                   Last read: Ch. {libraryEntry.currentChapterNumber || '-'}
                </div>
             )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
             <div className="flex justify-between items-center pb-3 border-b border-gray-100">
               <span className="text-sm text-gray-500">Status</span>
               <span className="text-sm font-semibold capitalize">{mangadex.attributes.status}</span>
             </div>
             {mal?.score && (
               <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                 <span className="text-sm text-gray-500">MAL Score</span>
                 <div className="flex items-center gap-1">
                   <span className="text-yellow-500 font-bold">{mal.score}</span>
                   <span className="text-xs text-gray-400">({mal.scored_by?.toLocaleString()})</span>
                 </div>
               </div>
             )}
             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-500">Rating</span>
               <span className="text-sm font-semibold capitalize">{mangadex.attributes.contentRating}</span>
             </div>
          </div>
        </div>

        {/* Right Column: Info & Content */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{title}</h1>
          {mal?.title_japanese && (
            <h2 className="text-lg text-gray-500 mb-6">{mal.title_japanese}</h2>
          )}

          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Synopsis</h3>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
              {description}
            </p>
          </div>

          <CharacterList malId={mal?.mal_id} />

          <ChapterList mangaId={mangadex.id} />
        </div>
      </div>
    </div>
  );
};
