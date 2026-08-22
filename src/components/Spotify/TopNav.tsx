import React, { useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ThemeSelector } from '../UI/ThemeSelector';
import { Search, Sparkles, X, User, Disc, Flame } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { searchQuery, setSearchQuery, isSearching, setTab } = usePlayerStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  const categories = ['All', 'YouTube Songs', 'Lo-Fi', 'Synthwave', 'Classical', 'Jazz', 'Chillout'];

  const handleCategoryClick = (cat: string) => {
    if (cat === 'All') {
      handleClear();
      setTab('home');
    } else {
      setLocalQuery(cat);
      setSearchQuery(cat);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#07080c]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between gap-4 border-b border-border/40 select-none">
      {/* Left: Spotify-Style Live Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder="Search for any song, artist, or YouTube track..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-bg-surface/80 border border-border/60 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Middle: Quick Category Chips (Desktop) */}
      <div className="hidden lg:flex items-center gap-2">
        {categories.slice(0, 5).map((cat, i) => (
          <button
            key={i}
            onClick={() => handleCategoryClick(cat)}
            className="px-3 py-1.5 rounded-full bg-bg-surface/60 hover:bg-bg-elevated border border-border/40 text-xs font-mono text-text-secondary hover:text-accent transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Right: Theme Swapper & User Profile */}
      <div className="flex items-center gap-3">
        <ThemeSelector />

        {/* User Profile Avatar */}
        <div className="w-9 h-9 rounded-full bg-accent-dim border border-accent/40 flex items-center justify-center text-accent shadow-sm cursor-pointer hover:scale-105 transition-transform">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};
