import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useDiscover } from '@/api/useTMDB';
import MovieCard from '@/components/MovieCard';
import SkeletonCardRow from '@/components/SkeletonCardRow';
import { GENRE_OPTIONS, LANGUAGE_OPTIONS, YEAR_OPTIONS } from '@/data/categories';
import { useApp } from '@/contexts/AppContext';
import type { MediaType, TMDBMovie } from '@/types';

export default function BrowsePage() {
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useDiscover(type, genre, language, year, '', '', page);
  const { isBookmarked, playContent, handleToggleBookmarkForDetail } = useApp();

  const handlePlay = (id: number, mtype: MediaType) => playContent(id, mtype);
  const handleBookmark = (item: any) => handleToggleBookmarkForDetail({
    id: item.id,
    mediaType: (item.media_type || type) as MediaType,
    title: item.title || item.name || '',
    poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
    rating: item.vote_average,
    year: item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '',
    overview: item.overview,
  });

  const switchType = (t: 'movie' | 'tv') => {
    if (t === type) return;
    setType(t);
    setGenre('');
    setLanguage('');
    setYear('');
    setPage(1);
  };

  const toggleGenre = (g: string) => {
    setGenre(g === genre ? '' : g);
    setPage(1);
  };

  const toggleLanguage = (l: string) => {
    setLanguage(l === language ? '' : l);
    setPage(1);
  };

  const toggleYear = (y: string) => {
    setYear(y === year ? '' : y);
    setPage(1);
  };

  const clearFilters = () => {
    setGenre('');
    setLanguage('');
    setYear('');
    setPage(1);
  };

  const hasFilters = genre || language || year;

  const activeLabels = [
    genre && `Genre: ${GENRE_OPTIONS.find(o => o.value === genre)?.label || genre}`,
    language && `Language: ${LANGUAGE_OPTIONS.find(o => o.value === language)?.label || language}`,
    year && `Year: ${YEAR_OPTIONS.find(o => o.value === year)?.label || year}`,
  ].filter(Boolean) as string[];

  const title = hasFilters
    ? activeLabels.map(l => l.replace(/^\w+:\s*/, '')).join(', ')
    : (type === 'movie' ? 'Browse Movies' : 'Browse TV Shows');

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-black text-white">{title}</h1>
          <p className="text-white/40 text-sm mt-1">
            {data ? `${data.total_results || 0} result${data.total_results !== 1 ? 's' : ''} found` : 'Browse our collection'}
          </p>
        </motion.div>
        <div className="flex items-center gap-2">
          {['movie', 'tv'].map(t => (
            <button
              key={t}
              onClick={() => switchType(t as 'movie' | 'tv')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                type === t
                  ? 'bg-purple-600/30 text-purple-300 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 flex-wrap mb-6">
          {genre && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-xs text-purple-300">
              {GENRE_OPTIONS.find(o => o.value === genre)?.label}
              <button onClick={() => setGenre('')} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
            </span>
          )}
          {language && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-xs text-purple-300">
              {LANGUAGE_OPTIONS.find(o => o.value === language)?.label}
              <button onClick={() => setLanguage('')} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
            </span>
          )}
          {year && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-xs text-purple-300">
              {YEAR_OPTIONS.find(o => o.value === year)?.label}
              <button onClick={() => setYear('')} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-white/40 hover:text-white/60 transition-colors">Clear all</button>
        </motion.div>
      )}

      {/* Filter Buttons */}
      {!hasFilters && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mb-8">
          <div>
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Genre</h3>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(g => (
                <button
                  key={g.value}
                  onClick={() => toggleGenre(g.value)}
                  className="px-3 py-1.5 rounded-xl glass text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Language</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map(g => (
                <button
                  key={g.value}
                  onClick={() => toggleLanguage(g.value)}
                  className="px-3 py-1.5 rounded-xl glass text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Year</h3>
            <div className="flex flex-wrap gap-2">
              {YEAR_OPTIONS.map(g => (
                <button
                  key={g.value}
                  onClick={() => toggleYear(g.value)}
                  className="px-3 py-1.5 rounded-xl glass text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-red-400/80 text-sm mb-2">Failed to load results</p>
          <p className="text-white/30 text-xs">Try selecting a different filter or check your connection.</p>
        </motion.div>
      )}

      {/* Results */}
      {isLoading ? (
        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SkeletonCardRow count={12} />
        </motion.div>
      ) : (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {(data?.results ?? []).length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-white/40 text-sm">No results found</p>
              <p className="text-white/20 text-xs mt-1">Try different filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {(data?.results ?? []).map((item: TMDBMovie, i: number) => (
                  <MovieCard
                    key={`${item.id}-${i}`}
                    item={item}
                    index={i}
                    onPlay={handlePlay}
                    isBookmarked={isBookmarked(item.id, (item.media_type || type) as MediaType)}
                    onToggleBookmark={() => handleBookmark(item)}
                  />
                ))}
              </div>

              {(data?.total_pages ?? 0) > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-5 py-2.5 rounded-xl glass text-sm text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/40">
                    Page {page} of {Math.min(data?.total_pages ?? 1, 500)}
                  </span>
                  <button
                    disabled={page >= (data?.total_pages ?? 1) || page >= 500}
                    onClick={() => setPage(p => p + 1)}
                    className="px-5 py-2.5 rounded-xl glass text-sm text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
