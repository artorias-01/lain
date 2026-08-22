import React from 'react';

export const TurntableBase: React.FC = () => {
  return (
    <group position={[0, -0.2, 0]}>
      {/* Main Heavy Chassis Body (Brushed Dark Anodized Metal) */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[5.2, 0.45, 4.2]} />
        <meshStandardMaterial
          color="#121319"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Top Deck Surface Plate */}
      <mesh receiveShadow position={[0, 0.226, 0]}>
        <boxGeometry args={[5.14, 0.01, 4.14]} />
        <meshStandardMaterial
          color="#1a1c24"
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Metallic Chassis Bezel / Trim */}
      <mesh position={[0, 0.23, 0]}>
        <boxGeometry args={[5.22, 0.02, 4.22]} />
        <meshStandardMaterial color="#2a2d3a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Recessed Platter Well / Ring under vinyl */}
      <mesh position={[-0.8, 0.232, 0]}>
        <cylinderGeometry args={[2.3, 2.3, 0.02, 64]} />
        <meshStandardMaterial color="#0b0c0f" roughness={0.8} />
      </mesh>

      {/* Metallic Platter Edge (Strobe Dots Rim) */}
      <mesh position={[-0.8, 0.16, 0]}>
        <cylinderGeometry args={[2.24, 2.24, 0.14, 64]} />
        <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Rubber Slipmat Under Vinyl */}
      <mesh position={[-0.8, 0.236, 0]}>
        <cylinderGeometry args={[2.18, 2.18, 0.01, 64]} />
        <meshStandardMaterial color="#171821" roughness={0.9} />
      </mesh>

      {/* --- Turntable Deck Controls --- */}

      {/* Power Knob (Bottom-Left) */}
      <group position={[-2.1, 0.26, 1.6]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.1, 32]} />
          <meshStandardMaterial color="#2d303f" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      </group>

      {/* 33 / 45 RPM Buttons (Bottom-Left next to power) */}
      <group position={[-1.5, 0.25, 1.6]}>
        <mesh castShadow position={[-0.15, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.12]} />
          <meshStandardMaterial color="var(--accent-color, #ff9d00)" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0.15, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.12]} />
          <meshStandardMaterial color="#222532" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Pitch Fader Slider Housing (Right Side) */}
      <group position={[2.0, 0.24, 0.6]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.3, 0.02, 1.6]} />
          <meshStandardMaterial color="#0f1014" roughness={0.8} />
        </mesh>
        {/* Slot Line */}
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.03, 0.01, 1.4]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* Fader Handle Knob */}
        <mesh position={[0, 0.06, 0.1]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Branding Plate (Top Left Deck) */}
      <group position={[-1.8, 0.235, -1.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 0.22]} />
          <meshStandardMaterial color="#0f1014" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Four Isolation Feet Cushions */}
      <group position={[0, -0.26, 0]}>
        {[
          [-2.3, 1.8],
          [2.3, 1.8],
          [-2.3, -1.8],
          [2.3, -1.8],
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 0, z]} castShadow>
            <cylinderGeometry args={[0.28, 0.32, 0.16, 32]} />
            <meshStandardMaterial color="#08080a" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
