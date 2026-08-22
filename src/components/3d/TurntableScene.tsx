import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { VinylRecord } from './VinylRecord';
import { Tonearm } from './Tonearm';
import { TurntableBase } from './TurntableBase';
import { EnvironmentLights } from './EnvironmentLights';

interface TurntableSceneProps {
  isPlaying: boolean;
  albumArtUrl: string;
}

// Camera drift container inside canvas context
const CameraDriftController: React.FC = () => {
  const controlsRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (controlsRef.current) {
      const time = clock.getElapsedTime();
      // Subtle continuous camera drift
      controlsRef.current.setAzimuthalAngle(Math.sin(time * 0.25) * 0.08);
      controlsRef.current.setPolarAngle(Math.PI / 4 + Math.cos(time * 0.2) * 0.03);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={4.5}
      maxDistance={8.5}
      minPolarAngle={Math.PI / 6} // ~30 deg
      maxPolarAngle={Math.PI / 2.4} // ~75 deg
      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  );
};

export const TurntableScene: React.FC<TurntableSceneProps> = ({ isPlaying, albumArtUrl }) => {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 4.2, 5.2], fov: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#07070a']} />

        {/* Ambient & Directional Lights */}
        <EnvironmentLights />

        {/* 3D Turntable Scene Components */}
        <group position={[0, -0.3, 0]} rotation={[0, -0.15, 0]}>
          <TurntableBase />
          <VinylRecord isPlaying={isPlaying} albumArtUrl={albumArtUrl} />
          <Tonearm isPlaying={isPlaying} />

          {/* Contact Shadows for Realistic Grounding */}
          <ContactShadows
            position={[0, -0.22, 0]}
            opacity={0.7}
            scale={8}
            blur={2.5}
            far={4}
            color="#000000"
          />
        </group>

        {/* Camera Drift & Orbit Controls */}
        <CameraDriftController />
      </Canvas>

      {/* Decorative Subtle Corner Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-40" />
    </div>
  );
};
