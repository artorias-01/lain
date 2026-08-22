import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Play, Pause, Disc, Clock, Music } from 'lucide-react';
import anime from 'animejs';

export const TrackListSection: React.FC = () => {
  const { tracks, currentTrackIndex, isPlaying, playTrackIndex, togglePlay } = usePlayerStore();

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRowClick = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    // Micro interaction on click
    anime({
      targets: e.currentTarget,
      scale: [0.98, 1],
      duration: 300,
      easing: 'easeOutQuad',
    });

    if (currentTrackIndex === index) {
      togglePlay();
    } else {
      playTrackIndex(index);
    }
  };

  return (
    <section id="library" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-accent font-mono text-xs tracking-widest uppercase mb-2">
            <Music className="w-3.5 h-3.5" />
            <span>Master Catalogue</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary">
            Curated Hi-Fi Vinyl Library
          </h2>
        </div>
        <p className="text-sm text-text-secondary max-w-sm">
          Select any master tape to drop the tonearm and load the high-definition stem.
        </p>
      </div>

      {/* Track List Table/Grid */}
      <div className="space-y-3">
        {tracks.map((track, idx) => {
          const isActive = currentTrackIndex === idx;
          const isRowPlaying = isActive && isPlaying;

          return (
            <div
              key={track.id}
              onClick={(e) => handleRowClick(idx, e)}
              className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl ${
                isActive
                  ? 'glass-panel-glow border-accent/40 bg-accent-dim/20'
                  : 'bg-bg-elevated/40 hover:bg-bg-elevated/80 border border-border/40 hover:border-border'
              }`}
            >
              {/* Left Info: Index + Thumbnail + Title/Artist */}
              <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                {/* Index / Playing Indicator */}
                <div className="w-8 text-center font-mono text-sm text-text-muted flex justify-center items-center flex-shrink-0">
                  {isRowPlaying ? (
                    <Disc className="w-5 h-5 text-accent animate-spin-slow" />
                  ) : (
                    <span className="group-hover:hidden">{String(idx + 1).padStart(2, '0')}</span>
                  )}
                  <Play className={`w-4 h-4 text-accent fill-current ${isRowPlaying ? 'hidden' : 'hidden group-hover:block'}`} />
                </div>

                {/* Album Art Cover */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-border-subtle">
                  <img src={track.albumArtUrl} alt={track.title} className="w-full h-full object-cover" />
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
                    {track.artist} <span className="text-text-muted">•</span> {track.album}
                  </p>
                </div>
              </div>

              {/* Middle Badge: Genre / BPM */}
              <div className="hidden md:flex items-center gap-3 px-4">
                <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-bg-surface text-text-secondary border border-border-subtle">
                  {track.genre}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  {track.bpm} BPM
                </span>
              </div>

              {/* Right Info: Duration */}
              <div className="flex items-center gap-3 pl-4 flex-shrink-0">
                <span className="font-mono text-xs sm:text-sm text-text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 hidden sm:inline" />
                  {formatDuration(track.duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
