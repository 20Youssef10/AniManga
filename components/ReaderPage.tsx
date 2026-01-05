import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useChapterPages } from '../hooks/useReader';
import { useMangaFeed } from '../hooks/useManga';
import { useSyncProgress } from '../hooks/useLibrary';
import { useSettings } from '../context/SettingsContext';
import { ReaderMode, ReaderQuality } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const ReaderPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [searchParams] = useSearchParams();
  const mangaId = searchParams.get('manga');
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [mode, setMode] = useState<ReaderMode>(settings.readerMode);
  const [quality, setQuality] = useState<ReaderQuality>(settings.readerQuality);
  const [isZen, setIsZen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, isError } = useChapterPages(chapterId!);
  const { data: chapters } = useMangaFeed(mangaId || '');
  const currentChapterDetails = chapters?.find(c => c.id === chapterId);

  useSyncProgress(
    mangaId || null, 
    chapterId, 
    currentChapterDetails?.attributes.chapter || undefined, 
    currentPage
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mangaId) {
      const saved = localStorage.getItem(`progress-${mangaId}`);
      if (saved) {
        const [savedChapter, savedPage] = saved.split(':');
        if (savedChapter === chapterId) {
            setCurrentPage(parseInt(savedPage, 10));
        }
      }
    }
  }, [chapterId, mangaId]);

  useEffect(() => {
    if (mangaId && chapterId) {
      localStorage.setItem(`progress-${mangaId}`, `${chapterId}:${currentPage}`);
    }
  }, [currentPage, chapterId, mangaId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'single') {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
      }
      if (e.key === 'f') toggleZen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentPage, data]);

  const images = data?.chapter[quality] || [];
  const baseUrl = data?.baseUrl;
  const hash = data?.chapter.hash;

  const nextPage = () => {
    if (currentPage < images.length - 1) {
      setCurrentPage(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleZen = () => setIsZen(!isZen);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white animate-pulse">Loading Chapter...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load chapter images.</p>
          <button onClick={() => navigate(-1)} className="text-blue-500 underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 ${isZen ? 'cursor-none' : ''}`}>
      
      {/* Top Bar */}
      <motion.div 
        initial={{ y: 0 }}
        animate={{ y: isZen ? -100 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur text-white p-4 z-50 flex justify-between items-center border-b border-gray-800"
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-brand-400">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
           <span className="hidden sm:inline">Back</span>
        </button>
        
        <div className="flex items-center gap-3">
           <button onClick={handleShare} className="p-2 hover:bg-gray-800 rounded-full" title="Copy Link">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
             </svg>
           </button>

           <select 
             value={mode} 
             onChange={(e) => setMode(e.target.value as ReaderMode)}
             className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-brand-500"
           >
             <option value="vertical">Vertical</option>
             <option value="single">Single</option>
           </select>

           <select 
             value={quality} 
             onChange={(e) => setQuality(e.target.value as ReaderQuality)}
             className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-brand-500"
           >
             <option value="data">HQ</option>
             <option value="dataSaver">Data Saver</option>
           </select>
        </div>
      </motion.div>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-brand-600 text-white px-4 py-2 rounded-full shadow-lg z-[60] text-sm font-bold"
          >
            Link Copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div 
        ref={containerRef}
        className="min-h-screen flex flex-col items-center justify-center pt-0 pb-0"
        onClick={toggleZen}
      >
        {mode === 'vertical' ? (
          <div className="w-full max-w-3xl flex flex-col items-center py-20 gap-2">
            {images.map((filename, index) => (
              <img
                key={index}
                src={`${baseUrl}/${quality}/${hash}/${filename}`}
                alt={`Page ${index + 1}`}
                className="w-full h-auto shadow-2xl min-h-[200px] bg-gray-800"
                loading="lazy"
              />
            ))}
             <div className="text-gray-500 py-10">End of Chapter</div>
          </div>
        ) : (
          <div className="w-full h-screen flex flex-col items-center justify-center relative touch-none">
             <img
                src={`${baseUrl}/${quality}/${hash}/${images[currentPage]}`}
                alt={`Page ${currentPage + 1}`}
                className="max-h-screen max-w-full object-contain"
             />
             
             {/* Navigation Zones */}
             <div 
               className="absolute top-0 left-0 w-1/4 h-full cursor-pointer z-10 active:bg-white/5 transition-colors"
               onClick={(e) => { e.stopPropagation(); prevPage(); }}
             />
             <div 
               className="absolute top-0 right-0 w-1/4 h-full cursor-pointer z-10 active:bg-white/5 transition-colors"
               onClick={(e) => { e.stopPropagation(); nextPage(); }}
             />
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <motion.div 
        initial={{ y: 0 }}
        animate={{ y: isZen ? 100 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur text-white p-4 z-50 flex justify-center gap-4 border-t border-gray-800"
      >
         <span className="text-sm font-mono">
            Page {mode === 'vertical' ? '-' : currentPage + 1} / {images.length}
         </span>
         {mode === 'single' && (
           <div className="flex gap-2">
             <button onClick={prevPage} disabled={currentPage === 0} className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 border border-gray-700">Prev</button>
             <button onClick={nextPage} disabled={currentPage === images.length - 1} className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 border border-gray-700">Next</button>
           </div>
         )}
      </motion.div>

    </div>
  );
};