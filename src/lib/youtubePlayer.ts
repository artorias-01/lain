/**
 * YouTubeAudioEngine — Low-latency audio wrapper around the YouTube IFrame API
 */

export interface TrackItem {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // Duration in real seconds
  thumbnailUrl: string;
  accentColor?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type PlayerEventType = 'playing' | 'paused' | 'ended' | 'ready' | 'error';

class YouTubeAudioEngine {
  private static instance: YouTubeAudioEngine;
  private player: any = null;
  private isReady = false;
  private pendingVideoId: string | null = null;

  // Mutable refs for zero-lag 60 FPS rAF loop reads
  public currentTimeRef = { current: 0 };
  public durationRef = { current: 0 };
  public isSeeking = false;

  private listeners: Set<(state: PlayerEventType, errorCode?: number) => void> = new Set();

  private constructor() {
    this.initYouTubeAPI();
  }

  public static getInstance(): YouTubeAudioEngine {
    if (!YouTubeAudioEngine.instance) {
      YouTubeAudioEngine.instance = new YouTubeAudioEngine();
    }
    return YouTubeAudioEngine.instance;
  }

  private initYouTubeAPI() {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      this.createPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  private createPlayer() {
    let container = document.getElementById('yt-audio-player-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-audio-player-container';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    this.player = new window.YT.Player('yt-audio-player-container', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {
          this.isReady = true;
          this.notifyListeners('ready');
          if (this.pendingVideoId) {
            this.loadVideoById(this.pendingVideoId);
            this.pendingVideoId = null;
          }
        },
        onStateChange: (event: any) => {
          if (!this.player) return;

          if (event.data === window.YT.PlayerState.PLAYING) {
            this.durationRef.current = this.player.getDuration() || 0;
            this.notifyListeners('playing');
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            this.notifyListeners('paused');
          } else if (event.data === window.YT.PlayerState.ENDED) {
            this.notifyListeners('ended');
          }
        },
        onError: (event: any) => {
          console.warn('YouTube Player error code:', event.data);
          // Codes: 2 (invalid param), 5 (HTML5 error), 100 (not found/private), 101/150 (embedding disabled by owner)
          this.notifyListeners('error', event.data);
        },
      },
    });
  }

  public loadVideoById(videoId: string, autoPlay = true) {
    if (!this.isReady || !this.player) {
      this.pendingVideoId = videoId;
      return;
    }

    this.currentTimeRef.current = 0;
    if (autoPlay) {
      this.player.loadVideoById(videoId);
    } else {
      this.player.cueVideoById(videoId);
    }
  }

  public play() {
    if (this.isReady && this.player && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  public pause() {
    if (this.isReady && this.player && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
    }
  }

  public seekTo(seconds: number) {
    if (this.isReady && this.player && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
      this.currentTimeRef.current = seconds;
    }
  }

  public setVolume(volume: number) {
    if (this.isReady && this.player && typeof this.player.setVolume === 'function') {
      const ytVol = Math.max(0, Math.min(100, Math.round(volume * 100)));
      this.player.setVolume(ytVol);
    }
  }

  public updateTimeRef() {
    if (this.isReady && this.player && typeof this.player.getCurrentTime === 'function' && !this.isSeeking) {
      const time = this.player.getCurrentTime() || 0;
      this.currentTimeRef.current = time;
      const dur = this.player.getDuration() || 0;
      if (dur > 0) this.durationRef.current = dur;
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

export const youtubeEngine = YouTubeAudioEngine.getInstance();
