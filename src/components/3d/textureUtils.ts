import * as THREE from 'three';

/**
 * Creates a procedural circular grooved bump texture for realistic vinyl reflections
 */
export const createVinylGrooveTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const cx = 512;
  const cy = 512;
  const maxRadius = 500;
  const minRadius = 180;

  // Dark vinyl background
  ctx.fillStyle = '#101012';
  ctx.fillRect(0, 0, 1024, 1024);

  // Concentric vinyl grooves with slight intensity variation
  ctx.fillStyle = '#000000';
  for (let r = minRadius; r < maxRadius; r += 1.5) {
    const intensity = 0.3 + Math.sin(r * 0.15) * 0.2 + (Math.random() * 0.1);
    ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
    ctx.lineWidth = 0.8 + (r % 3 === 0 ? 0.4 : 0);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Lead-out runout grooves spacing near center
    if (r < 220 && r > minRadius) {
      r += 2;
    }
  }

  // Radial micro-scratches/sheen effect
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2;
    const opacity = 0.02 + Math.random() * 0.03;
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * minRadius, cy + Math.sin(angle) * minRadius);
    ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};
