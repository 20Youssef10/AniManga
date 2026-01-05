import React, { useState } from 'react';

// Mock User Interface
interface User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export const AuthStatus: React.FC = () => {
  // Static Demo User state
  const [user] = useState<User>({ 
    displayName: "Demo Guest", 
    email: "demo@animanga.net", 
    isAnonymous: true,
    photoURL: null 
  });
  
  const [showMenu, setShowMenu] = useState(false);

  // No-ops for demo
  const handleLogout = () => {
    alert("Logout is disabled in Demo Mode. Your library is stored in LocalStorage.");
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
           D
        </div>
        <span className="hidden sm:inline">
          Demo Mode
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 mb-1">
            Using Local Storage
          </div>
          <a href="/library" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Library</a>
          <button 
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};