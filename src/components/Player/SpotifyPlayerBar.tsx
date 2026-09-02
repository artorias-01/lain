import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ProgressBar } from './ProgressBar';
import { registerVinylElement, setVinylPlaying } from '../../lib/vinylSpinSync';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle, Maximize2 } from 'lucide-react';
import anime from 'animejs';

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
  const playIconRef = useRef<HTMLSpanElement>(null);

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

  // anime.js micro-interaction: quick icon pop on state toggle
  useEffect(() => {
    if (playIconRef.current) {
      anime.remove(playIconRef.current);
      anime({
        targets: playIconRef.current,
        scale: [0.8, 1],
        opacity: [0.6, 1],
        duration: 260,
        easing: 'easeOutBack',
      });
    }
  }, [isPlaying]);

  const currentVol = isMuted ? 0 : volume;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-substrate border-t border-scribe px-4 sm:px-8 flex items-center justify-between gap-4 z-40 select-none">
      {/* Left Column: Tappable Mini Player Art & Track Identity (Expands Now Playing) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsNowPlayingExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsNowPlayingExpanded(true);
          }
        }}
        className="flex items-center gap-3.5 min-w-0 w-1/4 sm:w-1/3 cursor-pointer group/minibar py-1.5 px-1 rounded-lg hover:bg-white/[0.03] transition-colors"
        title="Expand Now Playing"
      >
        {/* The Signature Vinyl Disc */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-lacquer border border-scribe flex-shrink-0 shadow-md group-hover/minibar:border-ochre/50 transition-colors">
          <div
            ref={discRef}
            className="w-full h-full rounded-full vinyl-grooves-pattern relative overflow-hidden flex items-center justify-center"
          >
            {/* Center Label Masked Album Art */}
            <div className="w-8 h-8 rounded-full overflow-hidden relative">
              <img
                src={activeTrack.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Concentric Vinyl Specular Glare Overlay */}
            <div className="absolute inset-0 rounded-full vinyl-glare-overlay pointer-events-none opacity-40 mix-blend-screen" />

            {/* Center Spindle Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-lacquer border border-paper/30 shadow-inner" />
          </div>
        </div>

        {/* Track Title & Artist with Expand Indicator */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="font-display font-semibold text-sm text-paper truncate tracking-tight group-hover/minibar:text-ochre transition-colors">
              {activeTrack.title}
            </h2>
            <Maximize2 className="w-3 h-3 text-kraft/50 group-hover/minibar:text-ochre opacity-0 group-hover/minibar:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="font-sans text-xs text-kraft truncate mt-0.5">
            {activeTrack.artist}
          </p>
        </div>
      </div>

      {/* Center Column: Transport Controls & Scrubbable Progress Bar */}
      <div className="flex flex-col items-center justify-center gap-1.5 flex-1 max-w-xl">
        {/* Transport Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1 transition-colors ${
              isShuffle ? 'text-ochre' : 'text-kraft/60 hover:text-kraft'
            }`}
            title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={previousTrack}
            className="text-kraft hover:text-paper active:scale-95 transition-all p-1"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-paper text-lacquer flex items-center justify-center hover:bg-ochre active:scale-95 transition-all shadow-sm"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <span ref={playIconRef} className="flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />
              )}
            </span>
          </button>

          <button
            onClick={nextTrack}
            className="text-kraft hover:text-paper active:scale-95 transition-all p-1"
            title="Next track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-1 transition-colors ${
              repeatMode !== 'none' ? 'text-ochre' : 'text-kraft/60 hover:text-kraft'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Minimal Progress Bar with Tabular Times */}
        <div className="w-full max-w-md">
          <ProgressBar />
        </div>
      </div>

      {/* Right Column: Volume Slider */}
      <div className="flex items-center justify-end gap-2 w-1/4 sm:w-1/3">
        <button
          onClick={toggleMute}
          className="text-kraft hover:text-paper transition-colors p-1"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || currentVol === 0 ? (
            <VolumeX className="w-4 h-4 text-kraft/50" />
          ) : currentVol < 0.5 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVol}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 sm:w-24 h-1 cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F3EDE2 ${currentVol * 100}%, #26231F ${currentVol * 100}%)`,
          }}
          title={`Volume: ${Math.round(currentVol * 100)}%`}
        />
      </div>
    </footer>
  );
};
