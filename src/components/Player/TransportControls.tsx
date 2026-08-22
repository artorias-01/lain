import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import anime from 'animejs';

export const TransportControls: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  } = usePlayerStore();

  const playBtnRef = useRef<HTMLButtonElement>(null);

  const handlePlayClick = () => {
    togglePlay();
    if (playBtnRef.current) {
      anime({
        targets: playBtnRef.current,
        scale: [0.88, 1.05, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .5)',
      });
    }
  };

  const handleBtnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    anime({
      targets: e.currentTarget,
      scale: [0.85, 1],
      duration: 300,
      easing: 'easeOutBack',
    });
  };

  return (
    <div className="flex items-center gap-4 md:gap-6">
      {/* Shuffle Button */}
      <button
        onClick={(e) => {
          toggleShuffle();
          handleBtnClick(e);
        }}
        title="Shuffle Tracks"
        className={`p-2.5 rounded-full transition-all duration-200 ${
          isShuffle
            ? 'text-accent bg-accent-dim shadow-[0_0_15px_var(--accent-glow)]'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
        }`}
      >
        <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Skip Previous */}
      <button
        onClick={(e) => {
          previousTrack();
          handleBtnClick(e);
        }}
        title="Previous Track"
        className="p-3 rounded-full text-text-primary hover:bg-bg-surface transition-colors duration-200 active:scale-95"
      >
        <SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" />
      </button>

      {/* Main Play / Pause Button */}
      <button
        ref={playBtnRef}
        onClick={handlePlayClick}
        title={isPlaying ? 'Pause' : 'Play'}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          isPlaying
            ? 'bg-accent text-black shadow-[0_0_30px_var(--accent-glow)] scale-105'
            : 'bg-white text-black hover:bg-accent hover:shadow-[0_0_25px_var(--accent-glow)]'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" />
        ) : (
          <Play className="w-6 h-6 md:w-7 md:h-7 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Skip Next */}
      <button
        onClick={(e) => {
          nextTrack();
          handleBtnClick(e);
        }}
        title="Next Track"
        className="p-3 rounded-full text-text-primary hover:bg-bg-surface transition-colors duration-200 active:scale-95"
      >
        <SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" />
      </button>

      {/* Repeat Mode Button */}
      <button
        onClick={(e) => {
          cycleRepeatMode();
          handleBtnClick(e);
        }}
        title={`Repeat: ${repeatMode}`}
        className={`p-2.5 rounded-full transition-all duration-200 ${
          repeatMode !== 'none'
            ? 'text-accent bg-accent-dim shadow-[0_0_15px_var(--accent-glow)]'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
        }`}
      >
        {repeatMode === 'one' ? (
          <Repeat1 className="w-4 h-4 md:w-5 md:h-5" />
        ) : (
          <Repeat className="w-4 h-4 md:w-5 md:h-5" />
        )}
      </button>
    </div>
  );
};
