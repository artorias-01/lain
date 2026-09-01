import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';

// 4-hour cache TTL (Google Video playback URLs usually expire in 6 hours)
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

const resolvedUrlCache = new Map();
const inFlightResolutions = new Map();

/**
 * Returns youtubedl instance configured with local binary if present
 */
export function getYtDlpClient() {
  const localBinExe = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
  if (fs.existsSync(localBinExe)) return youtubedl.create(localBinExe);

  const localBin = path.resolve(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(localBin)) return youtubedl.create(localBin);

  return youtubedl;
}

/**
 * Resolves a direct Google Video audio stream URL for a given YouTube video ID using youtube-dl-exec
 * @param {string} videoId
 * @returns {Promise<string>}
 */
export async function resolveAudioStreamUrl(videoId) {
  const cleanId = (videoId || '').trim();
  if (!cleanId || !/^[\w-]{6,15}$/.test(cleanId)) {
    throw new Error(`Invalid video ID: ${videoId}`);
  }

  // 1. Check in-memory cache
  const cached = resolvedUrlCache.get(cleanId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  // 2. Concurrency guard: return existing in-flight resolution if already active
  const inFlight = inFlightResolutions.get(cleanId);
  if (inFlight) {
    return inFlight;
  }

  const yt = getYtDlpClient();
  const targetUrl = `https://www.youtube.com/watch?v=${cleanId}`;

  const resolutionPromise = (async () => {
    try {
      const output = await yt(targetUrl, {
        getUrl: true,
        format: 'bestaudio',
        noCheckCertificates: true,
      });

      const lines = String(output).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const streamUrl = lines.find((line) => line.startsWith('http://') || line.startsWith('https://'));

      if (!streamUrl) {
        throw new Error(`No audio stream URL returned by youtube-dl-exec for ${cleanId}`);
      }

      resolvedUrlCache.set(cleanId, {
        url: streamUrl,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return streamUrl;
    } catch (err) {
      console.error(`[youtube-dl-exec stream error for ${cleanId}]:`, err.message);
      throw err;
    }
  })();

  inFlightResolutions.set(cleanId, resolutionPromise);

  try {
    return await resolutionPromise;
  } finally {
    inFlightResolutions.delete(cleanId);
  }
}
