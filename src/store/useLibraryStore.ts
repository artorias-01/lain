import { create } from 'zustand';
import { TrackItem } from '../lib/nativeAudioEngine';

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  tracks: TrackItem[];
}

interface StoredLibrary {
  likedTracks: TrackItem[];
  playlists: Playlist[];
}

const STORAGE_KEY = 'lain_library_v1';

function loadStoredLibrary(): StoredLibrary {
  if (typeof window === 'undefined') {
    return { likedTracks: [], playlists: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { likedTracks: [], playlists: [] };
    const parsed = JSON.parse(raw);
    return {
      likedTracks: Array.isArray(parsed.likedTracks) ? parsed.likedTracks : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
    };
  } catch (e) {
    console.warn('[LibraryStorage read error]:', e);
    return { likedTracks: [], playlists: [] };
  }
}

function persistLibrary(likedTracks: TrackItem[], playlists: Playlist[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ likedTracks, playlists }));
  } catch (e) {
    console.warn('[LibraryStorage write error]:', e);
  }
}

interface LibraryState {
  likedTracks: TrackItem[];
  playlists: Playlist[];
  activeTab: 'catalog' | 'liked' | 'playlists';
  selectedPlaylistId: string | null;

  isLiked: (videoId: string) => boolean;
  toggleLike: (track: TrackItem) => void;

  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addTrackToPlaylist: (playlistId: string, track: TrackItem) => void;
  removeTrackFromPlaylist: (playlistId: string, videoId: string) => void;

  setActiveTab: (tab: 'catalog' | 'liked' | 'playlists') => void;
  setSelectedPlaylistId: (id: string | null) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => {
  const initial = loadStoredLibrary();

  return {
    likedTracks: initial.likedTracks,
    playlists: initial.playlists,
    activeTab: 'catalog',
    selectedPlaylistId: null,

    isLiked: (videoId: string) => {
      return get().likedTracks.some((t) => t.videoId === videoId);
    },

    toggleLike: (track: TrackItem) => {
      const { likedTracks, playlists } = get();
      const exists = likedTracks.some((t) => t.videoId === track.videoId);
      const updated = exists
        ? likedTracks.filter((t) => t.videoId !== track.videoId)
        : [track, ...likedTracks];

      set({ likedTracks: updated });
      persistLibrary(updated, playlists);
    },

    createPlaylist: (name: string) => {
      const cleanName = (name || '').trim() || 'Untitled Playlist';
      const newPlaylist: Playlist = {
        id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: cleanName,
        createdAt: Date.now(),
        tracks: [],
      };

      const updatedPlaylists = [newPlaylist, ...get().playlists];
      set({ playlists: updatedPlaylists, selectedPlaylistId: newPlaylist.id });
      persistLibrary(get().likedTracks, updatedPlaylists);
      return newPlaylist;
    },

    deletePlaylist: (playlistId: string) => {
      const { likedTracks, playlists, selectedPlaylistId } = get();
      const updated = playlists.filter((p) => p.id !== playlistId);
      set({
        playlists: updated,
        selectedPlaylistId: selectedPlaylistId === playlistId ? null : selectedPlaylistId,
      });
      persistLibrary(likedTracks, updated);
    },

    renamePlaylist: (playlistId: string, newName: string) => {
      const { likedTracks, playlists } = get();
      const updated = playlists.map((p) =>
        p.id === playlistId ? { ...p, name: newName.trim() || p.name } : p
      );
      set({ playlists: updated });
      persistLibrary(likedTracks, updated);
    },

    addTrackToPlaylist: (playlistId: string, track: TrackItem) => {
      const { likedTracks, playlists } = get();
      const updated = playlists.map((p) => {
        if (p.id !== playlistId) return p;
        // Prevent duplicates in the playlist
        if (p.tracks.some((t) => t.videoId === track.videoId)) return p;
        return { ...p, tracks: [...p.tracks, track] };
      });
      set({ playlists: updated });
      persistLibrary(likedTracks, updated);
    },

    removeTrackFromPlaylist: (playlistId: string, videoId: string) => {
      const { likedTracks, playlists } = get();
      const updated = playlists.map((p) => {
        if (p.id !== playlistId) return p;
        return { ...p, tracks: p.tracks.filter((t) => t.videoId !== videoId) };
      });
      set({ playlists: updated });
      persistLibrary(likedTracks, updated);
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedPlaylistId: (id) => set({ selectedPlaylistId: id }),
  };
});
