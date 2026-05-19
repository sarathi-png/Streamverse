// TMDB API Integration
const API_KEY = '2dca580c2a14b55200e784d157207b4d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export type MediaType = 'movie' | 'tv';

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

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ api_key: API_KEY, ...params });
  const url = `${BASE_URL}${endpoint}?${query.toString()}`;
  
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  const data = await res.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data as T;
}

export function getImageURL(path: string | null, size: string = 'w500'): string {
  if (!path) return '';
  return `${IMG_BASE}/${size}${path}`;
}

export function getBackdropURL(path: string | null): string {
  if (!path) return '';
  return `${IMG_BASE}/original${path}`;
}

export function getPosterURL(path: string | null): string {
  if (!path) return '';
  return `${IMG_BASE}/w500${path}`;
}

export function getTitle(item: TMDBMovie | TMDBMovieDetail): string {
  return item.title || item.name || 'Unknown';
}

export function getYear(item: TMDBMovie | TMDBMovieDetail): string {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear().toString() : '';
}

export function getMediaType(item: TMDBMovie): MediaType {
  if (item.media_type === 'tv') return 'tv';
  if (item.media_type === 'movie') return 'movie';
  if ('first_air_date' in item || 'name' in item) return 'tv';
  return 'movie';
}

export async function getTrending(page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
  return fetchTMDB('/trending/all/week', { page: String(page) });
}

export async function getPopularMovies(page: number = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTMDB('/movie/popular', { page: String(page) });
}

export async function getPopularTV(page: number = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTMDB('/tv/popular', { page: String(page) });
}

export async function getTopRated(page: number = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTMDB('/movie/top_rated', { page: String(page) });
}

export async function getNowPlaying(): Promise<{ results: TMDBMovie[] }> {
  return fetchTMDB('/movie/now_playing');
}

export async function getUpcoming(): Promise<{ results: TMDBMovie[] }> {
  return fetchTMDB('/movie/upcoming');
}

export async function getAiringToday(): Promise<{ results: TMDBMovie[] }> {
  return fetchTMDB('/tv/airing_today');
}

export async function getMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return fetchTMDB(`/movie/${id}`, { append_to_response: 'credits,videos,recommendations,similar' });
}

export async function getTVDetail(id: number): Promise<TMDBMovieDetail> {
  return fetchTMDB(`/tv/${id}`, { append_to_response: 'credits,videos,recommendations,similar' });
}

export async function getTVSeasonDetail(tvId: number, seasonNumber: number): Promise<TMDBSeasonDetail> {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMulti(query: string, page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
  return fetchTMDB('/search/multi', { query, page: String(page) });
}

export async function getByGenre(genreId: number, page: number = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTMDB('/discover/movie', { with_genres: String(genreId), page: String(page), sort_by: 'popularity.desc' });
}

export function getEmbedUrl(mediaType: MediaType, id: number, season?: number, episode?: number): string {
  // Delegate to new provider system
  // Using dynamic import to avoid circular deps
  const domain = 'www.vidking.net';
  if (mediaType === 'tv' && season !== undefined && episode !== undefined) {
    return `https://${domain}/embed/tv/${id}/${season}/${episode}?autoplay=1&color=6d28d9&subtitle=en&cc=true`;
  }
  return `https://${domain}/embed/movie/${id}?autoplay=1&color=6d28d9&subtitle=en&cc=true`;
}

export const GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};
