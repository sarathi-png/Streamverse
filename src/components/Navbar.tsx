import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bookmark, Menu, X, Film, Tv, Home, Settings, User, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getProviderLabel, getProviderColor, getDefaultProvider, setDefaultProvider, FALLBACK_ORDER } from '@/utils/embedProviders';
import type { StreamingProvider } from '@/types';
import CategoriesDropdown from './CategoriesDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const { setSearchOpen, nav, navigateToPage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<StreamingProvider>(getDefaultProvider());

  const handleProviderChange = (p: StreamingProvider) => {
    setProvider(p);
    setDefaultProvider(p);
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'movies' as const, label: 'Movies', icon: Film },
    { id: 'tv' as const, label: 'TV Shows', icon: Tv },
  ];

  return (
    <>
      {/* Mobile Top Bar — visible on md:hidden */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] flex items-center justify-between px-5 pt-3 pb-11 bg-gradient-to-b from-[#0a0f1a]/90 via-[#0a0f1a]/50 to-transparent backdrop-blur-[2px] pointer-events-none">
        <div className="pointer-events-auto">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToPage('home')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <span className="text-white font-black text-sm">S</span>
              </div>
            </div>
        </div>
        <button
          type="button"
          className="flex items-center justify-center p-2 rounded-full text-white pointer-events-auto transition-all duration-200"
          aria-label="Profile"
        >
          <User className="w-7 h-7 drop-shadow-lg" />
        </button>
      </div>

      {/* Desktop Nav — centered pill */}
      <header className="hidden md:flex fixed top-0 left-0 w-full z-[110] justify-center transition-all duration-300 pointer-events-none pt-4 md:pt-6">
        <nav className="flex items-center gap-1 bg-[#1a1a1e]/60 backdrop-blur-xl px-2 py-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto transition-all hover:bg-[#1a1a1e]/80">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer mr-2 pl-1" onClick={() => navigateToPage('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
          </div>

          {/* Nav Items */}
          <ul className="flex flex-row items-center gap-1 font-medium text-[14px]">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => navigateToPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    nav.page === item.id
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="text-[18px] w-[18px] h-[18px]" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <CategoriesDropdown />
            </li>
          </ul>

          <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block" />

          {/* Right Actions */}
          <div className="flex items-center gap-1 pr-1">
            {/* Provider indicator */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-white/40">
              <span className={`w-1.5 h-1.5 rounded-full ${getProviderColor(provider)}`} />
              {getProviderLabel(provider)}
            </div>

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2.5 rounded-full transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white"
                aria-label="Streaming settings"
              >
                <Settings className="w-[22px] h-[22px]" />
              </button>
              {settingsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 z-20 w-48 bg-[#1a1a1e]/95 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-2"
                  >
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold px-1">Streaming Provider</p>
                    {FALLBACK_ORDER.map(p => (
                      <button
                        key={p}
                        onClick={() => handleProviderChange(p)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                          provider === p ? 'bg-purple-600/30 text-purple-300' : 'text-white/60 hover:bg-white/5'
                        }`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${getProviderColor(p)}`} />
                        {getProviderLabel(p)}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-full transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Search"
            >
              <Search className="w-[22px] h-[22px]" />
            </button>

            {/* Watchlist */}
            <button
              onClick={() => navigateToPage('mylist')}
              className="p-2.5 rounded-full transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Watchlist"
            >
              <Bookmark className="w-[20px] h-[20px]" />
            </button>

            {/* Profile */}
            <button
              className="flex items-center justify-center p-1 rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 ml-1"
              aria-label="Profile"
            >
              <div className="p-1.5 bg-white/10 rounded-full">
                <User className="w-[20px] h-[20px]" />
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-full transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="w-[22px] h-[22px]" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-[#0b0b0f]/95 backdrop-blur-xl z-[120] border-l border-white/10"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">Menu</span>
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
                    <ChevronDown className="w-5 h-5" />
                    Browse
                  </button>
                  <hr className="border-white/10 my-4" />
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold px-4 mb-2">Provider</p>
                  {FALLBACK_ORDER.map(p => (
                    <button
                      key={p}
                      onClick={() => { handleProviderChange(p); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                        provider === p ? 'bg-purple-600/30 text-purple-300' : 'text-white/60 hover:bg-white/5'
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${getProviderColor(p)}`} />
                      {getProviderLabel(p)}
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
