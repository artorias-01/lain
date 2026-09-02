import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ProgressBar } from './ProgressBar';
import { registerVinylElement, setVinylPlaying } from '../../lib/vinylSpinSync';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle, Maximize2 } from 'lucide-react';

export const SpotifyPlayerBar: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    repeatMode,
    cycleRepeatMode,
    isShuffle,
    toggleShuffle,
    setIsNowPlayingExpanded,
  } = usePlayerStore();

  const discRef = useRef<HTMLDivElement>(null);

  // Synchronized continuous vinyl spinning
  useEffect(() => {
    setVinylPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const unregister = registerVinylElement(discRef.current);
    return () => {
      unregister();
    };
  }, []);

  const currentVol = isMuted ? 0 : volume;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-substrate border-t border-scribe px-4 sm:px-6 flex items-center justify-between gap-4 z-40 select-none font-mono">
      {/* Left Column: Tappable Mini Player Art & Metadata (Expands TUI View) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsNowPlayingExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsNowPlayingExpanded(true);
          }
        }}
        className="flex items-center gap-3 min-w-0 w-1/4 sm:w-1/3 cursor-pointer group/minibar py-1 px-1 border border-transparent hover:border-scribe bg-transparent hover:bg-surface transition-colors"
        title="[ EXPAND NOW PLAYING ]"
      >
        {/* Crisp Square-Framed Mini Vinyl */}
        <div className="relative w-10 h-10 p-0.5 bg-black border border-accent/40 flex items-center justify-center flex-shrink-0 group-hover/minibar:border-accent transition-colors">
          <div
            ref={discRef}
            className="w-full h-full rounded-full vinyl-grooves-pattern relative overflow-hidden flex items-center justify-center border border-scribe"
          >
            {/* Center Label Masked Album Art */}
            <div className="w-[50%] h-[50%] rounded-full overflow-hidden relative">
              <img
                src={activeTrack.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Specular Glare Overlay */}
            <div className="absolute inset-0 rounded-full vinyl-glare-overlay pointer-events-none opacity-40 mix-blend-screen" />

            {/* Spindle Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black border border-accent/50" />
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold text-paper truncate group-hover/minibar:text-accent transition-colors">
              {activeTrack.title}
            </h2>
            <Maximize2 className="w-3 h-3 text-accent opacity-0 group-hover/minibar:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-[10px] text-kraft truncate mt-0.5">
            {activeTrack.artist}
          </p>
        </div>
      </div>

      {/* Center Column: Transport Controls & Scrubbable Progress Bar */}
      <div className="flex flex-col items-center justify-center gap-1 flex-1 max-w-xl">
        {/* Transport Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`px-1 py-0.5 text-xs transition-colors ${
              isShuffle ? 'text-accent font-bold' : 'text-kraft/60 hover:text-kraft'
            }`}
            title={isShuffle ? 'Shuffle active' : 'Shuffle inactive'}
          >
            <Shuffle className="w-3 h-3" />
          </button>

          <button
            onClick={previousTrack}
            className="text-kraft hover:text-paper active:scale-95 transition-all p-1"
            title="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-7 h-7 bg-accent text-lacquer flex items-center justify-center hover:bg-accent-hover active:scale-95 transition-all font-bold"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-kraft hover:text-paper active:scale-95 transition-all p-1"
            title="Next track"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`px-1 py-0.5 text-xs transition-colors ${
              repeatMode !== 'none' ? 'text-accent font-bold' : 'text-kraft/60 hover:text-kraft'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat className="w-3 h-3" />
          </button>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full max-w-md">
          <ProgressBar />
        </div>
      </div>

      {/* Right Column: Volume Control */}
      <div className="flex items-center justify-end gap-2 w-1/4 sm:w-1/3">
        <button
          onClick={toggleMute}
          className="text-kraft hover:text-paper transition-colors p-1"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || currentVol === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-kraft/50" />
          ) : currentVol < 0.5 ? (
            <Volume1 className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVol}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 sm:w-20 h-1 cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22C55E ${currentVol * 100}%, #1C261D ${currentVol * 100}%)`,
          }}
          title={`Volume: ${Math.round(currentVol * 100)}%`}
        />
      </div>
    </footer>
  );
};
