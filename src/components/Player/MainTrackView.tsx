import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore, Playlist } from '../../store/useLibraryStore';
import { TrackItem } from '../../lib/nativeAudioEngine';
import { registerVinylElement, setVinylPlaying } from '../../lib/vinylSpinSync';
import { extractDominantColor } from '../../lib/colorExtractor';
import { Search, Play, X, Heart, Plus, Trash2, FolderPlus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    searchMessage,
    trackErrorMessage,
    setIsNowPlayingExpanded,
  } = usePlayerStore();

  const {
    likedTracks,
    playlists,
    activeTab,
    selectedPlaylistId,
    isLiked,
    toggleLike,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    setActiveTab,
    setSelectedPlaylistId,
  } = useLibraryStore();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  const heroSectionRef = useRef<HTMLElement>(null);
  const heroDiscContainerRef = useRef<HTMLDivElement>(null);
  const heroDiscRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronized Vinyl Rotation for Hero Disc
  useEffect(() => {
    setVinylPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const unregister = registerVinylElement(heroDiscRef.current);
    return () => {
      unregister();
    };
  }, []);

  // Update dynamic accent theme when activeTrack changes
  useEffect(() => {
    if (activeTrack) {
      extractDominantColor(activeTrack.thumbnailUrl, activeTrack.videoId);
    }
  }, [activeTrack?.videoId, activeTrack?.thumbnailUrl]);

  // Snappy Scroll-interactive Hero Disc animation with Lenis-synced ScrollTrigger
  useEffect(() => {
    if (!heroSectionRef.current || !heroDiscContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(heroDiscContainerRef.current, {
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top+=60',
          scrub: 0.3,
        },
        scale: 0.78,
        y: -24,
        opacity: 0.7,
        ease: 'none',
      });
    });

    return () => ctx.revert();
  }, []);

  // Debounce search input by 400ms
  useEffect(() => {
    if (inputVal === searchQuery) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(inputVal.trim());
    }, 400);

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
    if (activeTrack && activeTrack.videoId === track.videoId) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
  };

  // Close playlist popover menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuTrackId(null);
    if (activeMenuTrackId) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [activeMenuTrackId]);

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-36 select-none font-mono">
      {/* ─────────────────────────────────────────────────────────────
          TUI TOP BAR / STATUS HEADER
         ───────────────────────────────────────────────────────────── */}
      <header className="mb-6 border border-scribe bg-substrate p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold text-lg tracking-tight">LaIN</span>
          <span className="terminal-cursor text-accent font-bold text-lg">_</span>
          <span className="text-xs text-kraft ml-2 border-l border-scribe pl-2">
            [SYS: AUDIO_CORE_ONLINE]
          </span>
        </div>

        {/* TUI Bracketed Menu Navigation */}
        <nav className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-2.5 py-1 transition-all ${
              activeTab === 'catalog'
                ? 'bg-accent text-lacquer font-bold shadow-none'
                : 'text-kraft hover:text-paper hover:bg-surface border border-transparent hover:border-scribe'
            }`}
          >
            [ 01: CATALOG ]
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-2.5 py-1 transition-all flex items-center gap-1 ${
              activeTab === 'liked'
                ? 'bg-accent text-lacquer font-bold shadow-none'
                : 'text-kraft hover:text-paper hover:bg-surface border border-transparent hover:border-scribe'
            }`}
          >
            <span>[ 02: LIKED ({likedTracks.length}) ]</span>
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-2.5 py-1 transition-all flex items-center gap-1 ${
              activeTab === 'playlists'
                ? 'bg-accent text-lacquer font-bold shadow-none'
                : 'text-kraft hover:text-paper hover:bg-surface border border-transparent hover:border-scribe'
            }`}
          >
            <span>[ 03: PLAYLISTS ({playlists.length}) ]</span>
          </button>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          TUI ASCII-BORDERED HERO DISC WIDGET
         ───────────────────────────────────────────────────────────── */}
      <section ref={heroSectionRef} className="mb-8 select-none">
        <div className="border border-scribe bg-substrate p-4 sm:p-6 relative">
          {/* Panel Header Label */}
          <div className="flex items-center justify-between text-[11px] text-kraft border-b border-scribe pb-2.5 mb-4">
            <span className="text-accent font-semibold flex items-center gap-1.5">
              <span>┌──</span>
              <span>[ WIDGET: VINYL_OUTPUT ]</span>
              <span>──┐</span>
            </span>
            <span className="tabular-nums">
              STATUS: {isPlaying ? 'STREAMING [RUN]' : 'STANDBY [IDLE]'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* Vinyl Disc within Crisp Single-Pixel Ring */}
            <div
              ref={heroDiscContainerRef}
              onClick={() => setIsNowPlayingExpanded(true)}
              className="relative w-44 h-44 sm:w-52 sm:h-52 p-1.5 bg-black border border-accent/40 flex items-center justify-center flex-shrink-0 cursor-pointer group hover:border-accent transition-colors"
              title="Click to open Now Playing terminal"
            >
              <div
                ref={heroDiscRef}
                className="w-full h-full rounded-full vinyl-grooves-pattern relative overflow-hidden flex items-center justify-center shadow-none border border-scribe"
              >
                {/* Center Label Masked Album Art */}
                <div className="w-[48%] h-[48%] rounded-full overflow-hidden relative border border-scribe/80">
                  {activeTrack ? (
                    <img
                      src={activeTrack.thumbnailUrl}
                      alt={activeTrack.title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center text-accent text-[10px] font-bold">
                      LaIN
                    </div>
                  )}
                </div>

                {/* Glare Overlay */}
                <div className="absolute inset-0 rounded-full vinyl-glare-overlay pointer-events-none opacity-40 mix-blend-screen" />

                {/* Center Spindle Hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-black border border-accent/60" />
              </div>
            </div>

            {/* Terminal Metadata Readout */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="text-[11px] text-kraft mb-1 uppercase tracking-wider">
                &gt; NOW_PLAYING_METADATA:
              </div>
              <h2 className="font-bold text-base sm:text-lg text-paper truncate">
                {activeTrack ? activeTrack.title : 'NO_ACTIVE_TRACK'}
              </h2>
              <p className="text-xs text-accent truncate mt-0.5">
                {activeTrack ? `ARTIST: ${activeTrack.artist}` : 'READY FOR INPUT'}
              </p>
              {activeTrack?.album && (
                <p className="text-[11px] text-kraft truncate mt-0.5">
                  ALBUM:  {activeTrack.album}
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-scribe/60 flex items-center justify-center sm:justify-start gap-3 text-xs">
                <button
                  onClick={() => setIsNowPlayingExpanded(true)}
                  className="px-2.5 py-1 bg-surface border border-scribe hover:border-accent text-paper hover:text-accent transition-colors flex items-center gap-1.5"
                >
                  <span>[ EXPAND_VIEW ]</span>
                </button>
                <button
                  onClick={togglePlay}
                  className="px-2.5 py-1 bg-accent text-lacquer font-bold hover:bg-accent-hover transition-colors flex items-center gap-1"
                >
                  <span>{isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CATALOG / SEARCH
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <section>
          {/* Direct CLI Command Search Input */}
          <div className="mb-6">
            <div className="relative flex items-center border border-scribe bg-substrate px-3 py-2.5 focus-within:border-accent transition-colors">
              <span className="text-accent text-xs font-bold mr-2 pointer-events-none select-none">
                &gt; search:
              </span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="query title, artist, or composition..."
                className="w-full bg-transparent text-paper placeholder:text-kraft/50 text-xs focus:outline-none"
              />
              {inputVal && (
                <button
                  onClick={handleClearSearch}
                  className="text-kraft hover:text-paper transition-colors px-1"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {isSearching && (
                <span className="text-[11px] tabular-nums text-accent ml-2 animate-pulse flex-shrink-0">
                  [QUERYING...]
                </span>
              )}
            </div>

            {searchMessage && (
              <p className="mt-2 text-xs text-kraft leading-relaxed">
                # {searchMessage}
              </p>
            )}

            {trackErrorMessage && (
              <p className="mt-2 text-xs text-red-400 leading-relaxed">
                ! {trackErrorMessage}
              </p>
            )}
          </div>

          {/* Catalog Fixed-Width Table */}
          <div className="border border-scribe bg-substrate">
            <div className="grid grid-cols-[36px_1fr_60px_65px] sm:grid-cols-[48px_1fr_75px_80px] items-center text-xs text-kraft border-b border-scribe py-2 px-3 bg-surface">
              <span className="tabular-nums">#</span>
              <span>COMPOSITION / ARTIST</span>
              <span className="text-center">SAVE</span>
              <span className="text-right tabular-nums">TIME</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-16 text-center text-kraft text-xs">
                <p>[!] NO RECORDINGS MATCH CURRENT QUERY.</p>
                <p className="text-kraft/60 mt-1">Check query spelling or enter a different term.</p>
              </div>
            ) : (
              <div className="divide-y divide-scribe">
                {searchResults.map((track, idx) => (
                  <TrackRow
                    key={track.id || track.videoId}
                    track={track}
                    idx={idx}
                    activeTrack={activeTrack}
                    isPlaying={isPlaying}
                    isLiked={isLiked(track.videoId)}
                    onTrackClick={handleTrackClick}
                    onToggleLike={toggleLike}
                    playlists={playlists}
                    onAddToPlaylist={addTrackToPlaylist}
                    isMenuOpen={activeMenuTrackId === track.videoId}
                    onToggleMenu={(e) => {
                      e.stopPropagation();
                      setActiveMenuTrackId(activeMenuTrackId === track.videoId ? null : track.videoId);
                    }}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: LIKED SONGS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'liked' && (
        <section>
          <div className="border border-scribe bg-substrate p-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-accent font-bold">&gt; [ ARCHIVE: LIKED_SONGS ]</span>
              <p className="text-[11px] text-kraft mt-0.5">Persisted local collection</p>
            </div>
            <span className="text-xs tabular-nums text-kraft">
              COUNT: {likedTracks.length}
            </span>
          </div>

          {likedTracks.length === 0 ? (
            <div className="py-16 text-center text-kraft text-xs border border-dashed border-scribe p-8 bg-substrate">
              <p className="text-paper font-bold">[!] NO LIKED RECORDINGS RECORDED</p>
              <p className="text-kraft/70 mt-1">
                Toggle the heart marker [♥] on any composition to save it to your local storage.
              </p>
            </div>
          ) : (
            <div className="border border-scribe bg-substrate">
              <div className="grid grid-cols-[36px_1fr_60px_65px] sm:grid-cols-[48px_1fr_75px_80px] items-center text-xs text-kraft border-b border-scribe py-2 px-3 bg-surface">
                <span className="tabular-nums">#</span>
                <span>COMPOSITION / ARTIST</span>
                <span className="text-center">SAVE</span>
                <span className="text-right tabular-nums">TIME</span>
              </div>

              <div className="divide-y divide-scribe">
                {likedTracks.map((track, idx) => (
                  <TrackRow
                    key={track.id || track.videoId}
                    track={track}
                    idx={idx}
                    activeTrack={activeTrack}
                    isPlaying={isPlaying}
                    isLiked={true}
                    onTrackClick={handleTrackClick}
                    onToggleLike={toggleLike}
                    playlists={playlists}
                    onAddToPlaylist={addTrackToPlaylist}
                    isMenuOpen={activeMenuTrackId === track.videoId}
                    onToggleMenu={(e) => {
                      e.stopPropagation();
                      setActiveMenuTrackId(activeMenuTrackId === track.videoId ? null : track.videoId);
                    }}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: PLAYLISTS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'playlists' && (
        <section>
          {/* CLI Form: Create Playlist */}
          <form onSubmit={handleCreatePlaylist} className="mb-4 flex gap-2">
            <div className="relative flex-1 flex items-center border border-scribe bg-substrate px-3 py-2 focus-within:border-accent">
              <span className="text-accent text-xs font-bold mr-2 select-none">&gt; mkplaylist:</span>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="playlist_label..."
                className="w-full bg-transparent text-xs text-paper placeholder:text-kraft/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="bg-accent text-lacquer hover:bg-accent-hover disabled:opacity-30 disabled:pointer-events-none px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>[ CREATE ]</span>
            </button>
          </form>

          {playlists.length === 0 ? (
            <div className="py-16 text-center text-kraft text-xs border border-dashed border-scribe p-8 bg-substrate">
              <p className="text-paper font-bold">[!] ZERO PLAYLISTS RECORDED</p>
              <p className="text-kraft/70 mt-1">
                Execute 'mkplaylist' command above to create a named track list.
              </p>
            </div>
          ) : (
            <div>
              {/* Terminal Playlist Selectors */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3">
                {playlists.map((pl) => {
                  const isSelected = currentPlaylist?.id === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className={`px-3 py-1 text-xs transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'bg-accent text-lacquer font-bold'
                          : 'bg-substrate border border-scribe text-kraft hover:text-paper hover:border-scribe/80'
                      }`}
                    >
                      [ {pl.name} ({pl.tracks.length}) ]
                    </button>
                  );
                })}
              </div>

              {/* Selected Playlist Inspector */}
              {currentPlaylist && (
                <div className="border border-scribe bg-substrate p-4">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-scribe">
                    <div>
                      <span className="text-xs text-accent font-bold">
                        &gt; INSPECTING_PLAYLIST: {currentPlaylist.name}
                      </span>
                      <p className="text-[11px] text-kraft mt-0.5">
                        COUNT: {currentPlaylist.tracks.length} compositions
                      </p>
                    </div>

                    <button
                      onClick={() => deletePlaylist(currentPlaylist.id)}
                      className="text-kraft hover:text-red-400 p-1.5 border border-scribe hover:border-red-400/50 bg-surface transition-colors flex items-center gap-1 text-xs"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>[ RM ]</span>
                    </button>
                  </div>

                  {currentPlaylist.tracks.length === 0 ? (
                    <div className="py-10 text-center text-kraft text-xs">
                      <p>[!] PLAYLIST CONTAINS 0 TRACKS.</p>
                      <p className="text-kraft/60 mt-1">
                        Use the [+] action button on Catalog or Liked tracks to insert entries.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-scribe">
                      {currentPlaylist.tracks.map((track, idx) => (
                        <div
                          key={`${track.videoId}-${idx}`}
                          onClick={() => handleTrackClick(track)}
                          className="group grid grid-cols-[36px_1fr_40px_65px] items-center px-2 py-2.5 hover:bg-surface cursor-pointer transition-colors"
                        >
                          <span className="text-xs tabular-nums text-kraft">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>

                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-paper truncate group-hover:text-accent transition-colors">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-kraft truncate">
                              {track.artist}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTrackFromPlaylist(currentPlaylist.id, track.videoId);
                            }}
                            className="text-kraft hover:text-red-400 p-1 transition-colors"
                            title="Remove from playlist"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-right text-xs tabular-nums text-kraft">
                            {formatDuration(track.duration)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

interface TrackRowProps {
  track: TrackItem;
  idx: number;
  activeTrack: TrackItem | null;
  isPlaying: boolean;
  isLiked: boolean;
  onTrackClick: (track: TrackItem) => void;
  onToggleLike: (track: TrackItem) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, track: TrackItem) => void;
  isMenuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  formatDuration: (secs: number) => string;
}

const TrackRow: React.FC<TrackRowProps> = ({
  track,
  idx,
  activeTrack,
  isPlaying,
  isLiked,
  onTrackClick,
  onToggleLike,
  playlists,
  onAddToPlaylist,
  isMenuOpen,
  onToggleMenu,
  formatDuration,
}) => {
  const isActive = activeTrack?.videoId === track.videoId;
  const isRowPlaying = isActive && isPlaying;
  const trackNum = (idx + 1).toString().padStart(2, '0');

  return (
    <div
      onClick={() => onTrackClick(track)}
      className={`group grid grid-cols-[36px_1fr_60px_65px] sm:grid-cols-[48px_1fr_75px_80px] items-center px-3 py-2.5 cursor-pointer transition-colors relative ${
        isActive
          ? 'bg-surface text-accent border-l-2 border-accent'
          : 'hover:bg-surface/70 text-paper'
      }`}
    >
      {/* Column 1: Index / Play Status */}
      <div className="flex items-center">
        <span className="text-xs tabular-nums text-kraft flex items-center justify-center w-5">
          {isRowPlaying ? (
            <span className="text-accent font-bold animate-pulse">&gt;</span>
          ) : (
            <span className="group-hover:hidden">{trackNum}</span>
          )}
          <Play
            className={`w-3 h-3 text-accent fill-current ${
              isRowPlaying ? 'hidden' : 'hidden group-hover:block'
            }`}
          />
        </span>
      </div>

      {/* Column 2: Monospace Track Title & Artist */}
      <div className="min-w-0 pr-3">
        <p
          className={`text-xs font-semibold truncate ${
            isActive ? 'text-accent' : 'text-paper group-hover:text-accent transition-colors'
          }`}
        >
          {track.title}
        </p>
        <p className="text-[11px] text-kraft truncate mt-0.5">
          {track.artist}
          {track.album && <span className="opacity-60"> // {track.album}</span>}
        </p>
      </div>

      {/* Column 3: Like / Add Actions */}
      <div className="flex items-center justify-center gap-1.5 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(track);
          }}
          className="p-1 text-kraft hover:text-paper transition-colors"
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isLiked ? 'fill-accent text-accent' : 'hover:text-paper'
            }`}
          />
        </button>

        {playlists.length > 0 && (
          <div className="relative">
            <button
              onClick={onToggleMenu}
              className="p-1 text-kraft hover:text-paper transition-colors"
              title="Add to playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Sharp TUI Playlist Dropdown */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 z-30 w-48 bg-substrate border border-accent/60 shadow-none py-1 text-xs"
              >
                <div className="px-2.5 py-1 text-[10px] uppercase text-accent border-b border-scribe">
                  &gt; add_to_playlist:
                </div>
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAddToPlaylist(p.id, track);
                      onToggleMenu({ stopPropagation: () => {} } as React.MouseEvent);
                    }}
                    className="w-full px-2.5 py-1 text-left text-paper hover:bg-accent hover:text-lacquer truncate flex items-center justify-between"
                  >
                    <span className="truncate">[ {p.name} ]</span>
                    <span className="text-[10px] opacity-70 ml-1">{p.tracks.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Column 4: Tabular Duration */}
      <div className="text-right text-xs tabular-nums text-kraft group-hover:text-paper transition-colors">
        {formatDuration(track.duration)}
      </div>
    </div>
  );
};
