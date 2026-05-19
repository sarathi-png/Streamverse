import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

const AGE_KEY = 'sv_age_verified';
const AGE_EXPIRY_DAYS = 30;

export function isAgeVerified(): boolean {
  try {
    const stored = localStorage.getItem(AGE_KEY);
    if (!stored) return false;
    const timestamp = parseInt(stored, 10);
    return !isNaN(timestamp) && (Date.now() - timestamp) < AGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function setAgeVerified(): void {
  try {
    localStorage.setItem(AGE_KEY, String(Date.now()));
  } catch {}
}

interface Props {
  open: boolean;
  onConfirm: () => void;
  onDeny: () => void;
  title?: string;
}

export default function AgeGate({ open, onConfirm, onDeny, title }: Props) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setAgeVerified();
    setConfirming(true);
    setTimeout(onConfirm, 400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={confirming ? { scale: 0.95, opacity: 0, y: 10 } : { scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md rounded-2xl glass-strong border border-white/10 p-8 text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Age Verification Required</h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {title
                  ? `"${title}" contains mature content that may not be suitable for all audiences.`
                  : 'This content may contain mature themes, violence, or adult language.'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all"
              >
                I am 18+ — Continue
              </button>
              <button
                onClick={onDeny}
                className="w-full py-3 rounded-2xl glass text-white/50 hover:text-white transition-all"
              >
                Go Back
              </button>
            </div>

            <p className="text-[11px] text-white/20 leading-relaxed">
              By confirming, you certify that you are at least 18 years old. This verification is stored locally for {AGE_EXPIRY_DAYS} days.
            </p>

            <button onClick={onDeny} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
