import { ShoppingBag } from 'lucide-react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

const FloatingCart = ({ total = 1099.00, count = 2 }) => {
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation
    gsap.from(cartRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
      delay: 1
    });
  }, []);

  return (
    <div 
      ref={cartRef}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-pointer group"
    >
      <div className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl hover:scale-105 transition-transform duration-300">
        <span className="font-semibold text-sm tracking-wide">${total.toFixed(2)}</span>
        <div className="w-px h-4 bg-white/20"></div>
        <div className="relative">
          <ShoppingBag size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-black">
            {count}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FloatingCart;
