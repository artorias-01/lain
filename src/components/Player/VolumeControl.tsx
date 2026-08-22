import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const VolumeControl: React.FC = () => {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();

  const currentVol = isMuted ? 0 : volume;

  return (
    <div className="flex items-center gap-3 select-none">
      <button
        onClick={toggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
      >
        {isMuted || currentVol === 0 ? (
          <VolumeX className="w-5 h-5 text-accent" />
        ) : currentVol < 0.5 ? (
          <Volume1 className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Volume Slider Rail */}
      <div className="w-24 md:w-32 flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVol}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-1 bg-bg-surface rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent-color) ${currentVol * 100}%, var(--bg-surface) ${currentVol * 100}%)`,
          }}
        />
      </div>
    </div>
  );
};
