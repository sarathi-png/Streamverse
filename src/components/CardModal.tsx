import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Info, BookmarkPlus, BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { type TMDBMovie, getBackdropURL, getPosterURL, getTitle, getYear, getMediaType, GENRES } from '@/api/tmdb';
import { useMovieDetail, useTVDetail, useMovieCertification, useTVCertification, useMovieRecommendations } from '@/api/useTMDB';
import { useApp } from '@/contexts/AppContext';
import CastRow from './CastRow';

interface CardModalProps {
  isOpen: boolean;
  item: TMDBMovie | null;
  onClose: () => void;
}

export default function CardModal({ isOpen, item, onClose }: CardModalProps) {
  const { isBookmarked, handleToggleBookmark, playContent, openDetail } = useApp();
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const mediaType = item ? getMediaType(item) : 'movie';
  const itemDetail = useMovieDetail(mediaType === 'movie' ? item?.id ?? null : null);
  const tvDetail = useTVDetail(mediaType === 'tv' ? item?.id ?? null : null);
  const movieCert = useMovieCertification(mediaType === 'movie' ? item?.id ?? null : null);
  const tvCert = useTVCertification(mediaType === 'tv' ? item?.id ?? null : null);
  const recommendations = useMovieRecommendations(item?.id ?? null, mediaType);

  const detail = mediaType === 'movie' ? itemDetail.data : tvDetail.data;

  useEffect(() => {
    if (isOpen) {
      setExpandedDesc(false);
      setImgLoaded(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!item) return null;

  const title = getTitle(item);
  const year = getYear(item);
  const backdrop = getBackdropURL(item.backdrop_path || detail?.backdrop_path || null);
  const poster = getPosterURL(item.poster_path || detail?.poster_path || null);
  const genres = detail?.genres || item.genre_ids?.map(id => ({ id, name: GENRES[id] })).filter(g => g.name) || [];
  const overview = detail?.overview || item.overview || '';
  const rating = detail?.vote_average ?? item.vote_average ?? 0;
  const runtime = detail?.runtime;
  const cast = detail?.credits?.cast?.slice(0, 20) || [];
  const recommendationsList = recommendations.data?.results?.slice(0, 10) || [];

  const certification = (movieCert.data?.results?.find(r => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification)
    || (tvCert.data?.results?.find(r => r.iso_3166_1 === 'US')?.rating)
    || null;

  const ratingColor = rating >= 7 ? '#22c55e' : rating >= 5 ? '#eab308' : '#ef4444';
  const bookmarked = isBookmarked(item.id, mediaType);

  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    playContent(item.id, mediaType);
    onClose();
  };

  const handleMoreInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDetail(item.id, mediaType);
    onClose();
  };

  const handleRecClick = (recItem: TMDBMovie) => {
    openDetail(recItem.id, getMediaType(recItem));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0f1a] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Backdrop Section */}
            <div className="relative h-[35vh] sm:h-[45vh] overflow-hidden rounded-t-3xl">
              {backdrop && (
                <img
                  src={backdrop}
                  alt={title}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgLoaded(true)}
                />
              )}
              {!imgLoaded && (
                <div className="absolute inset-0 bg-dark-800 shimmer-bg" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a]/80 to-transparent" />

              {/* Poster overlay on backdrop */}
              <div className="absolute -bottom-16 left-6 sm:left-8 z-20 flex items-end gap-5">
                <div className="w-24 sm:w-32 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 aspect-[2/3]">
                  {poster && (
                    <img src={poster} alt={title} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="pt-20 px-6 sm:px-8 pb-8 space-y-6">
              {/* Title & Meta */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {year && <span className="text-white/50">{year}</span>}
                  {certification && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md border border-white/20 text-white/70 uppercase">
                      {certification}
                    </span>
                  )}
                  {runtime && <span className="text-white/50">{Math.floor(runtime / 60)}h {runtime % 60}m</span>}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `conic-gradient(${ratingColor} ${rating * 10}%, rgba(255,255,255,0.1) 0%)`, padding: '2px' }}
                    >
                      <div className="w-full h-full rounded-full bg-dark-900/90 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">{Math.round(rating * 10)}%</span>
                      </div>
                    </div>
                    <span className="text-white/70 text-xs">User Score</span>
                  </div>
                </div>
                {/* Genre Tags */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g: { id: number; name: string }) => (
                      <span key={g.id} className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/70 border border-white/5">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleWatch}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Watch Now
                </button>
                <button
                  onClick={handleMoreInfo}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-white font-medium transition-all hover:scale-105 active:scale-95"
                >
                  <Info className="w-4 h-4" />
                  More Info
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleBookmark(item); }}
                  className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all hover:scale-110 active:scale-90"
                >
                  {bookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-purple-400" />
                  ) : (
                    <BookmarkPlus className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </div>

              {/* Synopsis */}
              {overview && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Synopsis</h3>
                  <div className="relative">
                    <p className={`text-sm text-white/60 leading-relaxed ${!expandedDesc ? 'line-clamp-3' : ''}`}>
                      {overview}
                    </p>
                    {overview.length > 200 && (
                      <button
                        onClick={() => setExpandedDesc(!expandedDesc)}
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
                      >
                        {expandedDesc ? 'Show less' : 'Show more'}
                        {expandedDesc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Cast</h3>
                  <CastRow cast={cast} />
                </div>
              )}

              {/* Recommendations */}
              {recommendationsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">You May Also Like</h3>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {recommendationsList.map((rec: TMDBMovie) => (
                      <button
                        key={rec.id}
                        onClick={() => handleRecClick(rec)}
                        className="flex-shrink-0 w-28 group text-left"
                      >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-dark-700 mb-2 group-hover:ring-2 ring-purple-500 transition-all">
                          {rec.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                              alt={getTitle(rec)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10 text-4xl font-bold">?</div>
                          )}
                        </div>
                        <p className="text-xs text-white/70 line-clamp-1 group-hover:text-purple-300 transition-colors">
                          {getTitle(rec)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
