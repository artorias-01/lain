import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Disc, Music2 } from 'lucide-react';

export const TrackInfo: React.FC = () => {
  const { activeTrack, isPlaying } = usePlayerStore();

  return (
    <div className="flex items-center gap-4 min-w-0">
      {/* Thumbnail Cover Art */}
      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-lg border border-border-subtle flex-shrink-0 group">
        <img
          src={activeTrack.thumbnailUrl}
          alt={activeTrack.title}
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
        <h3 className="font-display font-bold text-lg md:text-xl text-text-primary truncate tracking-tight">
          {activeTrack.title}
        </h3>

        <p className="text-xs md:text-sm text-text-secondary truncate flex items-center gap-1.5 font-medium mt-0.5">
          <Music2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span>{activeTrack.artist}</span>
          {activeTrack.album && (
            <>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted truncate">{activeTrack.album}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
