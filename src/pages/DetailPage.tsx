import { useState, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, ArrowLeft, Star, Clock, Calendar, BookmarkPlus, BookmarkCheck,
  ChevronDown, Film, Tv, Users, Share2
} from 'lucide-react';
import { useMovieDetail, useTVDetail, useTVSeasonDetail, useMovieCertification, useTVCertification } from '@/api/useTMDB';
import { useApp } from '@/contexts/AppContext';
import { getBackdropURL, getPosterURL, getTitle, getYear, getImageURL } from '@/api/tmdb';
import type { MediaType, TMDBMovie } from '@/types';
import { addToContinueWatching, isInMyList, toggleMyList } from '@/utils/storage';
import type { Content } from '@/types';
import PlayerEmbed from '@/components/PlayerEmbed';
import ContentRow from '@/components/ContentRow';
import ContentRatingBadge, { isMatureRating, getUSMovieRating, getUSTVRating } from '@/components/ContentRatingBadge';
import AgeGate, { isAgeVerified } from '@/components/AgeGate';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DetailPage() {
  const { id: paramId } = useParams();
  const location = useLocation();
  const id = Number(paramId);
  const type = location.pathname.startsWith('/tv') ? 'tv' as MediaType : 'movie' as MediaType;

  const { data: movieDetail, isLoading: movieLoading } = useMovieDetail(type === 'movie' ? id : null);
  const { data: tvDetail, isLoading: tvLoading } = useTVDetail(type === 'tv' ? id : null);

  const detail = type === 'movie' ? movieDetail : tvDetail;
  const loading = type === 'movie' ? movieLoading : tvLoading;

  const { closeDetail, playContent } = useApp();

  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [expandedOverview, setExpandedOverview] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);

  const { data: movieRatings } = useMovieCertification(type === 'movie' ? id : null);
  const { data: tvRatings } = useTVCertification(type === 'tv' ? id : null);

  const certification = type === 'movie'
    ? getUSMovieRating(movieRatings)
    : getUSTVRating(tvRatings);
  const isMature = detail?.adult || isMatureRating(certification);

  const { data: seasonDetail } = useTVSeasonDetail(
    type === 'tv' ? id : null,
    type === 'tv' ? selectedSeason : null
  );

  const handlePlay = useCallback(() => {
    if (isMature && !isAgeVerified()) {
      setShowAgeGate(true);
      return;
    }
    if (type === 'tv') {
      const ep = selectedEpisode || 1;
      setSelectedEpisode(ep);
      addToContinueWatching({
        id, title: getTitle(detail!) || '', type, year: Number(getYear(detail!)),
        poster: getPosterURL(detail?.poster_path || null),
        backdrop: getBackdropURL(detail?.backdrop_path || null),
        description: detail?.overview || '', rating: detail?.vote_average || 0,
        season: selectedSeason, episode: ep,
      } as Content);
    }
    setShowPlayer(true);
  }, [type, id, detail, selectedSeason, selectedEpisode, isMature]);

  const handleEpisodeClick = useCallback((ep: number) => {
    setSelectedEpisode(ep);
    addToContinueWatching({
      id, title: getTitle(detail!) || '', type, year: Number(getYear(detail!)),
      poster: getPosterURL(detail?.poster_path || null),
      backdrop: getBackdropURL(detail?.backdrop_path || null),
      description: detail?.overview || '', rating: detail?.vote_average || 0,
      season: selectedSeason, episode: ep,
    } as Content);
    setShowPlayer(true);
  }, [id, type, detail, selectedSeason]);

  const handleAgeConfirm = useCallback(() => {
    setShowAgeGate(false);
    handlePlay();
  }, [handlePlay]);

  const handleAgeDeny = useCallback(() => {
    setShowAgeGate(false);
  }, []);

  const handleBookmarkToggle = useCallback(() => {
    if (!detail) return;
    const title = getTitle(detail);
    const poster = getPosterURL(detail.poster_path);
    const backdrop = getBackdropURL(detail.backdrop_path);
    const year = getYear(detail);
    const item = {
      id: detail.id, type, title, year: Number(year),
      poster, backdrop, description: detail.overview, rating: detail.vote_average,
    } as Content;
    toggleMyList(item);
  }, [detail, type]);

  if (loading || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 mx-auto animate-pulse" />
          <p className="text-white/40">Loading details...</p>
        </motion.div>
      </div>
    );
  }

  const title = getTitle(detail);
  const year = getYear(detail);
  const backdrop = getBackdropURL(detail.backdrop_path);
  const poster = getPosterURL(detail.poster_path);
  const rating = detail.vote_average;
  const genres = detail.genres?.map(g => g.name) || [];
  const runtime = detail.runtime || detail.episode_run_time?.[0];
  const cast = detail.credits?.cast?.slice(0, 12) || [];
  const director = detail.credits?.crew?.find(c => c.job === 'Director');
  const recommendations = (detail.recommendations?.results || detail.similar?.results || []).slice(0, 12);
  const seasons = detail.seasons?.filter(s => s.season_number > 0) || [];
  const updatedBookmarked = detail ? isInMyList(detail.id, type) : false;

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  useEffect(() => {
    document.title = `${title} — StreamVerse`;
  }, [title]);

  return (
    <ErrorBoundary>

      <div className="min-h-screen">
        {/* Backdrop */}
        <div className="relative h-[60vh] sm:h-[70vh]">
          {backdrop && (
            <motion.img
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              src={backdrop}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="hero-gradient absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/50 to-transparent" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="ambient-light bg-purple-600/40 top-1/3 -left-10" />
            <div className="ambient-light bg-cyan-500/30 bottom-1/3 right-10" />
          </div>
        </div>

        {/* Content */}
        <div className="relative -mt-48 sm:-mt-56 z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="hidden lg:block flex-shrink-0">
              <div className="w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 gradient-border">
                {poster ? (
                  <img src={poster} alt={title} className="w-full aspect-[2/3] object-cover" loading="lazy" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-dark-700 flex items-center justify-center">
                    <Film className="w-12 h-12 text-white/20" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex-1 space-y-5">
              <motion.button onClick={closeDetail} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm" whileHover={{ x: -5 }}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">{title}</h1>
                {detail.tagline && <p className="text-purple-300/60 italic mt-1 text-sm">"{detail.tagline}"</p>}

                <div className="flex items-center gap-3 sm:gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300">{rating.toFixed(1)}</span>
                    <span className="text-xs text-yellow-400/50">({detail.vote_count?.toLocaleString()})</span>
                  </div>
                  {year && <div className="flex items-center gap-1.5 text-white/50 text-sm"><Calendar className="w-4 h-4" />{year}</div>}
                  <ContentRatingBadge tmdbId={id} mediaType={type} />
                  {runtime && <div className="flex items-center gap-1.5 text-white/50 text-sm"><Clock className="w-4 h-4" />{formatRuntime(runtime)}</div>}
                  <div className="flex items-center gap-1.5 text-white/50 text-sm">
                    {type === 'tv' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    {type === 'tv' ? 'TV Series' : 'Movie'}
                  </div>
                  {detail.status && (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400/70 text-xs">{detail.status}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {genres.map(g => (
                    <span key={g} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/60">{g}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                  onClick={handlePlay}
                  className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold shadow-lg transition-all ${
                    isMature
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-600/30'
                      : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-purple-600/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5 fill-white" />
                  {isMature ? '18+ Watch Now' : showPlayer ? 'Now Playing' : 'Watch Now'}
                </motion.button>

                <motion.button
                  onClick={handleBookmarkToggle}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold transition-all ${
                    updatedBookmarked ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300' : 'glass text-white/70 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updatedBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                  {updatedBookmarked ? 'Saved' : 'My List'}
                </motion.button>

                <motion.button className="p-3.5 rounded-2xl glass text-white/60 hover:text-white transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Overview */}
              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Synopsis</h3>
                <p className={`text-white/60 leading-relaxed ${!expandedOverview ? 'line-clamp-3' : ''}`}>
                  {detail.overview || 'No overview available.'}
                </p>
                {(detail.overview?.length || 0) > 200 && (
                  <button onClick={() => setExpandedOverview(!expandedOverview)}
                    className="text-purple-400 text-sm mt-1 hover:text-purple-300 flex items-center gap-1">
                    {expandedOverview ? 'Show less' : 'Read more'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedOverview ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {director && (
                <div><span className="text-sm text-white/40">Director: </span><span className="text-sm text-white/70 font-medium">{director.name}</span></div>
              )}

              {detail.networks && detail.networks.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/40">Networks:</span>
                  {detail.networks.map(n => (
                    <span key={n.id} className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/50">{n.name}</span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Player */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-8"
            >
              <PlayerEmbed
                mediaType={type}
                tmdbId={id}
                title={title}
                backdrop={backdrop}
                season={type === 'tv' ? selectedSeason : undefined}
                episode={type === 'tv' ? (selectedEpisode || 1) : undefined}
                onClose={() => setShowPlayer(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* TV Season/Episode Selector */}
        {type === 'tv' && seasons.length > 0 && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mr-4">
                <Tv className="w-5 h-5 text-purple-400" />Episodes
              </h3>
              {seasons.map(s => (
                <motion.button
                  key={s.id}
                  onClick={() => { setSelectedSeason(s.season_number); setSelectedEpisode(null); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSeason === s.season_number
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                      : 'glass text-white/50 hover:text-white/70'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Season {s.season_number}
                </motion.button>
              ))}
            </div>

            <div className="grid gap-3">
              {seasonDetail?.episodes?.map(ep => (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedEpisode === ep.episode_number && showPlayer
                      ? 'glass-strong border border-purple-500/30'
                      : 'glass hover:bg-white/5'
                  }`}
                  onClick={() => handleEpisodeClick(ep.episode_number)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="relative w-40 sm:w-52 flex-shrink-0 rounded-lg overflow-hidden aspect-video bg-dark-700">
                    {ep.still_path ? (
                      <img src={getImageURL(ep.still_path, 'w300')} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Play className="w-6 h-6 text-white/20" /></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-xs text-white/80">
                      E{String(ep.episode_number).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="text-sm font-semibold text-white line-clamp-1">{ep.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                      <span>Episode {ep.episode_number}</span>
                      {ep.runtime && <span>{ep.runtime}m</span>}
                      {ep.air_date && <span>{new Date(ep.air_date).toLocaleDateString()}</span>}
                      {ep.vote_average > 0 && (
                        <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{ep.vote_average.toFixed(1)}</div>
                      )}
                    </div>
                    <p className="text-xs text-white/30 line-clamp-2 mt-2">{ep.overview || 'No description available.'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Cast</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
              {cast.map(person => (
                <motion.div key={person.id} className="flex-shrink-0 text-center group" whileHover={{ y: -5 }}>
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-dark-700 border-2 border-transparent group-hover:border-purple-500/50 transition-all">
                    {person.profile_path ? (
                      <img src={getImageURL(person.profile_path, 'w185')} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-bold">{person.name[0]}</div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white/70 mt-2 line-clamp-1 max-w-20">{person.name}</p>
                  <p className="text-[10px] text-white/30 line-clamp-1 max-w-20">{person.character}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-8">
            <ContentRow title="You May Also Like" icon="sparkles"
              items={recommendations.map(r => ({ ...r, media_type: r.media_type || type }) as TMDBMovie)}
              onPlay={(itemId, itemType) => playContent(itemId, itemType)}
              isBookmarked={(itemId, itemType) => isInMyList(itemId, itemType)}
            />
          </div>
        )}

        <div className="h-20" />
      </div>

      <AgeGate
        open={showAgeGate}
        onConfirm={handleAgeConfirm}
        onDeny={handleAgeDeny}
        title={title}
      />
    </ErrorBoundary>
  );
}
