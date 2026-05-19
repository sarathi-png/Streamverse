import { type StreamingProvider, ALLOWED_EMBED_DOMAINS } from '@/types';
import { getProgress } from './storage';

const VIDKING_DOMAINS = ['www.vidking.net', 'vidking1.net', 'vidking2.net', 'vidking3.net', 'vidking.net'];

export function getStreamingProvider(): StreamingProvider {
  const saved = localStorage.getItem('sv_streaming_provider');
  if (saved === 'vidking' || saved === 'vidsrc') return saved;
  return 'vidking';
}

export function setStreamingProvider(provider: StreamingProvider): void {
  localStorage.setItem('sv_streaming_provider', provider);
}

export function getVidkingDomain(): string {
  const saved = localStorage.getItem('sv_vidking_domain');
  if (saved && VIDKING_DOMAINS.includes(saved)) return saved;
  return VIDKING_DOMAINS[0];
}

export function setVidkingDomain(domain: string): void {
  if (VIDKING_DOMAINS.includes(domain)) {
    localStorage.setItem('sv_vidking_domain', domain);
  }
}

export interface EmbedParams {
  type: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
  autoplay?: boolean;
  color?: string;
  subtitle?: string;
  subtitleLang?: string;
  cc?: boolean;
  captions?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  progress?: number;
  muted?: boolean;
  domain?: string;
}

export function buildEmbedUrl(params: EmbedParams): string {
  const domain = params.domain || getVidkingDomain();
  let url = `https://${domain}/embed/${params.type}/${params.id}`;
  if (params.type === 'tv' && params.season !== undefined && params.episode !== undefined) {
    url += `/${params.season}/${params.episode}`;
  }

  const qp = new URLSearchParams();
  qp.set('autoplay', params.autoplay !== false ? '1' : '0');
  qp.set('color', params.color || '6d28d9');
  qp.set('subtitle', params.subtitle || 'en');
  qp.set('subtitleLang', params.subtitleLang || 'en');
  if (params.cc) qp.set('cc', 'true');
  if (params.captions) qp.set('captions', 'true');
  if (params.type === 'tv') {
    qp.set('nextEpisode', 'true');
    qp.set('episodeSelector', 'true');
  }
  if (params.progress && params.progress > 0) qp.set('progress', String(params.progress));
  if (params.muted) qp.set('muted', '1');

  return `${url}?${qp.toString()}`;
}

export function buildSmartEmbedUrl(
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  episode?: number
): string {
  const progress = getProgress(id, type);
  let resumeSeconds = 0;

  if (progress && progress.duration > 0) {
    if (progress.progress > 95) {
      resumeSeconds = Math.max(0, Math.floor(progress.duration - 60));
    } else if (progress.currentTime >= 60) {
      resumeSeconds = progress.currentTime > 300 ? 0 : Math.floor(progress.currentTime);
    }
  }

  return buildEmbedUrl({
    type,
    id,
    season,
    episode,
    autoplay: true,
    color: '6d28d9',
    subtitle: 'en',
    nextEpisode: type === 'tv',
    episodeSelector: type === 'tv',
    progress: resumeSeconds > 0 ? resumeSeconds : undefined,
  });
}

export function buildVidkingPreviewUrl(
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  episode?: number
): string {
  const domain = getVidkingDomain();
  let url = `https://${domain}/embed/${type}/${id}`;
  if (type === 'tv' && season !== undefined && episode !== undefined) {
    url += `/${season}/${episode}`;
  }
  return `${url}?autoplay=1&muted=1&color=6d28d9`;
}

export function isValidEmbedOrigin(origin: string): boolean {
  return ALLOWED_EMBED_DOMAINS.some(d => origin.includes(d));
}
