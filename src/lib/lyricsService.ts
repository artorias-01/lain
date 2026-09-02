export interface LyricsResult {
  plainLyrics: string | null;
  syncedLyrics: string | null;
  instrumental: boolean;
  found: boolean;
}

const lyricsCache = new Map<string, LyricsResult>();

/**
 * Sanitizes track titles from YouTube-style labels (e.g. "(Official Video)", "[HD]")
 * to dramatically improve lookup matches against lyric databases.
 */
export function sanitizeSearchTerm(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s*[\(\[](official\s*(video|audio|music\s*video|lyric\s*video|visualizer)?|hd|4k|remastered.*|explicit|clean|live.*|audio)[\)\]]/gi, '')
    .replace(/\s*feat\..*|\s*ft\..*/gi, '')
    .replace(/^[0-9]+\.\s*/, '') // Remove track numbers like "32. "
    .trim();
}

/**
 * Fetches plain and synced lyrics from the free public lrclib.net API.
 * Results are cached in-memory per videoId.
 */
export async function fetchLyrics(
  title: string,
  artist: string,
  videoId: string
): Promise<LyricsResult> {
  const cacheKey = videoId || `${artist}-${title}`.toLowerCase();
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  const cleanTitle = sanitizeSearchTerm(title);
  const cleanArtist = sanitizeSearchTerm(artist);

  if (!cleanTitle) {
    const emptyRes: LyricsResult = { plainLyrics: null, syncedLyrics: null, instrumental: false, found: false };
    return emptyRes;
  }

  try {
    const searchUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`lrclib.net search error HTTP ${response.status}`);
    }

    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      // Secondary fallback: query by track name only if artist match was too strict
      const broadUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`;
      const broadRes = await fetch(broadUrl);
      if (broadRes.ok) {
        const broadItems = await broadRes.json();
        if (Array.isArray(broadItems) && broadItems.length > 0) {
          const first = broadItems[0];
          const result: LyricsResult = {
            plainLyrics: first.plainLyrics || null,
            syncedLyrics: first.syncedLyrics || null,
            instrumental: Boolean(first.instrumental),
            found: Boolean(first.plainLyrics || first.syncedLyrics || first.instrumental),
          };
          lyricsCache.set(cacheKey, result);
          return result;
        }
      }

      const notFound: LyricsResult = { plainLyrics: null, syncedLyrics: null, instrumental: false, found: false };
      lyricsCache.set(cacheKey, notFound);
      return notFound;
    }

    const matched = items[0];
    const result: LyricsResult = {
      plainLyrics: matched.plainLyrics || null,
      syncedLyrics: matched.syncedLyrics || null,
      instrumental: Boolean(matched.instrumental),
      found: Boolean(matched.plainLyrics || matched.syncedLyrics || matched.instrumental),
    };

    lyricsCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[Lyrics fetch error]:', err);
    const errorResult: LyricsResult = { plainLyrics: null, syncedLyrics: null, instrumental: false, found: false };
    return errorResult;
  }
}
