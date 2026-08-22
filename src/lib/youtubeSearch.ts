import { TrackItem } from './youtubePlayer';

/**
 * Parses ISO 8601 duration string (e.g. PT3M42S, PT1H2M5S, PT45S) to seconds
 */
export const parseIsoDuration = (durationStr: string): number => {
  if (!durationStr) return 180;
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 180;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : 180;
};

export const STARTER_QUEUE: TrackItem[] = [
  {
    id: 'yt-1',
    videoId: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    album: 'Live Chill Sessions',
    duration: 300,
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
  },
  {
    id: 'yt-2',
    videoId: 'FGBhQbmPwH8',
    title: 'One More Time',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 320,
    thumbnailUrl: 'https://img.youtube.com/vi/FGBhQbmPwH8/hqdefault.jpg',
  },
  {
    id: 'yt-3',
    videoId: 'RxabA9bt8sE',
    title: 'Nocturne Op. 9 No. 2 in E-Flat Major',
    artist: 'Frédéric Chopin',
    album: 'Classical Masterpieces',
    duration: 275,
    thumbnailUrl: 'https://img.youtube.com/vi/RxabA9bt8sE/hqdefault.jpg',
  },
  {
    id: 'yt-4',
    videoId: 'Rx91g6w2zXk',
    title: 'Time (Official Soundtrack)',
    artist: 'Hans Zimmer',
    album: 'Inception OST',
    duration: 275,
    thumbnailUrl: 'https://img.youtube.com/vi/Rx91g6w2zXk/hqdefault.jpg',
  },
  {
    id: 'yt-5',
    videoId: '4xDzrJKXOOY',
    title: 'Synthwave Radio - Cyberpunk Retrowave',
    artist: 'Lofi Pulse',
    album: 'Neon Nights',
    duration: 240,
    thumbnailUrl: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
  },
];

export interface SearchResponse {
  tracks: TrackItem[];
  hasApiKey: boolean;
  message?: string;
}

/**
 * Searches YouTube Data API v3, filters out non-embeddable videos, and fetches real ISO 8601 durations
 */
export const searchYouTubeTracks = async (query: string): Promise<SearchResponse> => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    if (query && query.trim()) {
      const q = query.toLowerCase();
      const filtered = STARTER_QUEUE.filter(
        (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      );
      return {
        tracks: filtered.length > 0 ? filtered : STARTER_QUEUE,
        hasApiKey: false,
        message: 'No VITE_YOUTUBE_API_KEY set in .env. Showing pre-resolved starter queue.',
      };
    }
    return {
      tracks: STARTER_QUEUE,
      hasApiKey: false,
      message: 'No VITE_YOUTUBE_API_KEY set in .env. Showing pre-resolved starter queue.',
    };
  }

  if (!query || !query.trim()) {
    return { tracks: STARTER_QUEUE, hasApiKey: true };
  }

  try {
    const encodedQuery = encodeURIComponent(`${query.trim()} music`);
    // Step 1: Initial search list call
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=15&q=${encodedQuery}&key=${apiKey}`
    );

    if (!searchRes.ok) {
      if (searchRes.status === 403) {
        throw new Error('Google Cloud YouTube API Quota Exceeded (403 quotaExceeded). Please check your API key quota limits.');
      }
      throw new Error(`YouTube Search returned HTTP ${searchRes.status}`);
    }

    const searchData = await searchRes.json();

    if (!searchData.items || !Array.isArray(searchData.items) || searchData.items.length === 0) {
      return { tracks: STARTER_QUEUE, hasApiKey: true, message: 'No search results found.' };
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean).join(',');

    if (!videoIds) {
      return { tracks: STARTER_QUEUE, hasApiKey: true };
    }

    // Step 2: Fetch detailed metadata (embeddable status & ISO 8601 duration) via videos.list
    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status,snippet&id=${videoIds}&key=${apiKey}`
    );

    if (!detailsRes.ok) {
      throw new Error(`YouTube Videos API returned HTTP ${detailsRes.status}`);
    }

    const detailsData = await detailsRes.json();

    if (!detailsData.items || !Array.isArray(detailsData.items)) {
      return { tracks: STARTER_QUEUE, hasApiKey: true };
    }

    // Filter OUT any track where status.embeddable === false
    const validItems = detailsData.items.filter((item: any) => {
      return item.status && item.status.embeddable !== false;
    });

    const tracks: TrackItem[] = validItems.map((item: any, idx: number) => {
      const videoId = item.id;
      const snippet = item.snippet || {};
      const contentDetails = item.contentDetails || {};

      const durationSeconds = parseIsoDuration(contentDetails.duration);
      const thumbnailUrl = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      return {
        id: `yt-${videoId}-${idx}`,
        videoId,
        title: snippet.title || 'Untitled Track',
        artist: snippet.channelTitle || 'YouTube Artist',
        duration: durationSeconds,
        thumbnailUrl,
      };
    });

    return {
      tracks: tracks.length > 0 ? tracks : STARTER_QUEUE,
      hasApiKey: true,
      message: tracks.length === 0 ? 'All search results had embedding disabled by rights holders.' : undefined,
    };
  } catch (err: any) {
    console.warn('YouTube search fetch error:', err);
    return {
      tracks: STARTER_QUEUE,
      hasApiKey: true,
      message: err.message || 'YouTube Search request failed. Showing starter queue.',
    };
  }
};
