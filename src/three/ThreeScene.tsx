import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import HeroScene from '@/scenes/HeroScene';
import { useThemeStore } from '@/theme/themeStore';

const ThreeScene = ({ scrollY }: { scrollY: number }) => {
  const { isDarkMode } = useThemeStore();
  
  // Convert scrollY to a normalized 0-1 value for animations
  const scrollProgress = Math.min(scrollY / 1000, 1);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        <Suspense fallback={null}>
          <HeroScene scrollProgress={scrollProgress} />
          
          {/* Environment Lighting */}
          <Environment preset={isDarkMode ? "night" : "city"} />
          
          {/* Dynamic Background Color */}
          <color attach="background" args={[isDarkMode ? '#0f172a' : '#ffe4e6']} /> {/* Pinkish for Light, Dark for Dark mode */}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeScene;
