import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import gsap from 'gsap';

// --- Configuration ---
const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const STORAGE_BUCKET = 'storage/v1/object/public/product-images';

// --- Interface ---
export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  image: string;          
  category: string;
  product_images?: {
    image_path: string;
    is_primary: boolean;
  }[];
  rating?: number;
  reviews?: number;
  description?: string;
  colors?: string[];
  in_stock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Swipe Refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isWishlisted = isInWishlist(product.id);

  // --- 🔥 Images Logic ---
  const productImages = useMemo(() => {
    let images: string[] = [];
    if (product.product_images && product.product_images.length > 0) {
      const sortedImages = [...product.product_images].sort((a, b) => {
        return (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0);
      });
      images = sortedImages.map(img => {
        if (!img.image_path) return null;
        if (img.image_path.startsWith('http')) return img.image_path;
        return `${SUPABASE_PROJECT_URL}/${STORAGE_BUCKET}/${img.image_path}`;
      }).filter(Boolean) as string[];
    } else if (typeof product.image === 'string' && product.image.includes(',')) {
      images = product.image.split(',').map(s => s.trim());
    } else if (product.image) {
      images = [product.image];
    }
    if (images.length === 0) images = ['/placeholder.svg'];
    return [...new Set(images)];
  }, [product]);

  // --- Navigation & Swipe ---
  const nextImage = (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (productImages.length > 1) setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (productImages.length > 1) setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextImage();
    else if (distance < -50) prevImage();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // --- 🛒 Cart Logic ---
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    gsap.fromTo(e.currentTarget, { scale: 1 }, { scale: 0.90, duration: 0.1, yoyo: true, repeat: 1 });

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: productImages[currentImageIndex], 
      quantity: 1
    });
    toast.success('Added to cart!');
  };

  // --- ❤️ Wishlist Logic ---
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    gsap.fromTo(e.currentTarget, { scale: 1 }, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1 });

    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.error('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: productImages[0]
      });
      toast.success('Added to wishlist!');
    }
  };

  const originalPrice = product.original_price || product.originalPrice;
  const discount = originalPrice ? Math.round((1 - product.price / originalPrice) * 100) : 0;

  return (
    <>
      {/* --- Fonts Import & Custom Styles --- */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Oswald:wght@500;700&family=Roboto+Condensed:wght@400;700&display=swap');
          
          .font-label { font-family: 'Roboto Condensed', sans-serif; }
          .font-product-name { font-family: 'Outfit', sans-serif; }
          .font-price { font-family: 'Oswald', sans-serif; }
        `}
      </style>

      <Link to={`/products/${product.id}`} className="block h-full select-none">
        <div 
          className="group relative flex w-full flex-col overflow-hidden rounded-[1.5rem] bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-zinc-800"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* --- Image Section --- */}
          <div 
            className="relative aspect-[4/5] w-full bg-[#f8f8f8] dark:bg-zinc-800 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute left-3 top-3 z-20">
                <span className="font-price rounded-full bg-red-500 px-2.5 py-1 text-[12px] tracking-wide text-white shadow-sm">
                  -{discount}%
                </span>
              </div>
            )}

            {/* ❤️ Wishlist Button */}
            <button 
              onClick={handleWishlist}
              className={`absolute right-3 top-3 z-30 rounded-full p-2.5 shadow-md transition-all duration-300 active:scale-90 flex items-center justify-center ${
                isWishlisted 
                  ? 'bg-red-600 text-white shadow-red-200 border border-red-600'
                  : 'bg-white/90 dark:bg-zinc-900/90 text-gray-400 hover:text-red-500 hover:bg-white border border-transparent'
              }`}
            >
              <Heart 
                size={18} 
                className={`transition-all duration-300 ${isWishlisted ? 'fill-current text-white' : ''}`} 
              />
            </button>

            {/* Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-sm text-gray-800 dark:text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-100 dark:border-zinc-700 md:opacity-0 md:group-hover:opacity-100 ${
                    isHovered ? 'opacity-100 translate-x-0' : '-translate-x-2'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={nextImage} 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-sm text-gray-800 dark:text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-100 dark:border-zinc-700 md:opacity-0 md:group-hover:opacity-100 ${
                    isHovered ? 'opacity-100 translate-x-0' : 'translate-x-2'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Images Display */}
            <div className="h-full w-full relative">
              {productImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} - View ${idx + 1}`}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out ${
                    idx === currentImageIndex 
                      ? 'opacity-100 scale-100 z-10' 
                      : 'opacity-0 scale-105 z-0'
                  }`}
                  loading="lazy"
                />
              ))}
            </div>

            {/* Pagination Dots */}
            {productImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                {productImages.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${
                      idx === currentImageIndex 
                        ? 'w-4 bg-gray-900 dark:bg-white' 
                        : 'w-1.5 bg-white/60 dark:bg-zinc-500/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* --- Product Info --- */}
          <div className="flex flex-1 flex-col p-4 pt-3">
            {/* Category Label - Uses Roboto Condensed */}
            <div className="mb-1.5">
              <span className="font-label text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {product.category}
              </span>
            </div>
            
            {/* Product Name - Uses Outfit */}
            <h3 className="font-product-name line-clamp-2 text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-gray-200 transition-colors h-11 leading-[1.35]">
              {product.name}
            </h3>
            
            <div className="mt-auto pt-3 flex items-end justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-label tracking-wide uppercase">Price</span>
                <div className="flex items-baseline gap-1.5">
                  {/* Price - Uses Oswald for PKR */}
                  <span className="font-price text-xl font-medium text-gray-900 dark:text-white tracking-wide">
                    Rs.{product.price.toLocaleString()}
                  </span>
                  {originalPrice && (
                    <span className="font-price text-sm line-through text-gray-400 dark:text-gray-600 decoration-gray-400/60">
                      Rs.{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={handleAddToCart} 
                className="relative overflow-hidden rounded-full bg-black dark:bg-white p-2.5 text-white dark:text-black shadow-md transition-all hover:scale-105 active:scale-95 flex-shrink-0 group/cart"
                aria-label="Add to cart"
              >
                <ShoppingCart size={18} strokeWidth={2.5} className="group-active/cart:scale-90 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default ProductCard;

