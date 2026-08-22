import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ProgressBar } from '../Player/ProgressBar';
import { TransportControls } from '../Player/TransportControls';
import { VolumeControl } from '../Player/VolumeControl';
import { Heart, Disc, Radio, Maximize2 } from 'lucide-react';

export const SpotifyPlayer: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    likedTrackIds,
    toggleLikeTrack,
    toggleTurntableDrawer,
    isTurntableDrawerOpen,
  } = usePlayerStore();

  const isLiked = likedTrackIds.includes(activeTrack.id);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#0a0b10]/95 backdrop-blur-xl border-t border-border/60 px-4 sm:px-8 flex items-center justify-between gap-4 z-40 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {/* Left Column: Track Info + Album Cover + Heart Button */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-1/4">
        {/* Album Artwork Thumbnail */}
        <div
          onClick={toggleTurntableDrawer}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-lg border border-border-subtle flex-shrink-0 cursor-pointer group"
        >
          <img
            src={activeTrack.albumArtUrl}
            alt={activeTrack.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Disc className={`w-6 h-6 text-accent ${isPlaying ? 'animate-spin-slow' : ''}`} />
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-bold text-sm sm:text-base text-text-primary truncate">
            {activeTrack.title}
          </h4>
          <p className="text-xs text-text-secondary truncate">{activeTrack.artist}</p>
        </div>

        {/* Heart Like Button */}
        <button
          onClick={() => toggleLikeTrack(activeTrack.id)}
          className="p-2 text-text-muted hover:text-accent transition-colors flex-shrink-0 hidden sm:block"
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'text-accent fill-current' : ''}`} />
        </button>
      </div>

      {/* Middle Column: Transport Controls & Progress Bar */}
      <div className="flex flex-col items-center justify-center gap-1.5 flex-1 max-w-2xl">
        <TransportControls />
        <div className="w-full max-w-xl">
          <ProgressBar />
        </div>
      </div>

      {/* Right Column: Volume + 2D Vinyl Deck Drawer Trigger */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 w-1/4">
        <div className="hidden lg:block">
          <VolumeControl />
        </div>

        {/* 2D Vinyl Deck Drawer Trigger Button */}
        <button
          onClick={toggleTurntableDrawer}
          title="Toggle 2D Turntable Deck"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-mono text-xs font-bold transition-all duration-300 ${
            isTurntableDrawerOpen
              ? 'bg-accent text-black shadow-[0_0_20px_var(--accent-glow)]'
              : 'bg-accent-dim text-accent border border-accent/40 hover:bg-accent hover:text-black'
          }`}
        >
          <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin-slow' : ''}`} />
          <span className="hidden md:inline">2D TURNTABLE</span>
        </button>
      </div>
    </footer>
  );
};
