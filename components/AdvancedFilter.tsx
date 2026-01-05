import React from 'react';
import { useMangaTags } from '../hooks/useManga';

interface AdvancedFilterProps {
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  selectedTags,
  onTagToggle,
  minRating,
  onRatingChange
}) => {
  const { data: tags, isLoading } = useMangaTags();

  // Group tags by their 'group' attribute (genre, theme, format, etc.)
  const groupedTags = React.useMemo(() => {
    if (!tags) return {};
    const groups: Record<string, typeof tags> = {};
    tags.forEach(tag => {
      const group = tag.attributes.group;
      if (!groups[group]) groups[group] = [];
      groups[group].push(tag);
    });
    return groups;
  }, [tags]);

  // Priority groups to show first
  const displayGroups = ['genre', 'theme'];

  if (isLoading) {
    return <div className="p-4 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>;
  }

  return (
    <div className="space-y-8 p-1">
      {/* Rating Filter */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Minimum MAL Score
        </h3>
        <div className="px-2">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Any</span>
            <span className="font-bold text-brand-600">{minRating > 0 ? minRating : 'All'}</span>
            <span>10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minRating}
            onChange={(e) => onRatingChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          />
          <p className="text-xs text-gray-500 mt-2">
            Filter currently loaded results by their MyAnimeList score.
          </p>
        </div>
      </div>

      {/* Tag Filters */}
      {displayGroups.map(groupName => {
        const groupTags = groupedTags[groupName];
        if (!groupTags) return null;

        return (
          <div key={groupName}>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              {groupName}s
            </h3>
            <div className="flex flex-wrap gap-2">
              {groupTags.sort((a,b) => a.attributes.name.en.localeCompare(b.attributes.name.en)).map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => onTagToggle(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-brand-100 text-brand-800 border-brand-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag.attributes.name.en}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
