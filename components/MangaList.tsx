import React from 'react';
import { usePopularManga } from '../hooks/useManga';
import { MangaCard } from './MangaCard';

export const MangaList: React.FC = () => {
  const { data, isLoading, isError, error } = usePopularManga();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-[400px] animate-pulse border border-gray-100">
            <div className="h-2/3 bg-gray-200 w-full" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-16 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-bold text-lg mb-2">Failed to load manga</h3>
        <p className="text-red-600">{error?.message || "An unexpected error occurred while fetching data."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {data?.map((manga) => (
        <MangaCard key={manga.mangadex.id} data={manga} />
      ))}
    </div>
  );
};
