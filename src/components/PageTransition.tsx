import React, { useRef, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, OrbitControls } from '@react-three/drei';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Three.js Particle Component
const FloatingParticles = () => {
  const meshRef = useRef<THREE.Points>(null);
  const count = 1000;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 10;
    positions[i + 1] = (Math.random() - 0.5) * 10;
    positions[i + 2] = (Math.random() - 0.5) * 10;
    
    colors[i] = Math.random();
    colors[i + 1] = Math.random() * 0.5;
    colors[i + 2] = Math.random() + 0.5;
  }

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
      />
    </points>
  );
};

// Glass Sphere Component
const GlassSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={1}
      floatIntensity={2}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshWobbleMaterial
          color="#ffffff"
          emissive="#4f46e5"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0}
          transmission={0.9}
          thickness={3}
        />
      </mesh>
    </Float>
  );
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const glassOverlayRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [showThreeScene, setShowThreeScene] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!isFirstRender.current) {
        // Initial state for transition
        gsap.set(containerRef.current, { 
          opacity: 0,
          scale: 0.92,
          y: 40,
          rotateX: 5,
          rotateY: 2,
          filter: 'blur(15px)',
          transformOrigin: 'center center',
          transformPerspective: 1000,
        });
        
        gsap.set(overlayRef.current, { 
          scaleY: 1, 
          opacity: 1,
          transformOrigin: 'top center' 
        });
        
        gsap.set(glassOverlayRef.current, {
          opacity: 1,
          scale: 1,
          rotate: 0,
          transformOrigin: 'center center'
        });
        
        gsap.set(particlesRef.current, {
          opacity: 1,
          scale: 1
        });

        // Show Three.js scene during transition
        setShowThreeScene(true);
      }

      const tl = gsap.timeline({
        defaults: { 
          ease: 'power4.inOut',
          duration: 0.8 
        }
      });

      if (isFirstRender.current) {
        // First load animation
        tl.fromTo(
          containerRef.current,
          { 
            opacity: 0, 
            y: 60,
            scale: 0.95,
            rotateX: 3,
            filter: 'blur(10px)'
          },
          { 
            opacity: 1, 
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'expo.out'
          }
        )
        .fromTo(
          '.page-content > *',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 },
          '-=0.4'
        );
        
        isFirstRender.current = false;
      } else {
        // Page transition animation sequence
        
        // Step 1: Liquid glass overlay animation
        tl.to(glassOverlayRef.current, {
          scale: 1.2,
          rotate: 5,
          duration: 0.5,
          ease: 'power2.inOut'
        })
        .to(glassOverlayRef.current, {
          scale: 1,
          rotate: -5,
          duration: 0.5,
          ease: 'power2.inOut'
        }, '+=0.1')
        
        // Step 2: Particle explosion
        .to(particlesRef.current, {
          scale: 1.5,
          opacity: 0.8,
          duration: 0.4,
          ease: 'power2.out'
        })
        
        // Step 3: Overlay transition
        .to(overlayRef.current, {
          scaleY: 0,
          duration: 0.8,
          ease: 'expo.inOut',
          transformOrigin: 'bottom center'
        }, '-=0.3')
        
        // Step 4: Page content reveal
        .to(containerRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'elastic.out(1, 0.5)'
        }, '-=0.6')
        
        // Step 5: Hide overlay and particles
        .to([glassOverlayRef.current, particlesRef.current], {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        }, '-=0.2')
        
        // Step 6: Content stagger animation
        .fromTo(
          '.page-content > *',
          { y: 30, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            stagger: 0.08, 
            duration: 0.6,
            ease: 'back.out(1.7)'
          },
          '-=0.4'
        );
      }
    });

    // Hide Three.js scene after transition
    const timer = setTimeout(() => {
      setShowThreeScene(false);
    }, 2000);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-transparent">
      {/* Three.js Background Canvas */}
      {showThreeScene && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <FloatingParticles />
            <GlassSphere />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate />
          </Canvas>
        </div>
      )}

      {/* Liquid Glass Overlay */}
      <div 
        ref={glassOverlayRef}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15), transparent 70%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 80%)',
        }}
      />

      {/* Animated Particles Overlay */}
      <div 
        ref={particlesRef}
        className="fixed inset-0 z-50 pointer-events-none opacity-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(139, 92, 246, 0.1) 100%)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />

      {/* Main Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[60] bg-gradient-to-br from-primary/10 via-violet-500/10 to-emerald-400/10 backdrop-blur-3xl pointer-events-none"
        style={{ transform: 'scaleY(0)' }}
      >
        {/* Animated Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Loading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[70] pointer-events-none">
        <div 
          className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{
            animation: 'loadingBar 2s ease-in-out infinite',
            maskImage: 'linear-gradient(to right, transparent 0%, white 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Page Content Container */}
      <div 
        ref={containerRef} 
        className="relative w-full will-change-transform backface-hidden transform-3d"
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        {/* Page Wrapper with Glass Effect */}
        <div className="relative page-content min-h-screen">
          {/* Frosted Glass Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-2xl" />
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)
                `,
              }}
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes loadingBar {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        .transform-3d {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .page-content > * {
          will-change: transform, opacity;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Performance optimizations */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default PageTransition;