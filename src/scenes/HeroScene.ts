import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { FloatingCard } from '@/three/objects/FloatingCards';
import { useThemeStore } from '@/theme/themeStore';
import gsap from 'gsap';
import * as THREE from 'three';

interface HeroSceneProps {
  scrollProgress: number; // 0 to 1
}

const HeroScene = ({ scrollProgress }: HeroSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { isDarkMode } = useThemeStore();

  // Scroll/Swipe effect on the entire 3D group
  useFrame(() => {
    if (groupRef.current) {
      // Rotate group based on scroll/interaction
      // Jab user scroll karega, 3D cards peeche fade honge aur rotate karenge
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, scrollProgress * Math.PI, 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, -scrollProgress * 5, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Center Hero Card */}
      <FloatingCard position={[0, 0, 0]} rotation={[0, -0.2, 0]} scale={1.2} />
      
      {/* Background/Side Cards */}
      <FloatingCard position={[-3, 1, -2]} rotation={[0, 0.4, 0.2]} scale={0.8} />
      <FloatingCard position={[3, -1, -2]} rotation={[0, -0.4, -0.2]} scale={0.8} />

      {/* Ambient Light for Scene */}
      <ambientLight intensity={isDarkMode ? 0.2 : 0.7} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={isDarkMode ? "#4f46e5" : "#ff9a9e"} />
    </group>
  );
};

export default HeroScene;
