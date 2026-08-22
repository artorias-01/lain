import React from 'react';
import { usePlayerStore, TabOption } from '../../store/usePlayerStore';
import { Home, Search, Library, Heart, Disc, Music, Plus, Sparkles, Radio } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setTab,
    activeTrack,
    isPlaying,
    likedTrackIds,
    toggleTurntableDrawer,
    isTurntableDrawerOpen,
  } = usePlayerStore();

  const navItems: { id: TabOption; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
    { id: 'turntable', label: '2D Vinyl Deck', icon: Disc },
  ];

  const playlists = [
    { name: 'Analog Master Tapes', count: '10 tracks', color: '#d4af37' },
    { name: 'Lo-Fi Midnight Study', count: '18 tracks', color: '#6366f1' },
    { name: 'Synthwave Highway', count: '12 tracks', color: '#ff5733' },
    { name: 'Neoclassical Dreams', count: '14 tracks', color: '#00e5ff' },
  ];

  return (
    <aside className="w-64 bg-[#07080c] flex flex-col justify-between p-4 border-r border-border/40 select-none flex-shrink-0 hidden md:flex">
      {/* Top Section: Logo & Main Navigation */}
      <div className="space-y-6">
        {/* Spotify-Style Brand Logo */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-black shadow-[0_0_20px_var(--accent-glow)]">
            <Disc className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-display font-extrabold text-xl tracking-wider text-text-primary">SPOTIFY</span>
            <span className="text-[10px] font-mono text-accent block -mt-1 tracking-widest uppercase">HI-FI // VINYL</span>
          </div>
        </div>

        {/* Main Nav Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-dim text-accent border border-accent/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                <span>{item.label}</span>
                {item.id === 'turntable' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-accent animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Library & Playlists Section */}
        <div className="pt-4 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between px-2 text-text-muted text-xs font-mono tracking-wider uppercase">
            <span>Playlists & Collections</span>
            <Plus className="w-4 h-4 cursor-pointer hover:text-text-primary" />
          </div>

          {/* Liked Songs Playlist Item */}
          <button
            onClick={() => setTab('library')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-bg-elevated/60 transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h5 className="font-display font-semibold text-sm text-text-primary group-hover:text-accent truncate">Liked Songs</h5>
              <p className="text-[11px] font-mono text-text-muted">{likedTrackIds.length} tracks</p>
            </div>
          </button>

          {/* Playlist Rows */}
          <div className="space-y-1 pt-1">
            {playlists.map((pl, i) => (
              <button
                key={i}
                onClick={() => setTab('library')}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-bg-elevated/60 transition-colors group text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-bg-surface border border-border/40 flex items-center justify-center text-text-secondary flex-shrink-0">
                  <Music className="w-4 h-4" style={{ color: pl.color }} />
                </div>
                <div className="min-w-0">
                  <h5 className="font-display font-medium text-sm text-text-primary group-hover:text-accent truncate">{pl.name}</h5>
                  <p className="text-[11px] font-mono text-text-muted">{pl.count}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Mini 2D Vinyl Preview Card */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/10 relative overflow-hidden group">
        <div className="flex items-center gap-3">
          {/* Mini 2D Spinning Disc Thumbnail */}
          <div className="relative w-12 h-12 rounded-full vinyl-grooves-pattern flex-shrink-0 shadow-md border-2 border-black overflow-hidden">
            <img
              src={activeTrack.albumArtUrl}
              alt={activeTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest block">NOW PLAYING</span>
            <h6 className="font-display font-bold text-xs text-text-primary truncate">{activeTrack.title}</h6>
            <p className="text-[11px] text-text-secondary truncate">{activeTrack.artist}</p>
          </div>
        </div>

        {/* Toggle Full 2D Deck Drawer Button */}
        <button
          onClick={toggleTurntableDrawer}
          className="mt-3 w-full py-1.5 rounded-xl bg-accent-dim text-accent text-xs font-mono font-semibold hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>OPEN 2D TURNTABLE</span>
        </button>
      </div>
    </aside>
  );
};
