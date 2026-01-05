import React from 'react';
import { useMangaCharacters } from '../hooks/useManga';

interface CharacterListProps {
  malId?: number;
}

export const CharacterList: React.FC<CharacterListProps> = ({ malId }) => {
  const { data: characters, isLoading } = useMangaCharacters(malId);

  if (!malId) return null;
  if (isLoading) return <div className="h-32 animate-pulse bg-gray-100 rounded-xl mb-6"></div>;
  if (!characters || characters.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="font-bold text-gray-900 mb-4">Characters</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {characters.map((char) => (
          <div key={char.character.mal_id} className="flex-shrink-0 w-24">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-transparent hover:border-brand-500 transition-colors">
              <img 
                src={char.character.images.webp.image_url} 
                alt={char.character.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-xs font-medium text-center text-gray-900 line-clamp-1">
              {char.character.name}
            </p>
            <p className="text-[10px] text-center text-gray-500">
              {char.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
