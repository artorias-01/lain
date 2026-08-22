import { create } from 'zustand';
import { TRACKS, Track } from '../lib/trackData';
import { audioManager } from '../lib/audioManager';
import { searchOnlineSongs } from '../lib/searchApi';

export type ThemeOption = 'vintage-gold' | 'warm-vermilion' | 'electric-teal' | 'neon-violet' | 'cyber-emerald';
export type TabOption = 'home' | 'search' | 'library' | 'turntable';

interface PlayerState {
  tracks: Track[];
  currentTrackIndex: number;
  activeTrack: Track;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
  theme: ThemeOption;
  
  // Search & Navigation State
  activeTab: TabOption;
  searchQuery: string;
  searchResults: Track[];
  isSearching: boolean;
  likedTrackIds: string[];
  isTurntableDrawerOpen: boolean;

  // Actions
  playTrackIndex: (index: number) => void;
  playTrack: (track: Track) => void;
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
  setTab: (tab: TabOption) => void;
  setSearchQuery: (query: string) => void;
  searchTracks: (query: string) => Promise<void>;
  toggleLikeTrack: (id: string) => void;
  toggleTurntableDrawer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
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

  const defaultTrack = TRACKS[0];

  return {
    tracks: TRACKS,
    currentTrackIndex: 0,
    activeTrack: defaultTrack,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    repeatMode: 'all',
    isShuffle: false,
    theme: 'vintage-gold',

    activeTab: 'home',
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    likedTrackIds: [TRACKS[0].id, TRACKS[2].id],
    isTurntableDrawerOpen: false,

    playTrackIndex: (index: number) => {
      const { tracks } = get();
      if (index < 0 || index >= tracks.length) return;
      
      const nextTrack = tracks[index];
      set({ currentTrackIndex: index, activeTrack: nextTrack, isPlaying: true });
      audioManager.loadTrack(nextTrack);
      audioManager.play();

      if (nextTrack.accentColor) {
        document.documentElement.style.setProperty('--accent-color', nextTrack.accentColor);
        document.documentElement.style.setProperty('--accent-glow', `${nextTrack.accentColor}66`);
        document.documentElement.style.setProperty('--accent-dim', `${nextTrack.accentColor}1f`);
      }
    },

    playTrack: (track: Track) => {
      const { tracks } = get();
      // If track is in existing list, find index, else prepend
      let idx = tracks.findIndex((t) => t.id === track.id || t.audioUrl === track.audioUrl);
      let updatedTracks = [...tracks];

      if (idx === -1) {
        updatedTracks = [track, ...tracks];
        idx = 0;
      }

      set({
        tracks: updatedTracks,
        currentTrackIndex: idx,
        activeTrack: track,
        isPlaying: true,
      });

      audioManager.loadTrack(track);
      audioManager.play();

      if (track.accentColor) {
        document.documentElement.style.setProperty('--accent-color', track.accentColor);
        document.documentElement.style.setProperty('--accent-glow', `${track.accentColor}66`);
        document.documentElement.style.setProperty('--accent-dim', `${track.accentColor}1f`);
      }
    },

    togglePlay: () => {
      const { isPlaying, activeTrack } = get();
      if (isPlaying) {
        audioManager.pause();
        set({ isPlaying: false });
      } else {
        if (!audioManager.audio.src) {
          audioManager.loadTrack(activeTrack);
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

    setTab: (tab: TabOption) => {
      set({ activeTab: tab });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
      if (query.trim().length > 0) {
        set({ activeTab: 'search' });
        get().searchTracks(query);
      }
    },

    searchTracks: async (query: string) => {
      if (!query.trim()) {
        set({ searchResults: [], isSearching: false });
        return;
      }
      set({ isSearching: true });
      const results = await searchOnlineSongs(query);
      set({ searchResults: results, isSearching: false });
    },

    toggleLikeTrack: (id: string) => {
      set((state) => {
        const exists = state.likedTrackIds.includes(id);
        const updated = exists
          ? state.likedTrackIds.filter((tId) => tId !== id)
          : [...state.likedTrackIds, id];
        return { likedTrackIds: updated };
      });
    },

    toggleTurntableDrawer: () => {
      set((state) => ({ isTurntableDrawerOpen: !state.isTurntableDrawerOpen }));
    },
  };
});
