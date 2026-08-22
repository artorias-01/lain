import { create } from 'zustand';
import { youtubeEngine, TrackItem } from '../lib/youtubePlayer';
import { STARTER_QUEUE, searchYouTubeTracks } from '../lib/youtubeSearch';

interface PlayerState {
  queue: TrackItem[];
  currentTrackIndex: number;
  activeTrack: TrackItem;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;

  // Search State
  searchQuery: string;
  searchResults: TrackItem[];
  isSearching: boolean;
  apiKeyMissing: boolean;
  searchMessage: string | null;

  // Actions
  playTrackIndex: (index: number) => void;
  playTrack: (track: TrackItem) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setSearchQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Subscribe to YouTube audio engine events
  youtubeEngine.subscribe((event) => {
    if (event === 'playing') {
      set({ isPlaying: true });
    } else if (event === 'paused') {
      set({ isPlaying: false });
    } else if (event === 'ended') {
      const { repeatMode, isShuffle, currentTrackIndex, queue } = get();
      if (repeatMode === 'one') {
        youtubeEngine.seekTo(0);
        youtubeEngine.play();
      } else if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        get().playTrackIndex(randomIndex);
      } else if (repeatMode === 'all' || currentTrackIndex < queue.length - 1) {
        get().nextTrack();
      } else {
        set({ isPlaying: false });
      }
    }
  });

  const defaultTrack = STARTER_QUEUE[0];

  return {
    queue: STARTER_QUEUE,
    currentTrackIndex: 0,
    activeTrack: defaultTrack,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    repeatMode: 'all',
    isShuffle: false,

    searchQuery: '',
    searchResults: STARTER_QUEUE,
    isSearching: false,
    apiKeyMissing: false,
    searchMessage: null,

    playTrackIndex: (index: number) => {
      const { queue } = get();
      if (index < 0 || index >= queue.length) return;

      const nextTrack = queue[index];
      set({ currentTrackIndex: index, activeTrack: nextTrack, isPlaying: true });
      youtubeEngine.loadVideoById(nextTrack.videoId, true);

      if (nextTrack.accentColor) {
        document.documentElement.style.setProperty('--accent-color', nextTrack.accentColor);
        document.documentElement.style.setProperty('--accent-glow', `${nextTrack.accentColor}66`);
        document.documentElement.style.setProperty('--accent-dim', `${nextTrack.accentColor}1f`);
      }
    },

    playTrack: (track: TrackItem) => {
      const { queue } = get();
      let idx = queue.findIndex((t) => t.videoId === track.videoId);
      let updatedQueue = [...queue];

      if (idx === -1) {
        updatedQueue = [track, ...queue];
        idx = 0;
      }

      set({
        queue: updatedQueue,
        currentTrackIndex: idx,
        activeTrack: track,
        isPlaying: true,
      });

      youtubeEngine.loadVideoById(track.videoId, true);

      if (track.accentColor) {
        document.documentElement.style.setProperty('--accent-color', track.accentColor);
        document.documentElement.style.setProperty('--accent-glow', `${track.accentColor}66`);
        document.documentElement.style.setProperty('--accent-dim', `${track.accentColor}1f`);
      }
    },

    togglePlay: () => {
      const { isPlaying, activeTrack } = get();
      if (isPlaying) {
        youtubeEngine.pause();
        set({ isPlaying: false });
      } else {
        if (!youtubeEngine.currentTimeRef.current) {
          youtubeEngine.loadVideoById(activeTrack.videoId, true);
        } else {
          youtubeEngine.play();
        }
        set({ isPlaying: true });
      }
    },

    play: () => {
      youtubeEngine.play();
      set({ isPlaying: true });
    },

    pause: () => {
      youtubeEngine.pause();
      set({ isPlaying: false });
    },

    nextTrack: () => {
      const { currentTrackIndex, queue, isShuffle } = get();
      let nextIndex = currentTrackIndex + 1;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else if (nextIndex >= queue.length) {
        nextIndex = 0;
      }
      get().playTrackIndex(nextIndex);
    },

    previousTrack: () => {
      const { currentTrackIndex, queue } = get();
      if (youtubeEngine.currentTimeRef.current > 3) {
        youtubeEngine.seekTo(0);
        return;
      }
      let prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }
      get().playTrackIndex(prevIndex);
    },

    setVolume: (val: number) => {
      const cleanVal = Math.max(0, Math.min(1, val));
      youtubeEngine.setVolume(cleanVal);
      set({ volume: cleanVal, isMuted: cleanVal === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        youtubeEngine.setVolume(volume || 0.8);
        set({ isMuted: false });
      } else {
        youtubeEngine.setVolume(0);
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

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
      get().search(query);
    },

    search: async (query: string) => {
      set({ isSearching: true });
      const res = await searchYouTubeTracks(query);
      set({
        searchResults: res.tracks,
        apiKeyMissing: !res.hasApiKey,
        searchMessage: res.message || null,
        isSearching: false,
      });
    },
  };
});
