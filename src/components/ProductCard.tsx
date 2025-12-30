import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Plus, ShoppingBag, Zap } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import gsap from 'gsap';

// --- YAHAN APNA REAL AUTH CONTEXT IMPORT KARO ---
// import { useAuth } from '@/contexts/AuthContext'; 

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  // --- AUTH LOGIC (CRITICAL FIX) ---
  // Agar tumhare paas useAuth hook hai tu niche wali line uncomment karo:
  // const { user } = useAuth();
  
  // Filhal ke liye main ise HARDCODE 'true' kar raha hun taake tum test kar sako.
  // Jab production me lagao tu 'true' ko hata kar 'user' ya 'isAuthenticated' likh dena.
  const isLoggedIn = true; // <--- CHANGE THIS TO YOUR ACTUAL AUTH STATE

  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  // --- 1. IDLE FLOATING ANIMATION (New) ---
  useEffect(() => {
    // Ye jootay ko hawa mein "tairta" hua dikhayega (Natural feel)
    gsap.to(imageRef.current, {
      y: -10,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }, []);

  // --- 2. 3D TILT & GLOW LOGIC ---
  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const glow = glowRef.current;
    const shine = shineRef.current;

    if (!card || !image || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Card Tilt (Thoda aggressive banaya hai)
      const rotateX = ((y - centerY) / centerY) * -15; 
      const rotateY = ((x - centerX) / centerX) * 15;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      });

      // Image Pop-out (Ziada bahar ayegi ab)
      gsap.to(image, {
        x: (x - centerX) / 8,
        y: (y - centerY) / 8,
        z: 60, // Ziada 3D depth
        duration: 0.4,
        ease: 'power2.out'
      });

      // Blob Movement
      gsap.to(glow, {
        x: x,
        y: y,
        opacity: 0.8, // Brightness barhai
        scale: 1.2,
        duration: 0.2,
      });

      // Shine/Glass Reflection Effect
      if (shine) {
        gsap.to(shine, {
          x: x - 100, // Offset shine
          y: y - 100,
          opacity: 0.3,
          duration: 0.1
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      gsap.to(image, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'power2.out' });
      gsap.to(glow, { opacity: 0.2, scale: 1, duration: 0.4 }); // Thoda sa glow rehne do
      if (shine) gsap.to(shine, { opacity: 0, duration: 0.4 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleAction = (actionType: 'cart' | 'buy', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // --- AUTH CHECK ---
    if (!isLoggedIn) {
      toast.error("Please Login First");
      navigate('/auth'); // Redirect only if NOT logged in
      return;
    }

    // Bounce Animation on Button
    const btn = e.currentTarget;
    gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" });

    if (actionType === 'cart') {
      addToCart({ ...product, quantity: 1 });
      toast.success('Added to cart!');
    } else {
      addToCart({ ...product, quantity: 1 });
      toast.success('Proceeding to Checkout...');
      navigate('/checkout'); // Direct checkout logic
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="block w-full h-full perspective-1000 group">
      <div 
        ref={cardRef}
        // Aspect Ratio fixed to match screenshot (Taller but proportional)
        className="relative flex flex-col bg-[#0f0f0f] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 h-auto aspect-[3/5] md:aspect-[3/4.5]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* --- DYNAMIC BLOBS & GRADIENTS --- */}
        {/* Main Background Blob (Always subtle visible) */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent z-0 opacity-20 pointer-events-none" />
        
        {/* Interactive Glow Blob (Mouse follower) */}
        <div 
          ref={glowRef}
          className="absolute w-64 h-64 rounded-full bg-blue-500/30 blur-[60px] pointer-events-none opacity-20 -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-screen will-change-transform"
        />

        {/* Reflective Shine Layer */}
        <div 
          ref={shineRef}
          className="absolute w-40 h-40 bg-white blur-[40px] opacity-0 pointer-events-none z-10 mix-blend-overlay rounded-full"
        />

        {/* --- TOP: IMAGE & BADGES --- */}
        <div className="relative flex-1 p-5 z-20 flex items-center justify-center translate-z-20">
            {/* Top Bar */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white tracking-wider shadow-lg">
                    -{Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}%
                </span>
                
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if(isInWishlist(product.id)) removeFromWishlist(product.id);
                        else addToWishlist(product);
                    }}
                    className="p-2.5 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-md border border-white/5 transition-all active:scale-90"
                >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                </button>
            </div>

            {/* PRODUCT IMAGE (Bigger & Floating) */}
            <img
                ref={imageRef}
                src={product.image}
                alt={product.name}
                // Image ab badi dikhegi aur fit hogi
                className="w-[110%] h-[80%] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] z-20 will-change-transform"
            />
        </div>

        {/* --- BOTTOM: DETAILS --- */}
        <div className="relative px-5 pb-5 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 mt-auto">
            
            {/* Category & Stars */}
            <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {product.category}
                </p>
                <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-white">{product.rating || 4.5}</span>
                </div>
            </div>

            {/* Name */}
            <h3 className="text-lg font-bold text-white leading-tight mb-3 truncate">
                {product.name}
            </h3>

            {/* Price & Action Row */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs text-gray-500 line-through font-medium">PKR {product.originalPrice?.toLocaleString()}</p>
                    <p className="text-xl font-black text-white">PKR {product.price.toLocaleString()}</p>
                </div>

                {/* PLUS BUTTON (Cart) */}
                <button
                    onClick={(e) => handleAction('cart', e)}
                    className="group/btn relative w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 flex items-center justify-center transition-all duration-300"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover/btn:rotate-90" />
                </button>
            </div>
            
            {/* BUY NOW BUTTON (Visible on Hover - Slide Up) */}
            <div className="absolute inset-x-5 bottom-5 translate-y-[120%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-30">
                 <button
                  onClick={(e) => handleAction('buy', e)}
                  // NATURAL GREEN GRADIENT + GLOW
                  className="w-full py-3 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transform active:scale-95 transition-all bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500"
                >
                  <ShoppingBag className="w-4 h-4" />
                  BUY NOW
                </button>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
