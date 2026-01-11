import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCartAdd01Icon, 
  FavouriteIcon, 
  FlashIcon, 
  StarIcon 
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

// --- IMPORTS ---
// Hum Context direct import karne ke bajaye Hooks try kar rahe hain
// Agar tumhare files me 'useCart' ya 'useWishlist' nahi hai, to error aayega.
// Lekin usually ye hooks banaye jate hain.
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviews: number;
    badge?: string;
    color?: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  // --- SAFE CONTEXT USAGE ---
  // Hum maan ke chal rahe hain ke hooks exported hain
  const cart = useCart();
  const wishlist = useWishlist();

  // Helper functions to safely access context
  // (Taake agar context null bhi ho to app crash na ho)
  const addToCart = cart?.addToCart || (() => console.error("Cart Context missing"));
  const addToWishlist = wishlist?.addToWishlist || (() => console.error("Wishlist Context missing"));
  const removeFromWishlist = wishlist?.removeFromWishlist || (() => {});
  const wishlistItems = wishlist?.wishlistItems || [];

  // Auth Check (Simple LocalStorage Check)
  // Tum yahan apna auth logic replace kar sakte ho
  const isLoggedIn = !!localStorage.getItem('user') || !!localStorage.getItem('token');

  const isWishlisted = wishlistItems.some((item: any) => item.id === product.id);

  // --- AUTH REDIRECT HELPER ---
  const checkAuthAndProceed = (action: () => void) => {
    if (!isLoggedIn) {
      // User ko login page par bhejo
      navigate('/auth'); 
      return;
    }
    action();
  };

  // --- ANIMATIONS ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 5;
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    checkAuthAndProceed(() => {
      if (isWishlisted) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product); // Product object pass kar rahe hain
        gsap.fromTo(heartRef.current, 
          { scale: 1 },
          { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1, ease: "back.out(1.7)" }
        );
      }
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    checkAuthAndProceed(() => {
      const btn = e.currentTarget;
      gsap.to(btn, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          // Adjust payload according to your Context types
          addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            color: product.color
          });
        }
      });
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    checkAuthAndProceed(() => {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        color: product.color
      });
      navigate('/checkout');
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full max-w-[380px] bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Badge & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start">
        {product.badge ? (
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
            product.badge === 'New' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}>
            {product.badge}
          </span>
        ) : <div />}

        <button
          ref={heartRef}
          onClick={handleWishlistClick}
          className="p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-sm hover:bg-white transition-colors group/heart"
        >
          <FavouriteIcon 
            size={20} 
            className={`transition-colors duration-300 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-500 group-hover/heart:text-rose-500'}`}
            variant={isWishlisted ? "solid" : "stroke"}
          />
        </button>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-zinc-800/50">
        <div className={`absolute inset-0 opacity-10 ${product.color || 'bg-blue-500'}`} />
        <img
          ref={imageRef}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110 will-change-transform"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-medium">
            <StarIcon size={12} className="text-amber-400 fill-amber-400" variant="solid" />
            <span>{product.rating}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through decoration-gray-400">
              ${product.originalPrice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
          <Button 
            onClick={handleBuyNow}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold h-10 rounded-xl flex items-center justify-center gap-2 group/btn transition-all active:scale-95"
          >
            <span>Buy Now</span>
            <FlashIcon size={16} className="text-yellow-400 group-hover/btn:animate-pulse" variant="solid" />
          </Button>

          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="h-10 w-12 rounded-xl border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 p-0 flex items-center justify-center transition-transform active:scale-90"
          >
            <ShoppingCartAdd01Icon size={20} className="text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

