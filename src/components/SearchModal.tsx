import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Film, Tv } from 'lucide-react';
import { searchMulti, type TMDBMovie, getPosterURL, getTitle, getYear, getMediaType, GENRES } from '@/api/tmdb';
import type { MediaType } from '@/api/tmdb';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (id: number, type: MediaType) => void;
}

export default function SearchModal({ isOpen, onClose, onItemClick }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchMulti(q);
      setResults(data.results.filter((r: TMDBMovie) => r.media_type !== 'person' && (r.poster_path || r.backdrop_path)));
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, handleSearch]);

  const filteredResults = results.filter(r => {
    if (selectedFilter === 'all') return true;
    return r.media_type === selectedFilter;
  });

  const trendingSearches = ['Marvel', 'Avatar', 'Stranger Things', 'Breaking Bad', 'The Batman', 'Dune'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-dark-900/95 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-4xl mx-auto px-4 pt-20 sm:pt-24"
          >
            {/* Close */}
            <motion.button
              className="absolute top-4 right-4 p-2 rounded-xl glass hover:bg-white/10"
              onClick={onClose}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-white/60" />
            </motion.button>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 to-purple-600/5 blur-xl" />
              <div className="relative glass-strong rounded-2xl flex items-center gap-3 px-5 py-4">
                <Search className={`w-5 h-5 ${loading ? 'text-purple-400 animate-pulse' : 'text-white/40'}`} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, TV shows..."
                  className="flex-1 bg-transparent text-white text-lg placeholder-white/30 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-white/40 hover:text-white/60">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-4">
              {(['all', 'movie', 'tv'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedFilter === filter
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter === 'movie' ? 'Movies' : 'TV Shows'}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="mt-6 max-h-[60vh] overflow-y-auto hide-scrollbar">
              {query.length < 2 ? (
                /* Trending Searches */
                <div>
                  <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <motion.button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 rounded-xl glass text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : filteredResults.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <p className="text-white/30 text-lg">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResults.map((item, index) => {
                    const mediaType = getMediaType(item);
                    const title = getTitle(item);
                    const year = getYear(item);
                    const poster = getPosterURL(item.poster_path);
                    const rating = item.vote_average;
                    const genreName = item.genre_ids?.[0] ? GENRES[item.genre_ids[0]] : '';

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => { onItemClick(item.id, mediaType); onClose(); }}
                        className="flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/10 cursor-pointer transition-all group"
                      >
                        {/* Poster */}
                        <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-dark-700">
                          {poster ? (
                            <img src={poster} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {mediaType === 'tv' ? <Tv className="w-5 h-5 text-white/20" /> : <Film className="w-5 h-5 text-white/20" />}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            {year && <span className="text-xs text-white/40">{year}</span>}
                            <span className="text-xs text-purple-400/60 uppercase">{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
                            {genreName && <span className="text-xs text-white/30">{genreName}</span>}
                          </div>
                          {item.overview && (
                            <p className="text-xs text-white/30 line-clamp-1 mt-1">{item.overview}</p>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-sm font-bold text-yellow-400">{rating.toFixed(1)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
