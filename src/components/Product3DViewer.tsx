import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Product3DViewerProps {
  productImage: string;
  color?: string;
}

const ProductBox = ({ color = '#8B5CF6' }: { color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <RoundedBox
        ref={meshRef}
        args={[2.5, 3, 0.3]}
        radius={0.15}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.1}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </RoundedBox>
    </Float>
  );
};

const GlowingOrb = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const Scene = ({ color }: { color?: string }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={1}
        color="#F59E0B"
      />
      
      <ProductBox color={color} />
      
      <GlowingOrb position={[1.5, 1, 0.5]} color="#8B5CF6" />
      <GlowingOrb position={[-1.5, -0.5, 0.5]} color="#10B981" />
      <GlowingOrb position={[0, 1.5, 1]} color="#F59E0B" />
      
      <Environment preset="city" />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const Product3DViewer: React.FC<Product3DViewerProps> = ({ productImage, color }) => {
  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-background via-muted to-background border border-border/30">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene color={color} />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-xs text-muted-foreground">Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default Product3DViewer;