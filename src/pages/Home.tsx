import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Bookmark } from 'lucide-react';
import { useTrending } from '@/api/useTMDB';
import { useApp } from '@/contexts/AppContext';
import { getByGenre, type TMDBMovie } from '@/api/tmdb';
import type { MediaType, Content } from '@/types';
import { getContinueWatching, getMyList } from '@/utils/storage';
import { getForYouContent } from '@/utils/recommendations';
import Hero from '@/components/Hero';
import TrendingBanner from '@/components/TrendingBanner';
import ContentRow from '@/components/ContentRow';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useQuery } from '@tanstack/react-query';

interface HomeProps {
  page: string;
}

const GENRE_IDS = [28, 878, 27, 35, 18, 16] as const;
const GENRE_TITLES = ['Action & Adventure', 'Science Fiction', 'Horror & Thriller', 'Comedy', 'Drama', 'Animation'];

function useGenreMovies(genreId: number) {
  return useQuery({
    queryKey: ['genre', genreId],
    queryFn: () => getByGenre(genreId),
    staleTime: 10 * 60 * 1000,
  });
}

function usePopularMovies() {
  return useQuery({
    queryKey: ['popular', 'movies'],
    queryFn: () => import('@/api/tmdb').then(m => m.getPopularMovies()),
    staleTime: 10 * 60 * 1000,
  });
}

function usePopularTV() {
  return useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: () => import('@/api/tmdb').then(m => m.getPopularTV()),
    staleTime: 10 * 60 * 1000,
  });
}

