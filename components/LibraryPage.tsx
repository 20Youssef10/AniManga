import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../hooks/useLibrary';
import { ReadingStatus, LibraryEntry } from '../types';

const statusTabs: { id: ReadingStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading' },
  { id: 'completed', label: 'Completed' },
  { id: 'plan_to_read', label: 'Plan to Read' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
];

export const LibraryPage: React.FC = () => {
  const { data: library, isLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'all'>('reading');

  const filteredLibrary = library?.filter(entry => 
    activeTab === 'all' ? true : entry.status === activeTab
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">My Library</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!library && !isLoading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
           <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
           <p className="text-gray-500">You need to be logged in to manage your library.</p>
        </div>
     )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-900">My Library</h2>
        
        {/* MAL Sync Button Mock */}
        <button 
          className="flex items-center gap-2 bg-[#2e51a2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#203a75] transition-colors"
          title="Connects your MAL account (Sync not fully implemented in demo)"
          onClick={() => alert("In a production app, this would start the OAuth2 flow with MyAnimeList. Currently, we just store the MAL ID locally.")}
        >
           <img src="https://myanimelist.net/img/common/p_icon_nest.png" alt="MAL" className="w-4 h-4 rounded-full bg-white p-0.5" />
           Sync MAL
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 border-b border-gray-200 gap-6 scrollbar-hide">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap pb-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredLibrary && filteredLibrary.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredLibrary.map((entry: LibraryEntry) => (
            <Link 
              key={entry.mangaId} 
              to={`/manga/${entry.mangaId}`}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="aspect-[2/3] bg-gray-200 relative overflow-hidden">
                {entry.coverUrl ? (
                  <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Cover</div>
                )}
                
                {/* Progress Overlay */}
                {entry.currentChapterNumber && (
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                      <p className="text-white text-xs font-bold">
                        Ch. {entry.currentChapterNumber} 
                        {entry.currentPage && <span className="font-normal opacity-80 ml-1">(Page {entry.currentPage + 1})</span>}
                      </p>
                   </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">{entry.title}</h3>
                <div className="flex justify-between items-center mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${
                        entry.status === 'reading' ? 'bg-blue-100 text-blue-700' :
                        entry.status === 'completed' ? 'bg-green-100 text-green-700' :
                        entry.status === 'dropped' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {entry.status.replace(/_/g, ' ')}
                    </span>
                    {entry.malScore && (
                        <span className="text-xs font-bold text-yellow-600 flex items-center gap-0.5">
                            ★ {entry.malScore}
                        </span>
                    )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 font-medium">No manga in {activeTab.replace(/_/g, ' ')}</p>
          <Link to="/" className="text-brand-600 text-sm hover:underline mt-2 inline-block">Discover Manga</Link>
        </div>
      )}
    </div>
  );
};
