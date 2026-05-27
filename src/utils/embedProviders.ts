import type { MediaType, StreamingProvider } from '@/types';
import { buildEmbedUrl } from './vidking';
import { buildVidSrcUrl } from './vidsrc';
import { getProgress } from './storage';

export interface ProviderInfo {
  id: StreamingProvider;
  label: string;
  color: string;
}

export const PROVIDER_INFO: Record<StreamingProvider, ProviderInfo> = {
  vidlink: { id: 'vidlink', label: 'VidLink Pro', color: 'bg-emerald-500' },
  embedsu: { id: 'embedsu', label: 'Embed.su', color: 'bg-blue-500' },
  smashy: { id: 'smashy', label: 'SmashyStream', color: 'bg-orange-500' },
  '2embed': { id: '2embed', label: '2Embed', color: 'bg-rose-500' },
  vidking: { id: 'vidking', label: 'VidKing', color: 'bg-purple-500' },
  vidsrc: { id: 'vidsrc', label: 'VidSrc', color: 'bg-cyan-500' },
};

export const FALLBACK_ORDER: StreamingProvider[] = [
  'vidlink',
  'embedsu',
  'smashy',
  '2embed',
  'vidking',
  'vidsrc',
];

export function getProviderLabel(provider: StreamingProvider): string {
  return PROVIDER_INFO[provider]?.label || provider;
}

export function getProviderColor(provider: StreamingProvider): string {
  return PROVIDER_INFO[provider]?.color || 'bg-gray-500';
}

export function getDefaultProvider(): StreamingProvider {
  const saved = localStorage.getItem('sv_streaming_provider') as StreamingProvider | null;
  if (saved && FALLBACK_ORDER.includes(saved)) return saved;
  return 'vidlink';
}

export function setDefaultProvider(provider: StreamingProvider): void {
  localStorage.setItem('sv_streaming_provider', provider);
}

export function getProviderUrl(
  provider: StreamingProvider,
  type: MediaType,
  id: number,
  season?: number,
  episode?: number
): string {
  switch (provider) {
    case 'vidlink': {
      if (type === 'tv' && season !== undefined && episode !== undefined) {
        return `https://vidlink.pro/embed/tv/${id}/${season}/${episode}?autoplay=1`;
      }
      return `https://vidlink.pro/embed/movie/${id}?autoplay=1`;
    }
    case 'embedsu': {
      if (type === 'tv' && season !== undefined && episode !== undefined) {
        return `https://embed.su/embed/tv/${id}/${season}/${episode}?autoplay=1`;
      }
      return `https://embed.su/embed/movie/${id}?autoplay=1`;
    }
    case 'smashy': {
      if (type === 'tv' && season !== undefined && episode !== undefined) {
        return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}&autoplay=1`;
      }
      return `https://embed.smashystream.com/playere.php?tmdb=${id}&autoplay=1`;
    }
    case '2embed': {
      if (type === 'tv' && season !== undefined && episode !== undefined) {
        return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}&autoplay=1`;
      }
      return `https://www.2embed.cc/embed/${id}?autoplay=1`;
    }
    case 'vidking': {
      return buildEmbedUrl({ type, id, season, episode, autoplay: true });
    }
    case 'vidsrc': {
      return buildVidSrcUrl(type, id, season, episode);
    }
  }
}

export function getNextProvider(
  current: StreamingProvider | null,
  tried: Set<StreamingProvider>
): StreamingProvider | null {
  if (!current) {
    return FALLBACK_ORDER.find(p => !tried.has(p)) || null;
  }
  const currentIdx = FALLBACK_ORDER.indexOf(current);
  for (let i = currentIdx + 1; i < FALLBACK_ORDER.length; i++) {
    if (!tried.has(FALLBACK_ORDER[i])) return FALLBACK_ORDER[i];
  }
  return null;
}

export function buildSmartProviderUrl(
  provider: StreamingProvider,
  type: MediaType,
  id: number,
  season?: number,
  episode?: number
): string {
  const progress = getProgress(id, type);
  let url = getProviderUrl(provider, type, id, season, episode);

  if (progress && progress.duration > 0) {
    let resumeSeconds = 0;
    if (progress.progress > 95) {
      resumeSeconds = Math.max(0, Math.floor(progress.duration - 60));
    } else if (progress.currentTime >= 60 && progress.currentTime <= 300) {
      resumeSeconds = Math.floor(progress.currentTime);
    }
    if (resumeSeconds > 0) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}start=${resumeSeconds}`;
    }
  }

  return url;
}