export default function Home({ page }: HomeProps) {
  const { data: trendingData, isLoading: trendingLoading } = useTrending();
  const { data: popularMovies } = usePopularMovies();
  const { data: popularTV } = usePopularTV();
  const genreQueries = GENRE_IDS.map(id => useGenreMovies(id));
  const { isBookmarked, openDetail, playContent, handleToggleBookmarkForDetail } = useApp();

  const trending = useMemo(() =>
    (trendingData?.results || []).filter(m => m.backdrop_path),
    [trendingData]
  );

  const loading = trendingLoading;

  // Convert watch history to TMDBMovie-like format for ContentRow
  const continueWatching = useMemo(() => {
    return getContinueWatching().map(h => ({
      id: h.id,
      title: h.type === 'movie' ? h.title : undefined,
      name: h.type === 'tv' ? h.title : undefined,
      overview: h.description || '',
      poster_path: h.poster?.replace('https://image.tmdb.org/t/p/w500', '') || null,
      backdrop_path: h.backdrop?.replace('https://image.tmdb.org/t/p/original', '') || null,
      vote_average: h.rating || 0,
      vote_count: 0,
      genre_ids: [],
      media_type: h.type,
      popularity: 0,
      release_date: h.type === 'movie' ? String(h.year) : '',
      first_air_date: h.type === 'tv' ? String(h.year) : '',
    } as TMDBMovie));
  }, []);

  // Bookmarks to TMDBMovie format
  const bookmarkItems = useMemo(() => {
    return getMyList().map(b => ({
      id: b.id,
      title: b.type === 'movie' ? b.title : undefined,
      name: b.type === 'tv' ? b.title : undefined,
      overview: b.description || '',
      poster_path: b.poster?.replace('https://image.tmdb.org/t/p/w500', '') || null,
      backdrop_path: b.backdrop?.replace('https://image.tmdb.org/t/p/original', '') || null,
      vote_average: b.rating || 0,
      vote_count: 0,
      genre_ids: [],
      media_type: b.type,
      popularity: 0,
      release_date: b.type === 'movie' ? String(b.year) : '',
      first_air_date: b.type === 'tv' ? String(b.year) : '',
    } as TMDBMovie));
  }, []);

  const handlePlay = useCallback((id: number, type: MediaType) => playContent(id, type), [playContent]);
  const handleInfo = useCallback((id: number, type: MediaType) => openDetail(id, type), [openDetail]);
  const handleBookmark = useCallback((item: TMDBMovie) => handleToggleBookmarkForDetail({
    id: item.id,
    mediaType: (item.media_type as MediaType) || 'movie',
    title: item.title || item.name || '',
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
    rating: item.vote_average,
    year: item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '',
    overview: item.overview,
  }), [handleToggleBookmarkForDetail]);

  const aiPicks = useMemo(() => {
    const allItems = [
      ...(popularMovies?.results || []),
      ...(popularTV?.results || []),
    ];
    return getForYouContent(allItems as unknown as Content[], getContinueWatching());
  }, [popularMovies, popularTV]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-cyan-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-white/60 text-lg font-medium">Loading StreamVerse</p>
            <p className="text-white/30 text-sm mt-2">Curating your experience...</p>
          </div>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {page === 'home' && (
          <>
            <TrendingBanner items={trending} onPlay={handlePlay} onInfo={handleInfo} />
            <Hero items={trending.slice(0, 5)} onPlay={handlePlay} onInfo={handleInfo} />
          </>
        )}

        {page !== 'home' && (
          <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {page === 'movies' ? 'Movies' : page === 'tv' ? 'TV Shows' : 'My List'}
              </h1>
              <p className="text-white/40 text-sm">
                {page === 'movies' ? 'Discover the latest blockbusters and timeless classics' :
                 page === 'tv' ? 'Binge-worthy series and exclusive shows' :
                 'Your saved movies and shows'}
              </p>
            </motion.div>
          </div>
        )}

        <div className={page === 'home' ? '-mt-20 relative z-10 space-y-2 pb-20' : 'space-y-2 pb-20'}>
          {page === 'mylist' && (
            <>
              {bookmarkItems.length > 0 ? (
                <ContentRow title="Saved Content" icon="sparkles" items={bookmarkItems}
                  onPlay={handlePlay}
                  isBookmarked={(id, type) => isBookmarked(id, type)}
                  onToggleBookmark={handleBookmark}
                />
              ) : (
                <div className="text-center py-20">
                  <Bookmark className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 text-lg">Your list is empty</p>
                  <p className="text-white/20 text-sm mt-2">Save movies and shows to watch later</p>
                </div>
              )}
            </>
          )}

          {page === 'home' && continueWatching.length > 0 && (
            <ContentRow title="Continue Watching" icon="clock" items={continueWatching}
              onPlay={handlePlay}
              isBookmarked={(id, type) => isBookmarked(id, type)}
              onToggleBookmark={handleBookmark}
            />
          )}

          {(page === 'home') && (
            <ContentRow title="Trending Now" icon="trending" showRanking items={trending.slice(0, 10)}
              onPlay={handlePlay}
              isBookmarked={(id, type) => isBookmarked(id, type)}
              onToggleBookmark={handleBookmark}
            />
          )}

          {/* AI Picks */}
          {page === 'home' && aiPicks.length > 0 && (
            <ContentRow title="✨ AI Picks For You" icon="sparkles"
              items={aiPicks as unknown as TMDBMovie[]}
              onPlay={handlePlay}
              isBookmarked={(id, type) => isBookmarked(id, type)}
              onToggleBookmark={handleBookmark}
            />
          )}

          {(page === 'home' || page === 'movies') && (
            <>
              <ContentRow title="Popular Movies" icon="film"
                items={popularMovies?.results || []}
                onPlay={handlePlay}
                isBookmarked={(id, type) => isBookmarked(id, type)}
                onToggleBookmark={handleBookmark}
              />
              {genreQueries.map((q, i) => (
                <ContentRow key={GENRE_IDS[i]} title={GENRE_TITLES[i]}
                  icon={i % 2 === 0 ? 'film' : 'sparkles'}
                  items={q.data?.results || []}
                  onPlay={handlePlay}
                  isBookmarked={(id, type) => isBookmarked(id, type)}
                  onToggleBookmark={handleBookmark}
                />
              ))}
            </>
          )}

          {(page === 'home' || page === 'tv') && (
            <ContentRow title="Popular TV Shows" icon="tv"
              items={popularTV?.results || []}
              onPlay={handlePlay}
              isBookmarked={(id, type) => isBookmarked(id, type)}
              onToggleBookmark={handleBookmark}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
