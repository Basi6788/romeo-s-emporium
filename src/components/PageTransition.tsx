import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const shape = shapeRef.current;

    if (!container || !overlay || !shape) return;

    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.set(container, { opacity: 1, y: 0 });
      gsap.set(overlay, { scaleY: 0 });
      gsap.set(shape, { scale: 0, opacity: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Reveal animation - wipe up
      tl.set(overlay, { scaleY: 1, transformOrigin: 'bottom' })
        .set(shape, { scale: 0, opacity: 1 })
        .set(container, { opacity: 0, y: 30 });

      // Shape pulse animation
      tl.to(shape, {
        scale: 1.5,
        duration: 0.3,
        ease: 'power2.out'
      })
      .to(shape, {
        scale: 0,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      }, '+=0.1');

      // Overlay wipe animation
      tl.to(overlay, { 
        scaleY: 0, 
        duration: 0.5, 
        ease: 'power3.inOut' 
      }, '-=0.3');

      // Content fade in
      tl.to(container, { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        ease: 'power2.out' 
      }, '-=0.3');
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <>
      {/* Transition overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9999] pointer-events-none origin-bottom"
        style={{ transform: 'scaleY(0)' }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-primary" />
        
        {/* Animated pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                              radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>
      
      {/* Center shape */}
      <div 
        ref={shapeRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none"
        style={{ transform: 'scale(0)', opacity: 0 }}
      >
        <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/50" />
        </div>
      </div>
      
      {/* Page content */}
      <div ref={containerRef} style={{ opacity: 1 }}>
        {children}
      </div>
    </>
  );
};

export default PageTransition;
