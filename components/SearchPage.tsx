import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { MangaGrid } from './MangaGrid';
import { useMangaSearch } from '../hooks/useManga';

export const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // AniList Search
  const { data, isLoading, isError, error } = useMangaSearch({
    search: searchQuery,
    perPage: 24
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Search Header */}
      <div className="mb-8 space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Search Library</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar onSearch={setSearchQuery} placeholder="Search by title..." />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Results Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Searching...' : `Showing ${data?.length || 0} results`}
            </span>
          </div>
          
          <MangaGrid 
            data={data} 
            isLoading={isLoading} 
            isError={isError} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
};