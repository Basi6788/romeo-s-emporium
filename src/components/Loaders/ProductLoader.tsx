import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const ProductLoader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    
    // Pulsating background
    tl.to(containerRef.current, {
      backgroundPosition: '200% 0',
      duration: 2,
      ease: 'none'
    });

    // Dots animation
    dotsRef.current.forEach((dot, i) => {
      if (dot) {
        gsap.to(dot, {
          y: -20,
          duration: 0.3,
          repeat: -1,
          yoyo: true,
          delay: i * 0.1,
          ease: 'power2.inOut'
        });
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative">
        {/* Main loader */}
        <div 
          ref={containerRef}
          className="w-64 h-64 rounded-2xl relative overflow-hidden bg-gradient-to-r from-transparent via-primary/20 to-transparent bg-[length:200%_100%]"
        >
          {/* Animated shapes */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-32 h-32">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  ref={el => dotsRef.current[i] = el}
                  className="absolute w-6 h-6 bg-primary rounded-full"
                  style={{
                    left: `${i * 24}px`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Text */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-lg font-semibold text-primary animate-pulse">
              Loading Amazing Deals...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Powered by AI Recommendations
            </p>
          </div>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductLoader;
