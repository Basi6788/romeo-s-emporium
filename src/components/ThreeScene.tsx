import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Ek floating blob jo theme ke hisab se color change karega
const MorphingBlob = ({ isDark }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Thoda sa rotation aur movement
    meshRef.current.rotation.x = Math.cos(t / 4) / 2;
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={isDark ? "#2a2a2a" : "#ffb7b2"} // Dark mode vs Light mode color
          envMapIntensity={0.4}
          clearcoat={0.8}
          clearcoatRoughness={0}
          metalness={0.1}
          distort={0.4} // Blobby effect
          speed={2}
        />
      </mesh>
    </Float>
  );
};

// Particles jo background me float karenge
const Particles = ({ count = 50, isDark }) => {
    const points = useRef();
    
    useFrame((state) => {
        points.current.rotation.y += 0.001;
        points.current.rotation.x += 0.001;
    });

    return (
        <points ref={points}>
            <sphereGeometry args={[4, 32, 32]} />
            <pointsMaterial 
                size={0.02} 
                color={isDark ? "#ffffff" : "#ff6b6b"} 
                transparent 
                opacity={0.4} 
            />
        </points>
    );
}

const ThreeScene = ({ isDark }) => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        
        {/* Main Hero Object */}
        <group position={[1.5, 0, 0]}>
            <MorphingBlob isDark={isDark} />
        </group>

        {/* Floating Particles */}
        <Particles isDark={isDark} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
