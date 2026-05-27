import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize, Minimize, Loader2, AlertTriangle, RefreshCw, SkipForward } from 'lucide-react';
import type { MediaType, StreamingProvider } from '@/types';
import { ALLOWED_EMBED_DOMAINS } from '@/types';
import { saveProgress, addToContinueWatching } from '@/utils/storage';
import {
  getProviderUrl,
  getProviderLabel,
  getProviderColor,
  getDefaultProvider,
  setDefaultProvider,
  FALLBACK_ORDER,
  getNextProvider,
} from '@/utils/embedProviders';

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

const LOAD_TIMEOUT_MS = 10000;

export default function PlayerEmbed({ mediaType, tmdbId, title, backdrop, season, episode, onClose }: PlayerEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [allExhausted, setAllExhausted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentProvider, setCurrentProvider] = useState<StreamingProvider>(getDefaultProvider());
  const [triedProviders, setTriedProviders] = useState<Set<StreamingProvider>>(new Set());
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressSaved = useRef(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackMessageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const embedUrl = getProviderUrl(currentProvider, mediaType, tmdbId, season, episode);

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const clearFallbackMessage = useCallback(() => {
    if (fallbackMessageTimeout.current) {
      clearTimeout(fallbackMessageTimeout.current);
      fallbackMessageTimeout.current = null;
    }
    setFallbackMessage(null);
  }, []);

  const tryNextProvider = useCallback(() => {
    clearLoadTimeout();
    const next = getNextProvider(currentProvider, triedProviders);
    if (next) {
      setCurrentProvider(next);
      setTriedProviders(prev => {
        const updated = new Set(prev);
        updated.add(next);
        return updated;
      });
      setLoading(true);
      setAllExhausted(false);
      const label = getProviderLabel(next);
      setFallbackMessage(`Switching to ${label}...`);
      if (fallbackMessageTimeout.current) clearTimeout(fallbackMessageTimeout.current);
      fallbackMessageTimeout.current = setTimeout(() => setFallbackMessage(null), 3000);
    } else {
      setAllExhausted(true);
      setLoading(false);
      setFallbackMessage(null);
    }
  }, [currentProvider, triedProviders, clearLoadTimeout]);

  const handleIframeLoad = useCallback(() => {
    clearLoadTimeout();
    setLoading(false);
    setAllExhausted(false);
    setDefaultProvider(currentProvider);
    clearFallbackMessage();
  }, [currentProvider, clearLoadTimeout, clearFallbackMessage]);

  const handleIframeError = useCallback(() => {
    clearLoadTimeout();
    setLoading(false);
    tryNextProvider();
  }, [clearLoadTimeout, tryNextProvider]);

  useEffect(() => {
    if (loading && !allExhausted) {
      loadTimeoutRef.current = setTimeout(() => {
        setLoading(false);
        tryNextProvider();
      }, LOAD_TIMEOUT_MS);
    }
    return () => clearLoadTimeout();
  }, [loading, allExhausted, tryNextProvider, clearLoadTimeout]);

  const skipToNext = useCallback(() => {
    clearLoadTimeout();
    tryNextProvider();
  }, [clearLoadTimeout, tryNextProvider]);

  const resetAll = useCallback(() => {
    setTriedProviders(new Set([currentProvider]));
    setCurrentProvider(FALLBACK_ORDER[0]);
    setLoading(true);
    setAllExhausted(false);
    setFallbackMessage(null);
  }, [currentProvider]);

  const manualSelectProvider = useCallback((provider: StreamingProvider) => {
    clearLoadTimeout();
    clearFallbackMessage();
    setCurrentProvider(provider);
    setTriedProviders(new Set([provider]));
    setLoading(true);
    setAllExhausted(false);
    setDefaultProvider(provider);
  }, [clearLoadTimeout, clearFallbackMessage]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full bg-black rounded-2xl overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      {backdrop && (
        <div className="absolute inset-0 -z-10">
          <img src={backdrop} alt="" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {loading && !allExhausted && (
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
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <span className={`w-2 h-2 rounded-full ${getProviderColor(currentProvider)}`} />
              {getProviderLabel(currentProvider)}
            </div>
          </div>
        </motion.div>
      )}

      {allExhausted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-dark-900 z-10"
        >
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
            <p className="text-white/60 text-sm">All sources unavailable</p>
            <p className="text-white/30 text-xs">No streaming server could load this content</p>
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/30 text-purple-300 text-sm hover:bg-purple-600/50 transition-all mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry All
            </button>
          </div>
        </motion.div>
      )}

      <iframe
        ref={iframeRef}
        src={!allExhausted ? embedUrl : undefined}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
        title={title}
        key={currentProvider}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />

      <AnimatePresence>
        {fallbackMessage && !allExhausted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10"
          >
            <p className="text-xs text-white/70">{fallbackMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none"
        animate={{ opacity: showControls || allExhausted ? 1 : 0 }}
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
            {!allExhausted && (
              <motion.button
                onClick={skipToNext}
                className="p-2 rounded-lg glass hover:bg-white/10 transition-all"
                whileTap={{ scale: 0.9 }}
                aria-label="Skip to next server"
                title="Skip to next server"
              >
                <SkipForward className="w-4 h-4 text-white/60" />
              </motion.button>
            )}

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

      {!loading && !allExhausted && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
          <div className="relative group">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/40 text-[10px] text-white/40 backdrop-blur-sm cursor-pointer hover:bg-black/60 hover:text-white/60 transition-all">
              <span className={`w-1.5 h-1.5 rounded-full ${getProviderColor(currentProvider)}`} />
              {getProviderLabel(currentProvider)}
            </span>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
              <div className="bg-black/80 backdrop-blur-md rounded-xl p-2 border border-white/10 min-w-[140px]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider px-2 pb-1">Switch Server</p>
                {FALLBACK_ORDER.map(p => (
                  <button
                    key={p}
                    onClick={() => manualSelectProvider(p)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${
                      p === currentProvider
                        ? 'bg-purple-600/30 text-purple-300'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${getProviderColor(p)}`} />
                    {getProviderLabel(p)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
