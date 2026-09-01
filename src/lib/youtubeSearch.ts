import { TrackItem } from './nativeAudioEngine';

export interface SearchResponse {
  tracks: TrackItem[];
  hasApiKey: boolean;
  message?: string;
  fromCache?: boolean;
}

// Curated authentic starter queue with verified YouTube IDs
export const STARTER_QUEUE: TrackItem[] = [
  {
    id: 'yt-FGBhQbmPwH8',
    videoId: 'FGBhQbmPwH8',
    title: 'One More Time',
    artist: 'Daft Punk',
    album: 'Discovery (2001)',
    duration: 320,
    thumbnailUrl: 'https://img.youtube.com/vi/FGBhQbmPwH8/hqdefault.jpg',
  },
  {
    id: 'yt-F5EFsUU7RRA',
    videoId: 'F5EFsUU7RRA',
    title: 'Early Summer',
    artist: 'Ryo Fukui',
    album: 'Scenery (1976)',
    duration: 644,
    thumbnailUrl: 'https://img.youtube.com/vi/F5EFsUU7RRA/hqdefault.jpg',
  },
  {
    id: 'yt-zqNTltOGh5c',
    videoId: 'zqNTltOGh5c',
    title: 'So What',
    artist: 'Miles Davis',
    album: 'Kind of Blue (1959)',
    duration: 562,
    thumbnailUrl: 'https://img.youtube.com/vi/zqNTltOGh5c/hqdefault.jpg',
  },
  {
    id: 'yt-r-Z8KuwI7Gc',
    videoId: 'r-Z8KuwI7Gc',
    title: 'Autumn Leaves',
    artist: 'Bill Evans Trio',
    album: 'Portrait in Jazz (1960)',
    duration: 361,
    thumbnailUrl: 'https://img.youtube.com/vi/r-Z8KuwI7Gc/hqdefault.jpg',
  },
  {
    id: 'yt-p29JUpsOSTE',
    videoId: 'p29JUpsOSTE',
    title: 'Nocturne in E Flat Major (Op. 9 No. 2)',
    artist: 'Frédéric Chopin',
    album: 'Classical Masterpieces',
    duration: 296,
    thumbnailUrl: 'https://img.youtube.com/vi/p29JUpsOSTE/hqdefault.jpg',
  },
  {
    id: 'yt-c56t7upa8Bk',
    videoId: 'c56t7upa8Bk',
    title: 'Time (Official Audio)',
    artist: 'Hans Zimmer',
    album: 'Inception OST',
    duration: 276,
    thumbnailUrl: 'https://img.youtube.com/vi/c56t7upa8Bk/hqdefault.jpg',
  },
  {
    id: 'yt-5qap5aO4i9A',
    videoId: '5qap5aO4i9A',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    album: 'Chill Beats',
    duration: 300,
    thumbnailUrl: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg',
  },
];

/**
 * Searches YouTube tracks via the backend /api/search endpoint with server-side caching
 */
export const searchYouTubeTracks = async (query: string): Promise<SearchResponse> => {
  const cleanQuery = (query || '').trim();

  if (!cleanQuery) {
    return { tracks: STARTER_QUEUE, hasApiKey: true };
  }

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);

    if (!res.ok) {
      throw new Error(`Search request failed (${res.status})`);
    }

    const data: SearchResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn('[Search fetch error]:', err.message);

    // Filter starter queue on network failure
    const q = cleanQuery.toLowerCase();
    const fallback = STARTER_QUEUE.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q))
    );

    return {
      tracks: fallback.length > 0 ? fallback : STARTER_QUEUE,
      hasApiKey: false,
      message: 'Server search offline. Showing matched starter tracks.',
    };
  }
};
