import { Link } from 'react-router-dom';

export default function LegalFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-10">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">SV</span>
            </div>
            <span className="text-sm text-white/30">StreamVerse &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <span>Powered by TMDB</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline">VidKing Streaming</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>AI-Enhanced Experience</span>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/20 leading-relaxed text-center sm:text-left max-w-2xl">
            StreamVerse does not host or upload any video content. All videos are embedded from third-party providers.
            We are not responsible for the content of external sites. All trademarks and copyrights are property of their respective owners.
          </p>
          <nav className="flex items-center gap-4 text-xs text-white/30">
            <Link to="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link to="/dmca" className="hover:text-white/60 transition-colors">DMCA</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
