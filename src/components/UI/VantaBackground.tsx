import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const VantaBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    // Disable ambient background on mobile or low-power devices for max performance
    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || prefersReducedMotion) {
      setIsDisabled(true);
      return;
    }

    if (!containerRef.current) return;

    // Lightweight Three.js Ambient Floating Particles (Vanta Net/Waves equivalent)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    containerRef.current.appendChild(renderer.domElement);

    // Particle nodes
    const count = 75;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 500;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.2,
      });
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff9d00,
      size: 3,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Network lines geometry
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff9d00,
      transparent: true,
      opacity: 0.08,
    });

    let lineMesh: THREE.LineSegments | null = null;

    let animFrameId: number;

    const animate = () => {
      const posArr = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        posArr[i * 3] += velocities[i].x;
        posArr[i * 3 + 1] += velocities[i].y;
        posArr[i * 3 + 2] += velocities[i].z;

        if (Math.abs(posArr[i * 3]) > 400) velocities[i].x *= -1;
        if (Math.abs(posArr[i * 3 + 1]) > 250) velocities[i].y *= -1;
        if (Math.abs(posArr[i * 3 + 2]) > 200) velocities[i].z *= -1;
      }

      geometry.attributes.position.needsUpdate = true;

      // Connect nearby nodes with ambient lines
      const linePositions: number[] = [];
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = posArr[i * 3] - posArr[j * 3];
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 130) {
            linePositions.push(
              posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2],
              posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]
            );
          }
        }
      }

      if (lineMesh) scene.remove(lineMesh);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineMesh = new THREE.LineSegments(lineGeo, lineMaterial);
      scene.add(lineMesh);

      particles.rotation.y += 0.0005;

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (isDisabled) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60"
    />
  );
};
