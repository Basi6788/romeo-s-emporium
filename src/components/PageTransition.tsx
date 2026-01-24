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
  const isFirstRender = useRef(true);

  // Auth pages par animation disable rakho taake user fast access kare
  const isAuthCallback = 
    location.pathname.includes('/sso-callback') || 
    location.pathname.includes('/auth') || 
    location.pathname.includes('/sign-in') || 
    location.pathname.includes('/sign-up');

  useLayoutEffect(() => {
    // Agar Auth page hai to animation skip karo aur direct show karo
    if (isAuthCallback) {
      if (containerRef.current) gsap.set(containerRef.current, { opacity: 1, y: 0 });
      if (overlayRef.current) gsap.set(overlayRef.current, { scaleY: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' } // Smooth easing curve
      });

      // --- 1. Initial State Setup ---
      // Content ko thora neeche aur transparent rakho
      gsap.set(containerRef.current, { 
        y: 40, 
        opacity: 0,
        scale: 0.98 // Halki si depth feel
      });

      // Overlay ko screen par phaila do (Full Cover)
      // Hum scaleY use karenge kyunki height animate karna heavy hota hai
      if (!isFirstRender.current) {
        gsap.set(overlayRef.current, { 
          scaleY: 1, 
          transformOrigin: 'bottom' // Neeche se start hoga
        });
      }

      // --- 2. Animation Sequence ---
      
      // Step A: Overlay Upar se gayab hoga (Revealing the content)
      tl.to(overlayRef.current, {
        scaleY: 0,
        duration: 0.8,
        ease: 'expo.inOut',
        transformOrigin: 'top' // Opar ki taraf shrink hoga
      })
      // Step B: Content neeche se upar slide karega smoothly
      .to(containerRef.current, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power4.out', // End mein slow stop (Premium feel)
        clearProps: "all"   // Animation ke baad cleanup zaroori hai
      }, "-=0.6"); // Ye overlay ke khatam hone se pehle shuru hoga (Overlap)

      isFirstRender.current = false;
    }, containerRef);

    return () => ctx.revert();
  }, [location.pathname, isAuthCallback]);

  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden">
      
      {/* 1. The Curtain (Overlay) - Pure Black/Foreground for Reveal */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[50] bg-black pointer-events-none"
        style={{ transform: 'scaleY(0)', willChange: 'transform' }} // Optimized for GPU
      />

      {/* 2. Main Content Container */}
      <div 
        ref={containerRef} 
        className="w-full relative z-0"
        style={{ willChange: 'transform, opacity' }} // Optimized
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;

