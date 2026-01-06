import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/hooks/useTheme';
import gsap from 'gsap';

// --- Light Mode Scene: Liquid Pastel Blobs ---
const LightModeScene = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle rotation
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    
    // Animate scale based on active state
    const targetScale = active ? 1.5 : 0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[2, 0, -2]}>
        <sphereGeometry args={[2, 64, 64]} />
        <MeshDistortMaterial 
          color="#FFB7C5" 
          attach="material" 
          distort={0.6} 
          speed={1.5} 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[-2, -2, -3]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <MeshDistortMaterial 
          color="#FFE4E1" 
          distort={0.4} 
          speed={2} 
        />
      </mesh>
    </Float>
  );
};

// --- Dark Mode Scene: Neon Particles ---
const DarkModeScene = ({ active }: { active: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if(!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    
    // Fade logic
    const targetOpacity = active ? 1 : 0;
    groupRef.current.children.forEach((child: any) => {
       if(child.material) child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.05);
    });
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4fd1c5" />
    </group>
  );
};

// --- Main Canvas Container ---
const SceneContainer = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 w-full h-full -z-10 transition-colors duration-1000 ease-in-out"
         style={{ background: isLight ? '#FFF0F3' : '#0a0a0a' }}>
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        
        <LightModeScene active={isLight} />
        <DarkModeScene active={!isLight} />
      </Canvas>
    </div>
  );
};

export default SceneContainer;
