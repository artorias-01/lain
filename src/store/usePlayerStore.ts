import { create } from 'zustand';
import { nativeAudioEngine, TrackItem, PlayerEventType } from '../lib/nativeAudioEngine';
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

  // Search & Status
  searchQuery: string;
  searchResults: TrackItem[];
  isSearching: boolean;
  apiKeyMissing: boolean;
  searchMessage: string | null;
  trackErrorMessage: string | null;
  isNowPlayingExpanded: boolean;

  // Actions
  setIsNowPlayingExpanded: (expanded: boolean) => void;
  toggleNowPlayingExpanded: () => void;
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
  clearErrorMessage: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Subscribe to native audio engine state events
  nativeAudioEngine.subscribe((event: PlayerEventType, errorCode?: number) => {
    if (event === 'playing') {
      set({ isPlaying: true, trackErrorMessage: null });
    } else if (event === 'paused') {
      set({ isPlaying: false });
    } else if (event === 'ended') {
      const { repeatMode, isShuffle, currentTrackIndex, queue } = get();
      if (repeatMode === 'one') {
        nativeAudioEngine.seekTo(0);
        nativeAudioEngine.play();
      } else if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        get().playTrackIndex(randomIndex);
      } else if (repeatMode === 'all' || currentTrackIndex < queue.length - 1) {
        get().nextTrack();
      } else {
        set({ isPlaying: false });
      }
    } else if (event === 'error') {
      console.warn('[Audio Engine error, skipping track]:', errorCode);
      set({
        isPlaying: false,
        trackErrorMessage: 'Track unavailable, skipping to next track...',
      });
      // Auto-advance so the listener isn't stuck
      setTimeout(() => {
        get().nextTrack();
      }, 1200);
    }
  });

  const defaultTrack = STARTER_QUEUE[0];

  return {
    queue: STARTER_QUEUE,
    currentTrackIndex: 0,
    activeTrack: defaultTrack,
    isPlaying: false,
    volume: 0.85,
    isMuted: false,
    repeatMode: 'all',
    isShuffle: false,

    searchQuery: '',
    searchResults: STARTER_QUEUE,
    isSearching: false,
    apiKeyMissing: false,
    searchMessage: null,
    trackErrorMessage: null,
    isNowPlayingExpanded: false,

    setIsNowPlayingExpanded: (expanded: boolean) => set({ isNowPlayingExpanded: expanded }),
    toggleNowPlayingExpanded: () => set((state) => ({ isNowPlayingExpanded: !state.isNowPlayingExpanded })),

    playTrackIndex: (index: number) => {
      const { queue } = get();
      if (index < 0 || index >= queue.length) return;

      const nextTrack = queue[index];
      set({
        currentTrackIndex: index,
        activeTrack: nextTrack,
        isPlaying: true,
        trackErrorMessage: null,
      });
      nativeAudioEngine.loadVideoById(nextTrack.videoId, true);
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
        trackErrorMessage: null,
      });

      nativeAudioEngine.loadVideoById(track.videoId, true);
    },

    togglePlay: () => {
      const { isPlaying, activeTrack } = get();
      if (isPlaying) {
        nativeAudioEngine.pause();
        set({ isPlaying: false });
      } else {
        if (!nativeAudioEngine.currentTimeRef.current) {
          nativeAudioEngine.loadVideoById(activeTrack.videoId, true);
        } else {
          nativeAudioEngine.play();
        }
        set({ isPlaying: true });
      }
    },

    play: () => {
      nativeAudioEngine.play();
      set({ isPlaying: true });
    },

    pause: () => {
      nativeAudioEngine.pause();
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
      if (nativeAudioEngine.currentTimeRef.current > 3) {
        nativeAudioEngine.seekTo(0);
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
      nativeAudioEngine.setVolume(cleanVal);
      set({ volume: cleanVal, isMuted: cleanVal === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        nativeAudioEngine.setVolume(volume || 0.85);
        set({ isMuted: false });
      } else {
        nativeAudioEngine.setVolume(0);
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

    clearErrorMessage: () => {
      set({ trackErrorMessage: null });
    },
  };
});
