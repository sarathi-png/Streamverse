import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize, Minimize, Loader2, AlertTriangle, RefreshCw, SwitchCamera } from 'lucide-react';
import type { MediaType, StreamingProvider } from '@/types';
import { ALLOWED_EMBED_DOMAINS } from '@/types';
import { buildSmartEmbedUrl, getStreamingProvider, setStreamingProvider, setVidkingDomain } from '@/utils/vidking';
import { buildVidSrcUrl, setVidSrcDomain } from '@/utils/vidsrc';
import { saveProgress, addToContinueWatching } from '@/utils/storage';

interface PlayerEmbedProps {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  backdrop?: string;
  season?: number;
  episode?: number;
  onClose?: () => void;
}

const VALID_ORIGINS = ALLOWED_EMBED_DOMAINS;

export default function PlayerEmbed({ mediaType, tmdbId, title, backdrop, season, episode, onClose }: PlayerEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [provider, setProvider] = useState<StreamingProvider>(getStreamingProvider());
  const [currentDomainIdx, setCurrentDomainIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressSaved = useRef(false);

  const embedUrl = provider === 'vidsrc'
    ? buildVidSrcUrl(mediaType, tmdbId, season, episode)
    : buildSmartEmbedUrl(mediaType, tmdbId, season, episode);

  const switchDomain = useCallback(() => {
    setLoading(true);
    setError(false);
    const domains = provider === 'vidsrc'
      ? ['vidsrc-embed.ru', 'vidsrc-embed.su', 'vidsrcme.su', 'vsrc.su']
      : ['www.vidking.net', 'vidking1.net', 'vidking2.net', 'vidking3.net', 'vidking.net'];
    const nextIdx = (currentDomainIdx + 1) % domains.length;
    setCurrentDomainIdx(nextIdx);
    if (provider === 'vidsrc') setVidSrcDomain(domains[nextIdx]);
    else setVidkingDomain(domains[nextIdx]);
  }, [provider, currentDomainIdx]);

  const switchProvider = useCallback(() => {
    const newProvider: StreamingProvider = provider === 'vidking' ? 'vidsrc' : 'vidking';
    setProvider(newProvider);
    setStreamingProvider(newProvider);
    setLoading(true);
    setError(false);
    setCurrentDomainIdx(0);
  }, [provider]);

  const handleIframeError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // PostMessage listener with origin validation
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const isValidOrigin = VALID_ORIGINS.some(d => {
        try {
          return new URL(e.origin).hostname.includes(d);
        } catch {
          return false;
        }
      });
      if (!isValidOrigin) return;

      if (e.data?.type === 'PLAYER_EVENT') {
        const data = e.data.data;
        if (data?.event === 'timeupdate' && data.duration > 0) {
          saveProgress(tmdbId, mediaType, {
            currentTime: data.currentTime || 0,
            duration: data.duration || 0,
            progress: data.progress || 0,
            season,
            episode,
          });

          // Add to continue watching once per session
          if (!progressSaved.current && data.progress > 5) {
            progressSaved.current = true;
            addToContinueWatching({
              id: tmdbId,
              title,
              type: mediaType,
              year: 0,
              poster: '',
              backdrop: backdrop || '',
              description: '',
              rating: 0,
              season,
              episode,
            });
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [tmdbId, mediaType, season, episode, title, backdrop]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full bg-black rounded-2xl overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Ambient Background */}
      {backdrop && (
        <div className="absolute inset-0 -z-10">
          <img src={backdrop} alt="" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-dark-900 z-10"
        >
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
            <div>
              <p className="text-white/60 text-sm">Loading stream...</p>
              <p className="text-white/30 text-xs mt-1">{title}</p>
              {season && episode && (
                <p className="text-white/20 text-xs">Season {season} &bull; Episode {episode}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/20">
              <span className={`w-1.5 h-1.5 rounded-full ${provider === 'vidking' ? 'bg-purple-400' : 'bg-cyan-400'}`} />
              {provider === 'vidking' ? 'VidKing' : 'VidSrc'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-dark-900 z-10"
        >
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
            <p className="text-white/60 text-sm">Failed to load stream</p>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={switchDomain}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 text-purple-300 text-sm hover:bg-purple-600/50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Switch Domain
              </button>
              <button
                onClick={switchProvider}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-white/70 text-sm hover:bg-white/10 transition-all"
              >
                <SwitchCamera className="w-4 h-4" />
                Switch to {provider === 'vidking' ? 'VidSrc' : 'VidKing'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
        title={title}
        key={`${provider}-${currentDomainIdx}`}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />

      {/* Floating Controls */}
      <motion.div
        className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none"
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            {onClose && (
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg glass hover:bg-white/10 transition-all"
                whileTap={{ scale: 0.9 }}
                aria-label="Close player"
              >
                <X className="w-5 h-5 text-white/80" />
              </motion.button>
            )}
            <div>
              <h3 className="text-white text-sm font-semibold">{title}</h3>
              {season && episode && (
                <p className="text-white/40 text-xs">S{String(season).padStart(2, '0')} E{String(episode).padStart(2, '0')}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Provider Switch Quick Button */}
            <motion.button
              onClick={switchProvider}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-all text-[10px]"
              whileTap={{ scale: 0.9 }}
              aria-label={`Switch to ${provider === 'vidking' ? 'VidSrc' : 'VidKing'}`}
              title={`Switch to ${provider === 'vidking' ? 'VidSrc' : 'VidKing'}`}
            >
              <SwitchCamera className="w-4 h-4 text-white/60" />
            </motion.button>

            {/* Fullscreen */}
            <motion.button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-all"
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 text-white/80" /> : <Maximize className="w-5 h-5 text-white/80" />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Provider Badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <span className="px-2 py-0.5 rounded-md bg-black/40 text-[10px] text-white/30 backdrop-blur-sm">
          {provider === 'vidking' ? '🔮 VidKing' : '🎬 VidSrc'}
        </span>
      </div>
    </motion.div>
  );
}
