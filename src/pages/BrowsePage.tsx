import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useDiscover } from '@/api/useTMDB';
import MovieCard from '@/components/MovieCard';
import { GENRE_OPTIONS, LANGUAGE_OPTIONS, YEAR_OPTIONS, DUBBED_OPTIONS, CATEGORY_GROUPS } from '@/data/categories';
import { useApp } from '@/contexts/AppContext';
import type { MediaType, TMDBMovie } from '@/types';

type FilterKey = 'type' | 'genre' | 'language' | 'year' | 'translations';

function getFilterLabel(value: string): string {
  const maps = [GENRE_OPTIONS, LANGUAGE_OPTIONS, YEAR_OPTIONS, DUBBED_OPTIONS];
  for (const map of maps) {
    const found = map.find(o => o.value === value);
    if (found) return found.label;
  }
  return value;
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
  const genre = searchParams.get('genre') || '';
  const language = searchParams.get('language') || '';
  const year = searchParams.get('year') || '';
  const translations = searchParams.get('translations') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, isLoading, error } = useDiscover(type, genre, language, year, page, translations);
  const { isBookmarked, openDetail, playContent, handleToggleBookmarkForDetail } = useApp();

  const activeFilters = useMemo(() => {
    const filters: { key: FilterKey; label: string; value: string }[] = [];
    if (genre) filters.push({ key: 'genre', label: `Genre: ${getFilterLabel(genre)}`, value: genre });
    if (language) filters.push({ key: 'language', label: `Language: ${getFilterLabel(language)}`, value: language });
    if (year) filters.push({ key: 'year', label: `Year: ${getFilterLabel(year)}`, value: year });
    if (translations) filters.push({ key: 'translations', label: `Dubbed: ${getFilterLabel(translations)}`, value: translations });
    return filters;
  }, [genre, language, year, translations]);

  const removeFilter = (key: FilterKey) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const changeType = (newType: 'movie' | 'tv') => {
    const next = new URLSearchParams(searchParams);
    next.set('type', newType);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleInfo = (id: number, mtype: MediaType) => openDetail(id, mtype);
  const handlePlay = (id: number, mtype: MediaType) => playContent(id, mtype);
  const handleBookmark = (item: any) => handleToggleBookmarkForDetail({
    id: item.id,
    mediaType: (item.media_type || type) as MediaType,
    title: item.title || item.name || '',
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
    rating: item.vote_average,
    year: item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '',
    overview: item.overview,
  });

  const title = activeFilters.length > 0
    ? activeFilters.map(f => f.label.replace(/^\w+:\s*/, '')).join(', ')
    : (type === 'movie' ? 'Discover Movies' : 'Discover TV Shows');

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-black text-white">{title}</h1>
          <p className="text-white/40 text-sm mt-1">
            {data?.total_results ? `${data.total_results} results found` : 'Browse our collection'}
          </p>
        </motion.div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeType('movie')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${type === 'movie' ? 'bg-purple-600/30 text-purple-300' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            Movies
          </button>
          <button
            onClick={() => changeType('tv')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${type === 'tv' ? 'bg-purple-600/30 text-purple-300' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            TV Shows
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 flex-wrap mb-6">
          {activeFilters.map(f => (
            <span
              key={f.key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-xs text-purple-300"
            >
              {f.label}
              <button onClick={() => removeFilter(f.key)} className="hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => setSearchParams({ type })}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Clear all
          </button>
        </motion.div>
      )}

      {/* Quick Category Access */}
      {activeFilters.length === 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 mb-8">
          {CATEGORY_GROUPS[0].items.slice(0, 18).map(g => (
            <button
              key={g.value}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('genre', g.value);
                next.set('page', '1');
                setSearchParams(next);
              }}
              className="px-3 py-2 rounded-xl glass text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-center"
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-red-400/80 text-sm mb-2">Failed to load results</p>
          <p className="text-white/30 text-xs">The server may be unavailable. Try selecting a different category.</p>
        </motion.div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {(data?.results || []).map((item: TMDBMovie, i: number) => (
              <MovieCard
                key={`${item.id}-${i}`}
                item={item}
                index={i}
                onClick={handleInfo}
                onPlay={handlePlay}
                isBookmarked={isBookmarked(item.id, (item.media_type || type) as MediaType)}
                onToggleBookmark={() => handleBookmark(item)}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(page - 1));
                  setSearchParams(next);
                }}
                className="px-5 py-2.5 rounded-xl glass text-sm text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              >
                Previous
              </button>
              <span className="text-sm text-white/40">
                Page {page} of {Math.min(data.total_pages, 500)}
              </span>
              <button
                disabled={page >= data.total_pages || page >= 500}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(page + 1));
                  setSearchParams(next);
                }}
                className="px-5 py-2.5 rounded-xl glass text-sm text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
