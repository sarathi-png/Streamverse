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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleMouseEnter = (index: number) => {
    pauseAutoRotate();
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(index);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredIndex(null);
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
  const showVideo = hoveredIndex === currentIndex && videoKey;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      className="relative w-full h-[85vh] sm:h-[90vh] lg:h-screen overflow-hidden"
      onMouseEnter={() => handleMouseEnter(currentIndex)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Background */}
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
              className="w-full h-full object-cover"
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
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoKey}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`}
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
      <div className="absolute inset-0 pointer-events-none animate-hue-shift">
        <div className="ambient-light bg-purple-600 top-1/4 -left-20" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />
        <div className="ambient-light bg-cyan-500 bottom-1/4 right-0" style={{ animation: 'pulse-glow 4s ease-in-out infinite 2s' }} />
      </div>

      {/* Gradient Overlays */}
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />

      {/* Scan Line Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-px bg-cyan-400" style={{ animation: 'scan-line 8s linear infinite' }} />
      </div>

      {/* CRT overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] animate-static mix-blend-screen" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-24 sm:pb-32 lg:pb-40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl space-y-4 sm:space-y-6"
          >
            {/* Badge */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm"
              >
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  {mediaType === 'tv' ? 'Featured Series' : 'Featured Film'}
                </span>
              </motion.div>
              {year && (
                <span className="text-sm text-white/50">{year}</span>
              )}
            </div>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight"
              >
                <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                  {title}
                </span>
              </motion.h1>
            </AnimatePresence>

            {/* Meta */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-white">{(current.vote_average).toFixed(1)}</span>
              </div>
              {genreNames.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-white/50">
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
              transition={{ delay: 0.7 }}
              className="text-sm sm:text-base text-white/60 leading-relaxed line-clamp-3 max-w-lg"
            >
              {current.overview}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 pt-2"
            >
              <motion.button
                onClick={() => onPlay(current.id, mediaType)}
                className="group flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95 will-change-transform shadow-lg shadow-purple-600/30"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Now</span>
              </motion.button>

              <motion.button
                onClick={() => onInfo(current.id, mediaType)}
                className="flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl glass hover:bg-white/10 text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95 will-change-transform"
              >
                <Info className="w-5 h-5" />
                <span>More Info</span>
              </motion.button>

              <motion.button
                onClick={() => setMuted(!muted)}
                className="hidden sm:flex p-3 rounded-xl glass hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-90 will-change-transform"
              >
                {muted ? <VolumeX className="w-5 h-5 text-white/60" /> : <Volume2 className="w-5 h-5 text-white/60" />}
              </motion.button>
            </motion.div>
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
