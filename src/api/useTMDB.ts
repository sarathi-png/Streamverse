import { useQuery } from '@tanstack/react-query';
import type { MediaType, TMDBMovie, TMDBMovieDetail, TMDBSeasonDetail, MovieReleaseDates, TVContentRatings } from '@/types';

const BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useTrending(page = 1) {
  return useQuery({
    queryKey: ['trending', page],
    queryFn: () => fetchJSON<{ results: TMDBMovie[]; total_pages: number }>(`${BASE}/trending?page=${page}`),
  });
}

export function useMovieDetail(id: number | null) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchJSON<TMDBMovieDetail>(`${BASE}/movie/${id}`),
    enabled: !!id,
  });
}

export function useTVDetail(id: number | null) {
  return useQuery({
    queryKey: ['tv', id],
    queryFn: () => fetchJSON<TMDBMovieDetail>(`${BASE}/tv/${id}`),
    enabled: !!id,
  });
}

export function useTVSeasonDetail(tvId: number | null, season: number | null) {
  return useQuery({
    queryKey: ['tv', tvId, 'season', season],
    queryFn: () => fetchJSON<TMDBSeasonDetail>(`${BASE}/tv/${tvId}/season/${season}`),
    enabled: !!tvId && !!season,
  });
}

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => fetchJSON<{ results: TMDBMovie[]; total_pages: number }>(`${BASE}/search?q=${encodeURIComponent(query)}&page=${page}`),
    enabled: query.length >= 2,
  });
}

export function useMovieRecommendations(id: number | null, type: MediaType = 'movie') {
  return useQuery({
    queryKey: ['recommendations', type, id],
    queryFn: () => fetchJSON<{ results: TMDBMovie[] }>(`${BASE}/recommendations/${id}?type=${type}`),
    enabled: !!id,
  });
}

export function useMovieCertification(id: number | null) {
  return useQuery({
    queryKey: ['movie', id, 'certification'],
    queryFn: () => fetchJSON<MovieReleaseDates>(`${BASE}/movie/${id}/ratings`),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}

export function useTVCertification(id: number | null) {
  return useQuery({
    queryKey: ['tv', id, 'certification'],
    queryFn: () => fetchJSON<TVContentRatings>(`${BASE}/tv/${id}/ratings`),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}

export function useDiscover(type: string = 'movie', genre?: string, language?: string, year?: string, page: number = 1, translations?: string) {
  const params = new URLSearchParams({ type, page: String(page) });
  if (genre) params.set('genre', genre);
  if (language) params.set('language', language);
  if (year) params.set('year', year);
  if (translations) params.set('translations', translations);
  return useQuery({
    queryKey: ['discover', type, genre, language, year, page, translations],
    queryFn: () => fetchJSON<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(`${BASE}/discover?${params.toString()}`),
  });
}
