import { lazy, Suspense, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import SearchModal from '@/components/SearchModal';
import LoadingScreen from '@/components/LoadingScreen';
import LegalFooter from '@/components/LegalFooter';
import CookieConsent from '@/components/CookieConsent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useApp } from '@/contexts/AppContext';
import type { MediaType } from '@/types';

const Home = lazy(() => import('@/pages/Home'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));
const BrowsePage = lazy(() => import('@/pages/BrowsePage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const DMCAPage = lazy(() => import('@/pages/DMCAPage'));

const PageLoader = () => <LoadingScreen />;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchOpen, setSearchOpen, nav } = useApp();

  const handleSearchItemClick = useCallback((id: number, type: MediaType) => {
    const path = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    navigate(path);
    setSearchOpen(false);
  }, [navigate, setSearchOpen]);

  return (
    <>
      <Helmet>
        <title>StreamVerse — AI-Powered Cinematic Streaming</title>
        <meta name="description" content="StreamVerse is a futuristic AI-powered movie and TV streaming platform with cinematic UI and seamless playback." />
        <meta property="og:title" content="StreamVerse — Cinematic Streaming" />
        <meta property="og:description" content="AI-powered movie and TV streaming with premium experience." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
        </div>

        <Navbar />
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} onItemClick={handleSearchItemClick} />
        <CookieConsent />

        <main className="relative z-10">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<Home page={nav.page} />} />
                    <Route path="/movies" element={<Home page="movies" />} />
                    <Route path="/tv" element={<Home page="tv" />} />
                    <Route path="/mylist" element={<Home page="mylist" />} />
                    <Route path="/movie/:id" element={<DetailPage />} />
                    <Route path="/tv/:id" element={<DetailPage />} />
                    <Route path="/browse" element={<BrowsePage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/dmca" element={<DMCAPage />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </main>

        <LegalFooter />

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="glass-strong border-t border-white/5">
            <div className="flex items-center justify-around py-2">
              {[
                { id: 'home' as const, label: 'Home' },
                { id: 'movies' as const, label: 'Movies' },
                { id: 'tv' as const, label: 'TV' },
                { id: 'mylist' as const, label: 'My List' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => navigate(id === 'home' ? '/' : `/${id}`)}
                  className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all ${
                    nav.page === id ? 'text-purple-400' : 'text-white/40'
                  }`}
                  aria-label={label}
                >
                  <span className="text-lg font-medium">{id === 'home' ? '⌂' : id === 'movies' ? '⊡' : id === 'tv' ? '⊞' : '☰'}</span>
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
