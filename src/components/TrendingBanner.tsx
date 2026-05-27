import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, TrendingUp, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { type TMDBMovie, getBackdropURL, getTitle, getYear, getMediaType, GENRES, getItemVideos } from '@/api/tmdb';

interface TrendingBannerProps {
  items: TMDBMovie[];
  onPlay: (id: number, type: 'movie' | 'tv') => void;
  onInfo: (id: number, type: 'movie' | 'tv') => void;
}

export default function TrendingBanner({ items, onPlay, onInfo }: TrendingBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [direction, setDirection] = useState(0);
  const [videoKeys, setVideoKeys] = useState<Map<number, string>>(new Map());
  const [videosLoaded, setVideosLoaded] = useState(false);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length === 0 || videosLoaded) return;
    const fetchVideos = async () => {
      const map = new Map<number, string>();
      const batch = items.slice(0, 10);
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
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 10));
    }, 5000);
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [items.length]);

  const pauseAutoRotate = () => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      autoRotateRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const resumeAutoRotate = () => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 10));
    }, 5000);
  };

  const scheduleResume = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(resumeAutoRotate, 10000);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    pauseAutoRotate();
    scheduleResume();
  };

  const goNext = () => {
    const next = (currentIndex + 1) % Math.min(items.length, 10);
    setDirection(1);
    setCurrentIndex(next);
    pauseAutoRotate();
    scheduleResume();
  };

  const goPrev = () => {
    const prev = (currentIndex - 1 + Math.min(items.length, 10)) % Math.min(items.length, 10);
    setDirection(-1);
    setCurrentIndex(prev);
    pauseAutoRotate();
    scheduleResume();
  };

  const current = items[currentIndex];
  if (!current || items.length === 0) return null;

  const title = getTitle(current);
  const year = getYear(current);
  const mediaType = getMediaType(current);
  const backdrop = getBackdropURL(current.backdrop_path);
  const genreNames = current.genre_ids?.slice(0, 3).map(id => GENRES[id]).filter(Boolean) || [];
  const videoKey = videoKeys.get(current.id);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const displayCount = Math.min(items.length, 10);

  return (
    <div
      className="relative w-full h-[55vh] sm:h-[60vh] lg:h-[65vh] overflow-hidden"
      onMouseEnter={pauseAutoRotate}
      onMouseLeave={resumeAutoRotate}
    >
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
            <img src={backdrop} alt={title} className="w-full h-full object-cover" />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {videoKey && (
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
              style={{ border: 'none', transform: 'scale(1.1)', filter: 'brightness(0.6)' }}
              allow="autoplay; encrypted-media"
              title="Trailer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark-900 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all duration-150 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all duration-150 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="relative z-10 h-full flex items-end pb-16 sm:pb-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl space-y-3"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">Trending #{currentIndex + 1}</span>
              </div>
              {year && <span className="text-xs text-white/50">{year}</span>}
              <span className="flex items-center gap-1 text-xs text-white/50">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {current.vote_average.toFixed(1)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.1] tracking-tight text-white">
              {title}
            </h2>

            {genreNames.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-white/50 flex-wrap">
                {genreNames.map((g, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" />}
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onPlay(current.id, mediaType)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30"
              >
                <Play className="w-4 h-4 fill-white" />
                <span className="text-sm">Watch Now</span>
              </button>
              <button
                onClick={() => onInfo(current.id, mediaType)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
              >
                <Info className="w-4 h-4" />
                <span>More Info</span>
              </button>
              <button
                onClick={() => setMuted(!muted)}
                className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-90"
              >
                {muted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white/60" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {Array.from({ length: displayCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-6 bg-purple-500' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
