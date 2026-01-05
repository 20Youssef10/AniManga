import React from 'react';
import { AniListCharacter } from '../types';

interface CharacterListProps {
  characters?: AniListCharacter[];
}

export const CharacterList: React.FC<CharacterListProps> = ({ characters }) => {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Characters</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {characters.map((char, idx) => (
          <div key={`${char.name.full}-${idx}`} className="flex-shrink-0 w-24">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-transparent hover:border-brand-500 transition-colors bg-gray-200">
              {char.image?.medium && (
                  <img 
                    src={char.image.medium} 
                    alt={char.name.full}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
              )}
            </div>
            <p className="text-xs font-medium text-center text-gray-900 dark:text-gray-200 line-clamp-1">
              {char.name.full}
            </p>
            {char.role && (
                <p className="text-[10px] text-center text-gray-500 capitalize">
                {char.role.toLowerCase()}
                </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};