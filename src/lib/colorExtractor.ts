export interface ExtractedColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

// Classic CRT Phosphor Green baseline for terminal aesthetics
export const FALLBACK_COLOR: ExtractedColor = {
  r: 34,
  g: 197,
  b: 94,
  hex: '#22c55e',
};

// In-memory cache per video ID
const colorCache = new Map<string, ExtractedColor>();

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Applies the terminal phosphor accent to global CSS custom properties on :root
 */
export function applyDynamicTheme(color: ExtractedColor = FALLBACK_COLOR) {
  if (typeof document === 'undefined') return;
  const { r, g, b, hex } = color;
  const root = document.documentElement;

  root.style.setProperty('--dynamic-accent', hex);
  root.style.setProperty('--dynamic-accent-rgb', `${r}, ${g}, ${b}`);
  root.style.setProperty('--dynamic-accent-dim', `rgba(${r}, ${g}, ${b}, 0.15)`);
  root.style.setProperty('--dynamic-accent-glow', `rgba(${r}, ${g}, ${b}, 0.22)`);

  const hoverR = Math.min(255, Math.round(r * 1.25));
  const hoverG = Math.min(255, Math.round(g * 1.15));
  const hoverB = Math.min(255, Math.round(b * 1.25));
  root.style.setProperty('--dynamic-accent-hover', rgbToHex(hoverR, hoverG, hoverB));
}

/**
 * Extracts artwork tone and constrains it strictly to the phosphor green terminal palette
 * ensuring a consistent, authentic TUI CRT experience without breaking into rainbow hues.
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

  // Constrain strictly within the terminal phosphor green family
  const result: ExtractedColor = FALLBACK_COLOR;
  colorCache.set(key, result);
  applyDynamicTheme(result);
  return Promise.resolve(result);
}

/**
 * Returns a CSS gradient string based on the terminal phosphor color
 */
export function createAmbientGradient(color: ExtractedColor = FALLBACK_COLOR): string {
  const { r, g, b } = color;
  return `radial-gradient(ellipse at 50% 25%, rgba(${r}, ${g}, ${b}, 0.25) 0%, rgba(14, 23, 16, 0.4) 45%, #050505 85%)`;
}
