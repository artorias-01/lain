import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { fetchLyrics, LyricsResult } from '../../lib/lyricsService';
import { nativeAudioEngine } from '../../lib/nativeAudioEngine';
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

  const [activeSheetTab, setActiveSheetTab] = useState<'queue' | 'lyrics'>('lyrics');
  const [lyricsData, setLyricsData] = useState<LyricsResult & { loading: boolean }>({
    plainLyrics: null,
    syncedLyrics: null,
    instrumental: false,
    found: false,
    loading: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressKnobRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLSpanElement>(null);
  const durationTimeRef = useRef<HTMLSpanElement>(null);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // RAF time updates
  useEffect(() => {
    if (!isNowPlayingExpanded) return;
    let animId: number;

    const updateTime = () => {
      nativeAudioEngine.updateTimeRef();
      const cur = nativeAudioEngine.currentTimeRef.current;
      const dur = nativeAudioEngine.durationRef.current;

      if (dur > 0) {
        const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
        if (progressFillRef.current) progressFillRef.current.style.width = `${pct}%`;
        if (progressKnobRef.current) progressKnobRef.current.style.left = `${pct}%`;
      }

      if (currentTimeRef.current) currentTimeRef.current.textContent = formatTime(cur);
      if (durationTimeRef.current) durationTimeRef.current.textContent = formatTime(dur);

      animId = requestAnimationFrame(updateTime);
    };

    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, [isNowPlayingExpanded]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || nativeAudioEngine.durationRef.current <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    nativeAudioEngine.seekTo(ratio * nativeAudioEngine.durationRef.current);
  };

  // Entry and Exit
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isNowPlayingExpanded) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(el, { y: '100%' }, { y: '0%', duration: 0.25, ease: 'power2.out' });
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isNowPlayingExpanded]);

  // Smooth scroll for lyrics
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

  // Fetch Lyrics
  useEffect(() => {
    if (!activeTrack) return;
    let isMounted = true;
    setLyricsData((prev) => ({ ...prev, loading: true }));

    fetchLyrics(activeTrack.title, activeTrack.artist, activeTrack.videoId).then((res) => {
      if (!isMounted) return;
      setLyricsData({ ...res, loading: false });
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
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => setIsNowPlayingExpanded(false),
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

  if (!isNowPlayingExpanded || !activeTrack) return null;

  const currentVol = isMuted ? 0 : volume;
  const isTrackLiked = isLiked(activeTrack.videoId);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-surface-container-lowest text-on-surface select-none font-body-md"
    >
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 sm:px-8 py-6"
      >
        <div className="w-full max-w-2xl flex flex-col min-h-full pb-20">
          {/* Top Bar */}
          <header className="w-full flex items-center justify-between mb-6">
            <button
              onClick={handleCollapse}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
              title="Close (Esc)"
            >
              <span className="material-symbols-outlined text-body-lg">expand_more</span>
            </button>

            <div className="flex flex-col items-center">
              <span className="font-mono-numbers text-label-md text-outline uppercase tracking-wider">
                Playing from Master Stream
              </span>
              <span className="font-label-lg text-label-lg text-primary font-bold">
                Kinesis Spatial Audio
              </span>
            </div>

            <button
              onClick={() => toggleLike(activeTrack)}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors ${
                isTrackLiked ? 'text-primary' : 'text-on-surface-variant'
              }`}
              title="Save to Library"
            >
              <span
                className="material-symbols-outlined text-headline-sm"
                style={{ fontVariationSettings: isTrackLiked ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </header>

          {/* Large High-Fidelity Album Artwork Display */}
          <div className="w-full flex justify-center py-4">
            <div className="relative group w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden bg-surface-container shadow-2xl border border-outline-variant/20">
              <img
                className="w-full h-full object-cover filter grayscale contrast-125"
                alt=""
                src={activeTrack.thumbnailUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-space-base left-space-base right-space-base flex items-center justify-between pointer-events-none">
                <div className="flex flex-col">
                  <span className="font-mono-numbers text-label-md text-outline uppercase">
                    Direct Master Output
                  </span>
                  <span className="font-label-lg text-label-lg text-primary font-semibold">
                    FLAC 24-Bit / 96kHz Lossless
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-body-lg">
                    all_inclusive
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Track Titles */}
          <div className="mt-6 mb-4 flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-4">
              <h1 className="font-headline-lg text-headline-lg text-primary truncate">
                {activeTrack.title}
              </h1>
              <p className="font-body-md text-body-md text-secondary truncate mt-0.5">
                {activeTrack.artist}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-surface-container-high rounded text-outline font-mono-numbers text-label-md flex-shrink-0">
              LOSSLESS
            </span>
          </div>

          {/* Scrubber Bar */}
          <div className="flex items-center gap-space-md w-full mb-6">
            <span ref={currentTimeRef} className="font-mono-numbers text-mono-numbers text-outline min-w-[34px] text-right">
              00:00
            </span>
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              className="relative flex-1 h-1.5 bg-surface-container-highest rounded-full cursor-pointer group py-1.5 -my-1.5"
            >
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  ref={progressFillRef}
                  className="h-full w-[0%] bg-primary rounded-full transition-none"
                />
              </div>
              <div
                ref={progressKnobRef}
                className="absolute left-[0%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span ref={durationTimeRef} className="font-mono-numbers text-mono-numbers text-outline min-w-[34px]">
              00:00
            </span>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-between mb-8 px-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${
                isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
              title="Shuffle"
            >
              <span className="material-symbols-outlined text-headline-sm">shuffle</span>
            </button>

            <div className="flex items-center gap-space-xl">
              <button
                onClick={previousTrack}
                className="text-on-surface-variant hover:text-primary transition-colors"
                title="Previous track"
              >
                <span className="material-symbols-outlined text-headline-lg">skip_previous</span>
              </button>

              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-primary text-surface-dim flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <span
                  className="material-symbols-outlined text-display-hero-mobile"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                onClick={nextTrack}
                className="text-on-surface-variant hover:text-primary transition-colors"
                title="Next track"
              >
                <span className="material-symbols-outlined text-headline-lg">skip_next</span>
              </button>
            </div>

            <button
              onClick={cycleRepeatMode}
              className={`transition-colors ${
                repeatMode !== 'none' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <span className="material-symbols-outlined text-headline-sm">repeat</span>
            </button>
          </div>

          {/* Sub-tab Navigation: Lyrics / Queue */}
          <div className="flex items-center gap-space-sm border-b border-outline-variant/10 pb-3 mb-6">
            <button
              onClick={() => setActiveSheetTab('lyrics')}
              className={`px-space-md py-1 rounded-full font-label-lg text-label-lg transition-colors ${
                activeSheetTab === 'lyrics'
                  ? 'bg-surface-container-highest text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Lyrics
            </button>
            <button
              onClick={() => setActiveSheetTab('queue')}
              className={`px-space-md py-1 rounded-full font-label-lg text-label-lg transition-colors ${
                activeSheetTab === 'queue'
                  ? 'bg-surface-container-highest text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Queue ({queue.length})
            </button>
          </div>

          {/* Sheet Tab Content */}
          {activeSheetTab === 'lyrics' ? (
            <div className="bg-surface-container-low rounded-xl p-space-xl border border-outline-variant/10 min-h-[300px]">
              {lyricsData.loading ? (
                <div className="py-20 text-center text-outline animate-pulse font-mono-numbers">
                  Connecting to Lyrics Database...
                </div>
              ) : lyricsData.instrumental ? (
                <div className="py-16 text-center text-on-surface-variant font-body-md">
                  Instrumental Recording (No Lyrics)
                </div>
              ) : lyricsData.plainLyrics ? (
                <pre className="text-body-lg text-primary/90 leading-loose whitespace-pre-wrap select-text font-body-lg">
                  {lyricsData.plainLyrics}
                </pre>
              ) : (
                <div className="py-16 text-center text-on-surface-variant font-body-md">
                  No Lyrics Available for this Composition
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
              <div className="p-space-md border-b border-outline-variant/10 font-label-md text-outline uppercase tracking-wider">
                Up Next in Session ({queue.length})
              </div>
              <div className="divide-y divide-outline-variant/10">
                {queue.map((track, idx) => {
                  const isCurrent = idx === currentTrackIndex;
                  return (
                    <button
                      key={`${track.videoId}-${idx}`}
                      onClick={() => playTrackIndex(idx)}
                      className={`w-full flex items-center gap-space-md p-space-md text-left transition-colors ${
                        isCurrent
                          ? 'bg-surface-container-highest text-primary font-bold'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <span className="w-6 text-center font-mono-numbers text-outline text-label-md">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-label-lg text-label-lg truncate">
                          {track.title}
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary truncate">
                          {track.artist}
                        </span>
                      </div>
                      <span className="font-mono-numbers text-mono-numbers text-outline">
                        {formatTime(track.duration)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
