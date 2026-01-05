import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentChapters } from '../hooks/useManga';

export const LatestUpdatesPage: React.FC = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useRecentChapters();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest Chapter Releases</h1>
      
      {isLoading ? (
         <div className="space-y-4">
           {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
         </div>
      ) : (
         <div className="space-y-4">
            {data?.pages.map((page, i) => (
               <React.Fragment key={i}>
                  {page.map(({ chapter, manga }) => {
                     // Try to get title from attributes, relationship, or fallback
                     const title = chapter.relationships.find(r => r.type === 'manga')?.attributes?.title?.en || 'Unknown Series';
                     const mangaId = chapter.relationships.find(r => r.type === 'manga')?.id;
                     
                     // We need the manga ID to link to it. The chapter object relationship has ID.
                     
                     return (
                        <div key={chapter.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-brand-300 transition-colors flex items-center gap-4">
                           <div className="flex-1">
                              <Link to={`/manga/${mangaId}`} className="font-bold text-gray-900 dark:text-gray-100 hover:text-brand-600 block mb-1">
                                 {title}
                              </Link>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 items-center">
                                 <Link to={`/read/${chapter.id}?manga=${mangaId}`} className="bg-brand-50 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded font-medium hover:bg-brand-100">
                                    {chapter.attributes.volume ? `Vol.${chapter.attributes.volume} ` : ''} 
                                    Ch.{chapter.attributes.chapter}
                                 </Link>
                                 <span>•</span>
                                 <span className="text-xs">{chapter.attributes.title || 'No Chapter Title'}</span>
                                 <span className="ml-auto text-xs opacity-70">
                                    {new Date(chapter.attributes.publishAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </span>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </React.Fragment>
            ))}
         </div>
      )}

      {hasNextPage && (
         <div className="mt-8 text-center">
            <button 
               onClick={() => fetchNextPage()}
               disabled={isFetchingNextPage}
               className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
               {isFetchingNextPage ? 'Loading more...' : 'Load More'}
            </button>
         </div>
      )}
    </div>
  );
};