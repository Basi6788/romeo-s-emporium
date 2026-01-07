import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import LightModeScene from './LightModeScene';
import DarkModeScene from './DarkModeScene';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface SceneContainerProps {
  theme: 'light' | 'dark';
}

const SceneContainer = ({ theme }: SceneContainerProps) => {
  const sceneComponent = useMemo(() => {
    return theme === 'light' ? <LightModeScene /> : <DarkModeScene />;
  }, [theme]);

  // Animate scene transition
  useGSAP(() => {
    gsap.to('.scene-transition', {
      opacity: theme === 'light' ? 0.3 : 0.7,
      duration: 1,
      ease: 'power2.inOut'
    });
  }, [theme]);

  return (
    <div className="fixed inset-0 -z-10 scene-transition">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={theme === 'light' ? 0.5 : 0.3} />
          <pointLight position={[10, 10, 10]} intensity={theme === 'light' ? 1 : 0.8} />
          
          {sceneComponent}
          
          <Environment
            preset={theme === 'light' ? 'sunset' : 'night'}
            background={false}
          />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SceneContainer;