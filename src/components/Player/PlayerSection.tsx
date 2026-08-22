import React, { useState } from 'react';
import { Turntable } from '../Turntable';
import { usePlayerStore } from '../../store/usePlayerStore';
import { TrackInfo } from './TrackInfo';
import { TransportControls } from './TransportControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { Search, Radio, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PlayerSection: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    searchQuery,
    setSearchQuery,
    isSearching,
    apiKeyMissing,
    searchMessage,
  } = usePlayerStore();

  const [inputVal, setInputVal] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchQuery(inputVal.trim());
    }
  };

  return (
    <section id="turntable-player" className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-dim border border-accent/20 text-accent text-xs font-mono tracking-widest uppercase mb-3">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>YouTube Full-Song Playback Deck</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-text-primary tracking-tight">
          Analog Mechanical Turntable
        </h2>
        <p className="text-sm sm:text-base text-text-secondary mt-2">
          Search any song or artist. Watch the tonearm drop onto the vinyl and stream full-length audio.
        </p>
      </div>

      {/* YouTube Live Search Bar Input */}
      <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mb-8 z-10">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search YouTube for any song, artist, or album (e.g. Daft Punk, Chopin, Lofi Girl)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary text-sm sm:text-base placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 shadow-xl transition-all"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-5 py-2 rounded-full bg-accent text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* API Status Notice */}
        {apiKeyMissing && (
          <div className="mt-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Note:</strong> Set <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">VITE_YOUTUBE_API_KEY</code> in <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">.env</code> to enable live YouTube Data API searches. Currently displaying pre-resolved starter queue.
            </span>
          </div>
        )}
      </form>

      {/* 2D Mechanical Vinyl Stage */}
      <div className="w-full max-w-4xl mb-8 z-10">
        <Turntable isPlaying={isPlaying} albumArtUrl={activeTrack.thumbnailUrl} />
      </div>

      {/* Integrated Control Console */}
      <div className="w-full max-w-4xl glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10">
        {/* Row 1: Track Info + Volume */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-5 border-b border-border/80">
          <div className="w-full sm:w-auto min-w-0">
            <TrackInfo />
          </div>

          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
            <VolumeControl />
          </div>
        </div>

        {/* Row 2: Progress Bar */}
        <div className="w-full pt-1">
          <ProgressBar />
        </div>

        {/* Row 3: Transport Controls */}
        <div className="flex items-center justify-center pt-2">
          <TransportControls />
        </div>
      </div>
    </section>
  );
};
