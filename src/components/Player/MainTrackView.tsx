import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { TrackItem } from '../../lib/nativeAudioEngine';
import { Search, Play, Pause, X } from 'lucide-react';

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
    trackErrorMessage,
  } = usePlayerStore();

  const [inputVal, setInputVal] = useState(searchQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input by 450ms
  useEffect(() => {
    if (inputVal === searchQuery) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(inputVal.trim());
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputVal, searchQuery, setSearchQuery]);

  const handleClearSearch = () => {
    setInputVal('');
    setSearchQuery('');
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
    <main className="max-w-3xl mx-auto px-6 pt-12 pb-36 select-none">
      {/* Masthead Header: Asymmetric, confident, left-aligned */}
      <header className="mb-10 pb-6 border-b border-scribe flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-paper">
            AURA
          </h1>
          <p className="font-sans text-xs text-kraft mt-1 tracking-normal">
            Analog listening session • High-fidelity audio stream
          </p>
        </div>
        <div className="font-sans text-xs tabular-nums text-kraft/80 self-start sm:self-auto">
          {searchResults.length} {searchResults.length === 1 ? 'recording' : 'recordings'}
        </div>
      </header>

      {/* Direct Search Bar: Plain, architectural, no rounded pill chrome */}
      <section className="mb-10">
        <div className="relative flex items-center border-b border-scribe focus-within:border-ochre transition-colors pb-2">
          <Search className="w-4 h-4 text-kraft flex-shrink-0 mr-3 pointer-events-none" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search by title, artist, or album..."
            className="w-full bg-transparent text-paper placeholder:text-kraft/60 text-sm font-sans focus:outline-none"
          />
          {inputVal && (
            <button
              onClick={handleClearSearch}
              className="text-kraft hover:text-paper transition-colors p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isSearching && (
            <span className="font-sans text-[11px] tabular-nums text-ochre ml-2 animate-pulse flex-shrink-0">
              Locating...
            </span>
          )}
        </div>

        {/* Informative server notice in direct interface voice */}
        {searchMessage && (
          <p className="mt-2 text-xs text-kraft leading-relaxed font-sans">
            {searchMessage}
          </p>
        )}

        {trackErrorMessage && (
          <p className="mt-2 text-xs text-ochre leading-relaxed font-sans">
            {trackErrorMessage}
          </p>
        )}
      </section>

      {/* Ledger Column Headings: Real structural header, not decorative eyebrow */}
      <section>
        <div className="grid grid-cols-[36px_1fr_60px] sm:grid-cols-[44px_1fr_80px] items-center text-xs font-sans text-kraft border-b border-scribe pb-2 mb-1 px-3">
          <span className="tabular-nums">#</span>
          <span>Composition</span>
          <span className="text-right tabular-nums">Length</span>
        </div>

        {/* Archival Ledger Rows */}
        {searchResults.length === 0 ? (
          <div className="py-16 text-center text-kraft font-sans text-sm">
            <p>No recordings match your search.</p>
            <p className="text-xs text-kraft/70 mt-1">Try querying a different title or clearing the filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-scribe/40">
            {searchResults.map((track, idx) => {
              const isActive = activeTrack.videoId === track.videoId;
              const isRowPlaying = isActive && isPlaying;
              const trackNum = (idx + 1).toString().padStart(2, '0');

              return (
                <div
                  key={track.id || track.videoId}
                  onClick={() => handleTrackClick(track)}
                  className={`group grid grid-cols-[36px_1fr_60px] sm:grid-cols-[44px_1fr_80px] items-center px-3 py-3.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-substrate text-paper'
                      : 'hover:bg-substrate/60 text-paper/90'
                  }`}
                >
                  {/* Column 1: Aligned Track Index or Play State */}
                  <div className="flex items-center">
                    <span className="font-sans font-medium text-xs tabular-nums text-kraft flex items-center justify-center w-5">
                      {isRowPlaying ? (
                        <span className="flex items-center gap-[2px] h-3.5">
                          <span className="w-[2px] h-2 bg-ochre animate-pulse" />
                          <span className="w-[2px] h-3.5 bg-ochre animate-pulse delay-75" />
                          <span className="w-[2px] h-2.5 bg-ochre animate-pulse delay-150" />
                        </span>
                      ) : (
                        <span className="group-hover:hidden">{trackNum}</span>
                      )}
                      <Play
                        className={`w-3.5 h-3.5 text-ochre fill-current ${
                          isRowPlaying ? 'hidden' : 'hidden group-hover:block'
                        }`}
                      />
                    </span>
                  </div>

                  {/* Column 2: Artwork Disc + Title & Artist */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-lacquer border border-scribe flex-shrink-0">
                      <img
                        src={track.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 rounded-full border border-black/20" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-display font-semibold text-sm truncate tracking-tight ${
                          isActive ? 'text-ochre' : 'text-paper group-hover:text-ochre transition-colors'
                        }`}
                      >
                        {track.title}
                      </h3>
                      <p className="font-sans text-xs text-kraft truncate mt-0.5">
                        {track.artist}
                        {track.album && <span className="opacity-60"> — {track.album}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Column 3: Tabular Duration */}
                  <div className="text-right font-sans font-medium text-xs tabular-nums text-kraft group-hover:text-paper transition-colors">
                    {formatDuration(track.duration)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};
