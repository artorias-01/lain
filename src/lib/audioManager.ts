import { TRACKS, Track } from './trackData';

class AudioManager {
  private static instance: AudioManager;
  public audio: HTMLAudioElement;
  
  // Non-React per-frame mutable state for zero-lag 60fps reads
  public currentTimeRef = { current: 0 };
  public durationRef = { current: 0 };
  public isSeeking = false;
  
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'metadata';

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSeeking) {
        this.currentTimeRef.current = this.audio.currentTime;
      }
      this.notifyListeners();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.durationRef.current = this.audio.duration || 0;
      this.notifyListeners();
    });

    this.audio.addEventListener('ended', () => {
      this.notifyListeners();
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public loadTrack(track: Track) {
    const wasPlaying = !this.audio.paused;
    this.audio.src = track.audioUrl;
    this.currentTimeRef.current = 0;
    this.audio.load();
    if (wasPlaying) {
      this.play();
    }
  }

  public play(): Promise<void> {
    return this.audio.play().catch((err) => {
      console.warn('Audio playback interrupted or blocked by browser policy:', err);
    });
  }

  public pause() {
    this.audio.pause();
  }

  public seek(seconds: number) {
    if (isFinite(seconds)) {
      this.audio.currentTime = seconds;
      this.currentTimeRef.current = seconds;
    }
  }

  public setVolume(volume: number) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb());
  }
}

export const audioManager = AudioManager.getInstance();
