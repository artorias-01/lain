import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { PixelVinyl3D } from '../Vinyl3D/PixelVinyl3D';
import { ProgressBar } from './ProgressBar';
import { fetchLyrics, LyricsResult } from '../../lib/lyricsService';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
  Volume2,
  VolumeX,
  X,
  Disc3,
} from 'lucide-react';
import gsap from 'gsap';
import Lenis from 'lenis';

export const ExpandedNowPlaying: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    repeatMode,
    cycleRepeatMode,
    isShuffle,
    toggleShuffle,
    queue,
    currentTrackIndex,
    playTrackIndex,
    isNowPlayingExpanded,
    setIsNowPlayingExpanded,
    volume,
    isMuted,
    setVolume,
    toggleMute,
  } = usePlayerStore();

  const { isLiked, toggleLike } = useLibraryStore();

  const [activeSheetTab, setActiveSheetTab] = useState<'queue' | 'lyrics'>('queue');
  const [lyricsData, setLyricsData] = useState<LyricsResult & { loading: boolean }>({
    plainLyrics: null,
    syncedLyrics: null,
    instrumental: false,
    found: false,
    loading: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queueSectionRef = useRef<HTMLDivElement>(null);

  // Snappy Console Entry and Exit
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isNowPlayingExpanded) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(
        el,
        { y: '100%' },
        { y: '0%', duration: 0.15, ease: 'none' }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isNowPlayingExpanded]);

  // Smooth scroll
  useEffect(() => {
    if (!isNowPlayingExpanded || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const content = container.firstElementChild as HTMLElement;
    if (!content) return;

    const modalLenis = new Lenis({
      wrapper: container,
      content: content,
      duration: 0.6,
      orientation: 'vertical',
      smoothWheel: true,
    });

    const tickerCallback = (time: number) => {
      modalLenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      gsap.ticker.remove(tickerCallback);
      modalLenis.destroy();
    };
  }, [isNowPlayingExpanded]);

  // Fetch Lyrics via lrclib.net on Track Change
  useEffect(() => {
    if (!activeTrack) return;

    let isMounted = true;
    setLyricsData((prev) => ({ ...prev, loading: true }));

    fetchLyrics(activeTrack.title, activeTrack.artist, activeTrack.videoId).then((res) => {
      if (!isMounted) return;
      setLyricsData({
        ...res,
        loading: false,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [activeTrack?.videoId, activeTrack?.title, activeTrack?.artist]);

  const handleCollapse = () => {
    const el = containerRef.current;
    if (!el) {
      setIsNowPlayingExpanded(false);
      return;
    }

    gsap.to(el, {
      y: '100%',
      duration: 0.12,
      ease: 'none',
      onComplete: () => {
        setIsNowPlayingExpanded(false);
      },
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNowPlayingExpanded) {
        handleCollapse();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isNowPlayingExpanded]);

  const scrollToQueue = () => {
    setActiveSheetTab('queue');
    queueSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isNowPlayingExpanded) return null;

  const currentVol = isMuted ? 0 : volume;
  const isTrackLiked = isLiked(activeTrack.videoId);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-retro-bg text-paper select-none font-mono"
    >
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 sm:px-8 py-4"
      >
        <div className="w-full max-w-xl flex flex-col min-h-full pb-20">
          {/* Top Console Navigation Bar */}
          <header className="w-full pixel-panel p-3 flex items-center justify-between mb-4 bg-retro-panel">
            <button
              onClick={handleCollapse}
              className="pixel-btn px-2.5 py-1 text-[10px] font-pixel text-kraft hover:text-paper flex items-center gap-1.5"
              title="Close HUD (Esc)"
            >
              <X className="w-3 h-3" />
              <span>RETURN</span>
            </button>

            <div className="text-center min-w-0 px-2">
              <span className="text-[10px] font-pixel text-retro-cyan tracking-wider">
                CONSOLE HUD // 16-BIT
              </span>
            </div>

            <button
              onClick={scrollToQueue}
              className="pixel-btn px-2.5 py-1 text-[10px] font-pixel text-kraft hover:text-paper flex items-center gap-1"
              title="View Queue"
            >
              <Disc3 className="w-3 h-3" />
              <span>QUEUE</span>
            </button>
          </header>

          {/* Large 3D Pixel Vinyl Cartridge Frame */}
          <div className="pixel-panel-cyan p-4 sm:p-6 mb-4 bg-retro-panel">
            <div className="text-[9px] font-pixel text-retro-cyan border-b-2 border-retro-border pb-2 mb-4 flex items-center justify-between">
              <span>┌── [ 3D PIXEL DISC: OUTPUT ] ──┐</span>
              <span className="text-retro-gold">FPS: 60 // R3F</span>
            </div>

            {/* Centered Large 3D Pixelated Vinyl Canvas */}
            <div className="w-full flex items-center justify-center py-2">
              <div className="pixel-panel-inset p-3 bg-black flex items-center justify-center">
                <PixelVinyl3D
                  thumbnailUrl={activeTrack.thumbnailUrl}
                  isPlaying={isPlaying}
                  size={260}
                />
              </div>
            </div>
          </div>

          {/* Track Spec & Like Action */}
          <div className="pixel-panel p-4 mb-4 flex items-start justify-between gap-3 bg-retro-panel">
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-pixel text-retro-gold mb-1">
                &gt;&gt; TRACK SPECS
              </div>
              <h1 className="font-bold text-base sm:text-lg text-paper truncate font-mono">
                {activeTrack.title}
              </h1>
              <p className="text-xs text-retro-cyan truncate mt-0.5 font-mono">
                ARTIST: {activeTrack.artist}
              </p>
              {activeTrack.album && (
                <p className="text-[11px] text-kraft truncate mt-0.5 font-mono">
                  ALBUM:  {activeTrack.album}
                </p>
              )}
            </div>

            <button
              onClick={() => toggleLike(activeTrack)}
              className={`pixel-btn px-3 py-1.5 text-xs font-pixel flex items-center gap-1.5 transition-none ${
                isTrackLiked
                  ? 'pixel-btn-gold text-retro-bg'
                  : 'text-kraft hover:text-paper'
              }`}
              title={isTrackLiked ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isTrackLiked ? 'fill-current' : ''}`} />
              <span className="text-[9px]">{isTrackLiked ? 'FAV' : 'SAVE'}</span>
            </button>
          </div>

          {/* Segmented Progress HUD */}
          <div className="pixel-panel p-3 mb-4 bg-retro-panel">
            <ProgressBar />
          </div>

          {/* Tactile 3D Keypad Transport Controls */}
          <div className="pixel-panel p-3 mb-4 flex items-center justify-between gap-2 bg-retro-panel">
            <button
              onClick={toggleShuffle}
              className={`pixel-btn px-2 py-1 text-[9px] font-pixel ${
                isShuffle ? 'text-retro-cyan border-retro-cyan font-bold' : 'text-kraft'
              }`}
              title="Toggle shuffle"
            >
              SHUF
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={previousTrack}
                className="pixel-btn px-3 py-1.5 text-xs font-pixel text-paper"
                title="Previous track"
              >
                <SkipBack className="w-3.5 h-3.5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="pixel-btn-accent px-4 py-1.5 text-xs font-pixel"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <span className="flex items-center gap-1">
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY</span>
                  </span>
                )}
              </button>

              <button
                onClick={nextTrack}
                className="pixel-btn px-3 py-1.5 text-xs font-pixel text-paper"
                title="Next track"
              >
                <SkipForward className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            <button
              onClick={cycleRepeatMode}
              className={`pixel-btn px-2 py-1 text-[9px] font-pixel ${
                repeatMode !== 'none' ? 'text-retro-cyan border-retro-cyan font-bold' : 'text-kraft'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              RPT
            </button>
          </div>

          {/* Volume and Sub-tab Switcher */}
          <div className="pixel-panel p-3 mb-6 flex flex-wrap items-center justify-between gap-3 bg-retro-panel text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="pixel-btn p-1.5 text-kraft hover:text-paper"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || currentVol === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-retro-cyan" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentVol}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 sm:w-28 h-2 cursor-pointer"
              />
              <span className="tabular-nums text-kraft text-[10px]">
                {Math.round(currentVol * 100)}%
              </span>
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex items-center gap-1 font-pixel text-[9px]">
              <button
                onClick={() => setActiveSheetTab('queue')}
                className={`px-2.5 py-1.5 ${
                  activeSheetTab === 'queue'
                    ? 'pixel-btn-accent'
                    : 'pixel-btn text-kraft hover:text-paper'
                }`}
              >
                ▶ QUEUE ({queue.length})
              </button>
              <button
                onClick={() => setActiveSheetTab('lyrics')}
                className={`px-2.5 py-1.5 ${
                  activeSheetTab === 'lyrics'
                    ? 'pixel-btn-accent'
                    : 'pixel-btn text-kraft hover:text-paper'
                }`}
              >
                ▶ LYRICS
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              BELOW-THE-FOLD INVENTORY / LYRICS SHEET
             ───────────────────────────────────────────────────────────── */}
          <section ref={queueSectionRef} className="w-full">
            {activeSheetTab === 'queue' ? (
              <div className="pixel-panel bg-retro-panel overflow-hidden">
                <div className="text-[10px] font-pixel text-kraft border-b-2 border-retro-border p-2.5 bg-retro-slot flex items-center justify-between">
                  <span className="text-retro-cyan">&gt;&gt; STAGE SELECT // QUEUE</span>
                  <span className="text-retro-gold">{queue.length} TRACKS</span>
                </div>

                <div className="divide-y-2 divide-retro-border">
                  {queue.map((track, idx) => {
                    const isCurrent = idx === currentTrackIndex;
                    return (
                      <button
                        key={`${track.videoId}-${idx}`}
                        onClick={() => playTrackIndex(idx)}
                        className={`w-full flex items-center gap-3 p-2.5 text-left transition-none ${
                          isCurrent
                            ? 'bg-retro-slot text-retro-cyan border-l-4 border-retro-cyan'
                            : 'hover:bg-retro-slot/60 text-paper'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold w-5 text-center flex-shrink-0 text-kraft">
                          {isCurrent && isPlaying ? (
                            <span className="text-retro-gold font-pixel text-[10px]">▶</span>
                          ) : (
                            idx + 1
                          )}
                        </span>

                        <div className="min-w-0 flex-1 font-mono">
                          <p
                            className={`text-xs font-bold truncate ${
                              isCurrent ? 'text-retro-cyan' : 'text-paper'
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-[10px] text-kraft truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Dialogue-Box Style Lyrics */
              <div className="pixel-panel bg-retro-panel overflow-hidden">
                <div className="text-[10px] font-pixel text-kraft border-b-2 border-retro-border p-2.5 bg-retro-slot flex items-center justify-between">
                  <span className="text-retro-cyan">&gt;&gt; SCRIPT DIALOGUE // LYRICS</span>
                  <span className="text-retro-gold font-mono text-xs">
                    {lyricsData.loading ? 'FETCHING...' : lyricsData.found ? 'LRCLIB: OK' : 'N/A'}
                  </span>
                </div>

                <div className="p-4 sm:p-6 font-mono">
                  {lyricsData.loading ? (
                    <div className="py-16 text-center text-retro-gold font-pixel text-xs animate-pulse">
                      LOADING LYRICS DATA...
                    </div>
                  ) : lyricsData.instrumental ? (
                    <div className="py-12 text-center text-kraft text-xs pixel-panel-inset p-6 bg-retro-panel">
                      <p className="font-pixel text-[10px] text-retro-cyan mb-1">
                        [!] INSTRUMENTAL TRACK
                      </p>
                      <p className="text-kraft/70">No vocal lyrics registered for this recording.</p>
                    </div>
                  ) : lyricsData.plainLyrics ? (
                    <pre className="text-xs sm:text-sm text-paper/95 leading-relaxed whitespace-pre-wrap select-text font-mono">
                      {lyricsData.plainLyrics}
                    </pre>
                  ) : (
                    <div className="py-12 text-center text-kraft text-xs pixel-panel-inset p-6 bg-retro-panel">
                      <p className="font-pixel text-[10px] text-retro-gold mb-1">
                        [!] LYRICS NOT FOUND
                      </p>
                      <p className="text-kraft/70">No lyric transcription available for this track.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
