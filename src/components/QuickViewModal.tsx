import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingCart, Star, Plus, Minus, ChevronRight, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import gsap from 'gsap';
import { Product } from './ProductCard';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (product?.colors?.[0]) {
      setSelectedColor(product.colors[0]);
    }
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (isOpen && modalRef.current && contentRef.current) {
      document.body.style.overflow = 'hidden';
      
      const tl = gsap.timeline();
      tl.fromTo(modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      tl.fromTo(contentRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
        '-=0.15'
      );
      
      if (imageRef.current) {
        tl.fromTo(imageRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.3'
        );
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && contentRef.current) {
      const tl = gsap.timeline({
        onComplete: onClose
      });
      tl.to(contentRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.2,
        ease: 'power2.in'
      });
      tl.to(modalRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      }, '-=0.1');
    } else {
      onClose();
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      color: selectedColor || undefined
    });
    
    toast.success('Added to cart!', {
      description: `${quantity}x ${product.name}`,
    });
    handleClose();
  };

  const handleWishlist = () => {
    if (!product) return;
    
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

  if (!isOpen || !product) return null;

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      
      {/* Modal Content */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-2xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square bg-muted/30 p-8 flex items-center justify-center">
            {discount > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-rose-500 text-white text-sm font-bold">
                -{discount}%
              </div>
            )}
            <img
              ref={imageRef}
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category */}
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              {product.category}
            </p>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {product.name}
            </h2>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating!) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-muted-foreground/30'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Color</p>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-primary ring-2 ring-primary/30' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-xl border transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'border-border hover:border-rose-500 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 text-center">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 text-center">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">2 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 text-center">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">30 Day Return</span>
              </div>
            </div>

            {/* View Full Details */}
            <Link 
              to={`/products/${product.id}`}
              onClick={handleClose}
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              View Full Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
