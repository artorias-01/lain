import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const EnvironmentLights: React.FC = () => {
  const rimLightRef = useRef<THREE.PointLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    // Subtle breathing/orbit drift for key light specular highlights on vinyl grooves
    if (rimLightRef.current) {
      rimLightRef.current.position.x = Math.sin(time * 0.4) * 1.2 - 2;
      rimLightRef.current.position.z = Math.cos(time * 0.4) * 1.2 + 2;
    }
  });

  return (
    <>
      {/* Ambient Fill */}
      <ambientLight intensity={0.6} />

      {/* Main Directional Key Light (Casts crisp vinyl groove shadows) */}
      <directionalLight
        ref={keyLightRef}
        position={[4, 7, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      {/* Sharp Rim/Specular Highlight Light (Makes grooves glisten) */}
      <pointLight
        ref={rimLightRef}
        position={[-3, 4, 3]}
        intensity={3.5}
        color="var(--accent-color, #ff9d00)"
        distance={15}
        decay={2}
      />

      {/* Soft Blue Under-Glow Fill Light */}
      <spotLight
        position={[0, 6, -4]}
        target-position={[0, 0, 0]}
        intensity={1.5}
        color="#38bdf8"
        angle={0.8}
        penumbra={1}
      />

      {/* Warm Stylus Point Light */}
      <pointLight position={[1.4, 0.6, -1.2]} intensity={0.8} color="#ffedd5" distance={3} />
    </>
  );
};
