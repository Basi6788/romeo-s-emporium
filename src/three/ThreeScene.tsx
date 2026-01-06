import { Canvas } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { useThemeStore } from '@/theme/themeStore';
import FloatingCards from './objects/FloatingCards';

export default function ThreeScene() {
  const mode = useThemeStore(s => s.mode);

  return (
    <Canvas
      className="fixed inset-0 -z-10"
      camera={{ position: [0, 0, 6], fov: 45 }}
    >
      <color attach="background" args={[mode === 'dark' ? '#050505' : '#fdecec']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Environment preset={mode === 'dark' ? 'night' : 'sunset'} />

      <Float speed={1.5} rotationIntensity={0.6}>
        <FloatingCards />
      </Float>
    </Canvas>
  );
}
