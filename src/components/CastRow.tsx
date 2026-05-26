import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastRowProps {
  cast: CastMember[];
}

const IMG_BASE = 'https://image.tmdb.org/t/p/w185';

export default function CastRow({ cast }: CastRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!cast || cast.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto hide-scrollbar px-1 py-2">
        {cast.map((person) => (
          <div key={person.id} className="flex-shrink-0 w-24 text-center">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-dark-700 border-2 border-white/10 mb-2">
              {person.profile_path ? (
                <img
                  src={`${IMG_BASE}${person.profile_path}`}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-bold">
                  ?
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-white/80 line-clamp-1">{person.name}</p>
            <p className="text-[10px] text-white/40 line-clamp-1">{person.character}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
