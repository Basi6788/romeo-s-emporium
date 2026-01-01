import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Plus, GitCompare, Zap, ShoppingBag } from 'lucide-react';
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
  index?: number; // Animation stagger ke liye
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, compareItems } = useCompare();
  const navigate = useNavigate();

  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Entrance Animation (Fix for "Late" appearing products)
  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      gsap.fromTo(card, 
        { opacity: 0, y: 50, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          delay: index * 0.05, // Stagger effect
          ease: "back.out(1.2)" 
        }
      );
    }
  }, [index]);

  // 3D Hover & Glow Effect
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
      
      // More aggressive 3D rotation
      const rotateX = ((y - centerY) / rect.height) * -20;
      const rotateY = ((x - centerX) / rect.width) * 20;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      });

      // Neon Glow movement
      gsap.to(glow, {
        x: x,
        y: y,
        opacity: 0.6,
        duration: 0.2,
        ease: "power1.out"
      });

      // Parallax effect for content
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: (x - centerX) / 20,
          y: (y - centerY) / 20,
          duration: 0.4
        });
      }
    };

    const handleMouseEnter = () => {
      gsap.to(image, { scale: 1.15, z: 50, duration: 0.5, ease: 'back.out(1.7)' });
      gsap.to(card, { boxShadow: "0 20px 40px -10px rgba(var(--primary), 0.3)" });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        boxShadow: "none",
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
      gsap.to(image, { scale: 1, z: 0, duration: 0.5, ease: 'power2.out' });
      gsap.to(glow, { opacity: 0, duration: 0.3 });
      
      if (contentRef.current) {
        gsap.to(contentRef.current, { x: 0, y: 0, duration: 0.5 });
      }
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Bounce Animation
    const button = e.currentTarget;
    gsap.fromTo(button, 
      { scale: 1 }, 
      { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }
    );

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

    // Specific animation for Buy Now
    const button = e.currentTarget;
    gsap.to(button, { scale: 0.95, duration: 0.1, onComplete: () => gsap.to(button, { scale: 1, duration: 0.3 }) });

    // Add to cart first
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });

    // Navigate to checkout (Modify path as per your routing)
    toast.success("Proceeding to Checkout...");
    navigate('/checkout'); 
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Heart Beat Animation
    const button = e.currentTarget;
    gsap.fromTo(button, 
      { scale: 1 }, 
      { scale: 1.4, duration: 0.2, yoyo: true, repeat: 1, ease: 'elastic.out(1, 0.3)' }
    );

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
    
    const button = e.currentTarget;
    gsap.fromTo(button, { rotate: 0 }, { rotate: 180, duration: 0.4, ease: "back.out" });

    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      toast.success('Removed from compare');
    } else {
      if (compareItems.length >= 4) {
        toast.error('Compare list is full');
        return;
      }
      addToCompare({ ...product }); // Simplified passing product
      toast.success('Added to compare!');
    }
  };

  // Calculate discount percentage
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="block h-full perspective-1000">
      <div 
        ref={cardRef}
        className="group relative h-full bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl overflow-hidden transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Dynamic Glowing Orb following mouse */}
        <div 
          ref={glowRef}
          className="absolute w-64 h-64 rounded-full bg-primary/20 blur-[80px] pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-screen"
        />

        {/* Image Area */}
        <div className="relative aspect-[4/5] p-6 overflow-hidden z-10">
          <img
            ref={imageRef}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-xl will-change-transform"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 translate-z-20">
            {discount > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-500/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-md border border-white/20">
                -{discount}% OFF
              </span>
            )}
            {product.inStock === false && (
              <span className="px-3 py-1 rounded-full bg-gray-500/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-md">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Floating Action Buttons (Right Side) */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300 ease-out z-20">
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:scale-110 transition-all duration-200 ${
                isInWishlist(product.id)
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-white/80 dark:bg-black/50 text-foreground hover:bg-rose-500 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCompare}
              className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:scale-110 transition-all duration-200 ${
                isInCompare(product.id)
                  ? 'bg-blue-500 text-white shadow-blue-500/30'
                  : 'bg-white/80 dark:bg-black/50 text-foreground hover:bg-blue-500 hover:text-white'
              }`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>

          {/* Buy Now Button (Replaces Quick View) - Only visible on hover */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-30">
            <button
              onClick={handleBuyNow}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/50 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              BUY NOW
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div ref={contentRef} className="p-5 pt-2 z-20 relative bg-gradient-to-t from-white/50 to-transparent dark:from-black/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
              {product.category}
            </p>
            {product.rating && (
              <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{product.rating}</span>
              </div>
            )}
          </div>

          <h3 className="font-bold text-foreground text-base line-clamp-1 mb-3 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through ml-1">
                {product.originalPrice ? `PKR ${product.originalPrice.toLocaleString()}` : ''}
              </span>
              <span className="text-xl font-black text-foreground tracking-tight">
                PKR {product.price.toLocaleString()}
              </span>
            </div>
            
            {/* Quick Add (Plus Button) */}
            <button
              onClick={handleAddToCart}
              className="group/btn relative p-3 rounded-xl bg-muted/50 hover:bg-primary text-foreground hover:text-white transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <Plus className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
