import { useState, useEffect, useCallback } from 'react';
import { type MediaType } from '@/api/tmdb';

export interface WatchHistoryItem {
  id: number;
  mediaType: MediaType;
  title: string;
  poster: string;
  backdrop: string;
  timestamp: number;
  progress: number; // 0-100
  duration: number; // in seconds
  season?: number;
  episode?: number;
  updatedAt: number;
}

export interface BookmarkItem {
  id: number;
  mediaType: MediaType;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: string;
  overview: string;
  addedAt: number;
}

const WATCH_HISTORY_KEY = 'streamverse_watch_history';
const BOOKMARKS_KEY = 'streamverse_bookmarks';

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() =>
    getFromStorage(WATCH_HISTORY_KEY, [])
  );
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() =>
    getFromStorage(BOOKMARKS_KEY, [])
  );

  useEffect(() => {
    setToStorage(WATCH_HISTORY_KEY, history);
  }, [history]);

  useEffect(() => {
    setToStorage(BOOKMARKS_KEY, bookmarks);
  }, [bookmarks]);

  const addToHistory = useCallback((item: Omit<WatchHistoryItem, 'updatedAt'>) => {
    setHistory(prev => {
      const filtered = prev.filter(h => !(h.id === item.id && h.mediaType === item.mediaType && h.season === item.season && h.episode === item.episode));
      return [{ ...item, updatedAt: Date.now() }, ...filtered].slice(0, 50);
    });
  }, []);

  const updateProgress = useCallback((id: number, mediaType: MediaType, progress: number, timestamp: number, season?: number, episode?: number) => {
    setHistory(prev =>
      prev.map(h => {
        if (h.id === id && h.mediaType === mediaType && h.season === season && h.episode === episode) {
          return { ...h, progress, timestamp, updatedAt: Date.now() };
        }
        return h;
      })
    );
  }, []);

  const removeFromHistory = useCallback((id: number, mediaType: MediaType) => {
    setHistory(prev => prev.filter(h => !(h.id === id && h.mediaType === mediaType)));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const toggleBookmark = useCallback((item: Omit<BookmarkItem, 'addedAt'>) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === item.id && b.mediaType === item.mediaType);
      if (exists) {
        return prev.filter(b => !(b.id === item.id && b.mediaType === item.mediaType));
      }
      return [{ ...item, addedAt: Date.now() }, ...prev].slice(0, 100);
    });
  }, []);

  const isBookmarked = useCallback((id: number, mediaType: MediaType) => {
    return bookmarks.some(b => b.id === id && b.mediaType === mediaType);
  }, [bookmarks]);

  return {
    history,
    bookmarks,
    addToHistory,
    updateProgress,
    removeFromHistory,
    clearHistory,
    toggleBookmark,
    isBookmarked,
  };
}
