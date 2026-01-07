import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D, Center } from '@react-three/drei';

const LightModeScene = () => {
  const shapesRef = useRef<Mesh[]>([]);

  useFrame((state) => {
    shapesRef.current.forEach((shape, i) => {
      if (shape) {
        shape.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
        shape.rotation.y = Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.1;
      }
    });
  });

  return (
    <>
      {/* Floating abstract shapes */}
      <Float speed={2} rotationIntensity={0.5}>
        <mesh
          ref={(el) => el && (shapesRef.current[0] = el)}
          position={[-3, 1, -2]}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#FFD1D1"
            emissive="#FFD1D1"
            emissiveIntensity={0.2}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.8}>
        <mesh
          ref={(el) => el && (shapesRef.current[1] = el)}
          position={[3, -1, -1]}
        >
          <torusKnotGeometry args={[0.8, 0.2, 128, 16]} />
          <meshStandardMaterial
            color="#FFF0F0"
            emissive="#FFF0F0"
            emissiveIntensity={0.1}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={0.3}>
        <mesh
          ref={(el) => el && (shapesRef.current[2] = el)}
          position={[0, 2, -3]}
        >
          <dodecahedronGeometry args={[0.6]} />
          <meshStandardMaterial
            color="#FFB6C1"
            emissive="#FFB6C1"
            emissiveIntensity={0.3}
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      </Float>

      {/* Subtle text in background */}
      <Center position={[0, -3, -10]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.2}
          curveSegments={12}
        >
          New Arrivals
          <meshStandardMaterial
            color="#FFD1D1"
            emissive="#FFD1D1"
            emissiveIntensity={0.1}
            transparent
            opacity={0.3}
          />
        </Text3D>
      </Center>
    </>
  );
};

export default LightModeScene;