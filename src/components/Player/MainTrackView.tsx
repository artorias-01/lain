import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore, Playlist } from '../../store/useLibraryStore';
import { TrackItem } from '../../lib/nativeAudioEngine';
import { PixelVinyl3D } from '../Vinyl3D/PixelVinyl3D';
import { Search, Play, Pause, X, Heart, Plus, Trash2, FolderPlus, Disc3 } from 'lucide-react';

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

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-6 pb-36 select-none font-mono">
      {/* ─────────────────────────────────────────────────────────────
          1. RETRO TITLE-SCREEN MASTHEAD
         ───────────────────────────────────────────────────────────── */}
      <header className="pixel-panel p-3.5 sm:p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-retro-panel">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-retro-cyan text-retro-bg flex items-center justify-center font-pixel text-xs border border-white">
            16
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-pixel text-xl sm:text-2xl text-retro-cyan tracking-wider drop-shadow-[2px_2px_0px_#04060A]">
                LaIN
              </h1>
              <span className="retro-cursor font-pixel text-sm text-retro-gold">_</span>
            </div>
            <p className="text-[10px] text-retro-border text-kraft tracking-widest mt-0.5">
              16-BIT STEREO AUDIO CARTRIDGE // REV 2.0
            </p>
          </div>
        </div>

        {/* Retro Game Menu Tab Navigation */}
        <nav className="flex items-center gap-1.5 overflow-x-auto text-xs font-pixel py-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-2.5 py-1.5 transition-none ${
              activeTab === 'catalog'
                ? 'pixel-btn-accent text-[10px]'
                : 'pixel-btn text-[10px] text-kraft hover:text-paper'
            }`}
          >
            {activeTab === 'catalog' ? '▶ CATALOG' : '  CATALOG'}
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-2.5 py-1.5 transition-none ${
              activeTab === 'liked'
                ? 'pixel-btn-accent text-[10px]'
                : 'pixel-btn text-[10px] text-kraft hover:text-paper'
            }`}
          >
            {activeTab === 'liked' ? `▶ LIKED (${likedTracks.length})` : `  LIKED (${likedTracks.length})`}
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-2.5 py-1.5 transition-none ${
              activeTab === 'playlists'
                ? 'pixel-btn-accent text-[10px]'
                : 'pixel-btn text-[10px] text-kraft hover:text-paper'
            }`}
          >
            {activeTab === 'playlists' ? `▶ LISTS (${playlists.length})` : `  LISTS (${playlists.length})`}
          </button>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. 3D PIXELATED VINYL CARTRIDGE CENTERPIECE
         ───────────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="pixel-panel-cyan p-4 sm:p-5 relative bg-retro-panel">
          {/* Cartridge Header Bar */}
          <div className="flex items-center justify-between text-[10px] font-pixel text-retro-cyan border-b-2 border-retro-border pb-2.5 mb-4">
            <span className="flex items-center gap-1.5">
              <Disc3 className="w-3.5 h-3.5" />
              <span>CARTRIDGE DISC: 01</span>
            </span>
            <span className="text-retro-gold">
              {isPlaying ? '● PLAYING [PCM]' : '○ STANDBY [READY]'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* Real 3D Pixelated Vinyl Canvas */}
            <div
              onClick={() => setIsNowPlayingExpanded(true)}
              className="pixel-panel-inset p-2 cursor-pointer group flex items-center justify-center bg-black hover:border-retro-cyan transition-none"
              title="Click to expand HUD console"
            >
              <PixelVinyl3D
                thumbnailUrl={activeTrack?.thumbnailUrl}
                isPlaying={isPlaying}
                size={190}
              />
            </div>

            {/* Cartridge Metadata & Command Actions */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="text-[10px] font-pixel text-retro-gold mb-1">
                &gt;&gt; NOW PLAYING
              </div>
              <h2 className="font-bold text-base sm:text-lg text-paper truncate">
                {activeTrack ? activeTrack.title : 'NO DISC LOADED'}
              </h2>
              <p className="text-xs text-retro-cyan truncate mt-0.5 font-mono">
                ARTIST: {activeTrack ? activeTrack.artist : 'SELECT A TRACK TO INSERT'}
              </p>
              {activeTrack?.album && (
                <p className="text-[11px] text-kraft truncate mt-0.5 font-mono">
                  ALBUM:  {activeTrack.album}
                </p>
              )}

              <div className="mt-4 pt-3 border-t-2 border-retro-border flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  onClick={togglePlay}
                  className="pixel-btn-accent px-3 py-1.5 text-xs font-pixel flex items-center gap-1.5"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>PLAY</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsNowPlayingExpanded(true)}
                  className="pixel-btn px-3 py-1.5 text-xs font-pixel text-paper hover:text-retro-cyan flex items-center gap-1.5"
                >
                  <span>FULL HUD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CATALOG SEARCH & TRACK SLOTS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <section>
          {/* Retro Search Command Box */}
          <div className="mb-6">
            <div className="pixel-panel-inset px-3 py-2.5 flex items-center gap-2">
              <span className="text-retro-cyan text-[11px] font-pixel select-none">
                SEARCH:
              </span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="query music database..."
                className="w-full bg-transparent text-paper placeholder:text-kraft/50 text-xs font-mono focus:outline-none"
              />
              {inputVal && (
                <button
                  onClick={handleClearSearch}
                  className="pixel-btn px-1.5 py-0.5 text-xs text-kraft hover:text-paper"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {isSearching && (
                <span className="text-[10px] font-pixel text-retro-gold ml-2 animate-pulse flex-shrink-0">
                  LOADING...
                </span>
              )}
            </div>

            {searchMessage && (
              <p className="mt-2 text-xs text-kraft font-mono">
                # {searchMessage}
              </p>
            )}

            {trackErrorMessage && (
              <p className="mt-2 text-xs text-red-400 font-mono">
                ! {trackErrorMessage}
              </p>
            )}
          </div>

          {/* Retro Inventory / Save-Slot Track Table */}
          <div className="pixel-panel bg-retro-panel overflow-hidden">
            <div className="grid grid-cols-[48px_1fr_65px_65px] sm:grid-cols-[60px_1fr_80px_75px] items-center text-[10px] font-pixel text-kraft border-b-2 border-retro-border py-2 px-3 bg-retro-slot">
              <span>SLOT</span>
              <span>COMPOSITION</span>
              <span className="text-center">FAV</span>
              <span className="text-right">TIME</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-16 text-center text-kraft text-xs font-mono">
                <p className="font-pixel text-[11px] text-retro-gold mb-1">
                  [!] NO DISCS FOUND IN CATALOG
                </p>
                <p className="text-kraft/70">Try a different search query or artist name.</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-retro-border">
                {searchResults.map((track, idx) => (
                  <RetroTrackRow
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
          <div className="pixel-panel p-3 mb-4 flex items-center justify-between bg-retro-panel">
            <div>
              <span className="text-xs font-pixel text-retro-cyan">
                ▶ SAVED TRACKS // FAVORITES
              </span>
              <p className="text-[11px] text-kraft font-mono mt-0.5">
                Saved cartridge memory slots
              </p>
            </div>
            <span className="text-[10px] font-pixel text-retro-gold">
              SLOTS: {likedTracks.length}
            </span>
          </div>

          {likedTracks.length === 0 ? (
            <div className="py-16 text-center text-kraft text-xs font-mono pixel-panel-inset p-8 bg-retro-panel">
              <p className="font-pixel text-[11px] text-retro-gold mb-2">
                [!] NO SAVED TRACKS IN MEMORY
              </p>
              <p className="text-kraft/70">
                Click the [♥] button on any track in the catalog to save it to cartridge memory.
              </p>
            </div>
          ) : (
            <div className="pixel-panel bg-retro-panel overflow-hidden">
              <div className="grid grid-cols-[48px_1fr_65px_65px] sm:grid-cols-[60px_1fr_80px_75px] items-center text-[10px] font-pixel text-kraft border-b-2 border-retro-border py-2 px-3 bg-retro-slot">
                <span>SLOT</span>
                <span>COMPOSITION</span>
                <span className="text-center">FAV</span>
                <span className="text-right">TIME</span>
              </div>

              <div className="divide-y-2 divide-retro-border">
                {likedTracks.map((track, idx) => (
                  <RetroTrackRow
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
          {/* Create Custom Playlist Form */}
          <form onSubmit={handleCreatePlaylist} className="mb-4 flex gap-2">
            <div className="relative flex-1 pixel-panel-inset px-3 py-2 flex items-center gap-2">
              <span className="text-retro-cyan text-[10px] font-pixel select-none">
                NEW_SLOT:
              </span>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="playlist_label..."
                className="w-full bg-transparent text-xs text-paper placeholder:text-kraft/50 font-mono focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="pixel-btn-accent px-4 py-2 text-[10px] font-pixel flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>CREATE</span>
            </button>
          </form>

          {playlists.length === 0 ? (
            <div className="py-16 text-center text-kraft text-xs font-mono pixel-panel-inset p-8 bg-retro-panel">
              <p className="font-pixel text-[11px] text-retro-gold mb-2">
                [!] ZERO CUSTOM PLAYLISTS
              </p>
              <p className="text-kraft/70">
                Enter a title above and press CREATE to add a new custom playlist slot.
              </p>
            </div>
          ) : (
            <div>
              {/* Retro Playlist Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
                {playlists.map((pl) => {
                  const isSelected = currentPlaylist?.id === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className={`px-3 py-1.5 text-[10px] font-pixel flex-shrink-0 transition-none ${
                        isSelected
                          ? 'pixel-btn-accent'
                          : 'pixel-btn text-kraft hover:text-paper'
                      }`}
                    >
                      {isSelected ? `▶ ${pl.name} (${pl.tracks.length})` : `  ${pl.name} (${pl.tracks.length})`}
                    </button>
                  );
                })}
              </div>

              {/* Selected Playlist Inspector */}
              {currentPlaylist && (
                <div className="pixel-panel p-4 bg-retro-panel">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-retro-border">
                    <div>
                      <span className="text-xs font-pixel text-retro-cyan">
                        ▶ PLAYLIST: {currentPlaylist.name}
                      </span>
                      <p className="text-[11px] text-kraft font-mono mt-0.5">
                        TRACKS: {currentPlaylist.tracks.length} compositions
                      </p>
                    </div>

                    <button
                      onClick={() => deletePlaylist(currentPlaylist.id)}
                      className="pixel-btn px-2 py-1 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="font-pixel text-[9px]">DELETE</span>
                    </button>
                  </div>

                  {currentPlaylist.tracks.length === 0 ? (
                    <div className="py-10 text-center text-kraft text-xs font-mono">
                      <p className="font-pixel text-[10px] text-retro-gold mb-1">
                        [!] PLAYLIST IS EMPTY
                      </p>
                      <p className="text-kraft/70">
                        Use the [+] action button on Catalog or Liked tracks to insert songs.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-retro-border">
                      {currentPlaylist.tracks.map((track, idx) => (
                        <div
                          key={`${track.videoId}-${idx}`}
                          onClick={() => handleTrackClick(track)}
                          className="group grid grid-cols-[40px_1fr_40px_65px] items-center px-2 py-2 hover:bg-retro-slot cursor-pointer transition-none"
                        >
                          <span className="text-xs tabular-nums text-kraft font-mono">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>

                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-paper truncate group-hover:text-retro-cyan font-mono">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-kraft truncate font-mono">
                              {track.artist}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTrackFromPlaylist(currentPlaylist.id, track.videoId);
                            }}
                            className="pixel-btn p-1 text-red-400 hover:text-red-300"
                            title="Remove from playlist"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-right text-xs tabular-nums text-kraft font-mono">
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

interface RetroTrackRowProps {
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

const RetroTrackRow: React.FC<RetroTrackRowProps> = ({
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
  const slotNum = (idx + 1).toString().padStart(2, '0');

  return (
    <div
      onClick={() => onTrackClick(track)}
      className={`group grid grid-cols-[48px_1fr_65px_65px] sm:grid-cols-[60px_1fr_80px_75px] items-center px-3 py-2.5 cursor-pointer transition-none relative ${
        isActive
          ? 'bg-retro-slot text-retro-cyan border-l-4 border-retro-cyan'
          : 'hover:bg-retro-slot/70 text-paper'
      }`}
    >
      {/* Column 1: Slot Indicator / Retro Cursor */}
      <div className="flex items-center">
        <span className="text-xs font-mono font-bold flex items-center justify-center w-6">
          {isRowPlaying ? (
            <span className="text-retro-gold font-pixel text-[10px] animate-pulse">▶</span>
          ) : (
            <span className="text-kraft group-hover:text-retro-cyan">{slotNum}</span>
          )}
        </span>
      </div>

      {/* Column 2: Track Title & Artist */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="w-8 h-8 pixel-panel-inset flex-shrink-0 overflow-hidden hidden sm:flex items-center justify-center bg-black">
          <img
            src={track.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover pixelated"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-bold truncate font-mono ${
              isActive ? 'text-retro-cyan' : 'text-paper group-hover:text-retro-cyan'
            }`}
          >
            {track.title}
          </p>
          <p className="text-[11px] text-kraft truncate mt-0.5 font-mono">
            {track.artist}
            {track.album && <span className="opacity-60"> // {track.album}</span>}
          </p>
        </div>
      </div>

      {/* Column 3: Like & Add Actions */}
      <div className="flex items-center justify-center gap-1.5 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(track);
          }}
          className={`pixel-btn px-1.5 py-1 text-xs ${
            isLiked ? 'text-retro-gold border-retro-gold' : 'text-kraft hover:text-paper'
          }`}
          title={isLiked ? 'Unlike' : 'Save to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {playlists.length > 0 && (
          <div className="relative">
            <button
              onClick={onToggleMenu}
              className="pixel-btn px-1.5 py-1 text-xs text-kraft hover:text-paper"
              title="Add to playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Retro Beveled Dropdown */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 z-30 w-48 pixel-panel-cyan py-1 text-xs bg-retro-panel"
              >
                <div className="px-2.5 py-1 text-[9px] font-pixel text-retro-cyan border-b-2 border-retro-border">
                  &gt; ADD TO SLOT:
                </div>
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAddToPlaylist(p.id, track);
                      onToggleMenu({ stopPropagation: () => {} } as React.MouseEvent);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-paper hover:bg-retro-cyan hover:text-retro-bg truncate flex items-center justify-between font-mono"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] opacity-70 ml-1">({p.tracks.length})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Column 4: Tabular Duration */}
      <div className="text-right text-xs tabular-nums text-kraft group-hover:text-paper font-mono">
        {formatDuration(track.duration)}
      </div>
    </div>
  );
};
