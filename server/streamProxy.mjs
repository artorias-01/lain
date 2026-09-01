import http from 'http';
import https from 'https';
import { URL } from 'url';
import { resolveAudioStreamUrl } from './ytDlpService.mjs';

/**
 * Handles GET /api/stream/:videoId
 * Proxies partial content Range requests from the client <audio> element to the upstream audio source
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} videoId
 */
export async function handleAudioStream(req, res, videoId) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const upstreamUrl = await resolveAudioStreamUrl(videoId);
    const parsedUrl = new URL(upstreamUrl);
    const clientRange = req.headers['range'];

    const upstreamHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: '*/*',
      Connection: 'keep-alive',
    };

    if (clientRange) {
      upstreamHeaders['Range'] = Array.isArray(clientRange) ? clientRange[0] : clientRange;
    }

    const requestLib = parsedUrl.protocol === 'http:' ? http : https;

    const upstreamReq = requestLib.request(
      upstreamUrl,
      {
        method: req.method,
        headers: upstreamHeaders,
        timeout: 20000,
      },
      (upstreamRes) => {
        // Forward HTTP status (typically 206 Partial Content or 200 OK)
        const statusCode = upstreamRes.statusCode || 200;

        const responseHeaders = {
          'Content-Type': upstreamRes.headers['content-type'] || 'audio/webm',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Range, Accept, Content-Type',
          'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
          'Cache-Control': 'public, max-age=14400',
        };

        if (upstreamRes.headers['content-length']) {
          responseHeaders['Content-Length'] = upstreamRes.headers['content-length'];
        }

        if (upstreamRes.headers['content-range']) {
          responseHeaders['Content-Range'] = upstreamRes.headers['content-range'];
        }

        res.writeHead(statusCode, responseHeaders);

        // Pipe upstream audio chunks to client
        upstreamRes.pipe(res);

        upstreamRes.on('error', (err) => {
          console.error(`[Upstream audio stream error for ${videoId}]:`, err.message);
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Upstream stream error' }));
          } else {
            res.destroy();
          }
        });
      }
    );

    upstreamReq.on('error', (err) => {
      console.error(`[Upstream connection error for ${videoId}]:`, err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to connect to upstream audio provider' }));
      }
    });

    // Cleanly cancel upstream stream if client disconnects or aborts
    req.on('close', () => {
      if (!upstreamReq.destroyed) {
        upstreamReq.destroy();
      }
    });

    upstreamReq.end();
  } catch (err) {
    console.error(`[Audio stream handler error for ${videoId}]:`, err.message);
    if (!res.headersSent) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Track audio unavailable', details: err.message }));
    }
  }
}
