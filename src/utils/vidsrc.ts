import { buildEmbedUrl } from './vidking';

const VIDSRC_DOMAINS = ['vidsrc.vc', 'vidsrc.cc', 'vidsrc.to', 'vidsrc.xyz'];

export function getVidSrcDomain(): string {
  const saved = localStorage.getItem('sv_vidsrc_domain');
  if (saved && VIDSRC_DOMAINS.includes(saved)) return saved;
  return VIDSRC_DOMAINS[0];
}

export function setVidSrcDomain(domain: string): void {
  if (VIDSRC_DOMAINS.includes(domain)) {
    localStorage.setItem('sv_vidsrc_domain', domain);
  }
}

export function buildVidSrcUrl(
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  episode?: number
): string {
  const domain = getVidSrcDomain();
  if (type === 'movie') {
    return `https://${domain}/embed/movie?tmdb=${id}&autoplay=1`;
  }
  const s = season || 1;
  const e = episode || 1;
  return `https://${domain}/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`;
}

export function getProviderUrl(
  provider: 'vidking' | 'vidsrc',
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  episode?: number
): string {
  if (provider === 'vidsrc') {
    return buildVidSrcUrl(type, id, season, episode);
  }
  return buildEmbedUrl({ type, id, season, episode });
}
