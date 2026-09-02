import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a default 8-bit arcade vinyl label pattern in the retro palette
 * Used as fallback or idle state.
 */
export function createDefaultRetroTexture(size = 32): THREE.CanvasTexture {
  const cacheKey = `default_retro_${size}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.imageSmoothingEnabled = false;

    // Deep Navy Base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    // Retro Cyan border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    // Gold diamond/cross in center
    ctx.fillStyle = '#ffb800';
    const mid = size / 2;
    ctx.fillRect(mid - 3, mid - 3, 6, 6);

    // Center Spindle Hole
    ctx.fillStyle = '#05070a';
    ctx.fillRect(mid - 1, mid - 1, 2, 2);

    // Diagonal pixel accents
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillRect(size - 8, 6, 2, 2);
    ctx.fillRect(6, size - 8, 2, 2);
    ctx.fillRect(size - 8, size - 8, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Loads an album artwork URL, draws it downscaled (32x32) onto an offscreen canvas,
 * and creates a THREE.CanvasTexture with NearestFilter for authentic 8-bit pixel art.
 */
export function loadPixelatedTexture(
  imageUrl: string | undefined | null,
  size = 32
): Promise<THREE.CanvasTexture> {
  if (!imageUrl) {
    return Promise.resolve(createDefaultRetroTexture(size));
  }

  if (textureCache.has(imageUrl)) {
    return Promise.resolve(textureCache.get(imageUrl)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallback = () => {
      const fallbackTex = createDefaultRetroTexture(size);
      textureCache.set(imageUrl, fallbackTex);
      resolve(fallbackTex);
    };

    const timer = setTimeout(fallback, 2500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          fallback();
          return;
        }

        ctx.imageSmoothingEnabled = false;

        // Draw downscaled image into 32x32
        ctx.drawImage(img, 0, 0, size, size);

        // Optional slight pixel-art enhancement: dark border & center hole
        ctx.strokeStyle = '#05070a';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);

        const mid = size / 2;
        ctx.fillStyle = '#05070a';
        ctx.beginPath();
        ctx.arc(mid, mid, 2, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;

        textureCache.set(imageUrl, texture);
        resolve(texture);
      } catch (_err) {
        fallback();
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      fallback();
    };

    img.src = imageUrl;
  });
}
