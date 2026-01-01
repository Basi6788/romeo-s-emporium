import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Plus, GitCompare, Zap } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';
import gsap from 'gsap';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  description?: string;
  colors?: string[];
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, compareItems } = useCompare();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  // GSAP Hover Animation (Clean & Performance Optimized)
  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const glow = glowRef.current;
    const border = borderRef.current;

    if (!card || !image || !glow || !border) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
      });

      // Glow following mouse
      gsap.to(glow, {
        x: x,
        y: y,
        opacity: 0.6,
        duration: 0.2,
      });
    };

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.3,
        ease: 'back.out(1.5)',
      });
      gsap.to(image, { 
        scale: 1.15, 
        y: -10,
        duration: 0.4, 
        ease: 'power2.out' 
      });
      // Show Neon Border
      gsap.to(border, { opacity: 1, duration: 0.3 });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(image, { 
        scale: 1, 
        y: 0, 
        duration: 0.4, 
        ease: 'power2.out' 
      });
      gsap.to(glow, { opacity: 0, duration: 0.3 });
      // Hide Neon Border
      gsap.to(border, { opacity: 0, duration: 0.3 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // --- Handlers (Add to Cart, etc.) ---
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simple bump animation
    gsap.fromTo(e.currentTarget, { scale: 1 }, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    toast.success('Added to cart!', { description: product.name });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      toast.success('Added to wishlist!');
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      toast.success('Removed from compare');
    } else {
      if (compareItems.length >= 4) return toast.error('Compare full');
      addToCompare({ ...product, originalPrice: product.originalPrice || 0 });
      toast.success('Added to compare!');
    }
  };

  // Calculations
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  // PRICE CONVERSION: Assuming input is in USD, converting to PKR.
  // If your DB is already in PKR, remove the (* 280) part.
  const priceInPKR = product.price * 280;
  const originalPriceInPKR = product.originalPrice ? product.originalPrice * 280 : null;

  return (
    <>
      <Link to={`/products/${product.id}`} className="group block relative w-full h-full p-2">
        
        {/* Main Card Container */}
        <div 
          ref={cardRef}
          className="relative h-full bg-[#121212]/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 transition-all duration-300"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* NEON RUNNING BORDER - Animated Gradient */}
          <div 
            ref={borderRef}
            className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none z-0"
          >
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-spin-slow opacity-20" />
            <div className="absolute inset-[1px] bg-[#121212] rounded-2xl" /> {/* Inner mask */}
          </div>

          {/* Mouse Follow Glow */}
          <div 
            ref={glowRef}
            className="absolute w-[200px] h-[200px] bg-primary/20 rounded-full blur-[80px] pointer-events-none opacity-0 z-10"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          {/* Grid Pattern (Subtle Tech Look) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] z-0" />

          {/* Image Area */}
          <div className="relative aspect-square z-20 overflow-hidden bg-gradient-to-b from-white/5 to-transparent p-6">
            <img
              ref={imageRef}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl will-change-transform"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <span className="px-2 py-1 text-[10px] font-bold bg-rose-500 text-white rounded-md shadow-lg shadow-rose-500/20">
                  -{discount}%
                </span>
              )}
              {product.category === 'New' && (
                <span className="px-2 py-1 text-[10px] font-bold bg-blue-500 text-white rounded-md shadow-lg shadow-blue-500/20">
                  NEW
                </span>
              )}
            </div>

            {/* Hover Actions (Glassmorphism) */}
            <div className="absolute right-3 top-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <button onClick={handleWishlist} className={`p-2 rounded-xl backdrop-blur-md border border-white/10 ${isInWishlist(product.id) ? 'bg-rose-500 text-white' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}>
                <Heart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
              <button onClick={handleCompare} className={`p-2 rounded-xl backdrop-blur-md border border-white/10 ${isInCompare(product.id) ? 'bg-blue-500 text-white' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}>
                <GitCompare size={16} />
              </button>
            </div>

            {/* Quick Add Button (Bottom Right of Image) */}
            <button 
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 hover:scale-110 active:scale-95"
            >
              <ShoppingCart size={18} />
            </button>
          </div>

          {/* Product Details */}
          <div className="p-4 relative z-20">
            {/* Category & Rating */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">{product.category}</span>
              <div className="flex items-center gap-1">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground font-medium">{product.rating || 4.5}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Price Section - ONLY PKR */}
            <div className="flex items-end justify-between border-t border-white/5 pt-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-0.5">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">
                    Rs {priceInPKR.toLocaleString()}
                  </span>
                  {originalPriceInPKR && (
                    <span className="text-xs text-muted-foreground line-through decoration-rose-500/50">
                      {originalPriceInPKR.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Fake 'Buy Now' visual indicator */}
              <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                <Zap size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </>
  );
};

export default ProductCard;
