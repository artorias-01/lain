import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { getSharedVinylAngle, setVinylPlaying } from '../../lib/vinylSpinSync';
import { loadPixelatedTexture, createDefaultRetroTexture } from '../../lib/pixelArtTexture';

interface DiscMeshProps {
  texture: THREE.CanvasTexture | null;
}

const DiscMesh: React.FC<DiscMeshProps> = ({ texture }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Sync continuous rotation with centralized vinylSpinSync physics
  useFrame(() => {
    if (groupRef.current) {
      const angleRad = -(getSharedVinylAngle() * Math.PI) / 180;
      groupRef.current.rotation.y = angleRad;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Grooved Vinyl Disc (Flattened Cylinder) */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.08, 28]} />
        <meshStandardMaterial
          color="#0d1117"
          roughness={0.8}
          metalness={0.2}
          flatShading={true}
        />
      </mesh>

      {/* Raised Grooved Rim Ring */}
      <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.95, 24]} />
        <meshBasicMaterial color="#161e2b" />
      </mesh>

      {/* Inner Accent Groove Line */}
      <mesh position={[0, 0.043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.54, 24]} />
        <meshBasicMaterial color="#212b3d" />
      </mesh>

      {/* Center Label (Masked Pixelated Album Art) */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 24]} />
        <meshBasicMaterial
          map={texture || undefined}
          color={texture ? '#ffffff' : '#00f0ff'}
        />
      </mesh>

      {/* Center Spindle Hole / Ring */}
      <mesh position={[0, 0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.16, 16]} />
        <meshBasicMaterial color="#ffb800" />
      </mesh>

      <mesh position={[0, 0.049, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 12]} />
        <meshBasicMaterial color="#05070a" />
      </mesh>
    </group>
  );
};

interface PixelVinyl3DProps {
  thumbnailUrl?: string;
  isPlaying: boolean;
  className?: string;
  size?: number;
}

export const PixelVinyl3D: React.FC<PixelVinyl3DProps> = ({
  thumbnailUrl,
  isPlaying,
  className = '',
  size = 200,
}) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  // Sync isPlaying state to physics controller
  useEffect(() => {
    setVinylPlaying(isPlaying);
  }, [isPlaying]);

  // Load and downscale artwork into 32x32 pixel texture with NearestFilter
  useEffect(() => {
    let isMounted = true;
    if (!thumbnailUrl) {
      setTexture(createDefaultRetroTexture(32));
      return;
    }

    loadPixelatedTexture(thumbnailUrl, 32).then((tex) => {
      if (isMounted) {
        setTexture(tex);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [thumbnailUrl]);

  return (
    <div
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
      className={`relative select-none overflow-hidden flex items-center justify-center ${className}`}
    >
      <Canvas
        // Low DPR creates real chunky hardware pixels rendered onto the canvas
        dpr={0.25}
        gl={{
          antialias: false,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      >
        {/* Retro Isometric Camera angle */}
        <OrthographicCamera
          makeDefault
          position={[0, 3.2, 3.6]}
          rotation={[-0.72, 0, 0]}
          zoom={42}
        />

        {/* Ambient + Directional Retro Lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 5, 2]} intensity={0.8} />

        <DiscMesh texture={texture} />
      </Canvas>
    </div>
  );
};
