export type MediaType = 'movie' | 'tv';
export type StreamingProvider = 'vidlink' | 'embedsu' | 'smashy' | '2embed' | 'vidking' | 'vidsrc';

export interface Content {
  id: number;
  title: string;
  type: MediaType;
  year: number;
  poster: string;
  backdrop: string;
  description: string;
  rating: number;
  season?: number;
  episode?: number;
  genres?: string[];
  genreIds?: number[];
}

export interface WatchProgress {
  id: number;
  mediaType: MediaType;
  currentTime: number;
  duration: number;
  progress: number;
  lastWatched: number;
  season?: number;
  episode?: number;
}

export interface PlayerEvent {
  type: 'PLAYER_EVENT';
  data: {
    event: 'timeupdate' | 'play' | 'pause' | 'ended' | 'seeked';
    currentTime: number;
    duration: number;
    progress: number;
    id: string;
    mediaType: MediaType;
    season?: number;
    episode?: number;
    timestamp: number;
  };
}

export interface IntroMarkers {
  start: number;
  end: number;
}

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
  popularity: number;
  original_language?: string;
  adult?: boolean;
}

export interface TMDBMovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  adult?: boolean;
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: { id: number; name: string; season_number: number; episode_count: number; poster_path: string | null; overview: string }[];
  credits?: { cast: { id: number; name: string; character: string; profile_path: string | null }[]; crew: { id: number; name: string; job: string; profile_path: string | null }[] };
  videos?: { results: { key: string; name: string; type: string; site: string }[] };
  recommendations?: { results: TMDBMovie[] };
  similar?: { results: TMDBMovie[] };
  status?: string;
  tagline?: string;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  networks?: { id: number; name: string; logo_path: string | null }[];
  episode_run_time?: number[];
  next_episode_to_air?: { id: number; name: string; overview: string; season_number: number; episode_number: number; still_path: string | null; air_date: string };
}

export interface ContentRating {
  certification: string | null;
  iso_3166_1: string;
}
export interface MovieReleaseDates {
  results: { iso_3166_1: string; release_dates: { certification: string; note?: string }[] }[];
}
export interface TVContentRatings {
  results: { iso_3166_1: string; rating: string }[];
}

export interface TMDBSeasonDetail {
  id: number;
  name: string;
  season_number: number;
  episodes: {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
    air_date: string;
    runtime?: number;
    vote_average: number;
  }[];
}

export const ALLOWED_EMBED_DOMAINS = [
  'vidlink.pro',
  'embed.su',
  'smashystream.xyz',
  'embed.smashystream.com',
  '2embed.cc',
  'vidking.net',
  'www.vidking.net',
  'vidking1.net',
  'vidking2.net',
  'vidking3.net',
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su',
];

export type NavigationPage = 'home' | 'movies' | 'tv' | 'mylist';
