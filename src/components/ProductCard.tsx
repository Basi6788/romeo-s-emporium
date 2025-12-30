import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Plus, ShoppingBag, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext'; // Tumhara Cart Context
import { useWishlist } from '@/contexts/WishlistContext'; // Tumhara Wishlist Context
import { toast } from 'sonner'; // Ya jo bhi toast library use kar rahe ho
import gsap from 'gsap';

// --- MOCK AUTH HOOK (Isse apne real Auth Context se replace karna) ---
// Example: const { user } = useAuth();
const useMockAuth = () => {
  // Filhal testing ke liye ise false rakho taake redirect check kar sako
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
  dominantColor?: string; // Ye naya hai: Image ke hisab se color (e.g., '#3b82f6')
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
  const { isAuthenticated } = useMockAuth(); // Auth Check yahan se aayega

  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Default color agar product me na ho
  const themeColor = product.dominantColor || '#ffffff';

  // --- 1. Entrance Animation ---
  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      gsap.fromTo(card, 
        { opacity: 0, y: 80, scale: 0.8, rotateX: -15 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          rotateX: 0,
          duration: 0.8, 
          delay: index * 0.1, 
          ease: "elastic.out(1, 0.6)" 
        }
      );
    }
  }, [index]);

  // --- 2. 3D Hover & Mouse Follow Effect ---
  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const glow = glowRef.current;

    if (!card || !image || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate Rotation
      const rotateX = ((y - centerY) / centerY) * -12; // Max 12 deg tilt
      const rotateY = ((x - centerX) / centerX) * 12;

      // Card Tilt
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      });

      // Image Parallax (Image moves more than card)
      gsap.to(image, {
        x: (x - centerX) / 10,
        y: (y - centerY) / 10,
        duration: 0.4,
        ease: 'power2.out'
      });

      // Glow Position
      gsap.to(glow, {
        x: x,
        y: y,
        opacity: 0.4,
        duration: 0.2,
      });
    };

    const handleMouseLeave = () => {
      // Reset everything
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, z: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      gsap.to(image, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
      gsap.to(glow, { opacity: 0, duration: 0.4 });
    };

    const handleMouseEnter = () => {
        gsap.to(image, { scale: 1.1, duration: 0.4, ease: 'back.out(2)' });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // --- AUTH CHECK HELPER ---
  const checkAuth = () => {
    if (!isAuthenticated) {
      // Animation for denial
      if(cardRef.current) {
        gsap.to(cardRef.current, { x: 10, duration: 0.1, yoyo: true, repeat: 5 });
      }
      
      toast.error("Access Denied", {
        description: "Please Login or Register first to shop!",
        icon: <Lock className="w-4 h-4 text-red-500" />
      });
      
      // Delay redirection slightly so user sees the toast
      setTimeout(() => navigate('/auth'), 1500);
      return false;
    }
    return true;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 1. Auth Check
    if (!checkAuth()) return;

    // 2. Button Animation
    const btn = e.currentTarget;
    gsap.fromTo(btn, { scale: 0.8, rotate: -45 }, { scale: 1, rotate: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    toast.success('Added to cart!', { description: product.name });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Auth Check
    if (!checkAuth()) return;

    // Add logic for Buy Now
    addToCart({ ...product, quantity: 1 }); // Pehle cart me add karo
    navigate('/checkout'); // Phir checkout pe le jao
  };

  return (
    <Link to={`/products/${product.id}`} className="block h-full group perspective-1000 select-none">
      <div 
        ref={cardRef}
        className="relative h-full bg-[#0a0a0a] border border-white/10 rounded-[30px] overflow-hidden shadow-2xl transition-all duration-300"
        style={{ 
          transformStyle: 'preserve-3d',
          // Dynamic shadow based on product color
          boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px -10px ${themeColor}40`
        }}
      >
        {/* Dynamic Hover Glow (Mouse follower) */}
        <div 
          ref={glowRef}
          className="absolute w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-screen will-change-transform"
          style={{ backgroundColor: themeColor }}
        />

        {/* --- TOP SECTION: Image --- */}
        <div className="relative p-6 z-10">
            {/* Top Bar: Discount & Wishlist */}
            <div className="flex justify-between items-start mb-2 translate-z-20">
                <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-[10px] font-bold text-white tracking-wider">
                    -{Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}% OFF
                </span>
                
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if(isInWishlist(product.id)) removeFromWishlist(product.id);
                        else addToWishlist(product);
                    }}
                    className="p-2 rounded-full bg-black/40 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors group/heart"
                >
                    <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-white/60 group-hover/heart:text-white'}`} />
                </button>
            </div>

            {/* Product Image */}
            <div className="relative aspect-[4/3] flex items-center justify-center my-2">
                <img
                    ref={imageRef}
                    src={product.image}
                    alt={product.name}
                    className="w-[90%] h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] z-20 will-change-transform"
                />
            </div>
        </div>

        {/* --- BOTTOM SECTION: Content --- */}
        <div className="relative px-6 pb-6 pt-2 z-20 flex flex-col gap-3">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
                <span 
                    className="text-[10px] font-bold uppercase tracking-[0.2em]" 
                    style={{ color: themeColor }}
                >
                    {product.category}
                </span>
                <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span className="text-sm font-bold text-white">{product.rating || 4.5}</span>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white leading-tight line-clamp-1 group-hover:text-white/90 transition-colors">
                {product.name}
            </h3>

            {/* Price & Add Button Row */}
            <div className="flex items-end justify-between mt-2">
                <div className="flex flex-col">
                    <span className="text-xs text-white/40 line-through font-medium">
                        PKR {product.originalPrice?.toLocaleString()}
                    </span>
                    <span className="text-xl font-black text-white tracking-tight">
                        PKR {product.price.toLocaleString()}
                    </span>
                </div>

                {/* THE CIRCLE PLUS BUTTON (Like screenshot) */}
                <button
                    ref={buttonRef}
                    onClick={handleAddToCart}
                    className="relative group/btn w-12 h-12 rounded-full flex items-center justify-center overflow-hidden transition-transform active:scale-90"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    {/* Hover Fill Effect */}
                    <div 
                        className="absolute inset-0 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"
                        style={{ backgroundColor: 'white' }}
                    />
                    <Plus className="w-6 h-6 text-white group-hover/btn:text-black relative z-10 transition-colors duration-300" />
                </button>
            </div>
        </div>

        {/* --- HIDDEN BUY NOW (Reveals on Hover) --- */}
        {/* Ye button card ke bottom se slide up karega jaisa tumne pehle manga tha */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-30 bg-gradient-to-t from-black via-black/90 to-transparent">
             <button
              onClick={handleBuyNow}
              className="w-full py-3 rounded-xl text-black font-bold shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
              style={{ 
                  backgroundColor: themeColor,
                  boxShadow: `0 0 20px ${themeColor}60`
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              BUY NOW
            </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
