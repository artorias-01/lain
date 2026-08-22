import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Turntable } from '../Turntable';
import { X, Disc, Radio, Sparkles } from 'lucide-react';

export const TurntableDrawer: React.FC = () => {
  const {
    isTurntableDrawerOpen,
    toggleTurntableDrawer,
    activeTrack,
    isPlaying,
  } = usePlayerStore();

  if (!isTurntableDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent text-black flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-text-primary">2D Mechanical Deck</h3>
            <p className="text-xs font-mono text-accent">SPOTIFY VINYL EDITION</p>
          </div>
        </div>

        <button
          onClick={toggleTurntableDrawer}
          className="p-3 rounded-full bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center 2D Mechanical Turntable Stage */}
      <div className="my-auto py-6">
        <Turntable isPlaying={isPlaying} albumArtUrl={activeTrack.albumArtUrl} />
      </div>

      {/* Bottom Track Meta Footer inside Drawer */}
      <div className="text-center pb-20">
        <h4 className="font-display font-extrabold text-2xl text-text-primary mb-1">{activeTrack.title}</h4>
        <p className="text-sm font-medium text-text-secondary">{activeTrack.artist} • {activeTrack.album}</p>
      </div>
    </div>
  );
};
