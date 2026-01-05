import React from 'react';
import { MangaCard } from './MangaCard';
import { EnrichedManga } from '../types';

interface MangaGridProps {
  data?: EnrichedManga[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
}

export const MangaGrid: React.FC<MangaGridProps> = ({ data, isLoading, isError, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-[380px] animate-pulse border border-gray-100 shadow-sm">
            <div className="h-[250px] bg-gray-200 w-full rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Oops, something went wrong</h3>
        <p className="text-gray-500 max-w-md mt-2 mb-6">{error?.message || "Failed to fetch data."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-gray-500">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-lg font-medium">No results found</p>
        <p className="text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((manga) => (
        <MangaCard key={manga.mangadex.id} data={manga} />
      ))}
    </div>
  );
};
