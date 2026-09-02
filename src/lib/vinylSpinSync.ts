import gsap from 'gsap';

// Shared rotation state across all vinyl elements in the app
let sharedAngle = 0;
const speedHolder = { speed: 0 };
const elements = new Set<HTMLElement>();

// Standard 33⅓ RPM feel: 360 degrees in 3.2 seconds => 112.5 deg/sec
const BASE_ROTATION_SPEED = 360 / 3.2;

// Drive continuous rotation via GSAP ticker
gsap.ticker.add((_time: number, deltaTime: number) => {
  if (speedHolder.speed > 0.0001) {
    const deltaSec = (deltaTime || 16.66) / 1000;
    sharedAngle = (sharedAngle + speedHolder.speed * BASE_ROTATION_SPEED * deltaSec) % 360;

    for (const el of elements) {
      gsap.set(el, { rotation: sharedAngle });
    }
  }
});

/**
 * Updates spinning momentum: accelerates on play, friction decelerates on pause
 */
export function setVinylPlaying(isPlaying: boolean) {
  gsap.killTweensOf(speedHolder);
  gsap.to(speedHolder, {
    speed: isPlaying ? 1 : 0,
    duration: isPlaying ? 0.75 : 0.95,
    ease: isPlaying ? 'power2.in' : 'power2.out',
  });
}

/**
 * Registers an HTML element to be continuously rotated in sync with all other vinyl discs
 */
export function registerVinylElement(el: HTMLElement | null): () => void {
  if (!el) return () => {};

  elements.add(el);
  // Synchronize immediately to current rotation angle
  gsap.set(el, { rotation: sharedAngle });

  return () => {
    elements.delete(el);
  };
}

/**
 * Returns current continuous rotation angle in degrees
 */
export function getSharedVinylAngle(): number {
  return sharedAngle;
}
