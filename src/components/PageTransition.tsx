import React, { useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const loadingLineRef = useRef<HTMLDivElement>(null);
  
  // Is ref se hum track karenge ke pehli baar load hua hai ya navigation hui hai
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Setups (Reset positions)
      if (!isFirstRender.current) {
        gsap.set(containerRef.current, { 
          opacity: 0, 
          scale: 0.96, 
          y: 20, 
          rotateX: 2, // 3D Tilt Effect
          transformOrigin: 'center top'
        });
        
        gsap.set(overlayRef.current, { scaleY: 1, transformOrigin: 'bottom' });
        gsap.set(loadingLineRef.current, { scaleX: 0, transformOrigin: 'left' });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power4.inOut' } // Luxury smooth ease
      });

      if (isFirstRender.current) {
        // First Load Animation (Subtle)
        tl.fromTo(containerRef.current, 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
        isFirstRender.current = false;
      } else {
        // Navigation Animation (The 3D "Whoosh" Effect)
        
        // Step 1: Loading Line shoots across
        tl.to(loadingLineRef.current, {
          scaleX: 1,
          duration: 0.4,
          ease: 'expo.inOut'
        })
        // Step 2: Overlay moves away quickly
        .to(overlayRef.current, {
          scaleY: 0,
          duration: 0.8,
          ease: 'expo.inOut',
          transformOrigin: 'top'
        })
        // Step 3: Page comes in with 3D Depth
        .to(containerRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          clearProps: "transform" // Animation ke baad transform hata do taake fixed elements blur na hon
        }, "-=0.6");
      }
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div className="relative w-full overflow-x-hidden bg-background">
      {/* 🔥 FIX: 'overflow-x-hidden' yahan zaroori hai.
        Yeh ensure karta hai ke transition ke doran koi bhi 
        element screen se bahar na nikle.
      */}

      {/* Luxury Overlay (The Curtain) */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9999] bg-foreground pointer-events-none"
        style={{ transform: 'scaleY(0)' }} // Hidden by default
      >
        {/* Abstract 3D Glass Effect inside overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent_70%)]" />
      </div>

      {/* High-Tech Loading Line (Top of screen) */}
      <div 
        ref={loadingLineRef}
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-emerald-400 z-[10000] pointer-events-none"
        style={{ transform: 'scaleX(0)' }}
      />
      
      {/* Main Content Container with 3D Perspective */}
      <div 
        ref={containerRef} 
        className="w-full min-h-screen will-change-transform backface-hidden"
        style={{ perspective: '1000px' }} // Gives that 3D depth feel
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
