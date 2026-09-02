export interface ExtractedColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

// Default cool slate tone for neutral dark aesthetic idle state
export const FALLBACK_COLOR: ExtractedColor = {
  r: 88,
  g: 117,
  b: 166,
  hex: '#5875a6',
};

// In-memory cache per video ID or image URL
const colorCache = new Map<string, ExtractedColor>();

/**
 * Converts RGB components to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Applies the extracted accent color to the global CSS custom properties on :root
 * so the entire app (hero glow, active tracks, scrub bar) reflects the active artwork.
 */
export function applyDynamicTheme(color: ExtractedColor) {
  if (typeof document === 'undefined') return;
  const { r, g, b, hex } = color;
  const root = document.documentElement;

  root.style.setProperty('--dynamic-accent', hex);
  root.style.setProperty('--dynamic-accent-rgb', `${r}, ${g}, ${b}`);
  root.style.setProperty('--dynamic-accent-dim', `rgba(${r}, ${g}, ${b}, 0.15)`);
  root.style.setProperty('--dynamic-accent-glow', `rgba(${r}, ${g}, ${b}, 0.28)`);

  const hoverR = Math.min(255, Math.round(r * 1.15));
  const hoverG = Math.min(255, Math.round(g * 1.15));
  const hoverB = Math.min(255, Math.round(b * 1.15));
  root.style.setProperty('--dynamic-accent-hover', rgbToHex(hoverR, hoverG, hoverB));
}

/**
 * Extracts a rich, dominant color from an image URL using an offscreen canvas.
 * Automatically applies the dynamic accent to :root and handles CORS gracefully.
 */
export function extractDominantColor(
  imageUrl: string,
  cacheKey?: string
): Promise<ExtractedColor> {
  const key = cacheKey || imageUrl;
  if (colorCache.has(key)) {
    const cached = colorCache.get(key)!;
    applyDynamicTheme(cached);
    return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    if (!imageUrl) {
      applyDynamicTheme(FALLBACK_COLOR);
      resolve(FALLBACK_COLOR);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Timeout safety in case image hangs
    const timer = setTimeout(() => {
      applyDynamicTheme(FALLBACK_COLOR);
      resolve(FALLBACK_COLOR);
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          applyDynamicTheme(FALLBACK_COLOR);
          resolve(FALLBACK_COLOR);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);

        // YouTube thumbnails from img.youtube.com may trigger CORS security errors
        // when read via getImageData depending on referrer headers / browser environment.
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        // Weighted bucket for vibrant/saturated pixels
        let vibrantR = 0;
        let vibrantG = 0;
        let vibrantB = 0;
        let vibrantCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          // Perceived brightness
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          // Skip extreme darks and blown highlights
          if (brightness < 20 || brightness > 235) continue;

          totalR += r;
          totalG += g;
          totalB += b;
          count++;

          // Measure saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;

          if (saturation > 0.18) {
            vibrantR += r;
            vibrantG += g;
            vibrantB += b;
            vibrantCount++;
          }
        }

        let finalR: number;
        let finalG: number;
        let finalB: number;

        if (vibrantCount > 15) {
          finalR = Math.round(vibrantR / vibrantCount);
          finalG = Math.round(vibrantG / vibrantCount);
          finalB = Math.round(vibrantB / vibrantCount);
        } else if (count > 0) {
          finalR = Math.round(totalR / count);
          finalG = Math.round(totalG / count);
          finalB = Math.round(totalB / count);
        } else {
          finalR = FALLBACK_COLOR.r;
          finalG = FALLBACK_COLOR.g;
          finalB = FALLBACK_COLOR.b;
        }

        const result: ExtractedColor = {
          r: finalR,
          g: finalG,
          b: finalB,
          hex: rgbToHex(finalR, finalG, finalB),
        };

        colorCache.set(key, result);
        applyDynamicTheme(result);
        resolve(result);
      } catch (_corsError) {
        // Limitation: CORS policy restrictions on cross-origin image data
        // Fall back gracefully to cool neutral slate tone
        colorCache.set(key, FALLBACK_COLOR);
        applyDynamicTheme(FALLBACK_COLOR);
        resolve(FALLBACK_COLOR);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      applyDynamicTheme(FALLBACK_COLOR);
      resolve(FALLBACK_COLOR);
    };

    img.src = imageUrl;
  });
}

/**
 * Returns a CSS gradient string based on the extracted color for the Now Playing backdrop
 */
export function createAmbientGradient(color: ExtractedColor): string {
  const { r, g, b } = color;
  const maxComp = Math.max(r, g, b, 1);
  const scale = maxComp > 180 ? 180 / maxComp : 1;
  const cr = Math.round(r * scale);
  const cg = Math.round(g * scale);
  const cb = Math.round(b * scale);

  return `radial-gradient(ellipse at 50% 25%, rgba(${cr}, ${cg}, ${cb}, 0.72) 0%, rgba(${Math.round(cr * 0.45)}, ${Math.round(cg * 0.45)}, ${Math.round(cb * 0.45)}, 0.45) 50%, #0A0B0E 90%)`;
}
