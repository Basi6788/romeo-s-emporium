import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '@/theme/themeStore';

export const FloatingCard = ({ position, rotation, textureUrl, scale = 1 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { isDarkMode } = useThemeStore();

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle floating animation
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
    meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y += 0.001;
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[2, 3, 0.1]} // Width, Height, Depth
      radius={0.1}
      smoothness={4}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshStandardMaterial
        color={isDarkMode ? "#1a1a1a" : "#ffffff"}
        roughness={0.4}
        metalness={0.1}
      />
    </RoundedBox>
  );
};
