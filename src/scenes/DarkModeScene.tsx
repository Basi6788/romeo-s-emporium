import { useRef } from 'react';
import { Points, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';

const DarkModeScene = () => {
  const particlesRef = useRef<Points>(null);
  const neonShapeRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
    
    if (neonShapeRef.current) {
      neonShapeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      neonShapeRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  // Create particle system
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
    
    // Neon colors
    colors[i3] = Math.random() * 0.5 + 0.5; // R: 0.5-1.0
    colors[i3 + 1] = Math.random() * 0.3;    // G: 0-0.3
    colors[i3 + 2] = Math.random() * 0.8 + 0.2; // B: 0.2-1.0
  }

  return (
    <>
      {/* Particle System */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Stars Background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Neon Shapes */}
      <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
        <mesh ref={neonShapeRef} position={[0, 0, -5]}>
          <torusGeometry args={[2, 0.2, 32, 100]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </Float>

      {/* Additional floating neon elements */}
      {[-3, 3].map((x, i) => (
        <Float key={i} speed={2 + i} rotationIntensity={0.5}>
          <mesh position={[x, i * 2 - 1, -3]}>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial
              color={i === 0 ? '#ff00ff' : '#ffff00'}
              emissive={i === 0 ? '#ff00ff' : '#ffff00'}
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

export default DarkModeScene;