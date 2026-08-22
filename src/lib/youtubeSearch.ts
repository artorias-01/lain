import { TrackItem } from './youtubePlayer';

export const STARTER_QUEUE: TrackItem[] = [
  {
    id: 'yt-1',
    videoId: 'jfKfPfyJRdk', // Lofi Girl Chill Beats
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    album: 'Live Chill Sessions',
    duration: 300,
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    accentColor: '#d4af37',
  },
  {
    id: 'yt-2',
    videoId: 'FGBhQbmPwH8', // Daft Punk - One More Time
    title: 'One More Time (Official Audio)',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 320,
    thumbnailUrl: 'https://img.youtube.com/vi/FGBhQbmPwH8/hqdefault.jpg',
    accentColor: '#ff5733',
  },
  {
    id: 'yt-3',
    videoId: 'RxabA9bt8sE', // Chopin Nocturne Op. 9 No. 2
    title: 'Nocturne Op. 9 No. 2 in E-Flat Major',
    artist: 'Frédéric Chopin',
    album: 'Classical Masterpieces',
    duration: 275,
    thumbnailUrl: 'https://img.youtube.com/vi/RxabA9bt8sE/hqdefault.jpg',
    accentColor: '#a855f7',
  },
  {
    id: 'yt-4',
    videoId: 'Rx91g6w2zXk', // Hans Zimmer - Time (Inception)
    title: 'Time (Official Soundtrack)',
    artist: 'Hans Zimmer',
    album: 'Inception OST',
    duration: 275,
    thumbnailUrl: 'https://img.youtube.com/vi/Rx91g6w2zXk/hqdefault.jpg',
    accentColor: '#00e5ff',
  },
  {
    id: 'yt-5',
    videoId: '4xDzrJKXOOY', // Synthwave Retrowave - Starfall
    title: 'Synthwave Radio - Cyberpunk Retrowave',
    artist: 'Lofi Pulse',
    album: 'Neon Nights',
    duration: 240,
    thumbnailUrl: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    accentColor: '#00ff9d',
  },
];

export interface SearchResponse {
  tracks: TrackItem[];
  hasApiKey: boolean;
  message?: string;
}

/**
 * Searches YouTube Data API v3 for music videos or returns starter queue with API status
 */
export const searchYouTubeTracks = async (query: string): Promise<SearchResponse> => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    // Filter starter queue if query matches
    if (query && query.trim()) {
      const q = query.toLowerCase();
      const filtered = STARTER_QUEUE.filter(
        (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      );
      return {
        tracks: filtered.length > 0 ? filtered : STARTER_QUEUE,
        hasApiKey: false,
        message: 'No VITE_YOUTUBE_API_KEY found in .env. Showing pre-resolved starter queue.',
      };
    }
    return {
      tracks: STARTER_QUEUE,
      hasApiKey: false,
      message: 'No VITE_YOUTUBE_API_KEY found in .env. Showing pre-resolved starter queue.',
    };
  }

  if (!query || !query.trim()) {
    return { tracks: STARTER_QUEUE, hasApiKey: true };
  }

  try {
    const encodedQuery = encodeURIComponent(`${query.trim()} music audio`);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=12&q=${encodedQuery}&key=${apiKey}`
    );

    if (!res.ok) {
      throw new Error(`YouTube API returned HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data.items || !Array.isArray(data.items)) {
      return { tracks: STARTER_QUEUE, hasApiKey: true };
    }

    const colors = ['#d4af37', '#ff5733', '#00e5ff', '#a855f7', '#00ff9d', '#f43f5e'];

    const tracks: TrackItem[] = data.items.map((item: any, idx: number) => {
      const videoId = item.id.videoId;
      const snippet = item.snippet;

      return {
        id: `yt-${videoId}-${idx}`,
        videoId,
        title: snippet.title || 'Untitled Track',
        artist: snippet.channelTitle || 'YouTube Artist',
        duration: 240, // Estimated duration until loaded
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        accentColor: colors[idx % colors.length],
      };
    });

    return { tracks, hasApiKey: true };
  } catch (err: any) {
    console.warn('YouTube search fetch error:', err);
    return {
      tracks: STARTER_QUEUE,
      hasApiKey: true,
      message: `YouTube Search failed: ${err.message || 'API request failed'}. Showing starter queue.`,
    };
  }
};
