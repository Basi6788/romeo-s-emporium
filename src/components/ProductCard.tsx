import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Plus, ShoppingBag, Lock, Zap } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner'; 
import gsap from 'gsap';

// --- MOCK AUTH (Replace with your Real Context) ---
const useMockAuth = () => {
  // ⚠️ Change this to true/false to test login logic
  const user = null; 
  return { user, isAuthenticated: !!user };
};

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  dominantColor?: string; // e.g., '#3b82f6' (Blue) or '#a855f7' (Purple)
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const { isAuthenticated } = useMockAuth();

  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);

  // Default color fallback (Blueish if not provided)
  const themeColor = product.dominantColor || '#3b82f6';

  // --- 1. INITIAL ENTRY ANIMATION ---
  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      gsap.fromTo(card, 
        { opacity: 0, y: 100, rotateX: -20 },
        { 
          opacity: 1, 
          y: 0, 
          rotateX: 0,
          duration: 1, 
          delay: index * 0.15, 
          ease: "elastic.out(1, 0.75)" 
        }
      );
    }
  }, [index]);

  // --- 2. HIGH SENSITIVITY 3D PARALLAX (Three.js Feel) ---
  useEffect(() => {
    const card = cardRef.current;
    const content = contentRef.current;
    const image = imageRef.current;
    const bgGlow = bgGlowRef.current;

    if (!card || !image || !content || !bgGlow) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // High Sensitivity Calculations
      const rotateX = ((y - centerY) / centerY) * -20; // 20 deg tilt (High)
      const rotateY = ((x - centerX) / centerX) * 20;

      // 1. Card Rotation
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.05,
        duration: 0.2, // Fast response
        ease: 'power1.out',
        transformPerspective: 1200,
        transformStyle: "preserve-3d"
      });

      // 2. Image Pop-out (Parallax Z-Index)
      gsap.to(image, {
        x: (x - centerX) / 8,
        y: (y - centerY) / 8,
        z: 60, // Pushes image towards screen
        rotateZ: (x - centerX) / 20, // Slight twist
        duration: 0.2,
        ease: 'power1.out'
      });

      // 3. Content (Text) Floating separately
      gsap.to(content, {
        x: (x - centerX) / 20,
        y: (y - centerY) / 20,
        z: 30,
        duration: 0.2
      });

      // 4. Background Glow Following Mouse
      gsap.to(bgGlow, {
        x: x - rect.width/2, // Center the glow
        y: y - rect.height/2,
        opacity: 0.8,
        scale: 1.2,
        duration: 0.3
      });
    };

    const handleMouseLeave = () => {
      // Reset All to Neutral
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      gsap.to(image, { x: 0, y: 0, z: 0, rotateZ: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      gsap.to(content, { x: 0, y: 0, z: 0, duration: 0.8 });
      gsap.to(bgGlow, { opacity: 0.3, scale: 1, x: 0, y: 0, duration: 0.8 });
    };

    const handleMouseEnter = () => {
        gsap.to(image, { scale: 1.15, duration: 0.4, ease: 'back.out(1.5)' });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);
    // Add touch events for mobile
    card.addEventListener('touchmove', handleMouseMove);
    card.addEventListener('touchend', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('touchmove', handleMouseMove);
      card.removeEventListener('touchend', handleMouseLeave);
    };
  }, []);

  // --- STRICT AUTH CHECKER ---
  const validateAction = (actionType: 'cart' | 'buy') => {
    if (!isAuthenticated) {
      
      // 1. Negative Shake Animation (Inkaar)
      if(cardRef.current) {
        gsap.killTweensOf(cardRef.current); // Stop other animations
        gsap.fromTo(cardRef.current, 
            { x: -10 },
            { x: 10, duration: 0.08, yoyo: true, repeat: 5, ease: "sine.inOut", onComplete: () => {
                gsap.to(cardRef.current, { x: 0, duration: 0.2 });
            }}
        );
      }

      // 2. Error Toast
      toast.error("Account Required", {
        description: "Please Login or Register first to continue.",
        icon: <Lock className="w-5 h-5 text-red-500" />,
        duration: 3000,
        style: { border: '1px solid #ef4444', background: '#000', color: '#fff' }
      });

      // 3. Redirect after slight delay
      setTimeout(() => navigate('/auth'), 1200);
      return false;
    }
    return true;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateAction('cart')) return;

    // Success Animation on Button
    const btn = buttonRef.current;
    if(btn) {
        gsap.fromTo(btn, 
            { scale: 0.8, rotate: -90 }, 
            { scale: 1, rotate: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }
        );
    }

    addToCart({ ...product, quantity: 1 });
    toast.success('Added to Cart', { 
        icon: <ShoppingBag className="w-4 h-4 text-green-400" />,
        style: { background: '#111', border: `1px solid ${themeColor}`, color: '#fff' }
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateAction('buy')) return;
    
    addToCart({ ...product, quantity: 1 });
    navigate('/checkout');
  };

  return (
    <div className="w-full flex justify-center py-6 perspective-1200">
        <Link 
            to={`/products/${product.id}`} 
            className="relative block w-full max-w-[320px] group select-none tap-highlight-transparent"
            style={{ textDecoration: 'none' }}
        >
            {/* --- MAIN CARD BODY --- */}
            <div 
                ref={cardRef}
                className="relative aspect-[1/1.6] rounded-[35px] bg-[#0f0f0f] border border-white/5 overflow-hidden transition-shadow duration-300"
                style={{ 
                    boxShadow: `0 20px 50px -20px ${themeColor}50, 0 0 0 1px rgba(255,255,255,0.05)`,
                    transformStyle: 'preserve-3d' 
                }}
            >
                {/* 1. Dynamic Background Gradient (Top Curve) */}
                <div 
                    className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] rounded-full blur-[80px] opacity-20 transition-colors duration-500"
                    style={{ background: `radial-gradient(circle, ${themeColor}, transparent)` }}
                />

                {/* 2. Interactive Spotlight Glow */}
                <div 
                    ref={bgGlowRef}
                    className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-white rounded-full blur-[100px] pointer-events-none mix-blend-overlay opacity-0 z-0 will-change-transform" 
                />

                {/* --- CONTENT CONTAINER --- */}
                <div ref={contentRef} className="relative z-10 w-full h-full flex flex-col p-6" style={{ transformStyle: 'preserve-3d' }}>
                    
                    {/* TOP HEADER */}
                    <div className="flex justify-between items-start translate-z-10">
                        {/* Discount Badge */}
                        <div 
                            className="px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1 shadow-lg"
                            style={{ backgroundColor: `${themeColor}20`, border: `1px solid ${themeColor}40` }}
                        >
                            <Zap className="w-3 h-3 text-white fill-white" />
                            <span className="text-[11px] font-bold text-white">
                                -{Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}%
                            </span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if(isInWishlist(product.id)) removeFromWishlist(product.id);
                                else addToWishlist(product);
                            }}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/5 transition-all active:scale-90"
                        >
                            <Heart className={`w-5 h-5 transition-colors ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-white/70'}`} />
                        </button>
                    </div>

                    {/* SHOE IMAGE (Floating Center) */}
                    <div className="flex-1 flex items-center justify-center relative translate-z-30 my-4">
                         {/* Circle Behind Shoe (Visual Anchor) */}
                         <div 
                            className="absolute w-[200px] h-[200px] rounded-full border border-white/5 opacity-50" 
                            style={{ background: `radial-gradient(circle, ${themeColor}10, transparent)` }}
                         />
                        <img
                            ref={imageRef}
                            src={product.image}
                            alt={product.name}
                            className="w-[110%] h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] z-20 will-change-transform"
                            style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                        />
                    </div>

                    {/* BOTTOM INFO */}
                    <div className="flex flex-col gap-1 translate-z-20 mt-auto">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[#888] text-xs font-bold uppercase tracking-widest">
                                {product.category}
                            </h4>
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-white text-sm font-bold">{product.rating || 4.8}</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white leading-tight mb-2 tracking-wide">
                            {product.name}
                        </h2>

                        <div className="flex items-center justify-between mt-2">
                            {/* Price */}
                            <div className="flex flex-col">
                                <span className="text-white/40 text-xs line-through font-medium">
                                    PKR {product.originalPrice?.toLocaleString()}
                                </span>
                                <span className="text-white text-xl font-bold tracking-tight">
                                    PKR {product.price.toLocaleString()}
                                </span>
                            </div>

                            {/* THE MAGIC BUTTON (Circle with Plus) */}
                            <button
                                ref={buttonRef}
                                onClick={handleAddToCart}
                                className="group/btn relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl overflow-hidden"
                                style={{ 
                                    background: themeColor, 
                                    boxShadow: `0 0 20px ${themeColor}60`
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                <Plus className="w-6 h-6 text-white relative z-10" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* HIDDEN BUY NOW DRAWER (Slides up on Hover) */}
                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-40 bg-gradient-to-t from-black via-black/90 to-transparent">
                     <button
                        onClick={handleBuyNow}
                        className="w-full py-3.5 rounded-[20px] font-bold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        style={{ 
                            background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`,
                            boxShadow: `0 10px 30px -5px ${themeColor}50`
                        }}
                     >
                        <ShoppingBag className="w-4 h-4 fill-white/20" />
                        Buy Now
                     </button>
                </div>
            </div>
        </Link>
    </div>
  );
};

export default ProductCard;
