import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Star, Clock, Film, Tv } from 'lucide-react';
import { type TMDBMovie, getMediaType } from '@/api/tmdb';
import type { MediaType } from '@/api/tmdb';
import MovieCard from './MovieCard';

interface ContentRowProps {
  title: string;
  items: TMDBMovie[];
  icon?: 'sparkles' | 'trending' | 'star' | 'clock' | 'film' | 'tv';
  showRanking?: boolean;
  onPlay: (id: number, type: MediaType) => void;
  isBookmarked?: (id: number, type: MediaType) => boolean;
  onToggleBookmark?: (item: TMDBMovie) => void;
}

export default function ContentRow({
  title,
  items,
  icon = 'sparkles',
  showRanking = false,
  onPlay,
  isBookmarked,
  onToggleBookmark,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const icons = {
    sparkles: Sparkles,
    trending: TrendingUp,
    star: Star,
    clock: Clock,
    film: Film,
    tv: Tv,
  };
  const IconComponent = icons[icon];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative py-4 sm:py-6"
    >
      {/* Section Header */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, rotate: -90, scale: 0 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="p-2 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 border border-purple-500/20"
          >
            <IconComponent className="w-4 h-4 text-purple-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl lg:text-2xl font-bold text-white"
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 h-px bg-gradient-to-r from-purple-500/50 via-cyan-500/30 to-transparent origin-left"
          />
        </div>
      </div>

      {/* Scroll Container */}
      <div className="relative group/row">
        {/* Left Arrow */}
        <motion.button
          className="absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center justify-center bg-gradient-to-r from-dark-900 to-transparent opacity-0 group-hover/row:opacity-100 hover:scale-110 active:scale-90 will-change-transform transition-all duration-200"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </motion.button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((item, index) => {
            const mediaType = getMediaType(item);
            return (
              <div key={`${item.id}-${index}`} style={{ scrollSnapAlign: 'start' }}>
                <MovieCard
                  item={item}
                  index={index}
                  rank={showRanking ? index + 1 : undefined}
                  onPlay={onPlay}
                  isBookmarked={isBookmarked?.(item.id, mediaType)}
                  onToggleBookmark={onToggleBookmark ? () => onToggleBookmark(item) : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <motion.button
          className="absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-center bg-gradient-to-l from-dark-900 to-transparent opacity-0 group-hover/row:opacity-100 hover:scale-110 active:scale-90 will-change-transform transition-all duration-200"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </motion.section>
  );
}
