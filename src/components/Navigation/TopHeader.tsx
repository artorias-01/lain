import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const TopHeader: React.FC = () => {
  const { searchQuery, setSearchQuery, isSearching } = usePlayerStore();
  const [inputVal, setInputVal] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (inputVal === searchQuery) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSearchQuery(inputVal.trim());
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputVal, searchQuery, setSearchQuery]);

  // Global ⌘K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 left-gutter-sidebar right-0 h-16 bg-surface/80 backdrop-blur-xl z-30 flex items-center justify-between px-space-xl border-b border-outline-variant/10 select-none">
      {/* Left Navigation and Search */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
            title="Go back"
          >
            <span className="material-symbols-outlined text-body-lg">arrow_back</span>
          </button>
          <button
            onClick={() => window.history.forward()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
            title="Go forward"
          >
            <span className="material-symbols-outlined text-body-lg">arrow_forward</span>
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-space-md text-outline text-body-lg pointer-events-none">
            search
          </span>
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-80 h-10 pl-10 pr-16 bg-surface-container-low rounded-full font-body-sm text-body-sm text-primary placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-all"
            placeholder="Search artists, tracks, or frequencies..."
            type="text"
          />
          {inputVal ? (
            <button
              onClick={() => {
                setInputVal('');
                setSearchQuery('');
              }}
              className="absolute right-space-sm text-outline hover:text-primary p-1"
            >
              <span className="material-symbols-outlined text-body-sm">close</span>
            </button>
          ) : (
            <span className="absolute right-space-sm px-space-xs py-space-2xs bg-surface-container-highest rounded text-outline font-mono-numbers text-label-md pointer-events-none">
              {isSearching ? '...' : '⌘K'}
            </span>
          )}
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-space-lg">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-body-lg">notifications</span>
        </button>

        <div className="flex items-center gap-space-md">
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant/30"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSHqV93TRjV2X5E2xTKZdEtAijjkmHWawDTcnSE6AyBdEpVBqM1I4orEwS4nOmEHgyQySlzur-yDpQHGWOKckcSyuy-DBqD-FdbUGbF55I0WIG7OIbWgPtbQ9w5OfMfp0jm1YWcaWTVfDZTcpEzBf7B6rv3B-J1t5zcivEkG3EQpDfQVSxp1ExiI8NVScxH_XUqeZey2AX7yw7QjQQb8FS1PnDNe-XmhDyeW6ggwdt0nLAJ0QN5JdC"
          />
          <span className="font-label-lg text-label-lg text-primary hidden md:inline">
            Alex V.
          </span>
        </div>
      </div>
    </header>
  );
};
