import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme, direction, toggleDirection } = useTheme();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-6">
         {/* Appearance */}
         <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <span className="text-xl">🎨</span> Appearance
            </h2>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <button 
                     onClick={toggleTheme}
                     className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-brand-600' : 'bg-gray-300'}`}
                  >
                     <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Interface Direction (RTL)</span>
                  <button 
                     onClick={toggleDirection}
                     className={`w-12 h-6 rounded-full transition-colors relative ${direction === 'rtl' ? 'bg-brand-600' : 'bg-gray-300'}`}
                  >
                     <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${direction === 'rtl' ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
            </div>
         </section>

         {/* Reader */}
         <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <span className="text-xl">📖</span> Reader Defaults
            </h2>
            <div className="space-y-4">
               <div className="flex flex-col gap-2">
                  <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Default View Mode</label>
                  <select 
                     value={settings.readerMode}
                     onChange={(e) => updateSettings({ readerMode: e.target.value as any })}
                     className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5"
                  >
                     <option value="vertical">Vertical (Webtoon)</option>
                     <option value="single">Single Page</option>
                  </select>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Image Quality (Data Saver)</label>
                  <select 
                     value={settings.readerQuality}
                     onChange={(e) => updateSettings({ readerQuality: e.target.value as any })}
                     className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5"
                  >
                     <option value="data">High Quality</option>
                     <option value="dataSaver">Data Saver (Compressed)</option>
                  </select>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
};