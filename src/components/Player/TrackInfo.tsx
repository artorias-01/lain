import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Disc, Music2 } from 'lucide-react';

export const TrackInfo: React.FC = () => {
  const { tracks, currentTrackIndex, isPlaying } = usePlayerStore();
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  return (
    <div className="flex items-center gap-4 min-w-0">
      {/* Thumbnail Album Art */}
      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-lg border border-border-subtle flex-shrink-0 group">
        <img
          src={currentTrack.albumArtUrl}
          alt={currentTrack.title}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
            isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Disc className={`w-7 h-7 text-accent ${isPlaying ? 'animate-spin-slow' : ''}`} />
        </div>
      </div>

      {/* Metadata & Title */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold uppercase rounded-full bg-accent-dim text-accent border border-accent/20">
            {currentTrack.genre}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            {currentTrack.bpm} BPM • {currentTrack.year}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg md:text-xl text-text-primary truncate tracking-tight">
          {currentTrack.title}
        </h3>
        
        <p className="text-xs md:text-sm text-text-secondary truncate flex items-center gap-1.5 font-medium">
          <Music2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span>{currentTrack.artist}</span>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted truncate">{currentTrack.album}</span>
        </p>
      </div>
    </div>
  );
};
