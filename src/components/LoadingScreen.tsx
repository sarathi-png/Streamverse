import { useEffect, useState } from 'react';

const MESSAGES = [
  'Initializing StreamVerse engine...',
  'Loading neural interfaces...',
  'Syncing content library...',
  'Calibrating cinematic experience...',
  'Almost ready...',
];

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden">
      {/* CRT Static overlay */}
      <div className="absolute inset-0 animate-static opacity-30 pointer-events-none" />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-px bg-white/10 animate-tracking" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Animated logo */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-cyan-500 animate-pulse"
            style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
          />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600 to-cyan-500 blur-xl opacity-50 animate-pulse" />
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
          <div className="h-full w-full bg-gradient-to-r from-purple-500 via-violet-500 to-cyan-500 rounded-full animate-pulse" />
        </div>

        {/* Status message */}
        <p className="text-sm text-white/40 font-mono tracking-wider animate-glitch">
          {MESSAGES[msgIndex]}
        </p>

        {/* Cursor blink */}
        <span className="inline-block w-2 h-4 bg-purple-400/60 animate-pulse" />
      </div>
    </div>
  );
}
