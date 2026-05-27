import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import { type TMDBMovie, getBackdropURL, getTitle, getYear, getMediaType, GENRES, getItemVideos } from '@/api/tmdb';

interface HeroProps {
  items: TMDBMovie[];
  onPlay: (id: number, type: 'movie' | 'tv') => void;
  onInfo: (id: number, type: 'movie' | 'tv') => void;
}

export default function Hero({ items, onPlay, onInfo }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [direction, setDirection] = useState(0);
  const [videoKeys, setVideoKeys] = useState<Map<number, string>>(new Map());
  const [showTrailer, setShowTrailer] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch video keys for hero items
  useEffect(() => {
    if (items.length === 0 || videosLoaded) return;
    const fetchVideos = async () => {
      const map = new Map<number, string>();
      const batch = items.slice(0, 5);
      const results = await Promise.allSettled(
        batch.map(item => getItemVideos(getMediaType(item), item.id))
      );
      batch.forEach((item, i) => {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value.length > 0) {
          map.set(item.id, result.value[0].key);
        }
      });
      setVideoKeys(map);
      setVideosLoaded(true);
      if (map.size > 0) setShowTrailer(true);
    };
    fetchVideos();
  }, [items, videosLoaded]);

  useEffect(() => {
    if (items.length === 0) return;
    autoRotateRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 5));
    }, 8000);
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [items.length]);

  const pauseAutoRotate = () => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      autoRotateRef.current = null;
    }
  };

  const resumeAutoRotate = () => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 5));
    }, 8000);
  };

  const handleMouseEnter = () => {
    pauseAutoRotate();
  };

  const handleMouseLeave = () => {
    resumeAutoRotate();
  };

  const current = items[currentIndex];
  if (!current) return null;

  const title = getTitle(current);
  const year = getYear(current);
  const mediaType = getMediaType(current);
  const backdrop = getBackdropURL(current.backdrop_path);
  const genreNames = current.genre_ids?.slice(0, 3).map(id => GENRES[id]).filter(Boolean) || [];
  const videoKey = videoKeys.get(current.id);
  const showVideo = showTrailer && videoKey;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      className="relative w-full h-[85vh] sm:h-[90vh] lg:h-screen overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Background with Ken Burns */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {backdrop && (
            <img
              src={backdrop}
              alt={title}
              className="w-full h-full object-cover animate-ken-burns"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Video Preview Overlay */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[5]"
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=${videoKey}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`}
              className="w-full h-full pointer-events-none"
              style={{ 
                border: 'none',
                transform: 'scale(1.1)',
                filter: 'brightness(0.7)',
              }}
              allow="autoplay; encrypted-media"
              title="Trailer preview"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="ambient-light bg-purple-600 top-1/4 -left-20" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />
      </div>

      {/* Gradient Overlays */}
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />

      {/* Scan Line Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-4">
        <div className="w-full h-px bg-purple-400/30" style={{ animation: 'scan-line 8s linear infinite' }} />
      </div>

      {/* CRT overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] animate-static mix-blend-screen" />

      {/* Content — bottom-left overlay */}
      <div className="relative z-10 h-full flex items-end justify-start pb-16 sm:pb-20 lg:pb-24">
        <div className="px-4 sm:px-6 lg:px-8 w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-2 sm:space-y-3">
              {/* Badge Row */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/25">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold text-yellow-300">{current.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <TrendingUp className="w-3 h-3 text-purple-400" />
                  <span className="text-[9px] font-semibold text-purple-300 uppercase tracking-wider">
                    {mediaType === 'tv' ? 'Featured Series' : 'Featured Film'}
                  </span>
                </div>
                {year && (
                  <span className="text-xs text-white/50">{year}</span>
                )}
              </motion.div>

              {/* Title */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"
                >
                  {title}
                </motion.h1>
              </AnimatePresence>

              {/* Genres */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 flex-wrap"
              >
                {genreNames.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    {genreNames.map((g, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" />}
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Overview */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs sm:text-sm text-white/50 leading-relaxed line-clamp-2 max-w-md"
              >
                {current.overview}
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 pt-1"
              >
                <motion.button
                  onClick={() => onPlay(current.id, mediaType)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/30"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Now</span>
                </motion.button>

                <motion.button
                  onClick={() => setShowTrailer(!showVideo)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl glass hover:bg-white/10 text-white font-semibold text-xs sm:text-sm transition-all"
                >
                  <Play className="w-3 h-3" />
                  <span>{showVideo ? 'Hide Trailer' : 'Trailer'}</span>
                </motion.button>

                <motion.button
                  onClick={() => onInfo(current.id, mediaType)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl glass hover:bg-white/10 text-white font-semibold text-xs sm:text-sm transition-all"
                >
                  <Info className="w-4 h-4" />
                  <span>More Info</span>
                </motion.button>

                <motion.button
                  onClick={() => setMuted(!muted)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden sm:flex p-2 rounded-lg glass hover:bg-white/10 transition-all"
                >
                  {muted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white/60" />}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {items.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-8 bg-purple-500' : 'w-3 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
