/**
 * NativeAudioEngine — High performance HTML5 Audio engine streaming from /api/stream/:videoId
 * Provides exact interface parity with the previous engine for zero disruption to rAF loops
 */

export interface TrackItem {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  accentColor?: string;
}

export type PlayerEventType = 'playing' | 'paused' | 'ended' | 'ready' | 'error';

class NativeAudioEngine {
  private static instance: NativeAudioEngine;
  private audio: HTMLAudioElement | null = null;
  private currentVideoId: string | null = null;
  private isReady = false;

  // Mutable refs for zero-lag 60 FPS rAF loop reads without React re-renders
  public currentTimeRef = { current: 0 };
  public durationRef = { current: 0 };
  public isSeeking = false;

  private listeners: Set<(state: PlayerEventType, errorCode?: number) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  public static getInstance(): NativeAudioEngine {
    if (!NativeAudioEngine.instance) {
      NativeAudioEngine.instance = new NativeAudioEngine();
    }
    return NativeAudioEngine.instance;
  }

  private initAudioElement() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.audio.addEventListener('canplay', () => {
      this.isReady = true;
      this.notifyListeners('ready');
    });

    this.audio.addEventListener('playing', () => {
      this.notifyListeners('playing');
    });

    this.audio.addEventListener('pause', () => {
      // If ended has fired, don't emit duplicate paused event
      if (this.audio && !this.audio.ended) {
        this.notifyListeners('paused');
      }
    });

    this.audio.addEventListener('ended', () => {
      this.notifyListeners('ended');
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && !this.isSeeking) {
        this.currentTimeRef.current = this.audio.currentTime || 0;
      }
    });

    this.audio.addEventListener('durationchange', () => {
      if (this.audio && Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.durationRef.current = this.audio.duration;
      }
    });

    this.audio.addEventListener('error', (event) => {
      const err = this.audio?.error;
      console.warn('[NativeAudioEngine error]:', err?.message || 'Media stream error', event);
      this.notifyListeners('error', err?.code || 1);
    });
  }

  public loadVideoById(videoId: string, autoPlay = true) {
    if (!this.audio) return;

    const streamUrl = `/api/stream/${encodeURIComponent(videoId)}`;

    if (this.currentVideoId !== videoId) {
      this.currentVideoId = videoId;
      this.audio.src = streamUrl;
      this.currentTimeRef.current = 0;
      this.durationRef.current = 0;
      this.audio.load();
    }

    if (autoPlay) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay policy or abort
          console.warn('[Playback error]:', err.message);
          this.notifyListeners('paused');
        });
      }
    }
  }

  public play() {
    if (!this.audio) return;
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[Play error]:', err.message);
      });
    }
  }

  public pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  public seekTo(seconds: number) {
    if (!this.audio) return;
    const safeSeconds = Math.max(0, seconds);
    this.currentTimeRef.current = safeSeconds;
    this.audio.currentTime = safeSeconds;
  }

  public setVolume(volume: number) {
    if (!this.audio) return;
    const cleanVol = Math.max(0, Math.min(1, volume));
    this.audio.volume = cleanVol;
  }

  public updateTimeRef() {
    if (this.audio && !this.isSeeking) {
      this.currentTimeRef.current = this.audio.currentTime || 0;
      if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.durationRef.current = this.audio.duration;
      }
    }
  }

  public subscribe(callback: (state: PlayerEventType, errorCode?: number) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(state: PlayerEventType, errorCode?: number) {
    this.listeners.forEach((cb) => cb(state, errorCode));
  }
}

export const nativeAudioEngine = NativeAudioEngine.getInstance();
export const youtubeEngine = nativeAudioEngine; // Backwards compatible alias
