import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioManager } from '../../lib/audioManager';

interface TonearmProps {
  isPlaying: boolean;
}

export const Tonearm: React.FC<TonearmProps> = ({ isPlaying }) => {
  // Pivot group rotates horizontally (Y-axis) and tilts vertically (Z-axis)
  const tonearmPivotRef = useRef<THREE.Group>(null);
  const armTubeRef = useRef<THREE.Group>(null);

  // Smooth angle tracking refs
  const currentAngleY = useRef<number>(0.65); // Rest angle (swung out)
  const currentLiftZ = useRef<number>(0.12);  // Lifted up angle

  // Pivot base position: [1.6, 0.35, -0.7]
  // Outer vinyl edge landing angle ~ 0.12 rad, Inner vinyl edge landing angle ~ -0.15 rad
  const REST_ANGLE_Y = 0.65;
  const OUTER_GROOVE_ANGLE_Y = 0.15;
  const INNER_GROOVE_ANGLE_Y = -0.12;
  const REST_LIFT_Z = 0.12;   // Arm lifted high off surface
  const PLAY_LIFT_Z = -0.015;  // Arm stylus lowered onto record surface

  useFrame((_, delta) => {
    if (!tonearmPivotRef.current) return;

    // Calculate current track progress ratio (0.0 to 1.0)
    let progressRatio = 0;
    if (audioManager.durationRef.current > 0) {
      progressRatio = Math.min(1, Math.max(0, audioManager.currentTimeRef.current / audioManager.durationRef.current));
    }

    // Target Y angle (swing): if playing, lerp from outer to inner groove based on progress
    const targetAngleY = isPlaying
      ? OUTER_GROOVE_ANGLE_Y - progressRatio * (OUTER_GROOVE_ANGLE_Y - INNER_GROOVE_ANGLE_Y)
      : REST_ANGLE_Y;

    // Target Z angle (lift): drop only when Y angle is near target position over vinyl
    const isOverVinyl = Math.abs(currentAngleY.current - targetAngleY) < 0.25 || isPlaying;
    const targetLiftZ = (isPlaying && isOverVinyl) ? PLAY_LIFT_Z : REST_LIFT_Z;

    // Smooth Spring/Lerp step (dt-independent smooth lerp)
    const lerpFactorY = isPlaying ? 3.5 * delta : 4.5 * delta;
    const lerpFactorZ = isPlaying ? 2.8 * delta : 5.0 * delta;

    currentAngleY.current = THREE.MathUtils.lerp(currentAngleY.current, targetAngleY, Math.min(1, lerpFactorY));
    currentLiftZ.current = THREE.MathUtils.lerp(currentLiftZ.current, targetLiftZ, Math.min(1, lerpFactorZ));

    // Apply rotations
    tonearmPivotRef.current.rotation.y = currentAngleY.current;
    if (armTubeRef.current) {
      armTubeRef.current.rotation.z = currentLiftZ.current;
    }
  });

  return (
    <group position={[1.6, 0.35, -0.7]}>
      {/* Fixed Turntable Arm Base Column & Cueing Lever Assembly */}
      <group position={[0, -0.15, 0]}>
        {/* Outer Gimbal Collar */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.28, 0.25, 32]} />
          <meshStandardMaterial color="#1f2128" metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* Brass Ring Trim */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Arm Rest Post (Pin off to side) */}
        <group position={[0.25, 0.2, 0.15]} rotation={[0, -0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.25, 16]} />
            <meshStandardMaterial color="#2d303e" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
            <meshStandardMaterial color="#111217" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Rotating Pivot Assembly */}
      <group ref={tonearmPivotRef}>
        {/* Gimbal Housing Ring */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.15, 32, 16]} />
          <meshStandardMaterial color="#333745" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Rear Counterweight Bar */}
        <group position={[0, 0.1, 0.35]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
            <meshStandardMaterial color="#252834" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Heavy Brass Counterweight Ring */}
          <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 32]} />
            <meshStandardMaterial color="#e5c158" metalness={0.98} roughness={0.1} />
          </mesh>

          {/* Tracking Weight Dial */}
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.04, 32]} />
            <meshStandardMaterial color="#0b0c0e" roughness={0.6} />
          </mesh>
        </group>

        {/* Vertical Tilting Arm Tube */}
        <group ref={armTubeRef} position={[0, 0.1, 0]}>
          {/* Curved S-Shaped Chrome Tonearm Tube */}
          {/* Section 1: Main Forward Tube */}
          <mesh position={[0, 0.05, -0.9]} rotation={[-0.05, 0, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 1.8, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.08} />
          </mesh>

          {/* Headshell & Cartridge Assembly at end of arm */}
          <group position={[0, 0.02, -1.82]} rotation={[0.08, -0.15, 0]}>
            {/* Headshell Plate */}
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.03, 0.28]} />
              <meshStandardMaterial color="#1e2029" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Cartridge (Ortofon Style) */}
            <mesh position={[0, -0.04, -0.02]} castShadow>
              <boxGeometry args={[0.09, 0.05, 0.16]} />
              <meshStandardMaterial color="var(--accent-color, #ff9d00)" roughness={0.3} metalness={0.4} />
            </mesh>

            {/* Stylus Needle Shaft */}
            <mesh position={[0, -0.08, -0.06]} rotation={[0.4, 0, 0]}>
              <coneGeometry args={[0.015, 0.06, 8]} />
              <meshStandardMaterial color="#f8fafc" metalness={1.0} roughness={0.05} />
            </mesh>

            {/* Stylus Glowing Tip Indicator */}
            <mesh position={[0, -0.1, -0.07]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color={isPlaying ? '#54efff' : '#64748b'} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
