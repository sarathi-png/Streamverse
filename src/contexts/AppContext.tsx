import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { MediaType, TMDBMovie, NavigationPage } from '@/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { getTitle, getPosterURL, getBackdropURL, getMediaType, getYear } from '@/api/tmdb';

interface NavigationState {
  page: NavigationPage;
  detailId: number | null;
  detailType: MediaType | null;
  playerActive: boolean;
  playerSeason?: number;
  playerEpisode?: number;
}

interface AppContextValue {
  nav: NavigationState;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  navigateToPage: (page: string) => void;
  openDetail: (id: number, type: MediaType) => void;
  closeDetail: () => void;
  playContent: (id: number, type: MediaType, season?: number, episode?: number) => void;
  history: ReturnType<typeof useWatchHistory>['history'];
  bookmarks: ReturnType<typeof useWatchHistory>['bookmarks'];
  handleToggleBookmark: (item: TMDBMovie) => void;
  onToggleBookmark: (item: TMDBMovie) => void;
  isBookmarked: (id: number, type: MediaType) => boolean;
  handleToggleBookmarkForDetail: (data: { id: number; mediaType: MediaType; title: string; poster: string; backdrop: string; rating: number; year: string; overview: string }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { history, bookmarks, toggleBookmark, isBookmarked } = useWatchHistory();

  const [searchOpen, setSearchOpen] = useState(false);
  const [nav, setNav] = useState<NavigationState>({
    page: 'home',
    detailId: null,
    detailType: null,
    playerActive: false,
  });

  // Sync page from URL path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setNav(prev => ({ ...prev, page: 'home' }));
    else if (path === '/movies') setNav(prev => ({ ...prev, page: 'movies' }));
    else if (path === '/tv') setNav(prev => ({ ...prev, page: 'tv' }));
    else if (path === '/mylist') setNav(prev => ({ ...prev, page: 'mylist' }));
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        if (nav.playerActive) {
          setNav(prev => ({ ...prev, playerActive: false }));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, nav.playerActive]);

  const navigateToPage = useCallback((page: string) => {
    navigate(page === 'home' ? '/' : `/${page}`);
    setNav({ page: page as NavigationPage, detailId: null, detailType: null, playerActive: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const openDetail = useCallback((id: number, type: MediaType) => {
    const path = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    navigate(path);
    setNav(prev => ({ ...prev, detailId: id, detailType: type, playerActive: false }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const closeDetail = useCallback(() => {
    setNav(prev => ({ ...prev, detailId: null, detailType: null, playerActive: false }));
    navigate(nav.page === 'home' ? '/' : `/${nav.page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, nav.page]);

  const playContent = useCallback((id: number, type: MediaType, season?: number, _episode?: number) => {
    setNav(prev => ({ ...prev, detailId: id, detailType: type, playerActive: true, playerSeason: season, playerEpisode: _episode }));
    const path = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    navigate(path);
  }, [navigate]);

  const handleToggleBookmark = useCallback((item: TMDBMovie) => {
    const mediaType = getMediaType(item);
    const title = getTitle(item);
    const poster = getPosterURL(item.poster_path);
    const backdrop = getBackdropURL(item.backdrop_path);
    const year = getYear(item);
    toggleBookmark({ id: item.id, mediaType, title, poster, backdrop, rating: item.vote_average, year, overview: item.overview });
  }, [toggleBookmark]);

  const handleToggleBookmarkForDetail = useCallback((data: { id: number; mediaType: MediaType; title: string; poster: string; backdrop: string; rating: number; year: string; overview: string }) => {
    toggleBookmark(data);
  }, [toggleBookmark]);

  return (
    <AppContext.Provider value={{
      nav, searchOpen, setSearchOpen,
      navigateToPage, openDetail, closeDetail, playContent,
      history, bookmarks, handleToggleBookmark,
      isBookmarked, handleToggleBookmarkForDetail, onToggleBookmark: handleToggleBookmark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
