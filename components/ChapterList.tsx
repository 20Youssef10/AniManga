import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MangaDexChapter } from '../types';
import { useMangaFeed } from '../hooks/useManga';

interface ChapterListProps {
  mangaId: string;
}

export const ChapterList: React.FC<ChapterListProps> = ({ mangaId }) => {
  const { data: chapters, isLoading, isError } = useMangaFeed(mangaId);

  // Filter duplicates (MangaDex sometimes returns multiple groups for same chapter)
  const uniqueChapters = useMemo(() => {
    if (!chapters) return [];
    const seen = new Set<string>();
    return chapters.filter(ch => {
      const key = `vol-${ch.attributes.volume}-ch-${ch.attributes.chapter}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [chapters]);

  if (isLoading) return <div className="h-40 animate-pulse bg-gray-100 rounded-xl"></div>;
  if (isError) return <div className="text-red-500">Failed to load chapters.</div>;
  if (uniqueChapters.length === 0) return <div className="text-gray-500">No chapters found.</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Chapters ({uniqueChapters.length})</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {uniqueChapters.map((chapter) => (
          <Link 
            key={chapter.id}
            to={`/read/${chapter.id}?manga=${mangaId}`}
            className="flex items-center justify-between p-4 hover:bg-brand-50 transition-colors group"
          >
            <div>
              <div className="font-medium text-gray-900 group-hover:text-brand-600">
                {chapter.attributes.volume && `Vol. ${chapter.attributes.volume} `} 
                Ch. {chapter.attributes.chapter}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {chapter.attributes.title || 'No Title'} • {new Date(chapter.attributes.publishAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              READ
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
