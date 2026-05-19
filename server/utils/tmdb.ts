const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '';
const BASE_URL = 'https://api.themoviedb.org/3';

import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300, maxKeys: 200 });

export async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
  const url = `${BASE_URL}${endpoint}?${query.toString()}`;

  const cached = cache.get<T>(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  const data = await res.json() as T;
  cache.set(url, data);
  return data;
}

export function getImageURL(path: string | null, size: string = 'w500'): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropURL(path: string | null): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/original${path}`;
}

export function getPosterURL(path: string | null): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/w500${path}`;
}

export function getTitle(item: { title?: string; name?: string }): string {
  return item.title || item.name || 'Unknown';
}

export function getYear(item: { release_date?: string; first_air_date?: string }): string {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear().toString() : '';
}

export function getMediaType(item: { media_type?: string; first_air_date?: string; name?: string }): 'movie' | 'tv' {
  if (item.media_type === 'tv') return 'tv';
  if (item.media_type === 'movie') return 'movie';
  if ('first_air_date' in item || 'name' in item) return 'tv';
  return 'movie';
}
