"use client";
import React, { Suspense } from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, GradientTexture } from "@react-three/drei";

// --- Three.js Liquid Background Component ---
const CinematicBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        
        {/* Liquid Mesh Blob - Cinematic Look */}
        <Sphere args={[1.5, 64, 64]} scale={2.5}>
          <MeshDistortMaterial
            distort={0.4} // Liquid movement amount
            speed={2}     // Animation speed
            roughness={0.1}
            metalness={0.8}
          >
            <GradientTexture
              stops={[0, 0.5, 1]}
              colors={['#4338ca', '#7c3aed', '#db2777']} // Cinematic Purple-Pink-Blue
              size={1024}
            />
          </MeshDistortMaterial>
        </Sphere>
      </Canvas>
    </div>
  );
};

interface RoundedContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const RoundedContentWrapper = ({ children, className }: RoundedContentWrapperProps) => {
  return (
    <motion.div 
      // --- SWIPE ANIMATION (Cinematic Entry) ---
      initial={{ y: 150, opacity: 0, scale: 0.95 }}
      whileInView={{ y: 0, opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 1.5, 
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth cinematic feel
      }}
      className={cn(
        "relative w-full z-20 min-h-[500px] overflow-hidden",
        
        // --- LIQUID GLASS UI ---
        "bg-white/10 dark:bg-zinc-900/20", // Low opacity base
        "backdrop-blur-[120px] backdrop-saturate-150", // High blur for liquid effect
        "border-t border-white/20 dark:border-white/10", // Subtle top edge
        
        // Rounded Corners
        "rounded-t-[50px] md:rounded-t-[80px]",
        
        // Spacing & Shadow
        "-mt-12 md:-mt-20",
        "pt-16 pb-10 px-6",
        "shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.3)]",
        
        className
      )}
    >
      {/* Three.js Layer */}
      <Suspense fallback={null}>
        <CinematicBackground />
      </Suspense>

      {/* Overlay for extra softness */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 dark:to-black/20 pointer-events-none" />

      {/* Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {children}
      </div>
    </motion.div>
  );
};

export default RoundedContentWrapper;
