import { handleAudioStream } from './streamProxy.mjs';
import { handleSearch } from './searchService.mjs';

/**
 * Dispatches incoming HTTP requests for /api/* endpoints
 * Returns true if the request was handled, false otherwise
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {Promise<boolean>}
 */
export async function handleApiRequest(req, res) {
  const url = req.url || '';

  // 1. Audio stream proxy: /api/stream/:videoId
  if (url.startsWith('/api/stream/')) {
    const rawPath = url.slice('/api/stream/'.length);
    const videoId = rawPath.split('?')[0].trim();

    if (!videoId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing videoId parameter' }));
      return true;
    }

    await handleAudioStream(req, res, videoId);
    return true;
  }

  // 2. Search endpoint: /api/search?q=...
  if (url.startsWith('/api/search')) {
    const parsedUrl = new URL(url, 'http://localhost');
    const query = parsedUrl.searchParams.get('q') || '';

    await handleSearch(req, res, query);
    return true;
  }

  return false;
}

/**
 * Connect/Vite/Express compatible middleware
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {() => void} [next]
 */
export function apiMiddleware(req, res, next) {
  const url = req.url || '';

  if (url.startsWith('/api/')) {
    handleApiRequest(req, res).catch((err) => {
      console.error('[API Middleware unhandled error]:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } else if (next) {
    next();
  } else {
    res.writeHead(404).end();
  }
}
