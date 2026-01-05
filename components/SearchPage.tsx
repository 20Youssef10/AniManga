import React, { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { AdvancedFilter } from './AdvancedFilter';
import { MangaGrid } from './MangaGrid';
import { useMangaSearch } from '../hooks/useManga';

export const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data, isLoading, isError, error } = useMangaSearch({
    title: searchQuery,
    includedTags: selectedTags,
    limit: 24
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (minRating === 0) return data;
    return data.filter(item => {
      if (!item.mal || !item.mal.score) return false;
      return item.mal.score >= minRating;
    });
  }, [data, minRating]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Search Header */}
      <div className="mb-8 space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Search Library</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar onSearch={setSearchQuery} placeholder="Search by title..." />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              flex items-center justify-center px-4 py-3 border rounded-lg shadow-sm text-sm font-medium 
              transition-colors
              ${isFilterOpen 
                ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900 dark:border-brand-700 dark:text-brand-300' 
                : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50'
              }
            `}
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters {selectedTags.length > 0 && `(${selectedTags.length})`}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`
          lg:w-64 flex-shrink-0 
          ${isFilterOpen ? 'block' : 'hidden'} 
          lg:block
        `}>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-24">
             <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-bold text-lg dark:text-white">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-500">Close</button>
             </div>
             <AdvancedFilter 
               selectedTags={selectedTags} 
               onTagToggle={handleTagToggle}
               minRating={minRating}
               onRatingChange={setMinRating}
             />
             {(selectedTags.length > 0 || minRating > 0) && (
               <button 
                 onClick={() => { setSelectedTags([]); setMinRating(0); }}
                 className="mt-6 w-full text-sm text-red-600 font-medium hover:text-red-800 py-2"
               >
                 Clear all filters
               </button>
             )}
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Searching...' : `Showing ${filteredData.length} results`}
            </span>
          </div>
          
          <MangaGrid 
            data={filteredData} 
            isLoading={isLoading} 
            isError={isError} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
};