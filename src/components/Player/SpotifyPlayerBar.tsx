import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ProgressBar } from './ProgressBar';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react';
import gsap from 'gsap';

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
    trackErrorMessage,
  } = usePlayerStore();

  const discRef = useRef<HTMLDivElement>(null);
  const spinTimelineRef = useRef<gsap.core.Tween | null>(null);

  // GSAP continuous restart-safe spinning loop for the vinyl thumbnail
  useEffect(() => {
    if (!discRef.current) return;

    spinTimelineRef.current = gsap.to(discRef.current, {
      rotation: '+=360',
      duration: 3.5, // Smooth constant spin speed
      repeat: -1,
      ease: 'none',
      paused: true,
    });

    return () => {
      spinTimelineRef.current?.kill();
    };
  }, []);

  // Handle Play/Pause acceleration & deceleration
  useEffect(() => {
    const spinTween = spinTimelineRef.current;
    if (!spinTween) return;

    if (isPlaying) {
      spinTween.play();
      gsap.to(spinTween, { timeScale: 1, duration: 0.6, ease: 'power2.in' });
    } else {
      gsap.to(spinTween, {
        timeScale: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          spinTween.pause();
        },
      });
    }
  }, [isPlaying]);

  const currentVol = isMuted ? 0 : volume;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#121212] border-t border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 z-50 select-none">
      {/* Left Column: Spinning Vinyl Album Art Thumbnail + Track Info */}
      <div className="flex items-center gap-3.5 min-w-0 w-1/4 sm:w-1/3">
        {/* Small Spinning Vinyl Disc Thumbnail */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#181818] border border-white/10 flex-shrink-0 shadow-sm">
          <div
            ref={discRef}
            className="w-full h-full rounded-full vinyl-grooves-pattern relative overflow-hidden"
          >
            <img
              src={activeTrack.thumbnailUrl}
              alt={activeTrack.title}
              className="w-full h-full object-cover rounded-full p-1"
            />
            {/* Center Spindle Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0b0c10] border border-white/30" />
          </div>
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <h4 className="font-sans font-semibold text-sm text-white truncate">
            {activeTrack.title}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">{activeTrack.artist}</p>
        </div>
      </div>

      {/* Center Column: Transport Controls & Progress Bar */}
      <div className="flex flex-col items-center justify-center gap-1 flex-1 max-w-xl">
        {/* Playback Error Toast Notice */}
        {trackErrorMessage && (
          <span className="text-[11px] font-sans text-amber-400 truncate max-w-md">
            {trackErrorMessage}
          </span>
        )}

        {/* Transport Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={previousTrack}
            className="text-gray-400 hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-gray-400 hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Slim Progress Bar */}
        <div className="w-full max-w-md">
          <ProgressBar />
        </div>
      </div>

      {/* Right Column: Volume Control */}
      <div className="flex items-center justify-end gap-2 w-1/4 sm:w-1/3">
        <button
          onClick={toggleMute}
          className="text-gray-400 hover:text-white transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || currentVol === 0 ? (
            <VolumeX className="w-4 h-4 text-gray-400" />
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
          className="w-20 sm:w-28 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffffff ${currentVol * 100}%, #374151 ${currentVol * 100}%)`,
          }}
        />
      </div>
    </footer>
  );
};
