import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createVinylGrooveTexture } from './textureUtils';

interface VinylRecordProps {
  isPlaying: boolean;
  albumArtUrl: string;
}

export const VinylRecord: React.FC<VinylRecordProps> = ({ isPlaying, albumArtUrl }) => {
  const recordGroupRef = useRef<THREE.Group>(null);
  const currentSpeedRef = useRef<number>(0);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  // Center album label texture
  const labelTexture = useMemo(() => {
    return textureLoader.load(albumArtUrl);
  }, [albumArtUrl, textureLoader]);

  // Vinyl groove bump texture
  const grooveBumpMap = useMemo(() => createVinylGrooveTexture(), []);

  useFrame((_, delta) => {
    if (!recordGroupRef.current) return;

    // Target spin speed: ~3.4 rad/s (33 1/3 RPM) when active, 0 when idle
    const targetSpeed = isPlaying ? 3.4 : 0;
    
    // Inertial acceleration & deceleration lerp curve
    currentSpeedRef.current = THREE.MathUtils.lerp(
      currentSpeedRef.current,
      targetSpeed,
      isPlaying ? 0.04 : 0.02
    );

    // Continuous rotation
    if (currentSpeedRef.current > 0.0001) {
      recordGroupRef.current.rotation.y += currentSpeedRef.current * delta;
    }
  });

  return (
    <group ref={recordGroupRef} position={[-0.8, 0.12, 0]}>
      {/* Outer Vinyl Body */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#0f1015"
          roughness={0.25}
          metalness={0.8}
          bumpMap={grooveBumpMap}
          bumpScale={0.015}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Raised Vinyl Outer Rim / Bead */}
      <mesh position={[0, 0.032, 0]}>
        <ringGeometry args={[2.16, 2.2, 64]} />
        <meshStandardMaterial color="#16171d" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Center Label Area (Top Face) */}
      <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 64]} />
        <meshStandardMaterial
          map={labelTexture}
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center Label Outer Border Ring */}
      <mesh position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.74, 0.77, 64]} />
        <meshStandardMaterial color="#1a1c23" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Center Spindle Hole */}
      <mesh position={[0, 0.036, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 32]} />
        <meshStandardMaterial color="#050507" roughness={0.9} />
      </mesh>
    </group>
  );
};
