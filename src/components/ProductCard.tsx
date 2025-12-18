import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const overlay = overlayRef.current;

    if (!card || !image || !overlay) return;

    const handleMouseEnter = () => {
      gsap.to(image, { scale: 1.15, duration: 0.5, ease: 'power2.out' });
      gsap.to(overlay, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        overlay.querySelectorAll('button'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(1.7)' }
      );
    };

    const handleMouseLeave = () => {
      gsap.to(image, { scale: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(overlay, { opacity: 0, duration: 0.2 });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Animate button
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
      action: { label: 'View Cart', onClick: () => window.location.href = '/cart' }
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
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

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div 
        ref={cardRef}
        className="relative bg-card rounded-2xl overflow-hidden border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            ref={imageRef}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform will-change-transform"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-lg">
              -{discount}%
            </div>
          )}

          {/* Hover Overlay */}
          <div 
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 flex flex-col justify-end p-4"
          >
            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-xl backdrop-blur-sm transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/20 text-white hover:bg-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleAddToCart}
                className="p-3 rounded-xl bg-white/20 text-white hover:bg-emerald-500 backdrop-blur-sm transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <Link
                to={`/products/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-3 rounded-xl bg-white/20 text-white hover:bg-violet-500 backdrop-blur-sm transition-all"
              >
                <Eye className="w-5 h-5" />
              </Link>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={handleQuickAdd}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {product.category}
          </p>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating!) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'fill-muted text-muted'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
