import { create } from 'zustand';
import { TRACKS, Track } from '../lib/trackData';
import { audioManager } from '../lib/audioManager';

export type ThemeOption = 'vintage-gold' | 'warm-vermilion' | 'electric-teal' | 'neon-violet' | 'cyber-emerald';

interface PlayerState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
  theme: ThemeOption;
  
  // Actions
  playTrackIndex: (index: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setTheme: (theme: ThemeOption) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Auto advance track on audio completion
  audioManager.audio.addEventListener('ended', () => {
    const { repeatMode, isShuffle, currentTrackIndex, tracks } = get();
    if (repeatMode === 'one') {
      audioManager.seek(0);
      audioManager.play();
    } else if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      get().playTrackIndex(randomIndex);
    } else if (repeatMode === 'all' || currentTrackIndex < tracks.length - 1) {
      get().nextTrack();
    } else {
      set({ isPlaying: false });
    }
  });

  return {
    tracks: TRACKS,
    currentTrackIndex: 0,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    repeatMode: 'all',
    isShuffle: false,
    theme: 'vintage-gold',

    playTrackIndex: (index: number) => {
      const { tracks } = get();
      if (index < 0 || index >= tracks.length) return;
      
      const nextTrack = tracks[index];
      set({ currentTrackIndex: index, isPlaying: true });
      audioManager.loadTrack(nextTrack);
      audioManager.play();

      if (nextTrack.accentColor) {
        document.documentElement.style.setProperty('--accent-color', nextTrack.accentColor);
        document.documentElement.style.setProperty('--accent-glow', `${nextTrack.accentColor}66`);
        document.documentElement.style.setProperty('--accent-dim', `${nextTrack.accentColor}1f`);
      }
    },

    togglePlay: () => {
      const { isPlaying, currentTrackIndex, tracks } = get();
      if (isPlaying) {
        audioManager.pause();
        set({ isPlaying: false });
      } else {
        if (!audioManager.audio.src) {
          audioManager.loadTrack(tracks[currentTrackIndex]);
        }
        audioManager.play();
        set({ isPlaying: true });
      }
    },

    play: () => {
      audioManager.play();
      set({ isPlaying: true });
    },

    pause: () => {
      audioManager.pause();
      set({ isPlaying: false });
    },

    nextTrack: () => {
      const { currentTrackIndex, tracks, isShuffle } = get();
      let nextIndex = currentTrackIndex + 1;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } else if (nextIndex >= tracks.length) {
        nextIndex = 0;
      }
      get().playTrackIndex(nextIndex);
    },

    previousTrack: () => {
      const { currentTrackIndex, tracks } = get();
      if (audioManager.currentTimeRef.current > 3) {
        audioManager.seek(0);
        return;
      }
      let prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = tracks.length - 1;
      }
      get().playTrackIndex(prevIndex);
    },

    setVolume: (val: number) => {
      const cleanVal = Math.max(0, Math.min(1, val));
      audioManager.setVolume(cleanVal);
      set({ volume: cleanVal, isMuted: cleanVal === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        audioManager.setVolume(volume || 0.8);
        set({ isMuted: false });
      } else {
        audioManager.setVolume(0);
        set({ isMuted: true });
      }
    },

    toggleShuffle: () => {
      set((state) => ({ isShuffle: !state.isShuffle }));
    },

    cycleRepeatMode: () => {
      set((state) => {
        const modes: ('none' | 'one' | 'all')[] = ['all', 'one', 'none'];
        const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
        return { repeatMode: modes[nextIdx] };
      });
    },

    setTheme: (theme: ThemeOption) => {
      set({ theme });
      if (theme === 'vintage-gold') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', theme);
    },
  };
});
