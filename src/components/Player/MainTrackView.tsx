import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore, Playlist } from '../../store/useLibraryStore';
import { TrackItem } from '../../lib/nativeAudioEngine';
import { registerVinylElement, setVinylPlaying } from '../../lib/vinylSpinSync';
import { extractDominantColor } from '../../lib/colorExtractor';
import { Search, Play, X, Heart, Plus, Trash2, Music2, FolderPlus } from 'lucide-react';
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

  // Scroll-interactive Hero Disc animation with Lenis-synced ScrollTrigger
  useEffect(() => {
    if (!heroSectionRef.current || !heroDiscContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(heroDiscContainerRef.current, {
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top+=60',
          scrub: 0.6,
        },
        scale: 0.72,
        y: -32,
        opacity: 0.62,
        ease: 'power1.out',
      });
    });

    return () => ctx.revert();
  }, []);

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

  // Selected Playlist helper
  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  return (
    <main className="max-w-3xl mx-auto px-6 pt-10 pb-36 select-none">
      {/* Rebranded Masthead Header */}
      <header className="mb-6 flex items-center justify-between border-b border-scribe pb-5">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-paper">
          LaIN
        </h1>

        {/* Lightweight Segmented Control Tab Navigation */}
        <nav className="flex items-center gap-1 bg-substrate/80 p-1 rounded-lg border border-scribe text-xs font-sans">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'catalog'
                ? 'bg-paper text-lacquer font-semibold shadow-sm'
                : 'text-kraft hover:text-paper'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'liked'
                ? 'bg-paper text-lacquer font-semibold shadow-sm'
                : 'text-kraft hover:text-paper'
            }`}
          >
            <Heart className={`w-3 h-3 ${activeTab === 'liked' ? 'fill-lacquer text-lacquer' : ''}`} />
            <span>Liked ({likedTracks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'playlists'
                ? 'bg-paper text-lacquer font-semibold shadow-sm'
                : 'text-kraft hover:text-paper'
            }`}
          >
            <Music2 className="w-3 h-3" />
            <span>Playlists ({playlists.length})</span>
          </button>
        </nav>
      </header>

      {/* Signature Scroll-Interactive Hero Vinyl Section */}
      <section ref={heroSectionRef} className="flex flex-col items-center justify-center pt-2 pb-10 select-none">
        <div className="relative flex items-center justify-center">
          {/* Ambient Glow behind disc driven dynamically by artwork accent */}
          <div
            className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full pointer-events-none blur-3xl opacity-60 transition-all duration-700"
            style={{ background: 'var(--dynamic-accent-glow)' }}
          />

          {/* Hero Vinyl Disc */}
          <div
            ref={heroDiscContainerRef}
            onClick={() => setIsNowPlayingExpanded(true)}
            className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 bg-lacquer/90 border border-scribe shadow-2xl flex items-center justify-center flex-shrink-0 cursor-pointer group transition-transform duration-200 hover:scale-[1.02]"
            title="Tap to expand Now Playing"
          >
            <div
              ref={heroDiscRef}
              className="w-full h-full rounded-full vinyl-grooves-pattern relative overflow-hidden flex items-center justify-center shadow-inner"
            >
              {/* Center Label Masked Album Art */}
              <div className="w-[50%] h-[50%] rounded-full overflow-hidden relative shadow-md border border-paper/10">
                {activeTrack ? (
                  <img
                    src={activeTrack.thumbnailUrl}
                    alt={activeTrack.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-substrate flex items-center justify-center text-kraft text-xs font-display">
                    LaIN
                  </div>
                )}
              </div>

              {/* Concentric Vinyl Specular Glare Overlay */}
              <div className="absolute inset-0 rounded-full vinyl-glare-overlay pointer-events-none opacity-45 mix-blend-screen" />

              {/* Center Spindle Hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-lacquer border border-paper/40 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Dynamic Track Attribution under Hero Disc */}
        <div className="mt-4 text-center max-w-sm px-4">
          <p className="font-display font-semibold text-sm sm:text-base text-paper truncate">
            {activeTrack ? activeTrack.title : 'Ready to play'}
          </p>
          <p className="font-sans text-xs text-kraft truncate mt-0.5">
            {activeTrack ? activeTrack.artist : 'Select a recording to begin'}
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CATALOG / SEARCH
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <>
          {/* Architectural Search Bar */}
          <section className="mb-8">
            <div className="relative flex items-center border-b border-scribe focus-within:border-accent transition-colors pb-2">
              <Search className="w-4 h-4 text-kraft flex-shrink-0 mr-3 pointer-events-none" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search songs, artists, or compositions..."
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
                <span className="font-sans text-[11px] tabular-nums text-accent ml-2 animate-pulse flex-shrink-0">
                  Locating...
                </span>
              )}
            </div>

            {searchMessage && (
              <p className="mt-2 text-xs text-kraft leading-relaxed font-sans">
                {searchMessage}
              </p>
            )}

            {trackErrorMessage && (
              <p className="mt-2 text-xs text-accent leading-relaxed font-sans">
                {trackErrorMessage}
              </p>
            )}
          </section>

          {/* Catalog Track List */}
          <section>
            <div className="grid grid-cols-[32px_1fr_60px_60px] sm:grid-cols-[40px_1fr_70px_70px] items-center text-xs font-sans text-kraft border-b border-scribe pb-2 mb-1 px-3">
              <span className="tabular-nums">#</span>
              <span>Composition</span>
              <span className="text-center">Save</span>
              <span className="text-right tabular-nums">Length</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-16 text-center text-kraft font-sans text-sm">
                <p>No recordings match your query.</p>
                <p className="text-xs text-kraft/60 mt-1">Try querying another artist or title.</p>
              </div>
            ) : (
              <div className="divide-y divide-scribe/40">
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
          </section>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: LIKED SONGS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'liked' && (
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-scribe pb-3">
            <div>
              <h2 className="font-display font-bold text-lg text-paper">Liked Songs</h2>
              <p className="font-sans text-xs text-kraft">Your personal collection of saved compositions</p>
            </div>
            <span className="font-sans text-xs tabular-nums text-kraft">
              {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
            </span>
          </div>

          {likedTracks.length === 0 ? (
            <div className="py-20 text-center text-kraft font-sans text-sm rounded-xl border border-dashed border-scribe/80 p-8">
              <Heart className="w-8 h-8 text-kraft/40 mx-auto mb-3" />
              <p className="text-paper font-semibold">No liked songs yet</p>
              <p className="text-xs text-kraft/70 mt-1">
                Tap the heart on any track in the Catalog to add it to your collection.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[32px_1fr_60px_60px] sm:grid-cols-[40px_1fr_70px_70px] items-center text-xs font-sans text-kraft border-b border-scribe pb-2 mb-1 px-3">
                <span className="tabular-nums">#</span>
                <span>Composition</span>
                <span className="text-center">Save</span>
                <span className="text-right tabular-nums">Length</span>
              </div>

              <div className="divide-y divide-scribe/40">
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
            </>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: PLAYLISTS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'playlists' && (
        <section>
          {/* Create Playlist Form */}
          <form onSubmit={handleCreatePlaylist} className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="New playlist name..."
                className="w-full bg-substrate border border-scribe rounded-lg px-3.5 py-2 text-sm text-paper placeholder:text-kraft/60 font-sans focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="bg-paper text-lacquer hover:bg-white disabled:opacity-40 disabled:pointer-events-none px-4 py-2 rounded-lg font-sans text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </form>

          {playlists.length === 0 ? (
            <div className="py-20 text-center text-kraft font-sans text-sm rounded-xl border border-dashed border-scribe/80 p-8">
              <Music2 className="w-8 h-8 text-kraft/40 mx-auto mb-3" />
              <p className="text-paper font-semibold">No playlists yet</p>
              <p className="text-xs text-kraft/70 mt-1">
                Enter a name above and click "Create" to start a custom playlist.
              </p>
            </div>
          ) : (
            <div>
              {/* Playlist Selection Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
                {playlists.map((pl) => {
                  const isSelected = currentPlaylist?.id === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-paper text-lacquer font-semibold shadow-sm'
                          : 'bg-substrate border border-scribe text-kraft hover:text-paper hover:border-scribe/80'
                      }`}
                    >
                      {pl.name} ({pl.tracks.length})
                    </button>
                  );
                })}
              </div>

              {/* Selected Playlist Header & Tracks */}
              {currentPlaylist && (
                <div className="bg-substrate/40 border border-scribe rounded-xl p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-scribe">
                    <div>
                      <h3 className="font-display font-bold text-lg text-paper">
                        {currentPlaylist.name}
                      </h3>
                      <p className="font-sans text-xs text-kraft mt-0.5">
                        {currentPlaylist.tracks.length} {currentPlaylist.tracks.length === 1 ? 'recording' : 'recordings'}
                      </p>
                    </div>

                    <button
                      onClick={() => deletePlaylist(currentPlaylist.id)}
                      className="text-kraft/60 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {currentPlaylist.tracks.length === 0 ? (
                    <div className="py-12 text-center text-kraft font-sans text-xs">
                      <p>This playlist is empty.</p>
                      <p className="text-kraft/60 mt-1">
                        Use the "+" action on any track in Catalog or Liked Songs to add to this playlist.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-scribe/40">
                      {currentPlaylist.tracks.map((track, idx) => (
                        <div
                          key={`${track.videoId}-${idx}`}
                          onClick={() => handleTrackClick(track)}
                          className="group grid grid-cols-[32px_1fr_40px_60px] items-center px-2 py-3 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
                        >
                          <span className="font-sans text-xs tabular-nums text-kraft">
                            {idx + 1}
                          </span>

                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-lacquer border border-scribe flex-shrink-0">
                              <img src={track.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-sans text-sm font-semibold text-paper truncate group-hover:text-accent transition-colors">
                                {track.title}
                              </p>
                              <p className="font-sans text-xs text-kraft truncate">
                                {track.artist}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTrackFromPlaylist(currentPlaylist.id, track.videoId);
                            }}
                            className="text-kraft/50 hover:text-red-400 p-1 transition-colors"
                            title="Remove from playlist"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-right font-sans text-xs tabular-nums text-kraft">
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
      className={`group grid grid-cols-[32px_1fr_60px_60px] sm:grid-cols-[40px_1fr_70px_70px] items-center px-3 py-3.5 cursor-pointer transition-colors relative ${
        isActive
          ? 'bg-substrate text-paper border-l-2 border-accent'
          : 'hover:bg-substrate/60 text-paper/90'
      }`}
    >
      {/* Column 1: Track Index / Animated Pulse */}
      <div className="flex items-center">
        <span className="font-sans font-medium text-xs tabular-nums text-kraft flex items-center justify-center w-5">
          {isRowPlaying ? (
            <span className="flex items-center gap-[2px] h-3.5">
              <span className="w-[2px] h-2 bg-accent animate-pulse" />
              <span className="w-[2px] h-3.5 bg-accent animate-pulse delay-75" />
              <span className="w-[2px] h-2.5 bg-accent animate-pulse delay-150" />
            </span>
          ) : (
            <span className="group-hover:hidden">{trackNum}</span>
          )}
          <Play
            className={`w-3.5 h-3.5 text-accent fill-current ${
              isRowPlaying ? 'hidden' : 'hidden group-hover:block'
            }`}
          />
        </span>
      </div>

      {/* Column 2: Artwork Disc + Title & Artist */}
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-lacquer border border-scribe flex-shrink-0 shadow-sm">
          <img
            src={track.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`font-display font-semibold text-sm truncate tracking-tight ${
              isActive ? 'text-accent' : 'text-paper group-hover:text-accent transition-colors'
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

      {/* Column 3: Like / Add Actions */}
      <div className="flex items-center justify-center gap-1.5 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(track);
          }}
          className="p-1 text-kraft/60 hover:text-paper transition-colors rounded-full"
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-accent text-accent' : 'hover:text-paper'
            }`}
          />
        </button>

        {playlists.length > 0 && (
          <div className="relative">
            <button
              onClick={onToggleMenu}
              className="p-1 text-kraft/50 hover:text-paper transition-colors rounded-full"
              title="Add to playlist"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Playlist dropdown menu */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 z-30 w-44 bg-substrate border border-scribe rounded-lg shadow-xl py-1 text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-kraft/60 border-b border-scribe/60">
                  Add to playlist
                </div>
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAddToPlaylist(p.id, track);
                      onToggleMenu({ stopPropagation: () => {} } as React.MouseEvent);
                    }}
                    className="w-full px-3 py-1.5 text-left text-paper hover:bg-white/5 truncate flex items-center justify-between"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] text-kraft ml-1">{p.tracks.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Column 4: Tabular Duration */}
      <div className="text-right font-sans font-medium text-xs tabular-nums text-kraft group-hover:text-paper transition-colors">
        {formatDuration(track.duration)}
      </div>
    </div>
  );
};
