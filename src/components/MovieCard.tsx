import { useState } from 'react';
import { Play, Star, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { type TMDBMovie, getPosterURL, getTitle, getYear, getMediaType, GENRES } from '@/api/tmdb';
import type { MediaType } from '@/api/tmdb';
import { useCardModal } from './CardModalProvider';

interface MovieCardProps {
  item: TMDBMovie;
  index: number;
  rank?: number;
  onPlay: (id: number, type: MediaType) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export default function MovieCard({ item, index, rank, onPlay, isBookmarked, onToggleBookmark }: MovieCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openCardModal } = useCardModal();
  const title = getTitle(item);
  const year = getYear(item);
  const mediaType = getMediaType(item);
  const poster = getPosterURL(item.poster_path);
  const rating = item.vote_average;
  const genreName = item.genre_ids?.[0] ? GENRES[item.genre_ids[0]] : '';
  const genreNames = item.genre_ids?.slice(0, 3).map(id => GENRES[id]).filter(Boolean) || [];

  const ratingColor = rating >= 7 ? '#22c55e' : rating >= 5 ? '#eab308' : '#ef4444';

  const rankColors: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: 'from-yellow-400 to-amber-600', text: 'text-yellow-900', label: '1st' },
    2: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-900', label: '2nd' },
    3: { bg: 'from-amber-600 to-amber-800', text: 'text-amber-100', label: '3rd' },
  };
  const defaultRankColor = { bg: 'from-dark-600 to-dark-800', text: 'text-white/80', label: '' };

  const rankStyle = rank && rank <= 3 ? rankColors[rank] : defaultRankColor;
  const rankLabel = rank && rank <= 3 ? rankColors[rank].label : rank ? `${rank}th` : '';

  const handleClick = () => {
    openCardModal(item);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(item.id, mediaType);
  };

  return (
    <div
      className="relative flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px] group cursor-pointer animate-fade-in"
      style={{
        animationDelay: `${Math.min(index * 50, 500)}ms`,
        animationFillMode: 'both',
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative aspect-[2/3] rounded-2xl overflow-hidden card-glow will-change-transform transition-all duration-200 ease-out"
        style={{
          transform: isHovered ? 'scale(1.08) translateY(-6px)' : 'scale(1) translateY(0)',
          zIndex: isHovered ? 40 : 10,
          boxShadow: isHovered ? '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.35)' : undefined,
        }}
      >
        <div className="absolute inset-0 rounded-2xl z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(0, 240, 255, 0.2), inset 0 0 30px rgba(139, 92, 246, 0.1)' }}
        />

        {!imgLoaded && (
          <div className="absolute inset-0 bg-dark-700 shimmer-bg rounded-2xl" />
        )}
        {poster && (
          <img
            src={poster}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-200" />

        {rank && (
          <div className="absolute top-0 left-0 z-20">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-br-xl bg-gradient-to-r ${rankStyle.bg} shadow-lg backdrop-blur-sm`}>
              <span className={`text-xs font-black ${rankStyle.text} tabular-nums`}>{rankLabel}</span>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 z-20">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${ratingColor} ${rating * 10}%, rgba(255,255,255,0.1) 0%)`,
              padding: '2px',
            }}
          >
            <div className="w-full h-full rounded-full bg-dark-900/90 flex items-center justify-center backdrop-blur-sm">
              <span className="text-[10px] font-bold text-white">{Math.round(rating * 10)}%</span>
            </div>
          </div>
        </div>

        {onToggleBookmark && (
          <button
            className={`absolute z-20 p-1.5 rounded-lg glass opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 active:scale-90 will-change-transform ${rank ? 'top-8 left-1' : 'top-2 left-2'}`}
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-white/60" />
            )}
          </button>
        )}

        {isHovered && (
          <div className="absolute inset-0 z-30">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className="w-16 h-16 rounded-full bg-purple-600/90 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-purple-600/40 hover:scale-110 active:scale-90 transition-transform duration-150 will-change-transform"
                onClick={handlePlayClick}
              >
                <Play className="w-7 h-7 text-white fill-white ml-0.5" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-dark-900/85 backdrop-blur-md border-t border-white/10 rounded-b-2xl">
              {genreNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {genreNames.map(g => (
                    <span key={g} className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/70">{g}</span>
                  ))}
                </div>
              )}
              {item.overview && (
                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{item.overview}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/40">
                <span>★ {rating.toFixed(1)}</span>
                <span>•</span>
                <span>{year || 'N/A'}</span>
                <span>•</span>
                <span>{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
              </div>
            </div>
          </div>
        )}

        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-white/80">{rating.toFixed(1)}</span>
            </div>
            {genreName && (
              <span className="text-[10px] text-purple-300/70 uppercase tracking-wider font-medium">{genreName}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-purple-300 transition-colors duration-200">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {year && <span className="text-xs text-white/40">{year}</span>}
          <span className="text-xs text-white/30 uppercase">{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
        </div>
      </div>
    </div>
  );
}
