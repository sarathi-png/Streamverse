import { useMovieCertification, useTVCertification } from '@/api/useTMDB';
import type { MediaType, MovieReleaseDates, TVContentRatings } from '@/types';

interface Props {
  tmdbId: number;
  mediaType: MediaType;
}

const RATING_COLORS: Record<string, string> = {
  G: 'bg-green-500/20 text-green-400 border-green-500/30',
  PG: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'PG-13': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  R: 'bg-red-500/20 text-red-400 border-red-500/30',
  'NC-17': 'bg-red-600/20 text-red-500 border-red-600/30',
  'TV-Y': 'bg-green-500/20 text-green-400 border-green-500/30',
  'TV-Y7': 'bg-green-600/20 text-green-400 border-green-600/30',
  'TV-G': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'TV-PG': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'TV-14': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'TV-MA': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const MATURE_RATINGS = new Set(['R', 'NC-17', 'TV-MA', 'X']);

export function getUSTVRating(data: TVContentRatings | undefined): string | null {
  if (!data?.results) return null;
  const us = data.results.find(r => r.iso_3166_1 === 'US');
  return us?.rating || null;
}

export function getUSMovieRating(data: MovieReleaseDates | undefined): string | null {
  if (!data?.results) return null;
  const us = data.results.find(r => r.iso_3166_1 === 'US');
  if (!us?.release_dates?.length) return null;
  const cert = us.release_dates.find(d => d.certification && d.certification.trim());
  return cert?.certification || null;
}

export function isMatureRating(certification: string | null): boolean {
  if (!certification) return false;
  return MATURE_RATINGS.has(certification);
}

export default function ContentRatingBadge({ tmdbId, mediaType }: Props) {
  const { data: movieRatings } = useMovieCertification(mediaType === 'movie' ? tmdbId : null);
  const { data: tvRatings } = useTVCertification(mediaType === 'tv' ? tmdbId : null);

  const certification = mediaType === 'movie'
    ? getUSMovieRating(movieRatings)
    : getUSTVRating(tvRatings);

  if (!certification) return null;

  const colorClass = RATING_COLORS[certification] || 'bg-white/10 text-white/60 border-white/20';

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${colorClass}`}>
      {certification}
    </span>
  );
}
