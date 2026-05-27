import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, BookmarkPlus, BookmarkCheck, Info } from 'lucide-react';
import { type TMDBMovie, getPosterURL, getTitle, getYear, getMediaType } from '@/api/tmdb';
import type { MediaType } from '@/api/tmdb';
import { useCardModal } from './CardModalProvider';

interface MovieCardProps {
  item: TMDBMovie;
  index: number;
  rank?: number;
  largeRank?: boolean;
  onPlay: (id: number, type: MediaType) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const getMetallicRankStyle = (r: number): React.CSSProperties => {
  if (r === 1) {
    return {
      background: 'linear-gradient(to bottom, #ffe066 0%, #f59e0b 50%, #92400e 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      WebkitTextStroke: '1.2px rgba(253, 224, 71, 0.35)',
      filter: 'drop-shadow(0 4px 20px rgba(250, 204, 21, 0.45))',
    } as React.CSSProperties;
  }
  if (r === 2) {
    return {
      background: 'linear-gradient(to bottom, #ffffff 0%, #cbd5e1 50%, #475569 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      WebkitTextStroke: '1.2px rgba(226, 232, 240, 0.25)',
      filter: 'drop-shadow(0 4px 20px rgba(209, 213, 219, 0.3))',
    } as React.CSSProperties;
  }
  if (r === 3) {
    return {
      background: 'linear-gradient(to bottom, #ffedd5 0%, #ca8a04 50%, #78350f 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      WebkitTextStroke: '1.2px rgba(202, 138, 4, 0.25)',
      filter: 'drop-shadow(0 4px 20px rgba(217, 119, 6, 0.35))',
    } as React.CSSProperties;
  }
  return {
    color: 'rgba(255, 255, 255, 0.03)',
    WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.04)',
  } as React.CSSProperties;
};

export default function MovieCard({ item, index, rank, largeRank, onPlay, isBookmarked, onToggleBookmark }: MovieCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openCardModal } = useCardModal();
  const title = getTitle(item);
  const year = getYear(item);
  const mediaType = getMediaType(item);
  const poster = getPosterURL(item.poster_path);
  const rating = item.vote_average;

  const rankColors: Record<number, { bg: string; text: string }> = {
    1: { bg: 'from-yellow-400 to-amber-600', text: 'text-yellow-900' },
    2: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-900' },
    3: { bg: 'from-amber-600 to-amber-800', text: 'text-amber-100' },
  };
  const defaultRankColor = { bg: 'from-dark-600 to-dark-800', text: 'text-white/80' };
  const rankStyle = rank && rank <= 3 ? rankColors[rank] : defaultRankColor;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleClick = () => {
    openCardModal(item);
  };



  const springHover = { type: 'spring' as const, stiffness: 300, damping: 22 };

  return (
    <motion.div
      className="relative flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px] group cursor-pointer animate-fade-in"
      style={{
        animationDelay: `${Math.min(index * 50, 500)}ms`,
        animationFillMode: 'both',
        zIndex: isHovered ? 50 : 10,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4, transition: springHover }}
    >
      {/* Large Rank Behind Poster */}
      {largeRank && rank && (
        <div className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-0 select-none pointer-events-none">
          <span
            className="font-black tracking-tighter leading-[0.85]"
            style={{
              fontSize: 'clamp(5rem, 12vw, 9rem)',
              ...getMetallicRankStyle(rank),
            }}
          >
            {rank.toString().padStart(2, '0')}
          </span>
        </div>
      )}

      <div
        className="relative aspect-[2/3] rounded-2xl overflow-hidden will-change-transform"
        style={{ zIndex: isHovered ? 40 : 10 }}
      >
        {/* Placeholder */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-dark-700 rounded-2xl" />
        )}

        {/* Poster */}
        {poster && (
          <img
            src={poster}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-200" />

        {/* Rank Badge (top-left small) */}
        {rank && (
          <div className="absolute top-0 left-0 z-20">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-br-xl bg-gradient-to-r ${rankStyle.bg} shadow-lg backdrop-blur-sm`}>
              <span className={`text-xs font-black ${rankStyle.text} tabular-nums`}>
                {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}
              </span>
            </div>
          </div>
        )}

        {/* Rating badge (top-right) */}
        <div className="absolute top-2 right-2 z-20">
          <div className="px-1.5 py-0.5 rounded-md bg-dark-900/80 text-[10px] font-bold text-white">
            {Math.round(rating * 10)}%
          </div>
        </div>

        {/* Bookmark Button */}
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

        {/* Bottom Bar */}
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(item.id, mediaType);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-all duration-200 text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                <span>Play</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openCardModal(item);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-all duration-200 text-sm font-medium"
              >
                <Info className="w-4 h-4" />
                <span>Info</span>
              </button>
              <div className="flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-medium text-white/70">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Title & Meta Below Card */}
      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-white line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {year && <span className="text-xs text-white/40">{year}</span>}
          <span className="text-xs text-white/30 uppercase">{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
        </div>
      </div>


    </motion.div>
  );
}
