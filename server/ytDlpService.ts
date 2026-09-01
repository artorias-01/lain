import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

interface CachedUrl {
  url: string;
  expiresAt: number;
}

// 4-hour cache TTL (Google Video playback URLs usually expire in 6 hours)
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

const resolvedUrlCache = new Map<string, CachedUrl>();
const inFlightResolutions = new Map<string, Promise<string>>();

/**
 * Finds the yt-dlp executable in local bin/ or system PATH
 */
export function findYtDlpBinary(): string {
  const localBinExe = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
  if (fs.existsSync(localBinExe)) return localBinExe;

  const localBin = path.resolve(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(localBin)) return localBin;

  return 'yt-dlp';
}

/**
 * Resolves a direct Google Video audio stream URL for a given YouTube video ID
 */
export async function resolveAudioStreamUrl(videoId: string): Promise<string> {
  const cleanId = videoId.trim();
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

  // 3. Spawn yt-dlp to extract direct audio URL
  const ytDlpPath = findYtDlpBinary();
  const targetUrl = `https://www.youtube.com/watch?v=${cleanId}`;

  const resolutionPromise = new Promise<string>((resolve, reject) => {
    // -f bestaudio -g returns the direct media stream URL
    const args = ['-f', 'bestaudio', '-g', targetUrl];

    execFile(ytDlpPath, args, { maxBuffer: 10 * 1024 * 1024, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[yt-dlp error for ${cleanId}]:`, stderr || error.message);
        return reject(new Error(`Failed to extract audio stream for ${cleanId}: ${error.message}`));
      }

      // Output may contain multiple lines or warnings; find the first valid URL
      const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const streamUrl = lines.find((line) => line.startsWith('http://') || line.startsWith('https://'));

      if (!streamUrl) {
        console.error(`[yt-dlp no URL in stdout for ${cleanId}]:`, stdout);
        return reject(new Error(`No audio stream URL returned by yt-dlp for ${cleanId}`));
      }

      // Cache the resolved URL
      resolvedUrlCache.set(cleanId, {
        url: streamUrl,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      resolve(streamUrl);
    });
  });

  inFlightResolutions.set(cleanId, resolutionPromise);

  try {
    return await resolutionPromise;
  } finally {
    inFlightResolutions.delete(cleanId);
  }
}
