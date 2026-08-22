import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Play, Pause, Disc, Youtube, Sparkles } from 'lucide-react';
import { TrackItem } from '../../lib/youtubePlayer';

export const TrackListSection: React.FC = () => {
  const {
    searchResults,
    activeTrack,
    isPlaying,
    playTrack,
    togglePlay,
    searchQuery,
  } = usePlayerStore();

  const handleTrackClick = (track: TrackItem) => {
    if (activeTrack.videoId === track.videoId) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <section id="queue" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-accent font-mono text-xs tracking-widest uppercase mb-2">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>{searchQuery ? `Search Results for "${searchQuery}"` : 'Curated YouTube Queue'}</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary">
            Full-Song Audio Queue
          </h2>
        </div>
        <p className="text-sm text-text-secondary max-w-sm">
          Select any track to drop the tonearm and stream full-length high-fidelity audio.
        </p>
      </div>

      {/* Track List */}
      <div className="space-y-3">
        {searchResults.map((track, idx) => {
          const isActive = activeTrack.videoId === track.videoId;
          const isRowPlaying = isActive && isPlaying;

          return (
            <div
              key={track.id || track.videoId}
              onClick={() => handleTrackClick(track)}
              className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl ${
                isActive
                  ? 'glass-panel-glow border-accent/60 bg-accent-dim/30'
                  : 'bg-bg-elevated/40 hover:bg-bg-elevated/80 border border-border/40 hover:border-border'
              }`}
            >
              {/* Left Info: Index + Thumbnail + Title/Channel */}
              <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                <div className="w-6 text-center font-mono text-sm text-text-muted flex justify-center items-center flex-shrink-0">
                  {isRowPlaying ? (
                    <Disc className="w-5 h-5 text-accent animate-spin-slow" />
                  ) : (
                    <span className="group-hover:hidden">{String(idx + 1).padStart(2, '0')}</span>
                  )}
                  <Play className={`w-4 h-4 text-accent fill-current ${isRowPlaying ? 'hidden' : 'hidden group-hover:block'}`} />
                </div>

                {/* YouTube High-Res Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-border-subtle">
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isRowPlaying ? (
                      <Pause className="w-5 h-5 text-accent fill-current" />
                    ) : (
                      <Play className="w-5 h-5 text-white fill-current" />
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="min-w-0 flex-1">
                  <h4 className={`font-display font-semibold text-base sm:text-lg truncate transition-colors ${isActive ? 'text-accent' : 'text-text-primary group-hover:text-accent'}`}>
                    {track.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-text-secondary truncate">
                    {track.artist}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pl-4 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackClick(track);
                  }}
                  className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all ${
                    isRowPlaying
                      ? 'bg-accent text-black shadow-[0_0_15px_var(--accent-glow)]'
                      : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                >
                  {isRowPlaying ? 'PLAYING' : 'DROP NEEDLE'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
