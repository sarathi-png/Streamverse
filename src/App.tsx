import { lazy, Suspense, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, LayoutGrid, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SearchModal from '@/components/SearchModal';
import LoadingScreen from '@/components/LoadingScreen';
import LegalFooter from '@/components/LegalFooter';
import CookieConsent from '@/components/CookieConsent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useApp } from '@/contexts/AppContext';
import { CardModalProvider } from '@/components/CardModalProvider';
import type { MediaType } from '@/types';

const HomePage = lazy(() => import('@/pages/Home'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));
const BrowsePage = lazy(() => import('@/pages/BrowsePage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const DMCAPage = lazy(() => import('@/pages/DMCAPage'));

const PageLoader = () => <LoadingScreen />;

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchOpen, setSearchOpen, nav, navigateToPage } = useApp();

  useEffect(() => {
    document.title = 'StreamVerse — AI-Powered Cinematic Streaming';
  }, []);

  const handleSearchItemClick = useCallback((id: number, type: MediaType) => {
    const path = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    navigate(path);
    setSearchOpen(false);
  }, [navigate, setSearchOpen]);

  const isHomeRoute = location.pathname === '/' || location.pathname === '/movies' || location.pathname === '/tv' || location.pathname === '/mylist';
  const showMobileNav = isHomeRoute;

  return (
    <>
      <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-600/4 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-950/8 to-transparent" />
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
                    <Route path="/" element={<HomePage page={nav.page} />} />
                    <Route path="/movies" element={<HomePage page="movies" />} />
                    <Route path="/tv" element={<HomePage page="tv" />} />
                    <Route path="/mylist" element={<HomePage page="mylist" />} />
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

        {/* Mobile Bottom Nav — Cinezo 3-tab style */}
        {showMobileNav && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[120] bg-[#0b0b0f]/95 backdrop-blur-xl px-4 pt-2 pb-5 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] border-t border-white/5">
            <div className="grid grid-cols-3 gap-1 text-center">
              <button
                type="button"
                onClick={() => navigateToPage('home')}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-1 transition-all duration-300 ${
                  nav.page === 'home' ? 'text-white' : 'text-gray-500'
                }`}
              >
                <Home className="text-[24px] w-6 h-6" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Home</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex flex-col items-center justify-center gap-1 rounded-lg py-1 transition-all duration-300 text-gray-500"
              >
                <Search className="text-[24px] w-6 h-6" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Search</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/browse')}
                className="flex flex-col items-center justify-center gap-1 rounded-lg py-1 transition-all duration-300 text-gray-500"
                name="menu"
              >
                <LayoutGrid className="text-[24px] w-6 h-6" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Menu</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <CardModalProvider>
      <AppContent />
    </CardModalProvider>
  );
}
