import React, { useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { TrackItem } from '../../lib/youtubePlayer';
import { Search, Play, Pause, AlertCircle, Music } from 'lucide-react';

export const MainTrackView: React.FC = () => {
  const {
    searchResults,
    activeTrack,
    isPlaying,
    playTrack,
    togglePlay,
    searchQuery,
    setSearchQuery,
    isSearching,
    apiKeyMissing,
    searchMessage,
  } = usePlayerStore();

  const [inputVal, setInputVal] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchQuery(inputVal.trim());
    }
  };

  const formatDuration = (secs: number): string => {
    if (!isFinite(secs) || secs <= 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTrackClick = (track: TrackItem) => {
    if (activeTrack.videoId === track.videoId) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-28 select-none">
      {/* App Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <h1 className="font-sans font-extrabold text-2xl tracking-wider text-white">
          AURA
        </h1>
        <span className="text-xs text-gray-500 font-sans">Spotify Hi-Fi Player</span>
      </div>

      {/* Minimal Plain Search Input */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search for any song or artist..."
            className="w-full pl-11 pr-24 py-3 rounded-xl bg-[#181818] border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-4 py-1.5 rounded-lg bg-white text-black font-sans font-semibold text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* API Warning or Quota Message */}
        {(apiKeyMissing || searchMessage) && (
          <div className="mt-3 p-3 rounded-lg bg-[#1e1e1e] border border-white/10 text-amber-300 text-xs font-sans flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{searchMessage || 'No VITE_YOUTUBE_API_KEY set in .env. Showing pre-resolved starter queue.'}</span>
          </div>
        )}
      </form>

      {/* Track List Section Header */}
      <div className="flex items-center justify-between mb-4 px-2 text-xs font-sans text-gray-400 uppercase tracking-wider">
        <span># Title & Artist</span>
        <span>Duration</span>
      </div>

      {/* Single Column Track Rows (Spotify Style) */}
      <div className="space-y-1">
        {searchResults.map((track, idx) => {
          const isActive = activeTrack.videoId === track.videoId;
          const isRowPlaying = isActive && isPlaying;

          return (
            <div
              key={track.id || track.videoId}
              onClick={() => handleTrackClick(track)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-[#282828] text-white' : 'hover:bg-[#1a1a1a] text-gray-300'
              }`}
            >
              {/* Left Column: Row Index / Play Icon + Thumbnail + Title/Artist */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="w-5 text-center text-xs font-mono text-gray-500 flex justify-center items-center flex-shrink-0">
                  {isRowPlaying ? (
                    <Play className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
                  ) : (
                    <span className="group-hover:hidden">{idx + 1}</span>
                  )}
                  <Play className={`w-3.5 h-3.5 text-white fill-current ${isRowPlaying ? 'hidden' : 'hidden group-hover:block'}`} />
                </span>

                {/* Thumbnail */}
                <div className="w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0 border border-white/5">
                  <img src={track.thumbnailUrl} alt={track.title} className="w-full h-full object-cover" />
                </div>

                {/* Track Metadata */}
                <div className="min-w-0 flex-1">
                  <h3 className={`font-sans font-semibold text-sm truncate ${isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                    {track.title}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>
              </div>

              {/* Right Column: Duration */}
              <div className="pl-4 flex-shrink-0 text-xs font-mono text-gray-400">
                {formatDuration(track.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
