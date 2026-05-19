import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bookmark, Menu, X, Film, Tv, Home, Sparkles, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getStreamingProvider, setStreamingProvider } from '@/utils/vidking';
import type { StreamingProvider } from '@/types';
import CategoriesDropdown from './CategoriesDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const { setSearchOpen, nav, navigateToPage } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<StreamingProvider>(getStreamingProvider());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProviderChange = (p: StreamingProvider) => {
    setProvider(p);
    setStreamingProvider(p);
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'movies' as const, label: 'Movies', icon: Film },
    { id: 'tv' as const, label: 'TV Shows', icon: Tv },
    { id: 'mylist' as const, label: 'My List', icon: Bookmark },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-strong shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 will-change-transform"
              onClick={() => navigateToPage('home')}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 blur-lg opacity-40" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                StreamVerse
              </span>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <CategoriesDropdown />
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    nav.page === item.id ? 'text-white' : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {nav.page === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-white/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30, duration: 0.3 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Provider Indicator */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-[10px] text-white/30">
                <span className={`w-1.5 h-1.5 rounded-full ${provider === 'vidking' ? 'bg-purple-400' : 'bg-cyan-400'}`} />
                {provider === 'vidking' ? 'VK' : 'VS'}
              </div>

              {/* Settings */}
              <div className="relative">
                <motion.button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-2.5 rounded-xl glass hover:bg-white/10 hover:scale-110 active:scale-90 transition-all duration-150 will-change-transform"
                  aria-label="Streaming settings"
                >
                  <Settings className="w-5 h-5 text-white/80" />
                </motion.button>
                {settingsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-12 z-20 w-48 glass-strong rounded-2xl p-3 space-y-2"
                    >
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Streaming Provider</p>
                      {(['vidking', 'vidsrc'] as StreamingProvider[]).map(p => (
                        <button
                          key={p}
                          onClick={() => handleProviderChange(p)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                            provider === p ? 'bg-purple-600/30 text-purple-300' : 'text-white/60 hover:bg-white/5'
                          }`}
                        >
                          {p === 'vidking' ? 'VidKing' : 'VidSrc'}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>

              {/* Search */}
              <motion.button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl glass hover:bg-white/10 hover:scale-110 active:scale-90 transition-all duration-150 will-change-transform"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-white/80" />
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-xl glass hover:bg-white/10 active:scale-90 transition-all duration-150"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-white/80" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-dark-800/95 backdrop-blur-xl z-50 border-l border-white/10"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                    <X className="w-6 h-6 text-white/60" />
                  </button>
                </div>
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { navigateToPage(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        nav.page === item.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/browse'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-white/60 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">⊞</span>
                    Browse
                  </button>
                  <hr className="border-white/10 my-4" />
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold px-4 mb-2">Provider</p>
                  {(['vidking', 'vidsrc'] as StreamingProvider[]).map(p => (
                    <button
                      key={p}
                      onClick={() => { handleProviderChange(p); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                        provider === p ? 'bg-purple-600/30 text-purple-300' : 'text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {p === 'vidking' ? '🔮 VidKing' : '🎬 VidSrc'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
