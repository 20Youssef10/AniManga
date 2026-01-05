import React from 'react';
import { Link } from 'react-router-dom';
import { AniListManga } from '../types';
import { motion } from 'framer-motion';

interface MangaCardProps {
  data: AniListManga;
}

export const MangaCard: React.FC<MangaCardProps> = ({ data }) => {
  const title = data.title.english || data.title.romaji || data.title.native || 'Unknown Title';
  const coverUrl = data.coverImage.large || data.coverImage.medium;
  const score = data.averageScore;
  const description = data.description || 'No description available.';

  // Strip HTML from description (AniList returns HTML)
  const plainDesc = description.replace(/<[^>]+>/g, '');

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link 
        to={`/manga/${data.id}`}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full block group"
      >
        <div className="relative aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {score && (
            <div className="absolute top-2 right-2 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {score}%
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" title={title}>
            {title}
          </h3>
          
          <div className="flex gap-2 mb-3">
             {data.status && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  data.status === 'FINISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {data.status}
                </span>
             )}
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 flex-1">
            {plainDesc}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};