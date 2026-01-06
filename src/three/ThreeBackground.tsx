import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';

function FloatingBlob() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    mesh.current.rotation.x = clock.elapsedTime * 0.1;
    mesh.current.rotation.y = clock.elapsedTime * 0.15;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1}>
      <mesh ref={mesh} scale={2.8}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#ffb4b4"
          roughness={0.25}
          metalness={0.6}
          emissive="#ff7a7a"
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeBackground() {
  return (
    <Canvas
      className="fixed inset-0 -z-20"
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#fdecec']} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />

      <Environment preset="sunset" />

      <FloatingBlob />
    </Canvas>
  );
}