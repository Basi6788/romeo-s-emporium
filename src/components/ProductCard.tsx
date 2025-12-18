import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Plus, Eye, GitCompare } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';
import gsap from 'gsap';
import QuickViewModal from './QuickViewModal';

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
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

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
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
      });

      gsap.to(glow, {
        x: x - rect.width / 2,
        y: y - rect.height / 2,
        opacity: 0.3,
        duration: 0.3,
      });
    };

    const handleMouseEnter = () => {
      gsap.to(image, { scale: 1.1, duration: 0.4, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(image, { scale: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(glow, { opacity: 0, duration: 0.3 });
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
    
    const button = e.currentTarget;
    gsap.fromTo(button, 
      { scale: 1 }, 
      { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }
    );

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    toast.success('Added to cart!', {
      description: product.name,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.currentTarget;
    gsap.fromTo(button, 
      { scale: 1 }, 
      { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
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
    gsap.fromTo(button, 
      { scale: 1 }, 
      { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
    );

    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      toast.success('Removed from compare');
    } else {
      if (compareItems.length >= 4) {
        toast.error('Compare list is full', {
          description: 'Maximum 4 products can be compared'
        });
        return;
      }
      addToCompare({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        rating: product.rating,
        description: product.description
      });
      toast.success('Added to compare!');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <>
      <Link to={`/products/${product.id}`} className="group block">
        <div 
          ref={cardRef}
          className="relative bg-card rounded-2xl overflow-hidden border border-border/50 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 3D Glow Effect */}
          <div 
            ref={glowRef}
            className="absolute w-32 h-32 rounded-full bg-primary/50 blur-3xl pointer-events-none opacity-0"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          {/* Image Container */}
          <div className="relative aspect-square bg-muted/50 overflow-hidden">
            <img
              ref={imageRef}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-6 transition-transform will-change-transform"
            />
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold">
                -{discount}%
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleWishlist}
                className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-rose-500 text-white'
                    : 'bg-background/80 text-foreground hover:bg-rose-500 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleCompare}
                className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${
                  isInCompare(product.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                <GitCompare className="w-4 h-4" />
              </button>
              <button
                onClick={handleQuickView}
                className="p-2.5 rounded-xl bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md transition-all"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddToCart}
                className="p-2.5 rounded-xl bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>

            {/* Quick View Button - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleQuickView}
                className="w-full py-2.5 rounded-xl bg-foreground/90 text-background text-sm font-medium hover:bg-foreground transition-colors backdrop-blur-md flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Quick View
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="font-medium text-foreground text-sm line-clamp-1 mb-2">
              {product.name}
            </h3>
            
            {/* Rating - Simplified */}
            {product.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-foreground">{product.rating}</span>
                <span className="text-xs text-muted-foreground">({product.reviews})</span>
              </div>
            )}

            {/* Price & Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-foreground">
                  ${product.price.toFixed(0)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(0)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;