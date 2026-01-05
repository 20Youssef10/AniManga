import React from 'react';
import { Link } from 'react-router-dom';
import { useTrendingManga, usePopularManga } from '../hooks/useManga';
import { HeroCarousel } from './HeroCarousel';
import { MangaCard } from './MangaCard';
import { useLibrary } from '../hooks/useLibrary';

export const HomePage: React.FC = () => {
  const { data: trending, isLoading: trendingLoading } = useTrendingManga();
  const { data: popular, isLoading: popularLoading } = usePopularManga();
  const { data: library } = useLibrary();

  const recentlyRead = library?.filter(item => item.status === 'reading').slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* Hero Section */}
      {trendingLoading ? (
         <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse mb-10" />
      ) : (
         trending && <HeroCarousel data={trending.slice(0, 5)} />
      )}

      {/* Continue Reading */}
      {recentlyRead && recentlyRead.length > 0 && (
        <div className="mb-12">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Reading</h2>
              <Link to="/library" className="text-sm text-brand-600 hover:text-brand-500 font-medium">View Library →</Link>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyRead.map(entry => (
                 <Link 
                    key={entry.mangaId} 
                    to={entry.currentChapterId ? `/read/${entry.currentChapterId}?manga=${entry.mangaId}` : `/manga/${entry.mangaId}`}
                    className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
                 >
                    <div className="w-12 h-16 shrink-0 rounded overflow-hidden bg-gray-200">
                        {entry.coverUrl && <img src={entry.coverUrl} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="min-w-0">
                       <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm group-hover:text-brand-500 transition-colors">{entry.title}</h4>
                       <p className="text-xs text-gray-500 mt-1">
                          {entry.currentChapterNumber ? `Ch. ${entry.currentChapterNumber}` : 'Start Reading'}
                       </p>
                       <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 mt-2 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 w-1/2"></div> {/* Mock progress */}
                       </div>
                    </div>
                 </Link>
              ))}
           </div>
        </div>
      )}

      {/* Trending Horizontal List */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
          <Link to="/search" className="text-sm text-brand-600 hover:text-brand-500 font-medium">See All →</Link>
        </div>
        
        {trendingLoading ? (
           <div className="flex gap-4 overflow-hidden">
              {[1,2,3,4,5].map(i => <div key={i} className="w-[160px] h-[240px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse shrink-0" />)}
           </div>
        ) : (
           <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
              {trending?.map(manga => (
                 <div key={manga.mangadex.id} className="w-[160px] md:w-[190px] shrink-0 snap-start">
                    <MangaCard data={manga} />
                 </div>
              ))}
           </div>
        )}
      </div>

      {/* Popular Grid */}
      <div>
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Time Popular</h2>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularLoading ? (
                Array.from({length: 12}).map((_, i) => <div key={i} className="bg-gray-200 h-64 rounded-xl animate-pulse" />)
            ) : (
                popular?.map(manga => <MangaCard key={manga.mangadex.id} data={manga} />)
            )}
         </div>
      </div>

    </div>
  );
};