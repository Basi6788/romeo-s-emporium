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
  const isFirstRender = useRef(true);

  // 🔥 FIX: Yahan '/sso-callback' add kia hai jo AuthContext me use ho raha hai
  const isAuthCallback = 
    location.pathname.includes('/sso-callback') || 
    location.pathname.includes('/auth/callback') || 
    location.pathname.includes('/sign-in') || 
    location.pathname.includes('/sign-up');

  useLayoutEffect(() => {
    // Agar Auth Callback hai, to animation mat chalao, seedha dikhao
    if (isAuthCallback) {
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, y: 0, scale: 1, rotateX: 0, clearProps: "all" });
      }
      if (overlayRef.current) gsap.set(overlayRef.current, { scaleY: 0 });
      if (loadingLineRef.current) gsap.set(loadingLineRef.current, { scaleX: 0 });
      return; 
    }

    const ctx = gsap.context(() => {
      // Normal animation logic
      if (!isFirstRender.current) {
        gsap.set(containerRef.current, { 
          opacity: 0, 
          scale: 0.96, 
          y: 20, 
          rotateX: 2,
          transformOrigin: 'center top'
        });
        
        gsap.set(overlayRef.current, { scaleY: 1, transformOrigin: 'bottom' });
        gsap.set(loadingLineRef.current, { scaleX: 0, transformOrigin: 'left' });
      }

      const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

      if (isFirstRender.current) {
        tl.fromTo(
          containerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
        isFirstRender.current = false;
      } else {
        tl.to(loadingLineRef.current, {
          scaleX: 1,
          duration: 0.4,
          ease: 'expo.inOut'
        })
        .to(overlayRef.current, {
          scaleY: 0,
          duration: 0.8,
          ease: 'expo.inOut',
          transformOrigin: 'top'
        })
        .to(containerRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          clearProps: "transform"
        }, "-=0.6");
      }
    });

    return () => ctx.revert();
  }, [location.pathname, isAuthCallback]);

  return (
    <div className="relative w-full overflow-x-hidden bg-background">
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[50] bg-foreground pointer-events-none"
        style={{ transform: 'scaleY(0)' }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent_70%)]" />
      </div>

      <div 
        ref={loadingLineRef}
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-emerald-400 z-[60] pointer-events-none"
        style={{ transform: 'scaleX(0)' }}
      />

      <div 
        ref={containerRef} 
        className="w-full will-change-transform backface-hidden"
        style={{ perspective: '1000px' }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
