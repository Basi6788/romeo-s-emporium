import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, GitCompare, Zap } from 'lucide-react'; // ShoppingCart ki jagah ShoppingBag aur Zap for Buy Now
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
  index?: number; // Animation delay ke liye
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, compareItems } = useCompare();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Price Formatter for PKR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Entry Animation (Fast & Smooth)
  useGSAP(() => {
    gsap.fromTo(cardRef.current,
      { y: 50, opacity: 0, scale: 0.9 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        duration: 0.6, 
        delay: index * 0.05, // Stagger effect
        ease: 'back.out(1.2)' 
      }
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / rect.height) * 20; // Max 20deg rotation
    const rotateY = ((x - centerX) / rect.width) * -20;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 1000,
    });

    // Neon Glow follows mouse
    gsap.to(glowRef.current, {
      x: x,
      y: y,
      opacity: 0.6,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !imageRef.current || !glowRef.current) return;
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    gsap.to(imageRef.current, { scale: 1, y: 0, duration: 0.4 });
    gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
  };

  const handleMouseEnter = () => {
    if (!imageRef.current) return;
    gsap.to(imageRef.current, { scale: 1.15, y: -10, duration: 0.4, ease: 'power2.out' });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Animation for button click
    const btn = e.currentTarget;
    gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    toast.success('Proceeding to Checkout', { description: product.name });
    navigate('/cart'); // Ya '/checkout' par redirect karo
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    toast.success('Added to cart!');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({ productId: product.id, name: product.name, price: product.price, image: product.image });
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
      if (compareItems.length >= 4) {
        toast.error('Compare list is full');
        return;
      }
      addToCompare({ ...product, originalPrice: product.originalPrice || 0, rating: product.rating || 0 });
      toast.success('Added to compare!');
    }
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="group block h-full">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="relative h-full bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 dark:border-white/10 transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Animated Gradient Border (Pseudo-border) */}
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-pink-500 group-hover:via-purple-500 group-hover:to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)' }}></div>

        {/* 3D Glow Blob */}
        <div 
          ref={glowRef}
          className="absolute w-[150px] h-[150px] bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-[60px] rounded-full pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2 z-0"
        />

        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full p-6 overflow-hidden z-10 flex items-center justify-center">
          <img
            ref={imageRef}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-xl will-change-transform"
          />
          
          {/* Tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {discount > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold backdrop-blur-sm shadow-lg shadow-red-500/20">
                -{discount}%
              </span>
            )}
            {product.inStock === false && (
               <span className="px-3 py-1 rounded-full bg-gray-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
               OUT OF STOCK
             </span>
            )}
          </div>

          {/* Floating Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 stagger-1">
            <button onClick={handleWishlist} className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-110 ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-black/50 text-gray-700 dark:text-gray-200 hover:bg-red-500 hover:text-white'}`}>
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleCompare} className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-110 ${isInCompare(product.id) ? 'bg-blue-500 text-white' : 'bg-white/80 dark:bg-black/50 text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white'}`}>
              <GitCompare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-5 pt-0 z-10 relative">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-1">{product.category}</p>
              <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < (product.rating || 0) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">({product.reviews} Reviews)</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">{formatPrice(product.originalPrice)}</span>
              )}
              <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                {formatPrice(product.price)}
              </span>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-primary hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Buy Now Slide-up Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <button
            onClick={handleBuyNow}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            <Zap className="w-5 h-5 fill-current" />
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
