import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Play, Pause, Heart, Clock, Disc, Sparkles, Music } from 'lucide-react';
import { Track } from '../../lib/trackData';

export const SearchResults: React.FC = () => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    activeTrack,
    isPlaying,
    playTrack,
    togglePlay,
    likedTrackIds,
    toggleLikeTrack,
    toggleTurntableDrawer,
  } = usePlayerStore();

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayClick = (track: Track) => {
    if (activeTrack.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-accent text-xs font-mono tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Web & YouTube Music Search</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Global Audio Tracks'}
          </h2>
        </div>

        {searchResults.length > 0 && (
          <span className="text-xs font-mono text-text-muted">
            Found {searchResults.length} live tracks
          </span>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="py-20 text-center space-y-3">
          <Disc className="w-10 h-10 text-accent animate-spin mx-auto" />
          <p className="font-mono text-sm text-text-secondary">Searching live audio streams...</p>
        </div>
      )}

      {/* Empty / No Results State */}
      {!isSearching && searchQuery && searchResults.length === 0 && (
        <div className="py-20 text-center space-y-3 glass-panel rounded-2xl p-8">
          <Music className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="font-display font-bold text-lg text-text-primary">No live tracks found for "{searchQuery}"</h3>
          <p className="text-xs font-mono text-text-secondary max-w-sm mx-auto">
            Try searching for popular artists like "Daft Punk", "Taylor Swift", "Lofi", or "Coldplay".
          </p>
        </div>
      )}

      {/* Grid of Results (Spotlight Cards) */}
      {!isSearching && searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map((track) => {
            const isActive = activeTrack.id === track.id;
            const isTrackPlaying = isActive && isPlaying;
            const isLiked = likedTrackIds.includes(track.id);

            return (
              <div
                key={track.id}
                className={`group relative glass-panel rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border ${
                  isActive ? 'border-accent/60 bg-accent-dim/30' : 'border-border/40 hover:border-accent/40'
                }`}
              >
                {/* Album Cover Art */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-md border border-border-subtle">
                  <img
                    src={track.albumArtUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Floating Play Button Overlay */}
                  <button
                    onClick={() => {
                      handlePlayClick(track);
                      toggleTurntableDrawer();
                    }}
                    className={`absolute bottom-3 right-3 w-12 h-12 rounded-full bg-accent text-black flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isTrackPlaying ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                    }`}
                  >
                    {isTrackPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>

                {/* Metadata */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-display font-bold text-base truncate ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                      {track.title}
                    </h4>
                    <button
                      onClick={() => toggleLikeTrack(track.id)}
                      className="text-text-muted hover:text-accent transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'text-accent fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{track.artist}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] font-mono text-text-muted">
                    <span className="truncate">{track.genre}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
