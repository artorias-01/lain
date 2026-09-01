import http from 'http';
import fs from 'fs';
import path from 'path';

export interface TrackItem {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  thumbnailUrl: string;
}

export interface SearchResponse {
  tracks: TrackItem[];
  hasApiKey: boolean;
  message?: string;
  fromCache?: boolean;
}

// Curated authentic starter queue with verified real YouTube video IDs
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

// 2-hour search cache TTL
const SEARCH_CACHE_TTL_MS = 2 * 60 * 60 * 1000;

interface CachedSearchResult {
  data: SearchResponse;
  expiresAt: number;
}

const searchCache = new Map<string, CachedSearchResult>();

/**
 * Reads server-side YOUTUBE_API_KEY from environment or .env file
 */
function getYouTubeApiKey(): string | null {
  if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here') {
    return process.env.YOUTUBE_API_KEY;
  }
  if (process.env.VITE_YOUTUBE_API_KEY && process.env.VITE_YOUTUBE_API_KEY !== 'your_youtube_api_key_here') {
    return process.env.VITE_YOUTUBE_API_KEY;
  }

  // Check .env file directly if present
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/(?:YOUTUBE_API_KEY|VITE_YOUTUBE_API_KEY)\s*=\s*(.+)/);
      if (match && match[1].trim() && match[1].trim() !== 'your_youtube_api_key_here') {
        return match[1].trim();
      }
    }
  } catch (e) {
    // Ignore read errors
  }

  return null;
}

/**
 * Searches YouTube tracks with server-side caching and batching
 */
export async function searchTracks(rawQuery: string): Promise<SearchResponse> {
  const query = (rawQuery || '').trim();
  const normalizedKey = query.toLowerCase();

  // If empty query, return curated starter queue
  if (!normalizedKey) {
    return {
      tracks: STARTER_QUEUE,
      hasApiKey: Boolean(getYouTubeApiKey()),
    };
  }

  // 1. Check in-memory cache
  const cached = searchCache.get(normalizedKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, fromCache: true };
  }

  const apiKey = getYouTubeApiKey();

  // 2. If no API key configured, search within starter queue
  if (!apiKey) {
    const filtered = STARTER_QUEUE.filter(
      (t) =>
        t.title.toLowerCase().includes(normalizedKey) ||
        t.artist.toLowerCase().includes(normalizedKey) ||
        (t.album && t.album.toLowerCase().includes(normalizedKey))
    );

    const fallbackResult: SearchResponse = {
      tracks: filtered.length > 0 ? filtered : STARTER_QUEUE,
      hasApiKey: false,
      message: filtered.length > 0
        ? undefined
        : `No matches in starter catalog for "${query}". Set YOUTUBE_API_KEY on the server to search all YouTube music.`,
    };

    return fallbackResult;
  }

  // 3. Query YouTube Data API v3
  try {
    const encodedQuery = encodeURIComponent(`${query} music`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=25&q=${encodedQuery}&key=${apiKey}`;

    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
      if (searchRes.status === 403) {
        throw new Error('YouTube API Quota Exceeded (403 quotaExceeded). Showing curated starter catalog.');
      }
      throw new Error(`YouTube search returned HTTP ${searchRes.status}`);
    }

    const searchData: any = await searchRes.json();

    if (!searchData.items || !Array.isArray(searchData.items) || searchData.items.length === 0) {
      const emptyResult: SearchResponse = {
        tracks: [],
        hasApiKey: true,
        message: `No songs found for "${query}".`,
      };
      searchCache.set(normalizedKey, { data: emptyResult, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
      return emptyResult;
    }

    // Batch up to 50 video IDs for videos.list call
    const videoIds = searchData.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .slice(0, 50)
      .join(',');

    if (!videoIds) {
      return { tracks: STARTER_QUEUE, hasApiKey: true };
    }

    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status,snippet&id=${videoIds}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);

    if (!detailsRes.ok) {
      throw new Error(`YouTube videos lookup returned HTTP ${detailsRes.status}`);
    }

    const detailsData: any = await detailsRes.json();
    const items = detailsData.items || [];

    // Filter embeddable items and map to TrackItem
    const validTracks: TrackItem[] = items
      .filter((item: any) => item.status?.embeddable !== false)
      .map((item: any, idx: number) => {
        const vid = item.id;
        const snippet = item.snippet || {};
        const contentDetails = item.contentDetails || {};
        const durationSec = parseIsoDuration(contentDetails.duration);
        const thumb =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;

        return {
          id: `yt-${vid}-${idx}`,
          videoId: vid,
          title: snippet.title || 'Untitled Track',
          artist: snippet.channelTitle || 'YouTube Artist',
          album: snippet.description ? snippet.description.split('\n')[0]?.slice(0, 60) : undefined,
          duration: durationSec,
          thumbnailUrl: thumb,
        };
      });

    const finalResult: SearchResponse = {
      tracks: validTracks.length > 0 ? validTracks : STARTER_QUEUE,
      hasApiKey: true,
      message: validTracks.length === 0 ? 'All matching results were restricted by content owners.' : undefined,
    };

    // Cache the result
    searchCache.set(normalizedKey, {
      data: finalResult,
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    });

    return finalResult;
  } catch (err: any) {
    console.warn(`[Search error for "${query}"]:`, err.message);

    // Graceful fallback to starter queue filter
    const fallbackTracks = STARTER_QUEUE.filter(
      (t) =>
        t.title.toLowerCase().includes(normalizedKey) ||
        t.artist.toLowerCase().includes(normalizedKey)
    );

    return {
      tracks: fallbackTracks.length > 0 ? fallbackTracks : STARTER_QUEUE,
      hasApiKey: Boolean(apiKey),
      message: err.message || 'YouTube search unavailable. Displaying starter queue.',
    };
  }
}

/**
 * HTTP handler for GET /api/search?q=...
 */
export async function handleSearch(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  query: string
): Promise<void> {
  try {
    const result = await searchTracks(query);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600',
    });
    res.end(JSON.stringify(result));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Search failed', message: err.message }));
  }
}
