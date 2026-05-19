import { useQuery } from '@tanstack/react-query';
import type { MediaType } from '@/types';
import { getStreamingProvider } from '@/utils/vidking';

const BASE = '/api';

interface PlayerResponse {
  tmdbId: number;
  type: string;
  season?: number;
  episode?: number;
  vidking: string;
  vidsrc: string;
  providers: {
    vidking: string[];
    vidsrc: string[];
  };
}

export function usePlayerUrl(type: MediaType, id: number, season?: number, episode?: number) {
  const provider = getStreamingProvider();

  const path = type === 'movie'
    ? `${BASE}/player/movie/${id}`
    : `${BASE}/player/tv/${id}/${season || 1}/${episode || 1}`;

  return useQuery({
    queryKey: ['player', type, id, season, episode],
    queryFn: async () => {
      const data = await fetch(path).then(r => r.json()) as PlayerResponse;
      return {
        primaryUrl: provider === 'vidsrc' ? (data as PlayerResponse).vidsrc : (data as PlayerResponse).vidking,
        allUrls: (data as PlayerResponse).providers,
        data,
      };
    },
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}
