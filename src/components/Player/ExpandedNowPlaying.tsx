import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { nativeAudioEngine } from '../../lib/nativeAudioEngine';
import { registerVinylElement, setVinylPlaying } from '../../lib/vinylSpinSync';
import { extractDominantColor, createAmbientGradient, FALLBACK_COLOR } from '../../lib/colorExtractor';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  ListMusic,
  MoreVertical,
  Volume2,
  VolumeX,
} from 'lucide-react';
import gsap from 'gsap';
import anime from 'animejs';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queueSectionRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const playIconRef = useRef<HTMLSpanElement>(null);

  // Gradient background cross-fade layers
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

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Synchronized Vinyl Rotation
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

  // 2. Animate Entry and Exit
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isNowPlayingExpanded) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(
        el,
        { y: '100%', opacity: 0.8 },
        { y: '0%', opacity: 1, duration: 0.42, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isNowPlayingExpanded]);

  // Wire Lenis smooth scroll specifically to the modal scroll container
  useEffect(() => {
    if (!isNowPlayingExpanded || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const content = container.firstElementChild as HTMLElement;
    if (!content) return;

    const modalLenis = new Lenis({
      wrapper: container,
      content: content,
      duration: 1.0,
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

  // 3. Dynamic Color Extraction on Track Change with Smooth Cross-Fade
  useEffect(() => {
    if (!isNowPlayingExpanded) return;

    let isMounted = true;

    extractDominantColor(activeTrack.thumbnailUrl, activeTrack.videoId).then((color) => {
      if (!isMounted) return;
      const gradient = createAmbientGradient(color);

      // Alternate cross-fading between bgLayer1 and bgLayer2
      if (activeLayerRef.current === 1) {
        if (bgLayer2Ref.current) {
          bgLayer2Ref.current.style.background = gradient;
          gsap.to(bgLayer2Ref.current, { opacity: 1, duration: 0.55, ease: 'power2.inOut' });
        }
        if (bgLayer1Ref.current) {
          gsap.to(bgLayer1Ref.current, { opacity: 0, duration: 0.55, ease: 'power2.inOut' });
        }
        activeLayerRef.current = 2;
      } else {
        if (bgLayer1Ref.current) {
          bgLayer1Ref.current.style.background = gradient;
          gsap.to(bgLayer1Ref.current, { opacity: 1, duration: 0.55, ease: 'power2.inOut' });
        }
        if (bgLayer2Ref.current) {
          gsap.to(bgLayer2Ref.current, { opacity: 0, duration: 0.55, ease: 'power2.inOut' });
        }
        activeLayerRef.current = 1;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeTrack.videoId, activeTrack.thumbnailUrl, isNowPlayingExpanded]);

  // 4. Progress bar continuous rAF loop
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

  // 5. Play/Pause icon pop micro-animation
  useEffect(() => {
    if (playIconRef.current && isNowPlayingExpanded) {
      anime.remove(playIconRef.current);
      anime({
        targets: playIconRef.current,
        scale: [0.82, 1],
        opacity: [0.65, 1],
        duration: 250,
        easing: 'easeOutBack',
      });
    }
  }, [isPlaying, isNowPlayingExpanded]);

  // Handle Seek Interaction
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

  // Collapse with smooth animation
  const handleCollapse = () => {
    const el = containerRef.current;
    if (!el) {
      setIsNowPlayingExpanded(false);
      return;
    }

    gsap.to(el, {
      y: '100%',
      opacity: 0.8,
      duration: 0.32,
      ease: 'power3.in',
      onComplete: () => {
        setIsNowPlayingExpanded(false);
      },
    });
  };

  // Escape key collapse listener
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
    queueSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isNowPlayingExpanded) return null;

  const currentVol = isMuted ? 0 : volume;
  const initialGradient = createAmbientGradient(FALLBACK_COLOR);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-lacquer text-paper select-none"
    >
      {/* Dynamic Ambient Background Layers */}
      <div
        ref={bgLayer1Ref}
        className="absolute inset-0 pointer-events-none transition-none"
        style={{ background: initialGradient, opacity: 1 }}
      />
      <div
        ref={bgLayer2Ref}
        className="absolute inset-0 pointer-events-none transition-none"
        style={{ background: initialGradient, opacity: 0 }}
      />

      {/* Subtle vignette darkening at bottom and edges */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-lacquer/90" />

      {/* Scrollable Container (Lenis / Native Smooth Scroll) */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-6 sm:px-12 py-6 scroll-smooth"
      >
        <div className="w-full max-w-lg flex flex-col min-h-full pb-20">
          {/* Top Header Row */}
          <header className="w-full flex items-center justify-between pt-2 pb-4">
            <button
              onClick={handleCollapse}
              className="p-2 -ml-2 text-paper/80 hover:text-paper active:scale-90 transition-all rounded-full hover:bg-white/5"
              title="Collapse (Esc)"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="text-center min-w-0 px-2">
              <p className="font-sans text-[10px] tracking-widest uppercase text-kraft font-medium truncate">
                {searchQuery ? 'PLAYING FROM SEARCH' : 'PLAYING FROM QUEUE'}
              </p>
              <p className="font-sans text-xs text-paper/90 font-semibold truncate max-w-[220px]">
                {activeTrack.album || activeTrack.artist}
              </p>
            </div>

            <button
              onClick={scrollToQueue}
              className="p-2 -mr-2 text-paper/80 hover:text-paper active:scale-90 transition-all rounded-full hover:bg-white/5"
              title="View Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </header>

          {/* Large Spinning Circular Vinyl Disc */}
          <div className="w-full flex items-center justify-center my-auto py-6 sm:py-8">
            <div className="relative w-[76vw] h-[76vw] max-w-[340px] max-h-[340px] sm:max-w-[380px] sm:max-h-[380px] rounded-full p-2 bg-lacquer/80 border border-scribe shadow-2xl flex items-center justify-center flex-shrink-0">
              {/* Outer Micro-Grooved Vinyl Body */}
              <div
                ref={discRef}
                className="w-full h-full rounded-full vinyl-grooves-pattern relative overflow-hidden flex items-center justify-center shadow-inner"
              >
                {/* Center Label Masked Album Art */}
                <div className="w-[50%] h-[50%] rounded-full overflow-hidden relative shadow-md border border-paper/10">
                  <img
                    src={activeTrack.thumbnailUrl}
                    alt={activeTrack.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Anisotropic Specular Glare Overlay */}
                <div className="absolute inset-0 rounded-full vinyl-glare-overlay pointer-events-none opacity-50 mix-blend-screen" />

                {/* Center Spindle Hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-lacquer border border-paper/40 shadow-inner" />
              </div>
            </div>
          </div>

          {/* Track Identity Details */}
          <div className="w-full mb-6">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper tracking-tight truncate leading-tight">
              {activeTrack.title}
            </h1>
            <p className="font-sans text-base text-kraft truncate mt-1">
              {activeTrack.artist}
            </p>
          </div>

          {/* Scrubbable Progress Bar */}
          <div className="w-full mb-6">
            <div
              ref={trackContainerRef}
              onMouseDown={onMouseDown}
              onMouseEnter={() => setIsScrubHovered(true)}
              onMouseLeave={() => setIsScrubHovered(false)}
              className="relative w-full h-6 flex items-center cursor-pointer group/track"
            >
              {/* Rail Base */}
              <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden transition-[height] duration-150 group-hover/track:h-1.5">
                {/* Active Progress Fill */}
                <div
                  ref={fillRef}
                  className="h-full bg-paper rounded-full"
                  style={{ width: '0%' }}
                />
              </div>

              {/* Scrub Handle Knob */}
              <div
                ref={handleRef}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-paper shadow-md transition-transform duration-100 ${
                  isScrubHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover/track:scale-100 group-hover/track:opacity-100'
                }`}
                style={{ left: '0%' }}
              />
            </div>

            {/* Time Indicators */}
            <div className="w-full flex items-center justify-between text-xs font-sans tabular-nums text-kraft mt-1">
              <span ref={currentTimeTextRef}>0:00</span>
              <span ref={totalTimeTextRef}>0:00</span>
            </div>
          </div>

          {/* Transport Controls Row */}
          <div className="w-full flex items-center justify-between gap-4 mb-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-colors rounded-full hover:bg-white/5 ${
                isShuffle ? 'text-ochre' : 'text-kraft/70 hover:text-paper'
              }`}
              title={isShuffle ? 'Shuffle active' : 'Shuffle inactive'}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={previousTrack}
              className="text-paper hover:text-ochre active:scale-90 transition-all p-2 rounded-full hover:bg-white/5"
              title="Previous track"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-paper text-lacquer hover:bg-ochre active:scale-95 transition-all shadow-xl flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <span ref={playIconRef} className="flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                )}
              </span>
            </button>

            <button
              onClick={nextTrack}
              className="text-paper hover:text-ochre active:scale-90 transition-all p-2 rounded-full hover:bg-white/5"
              title="Next track"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={cycleRepeatMode}
              className={`p-2 transition-colors rounded-full hover:bg-white/5 ${
                repeatMode !== 'none' ? 'text-ochre' : 'text-kraft/70 hover:text-paper'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Secondary Volume Row */}
          <div className="w-full flex items-center justify-between gap-3 px-2 py-2 border-b border-scribe/50 mb-12">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-kraft hover:text-paper transition-colors p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || currentVol === 0 ? (
                  <VolumeX className="w-4 h-4 text-kraft/50" />
                ) : (
                  <Volume2 className="w-4 h-4" />
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
                  background: `linear-gradient(to right, #F3EDE2 ${currentVol * 100}%, #26231F ${currentVol * 100}%)`,
                }}
              />
            </div>

            <button
              onClick={scrollToQueue}
              className="font-sans text-xs text-kraft hover:text-paper flex items-center gap-1.5 transition-colors"
            >
              <ListMusic className="w-4 h-4" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>

          {/* Below-the-fold Real Content: "Up Next in Queue" */}
          <section ref={queueSectionRef} className="w-full pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-paper tracking-tight">
                Up Next
              </h2>
              <span className="font-sans text-xs text-kraft tabular-nums">
                {queue.length} tracks
              </span>
            </div>

            <div className="flex flex-col divide-y divide-scribe/40 rounded-xl bg-substrate/50 border border-scribe/60 p-2 sm:p-3 shadow-md">
              {queue.map((track, idx) => {
                const isCurrent = idx === currentTrackIndex;
                return (
                  <button
                    key={`${track.videoId}-${idx}`}
                    onClick={() => playTrackIndex(idx)}
                    className={`w-full flex items-center gap-3 p-2.5 text-left rounded-lg transition-colors group ${
                      isCurrent
                        ? 'bg-ochre/15 text-paper'
                        : 'hover:bg-white/5 text-kraft hover:text-paper'
                    }`}
                  >
                    {/* Track Number / Play Indicator */}
                    <span className="font-sans text-xs tabular-nums w-5 text-center flex-shrink-0">
                      {isCurrent && isPlaying ? (
                        <span className="text-ochre font-bold animate-pulse">▶</span>
                      ) : (
                        idx + 1
                      )}
                    </span>

                    {/* Small Thumbnail */}
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-lacquer border border-scribe">
                      <img
                        src={track.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title & Artist */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-sans text-sm font-semibold truncate ${
                          isCurrent ? 'text-ochre' : 'text-paper group-hover:text-paper'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="font-sans text-xs text-kraft truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>

                    {/* Duration */}
                    <span className="font-sans text-xs tabular-nums text-kraft/80 flex-shrink-0 ml-2">
                      {formatTime(track.duration)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
