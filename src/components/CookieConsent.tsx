import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_KEY = 'sv_cookie_consent';

function hasConsented(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

function setConsented(): void {
  try {
    localStorage.setItem(CONSENT_KEY, 'true');
  } catch {}
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsented()) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsented();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-24 md:bottom-6 left-4 right-4 z-[90] max-w-md mx-auto md:mx-0 md:left-6"
        >
          <div className="glass-strong border border-white/10 rounded-2xl p-4 shadow-2xl">
            <p className="text-xs text-white/50 leading-relaxed mb-3">
              StreamVerse uses only local storage for your preferences and watch progress. No cookies are used for tracking. By continuing, you accept this practice.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 transition-all"
              >
                Got it
              </button>
              <a href="/privacy" className="text-[11px] text-white/30 underline hover:text-white/50 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
