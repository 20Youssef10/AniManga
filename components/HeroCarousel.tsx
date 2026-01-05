import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AniListManga } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

interface HeroCarouselProps {
  data: AniListManga[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [data.length]);

  if (!data || data.length === 0) return null;

  const current = data[currentIndex];
  const title = current.title.english || current.title.romaji || current.title.native;
  // Strip HTML
  const description = (current.description || 'No description available.').replace(/<[^>]+>/g, '');
  const heroImage = current.bannerImage || current.coverImage.extraLarge;
  const coverImage = current.coverImage.extraLarge || current.coverImage.large;

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-2xl mb-10 group bg-gray-900">
      {/* Background Image with Blur */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
             <div 
                className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-50 dark:opacity-40"
                style={{ backgroundImage: `url(${heroImage})` }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-10 flex flex-col md:flex-row gap-8 items-end md:items-center">
        {/* Cover Poster */}
        <motion.div 
            key={`img-${current.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="hidden md:block w-48 shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20"
        >
            <img src={coverImage} alt={title} className="w-full h-auto" />
        </motion.div>

        <div className="flex-1 space-y-4 max-w-2xl">
           <motion.div
             key={`text-${current.id}`}
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
           >
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight line-clamp-2 drop-shadow-md">
                {title}
              </h2>
              {current.averageScore && (
                  <div className="flex items-center gap-2 mt-2">
                     <span className="bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {current.averageScore}% Score
                     </span>
                     <span className="text-gray-300 text-sm">{current.favourites?.toLocaleString()} favourites</span>
                  </div>
              )}
              <p className="text-gray-200 mt-4 line-clamp-2 md:line-clamp-3 text-sm md:text-base max-w-xl">
                {description}
              </p>
           </motion.div>

           <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 mt-6"
           >
              <Link 
                to={`/manga/${current.id}`}
                className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 shadow-lg shadow-brand-600/30"
              >
                Read Now
              </Link>
           </motion.div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        {data.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-brand-400 h-6' : 'bg-white/30 hover:bg-white/80'}`}
            />
        ))}
      </div>
    </div>
  );
};