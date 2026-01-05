import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, NavLink } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './store/queryClient';
import { HomePage } from './components/HomePage';
import { SearchPage } from './components/SearchPage';
import { LatestUpdatesPage } from './components/LatestUpdatesPage';
import { SettingsPage } from './components/SettingsPage';
import { MangaDetailPage } from './components/MangaDetailPage';
import { ReaderPage } from './components/ReaderPage';
import { LibraryPage } from './components/LibraryPage';
import { AuthStatus } from './components/AuthStatus';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { AnimatePresence, motion } from 'framer-motion';

// Layout component for pages with Header/Footer
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, direction, toggleDirection } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                A
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">
                AniManga<span className="text-brand-600 dark:text-brand-400">Net</span>
              </h1>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex gap-6">
                {[
                  ['Home', '/'],
                  ['Latest', '/latest'],
                  ['Search', '/search'],
                  ['Library', '/library'],
                ].map(([label, path]) => (
                  <NavLink 
                    key={path} 
                    to={path}
                    className={({ isActive }) => `text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    {label}
                  </NavLink>
                ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
               {/* Controls */}
               <Link to="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Settings">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
               </Link>

               <AuthStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
        <div className="flex justify-around items-center h-14">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-brand-600' : 'text-gray-500'}`}>
             <span className="text-xl">🏠</span>
          </NavLink>
          <NavLink to="/search" className={({isActive}) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-brand-600' : 'text-gray-500'}`}>
             <span className="text-xl">🔍</span>
          </NavLink>
          <NavLink to="/latest" className={({isActive}) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-brand-600' : 'text-gray-500'}`}>
             <span className="text-xl">🔥</span>
          </NavLink>
          <NavLink to="/library" className={({isActive}) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-brand-600' : 'text-gray-500'}`}>
             <span className="text-xl">📚</span>
          </NavLink>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto mb-14 md:mb-0">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Data provided by MangaDex and Jikan API.
          </div>
      </footer>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Animation Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout><PageTransition><HomePage /></PageTransition></MainLayout>} />
        <Route path="/latest" element={<MainLayout><PageTransition><LatestUpdatesPage /></PageTransition></MainLayout>} />
        <Route path="/search" element={<MainLayout><PageTransition><SearchPage /></PageTransition></MainLayout>} />
        <Route path="/settings" element={<MainLayout><PageTransition><SettingsPage /></PageTransition></MainLayout>} />
        <Route path="/library" element={<MainLayout><PageTransition><LibraryPage /></PageTransition></MainLayout>} />
        <Route path="/manga/:id" element={<MainLayout><PageTransition><MangaDetailPage /></PageTransition></MainLayout>} />
        <Route path="/read/:chapterId" element={<ReaderPage />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;