import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { useRef, useEffect } from 'react';

interface FloatingCartProps {
  itemCount: number;
  total: number;
  theme: 'light' | 'dark';
}

const FloatingCart = ({ itemCount, total, theme }: FloatingCartProps) => {
  const cartRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (badgeRef.current) {
      gsap.fromTo(badgeRef.current,
        { scale: 0, rotation: 180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        }
      );
    }
  }, [itemCount]);

  const handleClick = () => {
    if (cartRef.current) {
      // Bounce animation
      gsap.to(cartRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });

      // Ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'absolute inset-0 rounded-full bg-primary/20';
      cartRef.current.appendChild(ripple);

      gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div ref={cartRef} className="relative">
        <Button
          className="cart-icon rounded-full px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300"
          onClick={handleClick}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <div
                  ref={badgeRef}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  {itemCount}
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium opacity-80">Total</div>
              <div className="text-xl font-bold">${total.toFixed(2)}</div>
            </div>
            <div className="ml-4">
              <div className="w-2 h-2 rounded-full bg-white/80 animate-ping" />
            </div>
          </div>
        </Button>

        {/* Floating particles */}
        {theme === 'dark' && (
          <>
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping opacity-60" />
            <div className="absolute -top-4 -right-4 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-60 delay-150" />
            <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60 delay-300" />
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingCart;