import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { CATEGORY_GROUPS, type CategoryGroup, type CategoryOption, buildBrowseURL } from '@/data/categories';

export default function CategoriesDropdown() {
  const [searchParams] = useSearchParams();
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updatePosition = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  function handleSelect(section: string, value: string) {
    if (section === 'adult' && value === 'true') {
      const ok = window.confirm(
        'This section may contain content suitable for adults 18+.\n\nDo you want to continue?'
      );
      if (!ok) return;
    }
    setOpen(false);
    window.location.href = buildBrowseURL(section, value, type, searchParams);
  }

  return (
    <div ref={btnRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white/90 transition-colors duration-150"
      >
        Browse
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-[680px] rounded-2xl p-4 shadow-2xl shadow-black/50"
            style={{ top: pos.top, left: Math.min(pos.left, window.innerWidth - 700), background: 'rgba(18, 18, 26, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <div className="grid grid-cols-4 gap-4">
              {CATEGORY_GROUPS.map((group: CategoryGroup) => (
                <div key={group.section}>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item: CategoryOption) => (
                      <button
                        key={item.value}
                        onClick={() => handleSelect(group.section, item.value)}
                        className="block w-full text-left px-2 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-100"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
