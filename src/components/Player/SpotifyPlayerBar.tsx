import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ProgressBar } from './ProgressBar';
import { PixelVinyl3D } from '../Vinyl3D/PixelVinyl3D';
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

  const currentVol = isMuted ? 0 : volume;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-retro-panel border-t-2 border-retro-border px-3 sm:px-6 flex items-center justify-between gap-3 z-40 select-none font-mono">
      {/* Left Column: Mini Cartridge & Track Info (Expands HUD) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsNowPlayingExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsNowPlayingExpanded(true);
          }
        }}
        className="flex items-center gap-2.5 min-w-0 w-1/4 sm:w-1/3 cursor-pointer group py-1 px-1 pixel-panel-inset hover:border-retro-cyan transition-none"
        title="Expand Console HUD"
      >
        {/* Mini 3D Vinyl Preview */}
        <div className="w-10 h-10 overflow-hidden flex-shrink-0 bg-black border border-retro-border flex items-center justify-center">
          <PixelVinyl3D
            thumbnailUrl={activeTrack.thumbnailUrl}
            isPlaying={isPlaying}
            size={40}
          />
        </div>

        {/* Track Title & Artist */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h2 className="text-xs font-bold text-paper truncate group-hover:text-retro-cyan">
              {activeTrack.title}
            </h2>
            <Maximize2 className="w-3 h-3 text-retro-cyan opacity-0 group-hover:opacity-100 transition-none flex-shrink-0" />
          </div>
          <p className="text-[10px] text-kraft truncate mt-0.5">
            {activeTrack.artist}
          </p>
        </div>
      </div>

      {/* Center Column: Chunky Transport Buttons & Segmented HUD Bar */}
      <div className="flex flex-col items-center justify-center gap-1 flex-1 max-w-xl">
        {/* Tactile 3D Buttons */}
        <div className="flex items-center gap-2 font-pixel">
          <button
            onClick={toggleShuffle}
            className={`pixel-btn px-1.5 py-1 text-[9px] ${
              isShuffle ? 'text-retro-cyan border-retro-cyan font-bold' : 'text-kraft'
            }`}
            title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
          >
            <Shuffle className="w-3 h-3" />
          </button>

          <button
            onClick={previousTrack}
            className="pixel-btn px-2 py-1 text-xs text-paper"
            title="Previous track"
          >
            <SkipBack className="w-3 h-3 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="pixel-btn-accent px-3 py-1 text-xs"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="pixel-btn px-2 py-1 text-xs text-paper"
            title="Next track"
          >
            <SkipForward className="w-3 h-3 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`pixel-btn px-1.5 py-1 text-[9px] ${
              repeatMode !== 'none' ? 'text-retro-cyan border-retro-cyan font-bold' : 'text-kraft'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            <Repeat className="w-3 h-3" />
          </button>
        </div>

        {/* Segmented Progress HUD */}
        <div className="w-full max-w-md">
          <ProgressBar />
        </div>
      </div>

      {/* Right Column: Console Audio Level */}
      <div className="flex items-center justify-end gap-2 w-1/4 sm:w-1/3">
        <button
          onClick={toggleMute}
          className="pixel-btn p-1.5 text-kraft hover:text-paper"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || currentVol === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-red-400" />
          ) : currentVol < 0.5 ? (
            <Volume1 className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-retro-cyan" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVol}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 sm:w-20 h-2 cursor-pointer"
          title={`Volume: ${Math.round(currentVol * 100)}%`}
        />
      </div>
    </footer>
  );
};
