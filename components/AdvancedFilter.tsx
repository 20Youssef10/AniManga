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
  onTagToggle
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
      {/* Tag Filters */}
      {displayGroups.map(groupName => {
        const groupTags = groupedTags[groupName];
        if (!groupTags) return null;

        return (
          <div key={groupName}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-3">
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
                        ? 'bg-brand-100 text-brand-800 border-brand-200 dark:bg-brand-900 dark:text-brand-200 dark:border-brand-700'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
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