import { getYtDlpClient } from './ytDlpService.mjs';

// Curated authentic starter queue with verified real YouTube video IDs
export const STARTER_QUEUE = [
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

// 2-hour search cache TTL
const SEARCH_CACHE_TTL_MS = 2 * 60 * 60 * 1000;

const searchCache = new Map();

/**
 * Searches YouTube tracks via youtube-dl-exec without needing Google Cloud API keys
 * @param {string} rawQuery
 */
export async function searchTracks(rawQuery) {
  const query = (rawQuery || '').trim();
  const normalizedKey = query.toLowerCase();

  // If empty query, return curated starter queue
  if (!normalizedKey) {
    return {
      tracks: STARTER_QUEUE,
      hasApiKey: false,
    };
  }

  // 1. Check in-memory cache
  const cached = searchCache.get(normalizedKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, fromCache: true };
  }

  // 2. Query youtube-dl-exec with ytmsearch prefix (music catalog)
  try {
    const yt = getYtDlpClient();
    const searchResult = await yt(`ytmsearch15:${query}`, {
      dumpSingleJson: true,
      flatPlaylist: true,
      noCheckCertificates: true,
    });

    const entries = Array.isArray(searchResult?.entries)
      ? searchResult.entries
      : searchResult?.id
      ? [searchResult]
      : [];

    if (entries.length === 0) {
      const emptyResult = {
        tracks: [],
        hasApiKey: false,
        message: `No songs found for "${query}".`,
      };
      searchCache.set(normalizedKey, { data: emptyResult, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
      return emptyResult;
    }

    // Belt and suspenders filter: exclude livestreams, clips under 30s, and multi-hour mixes over 30min
    const validTracks = entries
      .filter((item) => {
        if (!item || !item.id || item.is_live) return false;
        const d = item.duration || 0;
        return d >= 30 && d <= 1800;
      })
      .map((item, idx) => {
        const vid = item.id;
        const durationSec = Math.round(item.duration || 180);
        const thumb =
          item.thumbnails?.[item.thumbnails.length - 1]?.url ||
          `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;

        return {
          id: `yt-${vid}-${idx}`,
          videoId: vid,
          title: item.title || 'Untitled Track',
          artist: item.uploader || item.channel || 'YouTube Artist',
          album: item.album || undefined,
          duration: durationSec,
          thumbnailUrl: thumb,
        };
      });

    const finalResult = {
      tracks: validTracks.length > 0 ? validTracks : STARTER_QUEUE,
      hasApiKey: false,
      message: validTracks.length === 0 ? 'No playable audio tracks found matching criteria.' : undefined,
    };

    // Cache the result
    searchCache.set(normalizedKey, {
      data: finalResult,
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    });

    return finalResult;
  } catch (err) {
    console.warn(`[youtube-dl-exec search error for "${query}"]:`, err.message);

    // Fallback to searching the starter queue
    const fallbackTracks = STARTER_QUEUE.filter(
      (t) =>
        t.title.toLowerCase().includes(normalizedKey) ||
        t.artist.toLowerCase().includes(normalizedKey)
    );

    return {
      tracks: fallbackTracks.length > 0 ? fallbackTracks : STARTER_QUEUE,
      hasApiKey: false,
      message: err.message || 'Live search temporarily unavailable. Displaying starter catalog.',
    };
  }
}

/**
 * HTTP handler for GET /api/search?q=...
 */
export async function handleSearch(req, res, query) {
  try {
    const result = await searchTracks(query);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600',
    });
    res.end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Search failed', message: err.message }));
  }
}
