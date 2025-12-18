import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay) return;

    const tl = gsap.timeline();

    // Page enter animation
    tl.set(overlay, { scaleY: 1, transformOrigin: 'top' })
      .to(overlay, { scaleY: 0, duration: 0.5, ease: 'power3.inOut' })
      .fromTo(container, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 
        '-=0.2'
      );

    return () => {
      tl.kill();
    };
  }, [location.pathname]);

  return (
    <>
      {/* Transition overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9999] bg-primary pointer-events-none origin-top"
        style={{ transform: 'scaleY(0)' }}
      />
      {/* Page content */}
      <div ref={containerRef}>
        {children}
      </div>
    </>
  );
};

export default PageTransition;
