import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { nativeAudioEngine } from '../../lib/nativeAudioEngine';

export const SpotifyPlayerBar: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    repeatMode,
    cycleRepeatMode,
    isShuffle,
    toggleShuffle,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    setIsNowPlayingExpanded,
  } = usePlayerStore();

  const { isLiked, toggleLike } = useLibraryStore();

  const trackLiked = activeTrack ? isLiked(activeTrack.videoId) : false;

  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressKnobRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLSpanElement>(null);
  const durationTimeRef = useRef<HTMLSpanElement>(null);

  const [isScrubbing, setIsScrubbing] = useState(false);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // High performance RAF time update
  useEffect(() => {
    let animId: number;

    const updateTime = () => {
      nativeAudioEngine.updateTimeRef();
      const cur = nativeAudioEngine.currentTimeRef.current;
      const dur = nativeAudioEngine.durationRef.current;

      if (!isScrubbing && dur > 0) {
        const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
        if (progressFillRef.current) {
          progressFillRef.current.style.width = `${pct}%`;
        }
        if (progressKnobRef.current) {
          progressKnobRef.current.style.left = `${pct}%`;
        }
      }

      if (currentTimeRef.current) {
        currentTimeRef.current.textContent = formatTime(cur);
      }
      if (durationTimeRef.current) {
        durationTimeRef.current.textContent = formatTime(dur);
      }

      animId = requestAnimationFrame(updateTime);
    };

    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, [isScrubbing]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || nativeAudioEngine.durationRef.current <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    nativeAudioEngine.seekTo(ratio * nativeAudioEngine.durationRef.current);
  };

  const currentVol = isMuted ? 0 : volume;

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(ratio);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-player-height bg-surface-container-lowest/95 backdrop-blur-2xl z-50 px-space-xl flex items-center justify-between border-t border-outline-variant/10 select-none">
      {/* ─────────────────────────────────────────────────────────────
          Left: Track Art & Title & Favorite (1/4)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-space-base w-1/4 min-w-0">
        <div
          onClick={() => setIsNowPlayingExpanded(true)}
          className="w-14 h-14 bg-surface-container-high rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer group"
          title="Open expanded now playing"
        >
          {activeTrack?.thumbnailUrl ? (
            <img
              src={activeTrack.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover filter grayscale group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="material-symbols-outlined text-primary text-headline-md">
              graphic_eq
            </span>
          )}
        </div>

        <div
          onClick={() => setIsNowPlayingExpanded(true)}
          className="flex flex-col truncate cursor-pointer"
        >
          <span className="font-label-lg text-label-lg text-primary truncate font-semibold hover:underline">
            {activeTrack?.title || 'Sub-Zero Echoes'}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {activeTrack?.artist || 'Klara Voss & Monolith'}
          </span>
        </div>

        {activeTrack && (
          <button
            onClick={() => toggleLike(activeTrack)}
            className={`transition-colors ml-space-xs ${
              trackLiked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            }`}
            title={trackLiked ? 'Unlike' : 'Like'}
          >
            <span
              className="material-symbols-outlined text-headline-sm"
              style={{ fontVariationSettings: trackLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Center: Controls & Scrub Bar (2/4 max-w-xl)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-space-xs w-2/4 max-w-xl">
        {/* Buttons */}
        <div className="flex items-center gap-space-lg">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            }`}
            title="Shuffle"
          >
            <span className="material-symbols-outlined text-body-lg">shuffle</span>
          </button>

          <button
            onClick={previousTrack}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title="Previous"
          >
            <span className="material-symbols-outlined text-headline-sm">skip_previous</span>
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary text-surface-dim flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <span
              className="material-symbols-outlined text-headline-md"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={nextTrack}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title="Next"
          >
            <span className="material-symbols-outlined text-headline-sm">skip_next</span>
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`transition-colors ${
              repeatMode !== 'none' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            <span className="material-symbols-outlined text-body-lg">repeat</span>
          </button>
        </div>

        {/* Scrub Bar */}
        <div className="flex items-center gap-space-md w-full">
          <span ref={currentTimeRef} className="font-mono-numbers text-mono-numbers text-outline min-w-[34px] text-right">
            00:00
          </span>

          <div
            ref={progressBarRef}
            onClick={handleSeek}
            className="relative flex-1 h-1 bg-surface-container-highest rounded-full cursor-pointer group py-1 -my-1"
          >
            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                ref={progressFillRef}
                className="h-full w-[0%] bg-primary rounded-full group-hover:bg-primary transition-none"
              />
            </div>
            <div
              ref={progressKnobRef}
              className="absolute left-[0%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          <span ref={durationTimeRef} className="font-mono-numbers text-mono-numbers text-outline min-w-[34px]">
            00:00
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Right: Lyrics, Queue, Audio Output & Volume (1/4)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-space-md w-1/4">
        <button
          onClick={() => setIsNowPlayingExpanded(true)}
          className="text-on-surface-variant hover:text-primary transition-colors"
          title="Lyrics"
        >
          <span className="material-symbols-outlined text-body-lg">lyrics</span>
        </button>

        <button
          onClick={() => setIsNowPlayingExpanded(true)}
          className="text-on-surface-variant hover:text-primary transition-colors"
          title="Queue"
        >
          <span className="material-symbols-outlined text-body-lg">queue_music</span>
        </button>

        <button
          className="text-on-surface-variant hover:text-primary transition-colors"
          title="Audio Output: Spatial / Speaker"
        >
          <span className="material-symbols-outlined text-body-lg">speaker_group</span>
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-space-xs w-28">
          <button
            onClick={toggleMute}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="material-symbols-outlined text-body-md">
              {isMuted || currentVol === 0 ? 'volume_off' : currentVol < 0.5 ? 'volume_down' : 'volume_up'}
            </span>
          </button>

          <div
            onClick={handleVolumeClick}
            className="relative flex-1 h-1 bg-surface-container-highest rounded-full cursor-pointer group py-1 -my-1"
          >
            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                style={{ width: `${currentVol * 100}%` }}
                className="h-full bg-primary rounded-full transition-all"
              />
            </div>
            <div
              style={{ left: `${currentVol * 100}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
