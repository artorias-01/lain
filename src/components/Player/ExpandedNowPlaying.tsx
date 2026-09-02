import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { nativeAudioEngine } from '../../lib/nativeAudioEngine';
import { registerVinylElement, setVinylPlaying } from '../../lib/vinylSpinSync';
import { extractDominantColor, createAmbientGradient, FALLBACK_COLOR } from '../../lib/colorExtractor';
import { fetchLyrics, LyricsResult } from '../../lib/lyricsService';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  Volume2,
  VolumeX,
  FileText,
  X,
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
    searchQuery,
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
  const discRef = useRef<HTMLDivElement>(null);

  // Background layers
  const bgLayer1Ref = useRef<HTMLDivElement>(null);
  const bgLayer2Ref = useRef<HTMLDivElement>(null);
  const activeLayerRef = useRef<1 | 2>(1);

  // Progress bar refs
  const fillRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const currentTimeTextRef = useRef<HTMLSpanElement>(null);
  const totalTimeTextRef = useRef<HTMLSpanElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const [isScrubHovered, setIsScrubHovered] = useState(false);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Synchronized Vinyl Rotation
  useEffect(() => {
    setVinylPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!isNowPlayingExpanded) return;
    const unregister = registerVinylElement(discRef.current);
    return () => {
      unregister();
    };
  }, [isNowPlayingExpanded]);

  // Snappy Terminal Entry and Exit (180ms, linear/sharp power1)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isNowPlayingExpanded) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(
        el,
        { y: '100%', opacity: 0.9 },
        { y: '0%', opacity: 1, duration: 0.18, ease: 'power2.out' }
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
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
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

  // Terminal Ambient Glow
  useEffect(() => {
    if (!isNowPlayingExpanded) return;

    let isMounted = true;

    extractDominantColor(activeTrack.thumbnailUrl, activeTrack.videoId).then((color) => {
      if (!isMounted) return;
      const gradient = createAmbientGradient(color);

      if (activeLayerRef.current === 1) {
        if (bgLayer2Ref.current) {
          bgLayer2Ref.current.style.background = gradient;
          gsap.to(bgLayer2Ref.current, { opacity: 1, duration: 0.25, ease: 'power1.out' });
        }
        if (bgLayer1Ref.current) {
          gsap.to(bgLayer1Ref.current, { opacity: 0, duration: 0.25, ease: 'power1.out' });
        }
        activeLayerRef.current = 2;
      } else {
        if (bgLayer1Ref.current) {
          bgLayer1Ref.current.style.background = gradient;
          gsap.to(bgLayer1Ref.current, { opacity: 1, duration: 0.25, ease: 'power1.out' });
        }
        if (bgLayer2Ref.current) {
          gsap.to(bgLayer2Ref.current, { opacity: 0, duration: 0.25, ease: 'power1.out' });
        }
        activeLayerRef.current = 1;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeTrack?.videoId, activeTrack?.thumbnailUrl, isNowPlayingExpanded]);

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

  // Progress Bar rAF loop
  useEffect(() => {
    if (!isNowPlayingExpanded) return;

    let animFrameId: number;

    const updateProgress = () => {
      nativeAudioEngine.updateTimeRef();

      const current = nativeAudioEngine.currentTimeRef.current;
      const duration = nativeAudioEngine.durationRef.current;

      if (fillRef.current && duration > 0) {
        const percent = Math.min(100, Math.max(0, (current / duration) * 100));
        fillRef.current.style.width = `${percent}%`;
        if (handleRef.current) {
          handleRef.current.style.left = `${percent}%`;
        }
      }

      if (currentTimeTextRef.current) {
        currentTimeTextRef.current.textContent = formatTime(current);
      }
      if (totalTimeTextRef.current) {
        totalTimeTextRef.current.textContent = formatTime(duration);
      }

      animFrameId = requestAnimationFrame(updateProgress);
    };

    animFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrameId);
  }, [isNowPlayingExpanded]);

  // Seek Interaction
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!trackContainerRef.current || nativeAudioEngine.durationRef.current <= 0) return;
    const rect = trackContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * nativeAudioEngine.durationRef.current;
    nativeAudioEngine.seekTo(newTime);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    nativeAudioEngine.isSeeking = true;
    handleSeek(e);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSeek(moveEvent);
    };

    const onMouseUp = () => {
      nativeAudioEngine.isSeeking = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleCollapse = () => {
    const el = containerRef.current;
    if (!el) {
      setIsNowPlayingExpanded(false);
      return;
    }

    gsap.to(el, {
      y: '100%',
      opacity: 0.9,
      duration: 0.16,
      ease: 'power2.in',
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
  const initialGradient = createAmbientGradient(FALLBACK_COLOR);
  const isTrackLiked = isLiked(activeTrack.videoId);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-black text-paper select-none font-mono"
    >
      {/* CRT Phosphor Aura */}
      <div
        ref={bgLayer1Ref}
        className="absolute inset-0 pointer-events-none"
        style={{ background: initialGradient, opacity: 1 }}
      />
      <div
        ref={bgLayer2Ref}
        className="absolute inset-0 pointer-events-none"
        style={{ background: initialGradient, opacity: 0 }}
      />

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 sm:px-8 py-4"
      >
        <div className="w-full max-w-xl flex flex-col min-h-full pb-20">
          {/* TUI Top Header */}
          <header className="w-full flex items-center justify-between border-b border-scribe pb-3 mb-4">
            <button
              onClick={handleCollapse}
              className="px-2 py-1 bg-substrate border border-scribe hover:border-accent text-kraft hover:text-accent transition-colors text-xs flex items-center gap-1"
              title="Close terminal (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span>[ ESC: COLLAPSE ]</span>
            </button>

            <div className="text-center min-w-0 px-2">
              <span className="text-[11px] text-accent font-bold">
                $ now_playing --active
              </span>
            </div>

            <button
              onClick={scrollToQueue}
              className="px-2 py-1 bg-substrate border border-scribe hover:border-accent text-kraft hover:text-accent transition-colors text-xs flex items-center gap-1"
              title="Inspect queue"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>[ QUEUE ]</span>
            </button>
          </header>

          {/* ASCII-Framed Vinyl Output Panel */}
          <div className="border border-scribe bg-substrate p-4 sm:p-6 mb-6">
            <div className="text-[11px] text-kraft border-b border-scribe pb-2 mb-4 flex items-center justify-between">
              <span className="text-accent font-bold">┌── [ VINYL_STREAM_OUTPUT ] ──┐</span>
              <span className="tabular-nums">FPS: 60 // SYNC: LOCKED</span>
            </div>

            {/* Large Spinning Circular Vinyl Disc */}
            <div className="w-full flex items-center justify-center py-4">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 p-2 bg-black border border-accent/40 flex items-center justify-center flex-shrink-0">
                <div
                  ref={discRef}
                  className="w-full h-full rounded-full vinyl-grooves-pattern relative overflow-hidden flex items-center justify-center border border-scribe"
                >
                  {/* Center Label Masked Album Art */}
                  <div className="w-[48%] h-[48%] rounded-full overflow-hidden relative border border-scribe/80">
                    <img
                      src={activeTrack.thumbnailUrl}
                      alt={activeTrack.title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Glare Overlay */}
                  <div className="absolute inset-0 rounded-full vinyl-glare-overlay pointer-events-none opacity-40 mix-blend-screen" />

                  {/* Center Spindle Hole */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border border-accent/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Track Metadata + Like Command */}
          <div className="border border-scribe bg-substrate p-4 mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-kraft uppercase tracking-wider mb-0.5">
                &gt; RECORDING_INFO:
              </div>
              <h1 className="font-bold text-base sm:text-lg text-paper truncate">
                {activeTrack.title}
              </h1>
              <p className="text-xs text-accent truncate mt-0.5">
                ARTIST: {activeTrack.artist}
              </p>
              {activeTrack.album && (
                <p className="text-[11px] text-kraft truncate mt-0.5">
                  ALBUM:  {activeTrack.album}
                </p>
              )}
            </div>

            <button
              onClick={() => toggleLike(activeTrack)}
              className={`px-2.5 py-1.5 border text-xs flex items-center gap-1.5 transition-colors ${
                isTrackLiked
                  ? 'border-accent bg-accent/15 text-accent font-bold'
                  : 'border-scribe bg-surface text-kraft hover:text-paper hover:border-scribe/80'
              }`}
              title={isTrackLiked ? 'Remove from liked songs' : 'Save to liked songs'}
            >
              <Heart className={`w-3.5 h-3.5 ${isTrackLiked ? 'fill-accent' : ''}`} />
              <span>{isTrackLiked ? '[ LIKED ]' : '[ LIKE ]'}</span>
            </button>
          </div>

          {/* Terminal Scrub Bar */}
          <div className="border border-scribe bg-substrate p-3 mb-4">
            <div
              ref={trackContainerRef}
              onMouseDown={onMouseDown}
              onMouseEnter={() => setIsScrubHovered(true)}
              onMouseLeave={() => setIsScrubHovered(false)}
              className="relative w-full h-5 flex items-center cursor-pointer group/track"
            >
              <div className="w-full h-[2px] bg-scribe overflow-hidden">
                <div
                  ref={fillRef}
                  className="h-full bg-accent"
                  style={{ width: '0%' }}
                />
              </div>

              <div
                ref={handleRef}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-3 bg-accent border border-black ${
                  isScrubHovered ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'
                }`}
                style={{ left: '0%' }}
              />
            </div>

            <div className="w-full flex items-center justify-between text-[11px] tabular-nums text-kraft mt-1">
              <span ref={currentTimeTextRef}>0:00</span>
              <span className="text-accent text-[10px]">SEEK_BAR</span>
              <span ref={totalTimeTextRef}>0:00</span>
            </div>
          </div>

          {/* TUI Keypad Transport Controls */}
          <div className="border border-scribe bg-substrate p-3 mb-4 flex items-center justify-between gap-2">
            <button
              onClick={toggleShuffle}
              className={`px-2 py-1 text-xs border transition-colors ${
                isShuffle
                  ? 'border-accent bg-accent/20 text-accent font-bold'
                  : 'border-scribe text-kraft hover:text-paper'
              }`}
              title="Toggle shuffle"
            >
              [SHUF]
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={previousTrack}
                className="px-2.5 py-1 bg-surface border border-scribe hover:border-accent text-paper hover:text-accent text-xs font-bold transition-colors"
                title="Previous track"
              >
                [&lt;&lt; PREV]
              </button>

              <button
                onClick={togglePlay}
                className="px-4 py-1.5 bg-accent text-lacquer hover:bg-accent-hover text-xs font-bold transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '[ || PAUSE ]' : '[ ▶ PLAY ]'}
              </button>

              <button
                onClick={nextTrack}
                className="px-2.5 py-1 bg-surface border border-scribe hover:border-accent text-paper hover:text-accent text-xs font-bold transition-colors"
                title="Next track"
              >
                [NEXT &gt;&gt;]
              </button>
            </div>

            <button
              onClick={cycleRepeatMode}
              className={`px-2 py-1 text-xs border transition-colors ${
                repeatMode !== 'none'
                  ? 'border-accent bg-accent/20 text-accent font-bold'
                  : 'border-scribe text-kraft hover:text-paper'
              }`}
              title={`Repeat mode: ${repeatMode}`}
            >
              [RPT:{repeatMode.toUpperCase()}]
            </button>
          </div>

          {/* Volume Control Row */}
          <div className="border border-scribe bg-substrate p-3 mb-6 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-kraft hover:text-paper transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || currentVol === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-kraft/50" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentVol}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 sm:w-32 h-1 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22C55E ${currentVol * 100}%, #1C261D ${currentVol * 100}%)`,
                }}
              />
              <span className="tabular-nums text-kraft text-[10px]">
                {Math.round(currentVol * 100)}%
              </span>
            </div>

            {/* Sheet Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSheetTab('queue')}
                className={`px-2.5 py-1 transition-colors ${
                  activeSheetTab === 'queue'
                    ? 'bg-accent text-lacquer font-bold'
                    : 'bg-surface border border-scribe text-kraft hover:text-paper'
                }`}
              >
                [ QUEUE ({queue.length}) ]
              </button>
              <button
                onClick={() => setActiveSheetTab('lyrics')}
                className={`px-2.5 py-1 transition-colors ${
                  activeSheetTab === 'lyrics'
                    ? 'bg-accent text-lacquer font-bold'
                    : 'bg-surface border border-scribe text-kraft hover:text-paper'
                }`}
              >
                [ LYRICS ]
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              BELOW-THE-FOLD TUI INSPECTION SHEET
             ───────────────────────────────────────────────────────────── */}
          <section ref={queueSectionRef} className="w-full">
            {activeSheetTab === 'queue' ? (
              <div className="border border-scribe bg-substrate">
                <div className="text-[11px] text-kraft border-b border-scribe p-2.5 bg-surface flex items-center justify-between">
                  <span className="text-accent font-bold">&gt; UP_NEXT_QUEUE:</span>
                  <span className="tabular-nums">COUNT: {queue.length} TRACKS</span>
                </div>

                <div className="divide-y divide-scribe">
                  {queue.map((track, idx) => {
                    const isCurrent = idx === currentTrackIndex;
                    return (
                      <button
                        key={`${track.videoId}-${idx}`}
                        onClick={() => playTrackIndex(idx)}
                        className={`w-full flex items-center gap-3 p-2.5 text-left transition-colors ${
                          isCurrent
                            ? 'bg-surface text-accent border-l-2 border-accent'
                            : 'hover:bg-surface/60 text-paper'
                        }`}
                      >
                        <span className="text-xs tabular-nums w-5 text-center flex-shrink-0 text-kraft">
                          {isCurrent && isPlaying ? '>' : idx + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-accent' : 'text-paper'
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-[10px] text-kraft truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>

                        <span className="text-xs tabular-nums text-kraft flex-shrink-0 ml-2">
                          {formatTime(track.duration)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Terminal Lyrics Output */
              <div className="border border-scribe bg-substrate">
                <div className="text-[11px] text-kraft border-b border-scribe p-2.5 bg-surface flex items-center justify-between">
                  <span className="text-accent font-bold">&gt; lrclib_fetch --stdout:</span>
                  <span>STATUS: {lyricsData.loading ? 'LOADING...' : lyricsData.found ? 'OK' : 'N/A'}</span>
                </div>

                <div className="p-4 sm:p-6">
                  {lyricsData.loading ? (
                    <div className="py-16 text-center text-kraft text-xs animate-pulse">
                      [SYS: QUERYING LRCLIB API...]
                    </div>
                  ) : lyricsData.instrumental ? (
                    <div className="py-12 text-center text-kraft text-xs border border-dashed border-scribe p-6">
                      <p className="text-paper font-bold">[!] INSTRUMENTAL RECORDING</p>
                      <p className="text-kraft/70 mt-1">This composition contains zero vocal lyrics.</p>
                    </div>
                  ) : lyricsData.plainLyrics ? (
                    <pre className="text-xs sm:text-sm text-paper/90 leading-relaxed whitespace-pre-wrap select-text font-mono">
                      {lyricsData.plainLyrics}
                    </pre>
                  ) : (
                    <div className="py-12 text-center text-kraft text-xs border border-dashed border-scribe p-6">
                      <p className="text-paper font-bold">[!] LYRICS NOT AVAILABLE</p>
                      <p className="text-kraft/70 mt-1">No registered lyrics found for this track.</p>
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
