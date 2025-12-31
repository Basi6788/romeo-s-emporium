import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // Tumhara Auth Context
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
  const { isAuthenticated } = useAuth(); // Auth check ke liye
  const navigate = useNavigate(); // Redirect ke liye
  
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null); // New Shine Ref

  // GSAP 3D Animation & Shine Effect
  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const glow = glowRef.current;
    const shine = shineRef.current;

    if (!card || !image || !glow || !shine) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Increased Sensitivity for "High Animation" feel
      const rotateX = ((y - centerY) / rect.height) * -25; // More tilt
      const rotateY = ((x - centerX) / rect.width) * 25;

      // 3D Tilt
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      });

      // Moving Glow behind the shoe
      gsap.to(glow, {
        x: x - rect.width / 2,
        y: y - rect.height / 2,
        opacity: 0.6,
        duration: 0.3,
      });

      // Shine/Glare Effect on Card Surface
      gsap.to(shine, {
        background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 80%)`,
        duration: 0.1
      });
      
      // Parallax Image Effect (Pop out)
      gsap.to(image, {
        x: (x - centerX) / 10,
        y: (y - centerY) / 10,
        scale: 1.15,
        duration: 0.4,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      // Reset everything
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)', // Bouncy reset
      });
      gsap.to(image, { x: 0, y: 0, scale: 1, duration: 0.5 });
      gsap.to(glow, { opacity: 0, duration: 0.5 });
      gsap.to(shine, { background: 'transparent', duration: 0.5 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Secure Add to Cart Logic
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Button Animation
    const button = e.currentTarget;
    gsap.fromTo(button, 
      { scale: 1 }, 
      { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 }
    );

    // 1. CHECK LOGIN STATUS
    if (!isAuthenticated) {
      // Pop-up Animation Message
      toast.error('Access Denied', {
        description: 'Please Login or Register First to shop!',
        duration: 3000,
        style: {
            background: '#1a1a1a',
            border: '1px solid #ff4d4f',
            color: '#fff'
        }
      });
      
      // Redirect to Auth Page
      setTimeout(() => navigate('/auth'), 500); // Thora sa delay smooth feel ke liye
      return;
    }

    // 2. If Logged in -> Add to Cart
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    toast.success('Added to Cart', {
      description: `${product.name} is now in your cart`,
      style: {
        background: '#1a1a1a',
        border: '1px solid #22c55e',
        color: '#fff'
      }
    });
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="perspective-1000 w-full h-full p-4"> {/* Container for 3D context */}
      <Link to={`/products/${product.id}`} className="block h-full">
        <div 
          ref={cardRef}
          className="relative h-[420px] w-full bg-[#121212] rounded-[30px] overflow-hidden border border-white/10 shadow-2xl group transition-all duration-300"
          style={{ 
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
          }}
        >
          {/* Shine/Glare Overlay */}
          <div ref={shineRef} className="absolute inset-0 z-20 pointer-events-none" />

          {/* Dynamic Background Glow */}
          <div 
            ref={glowRef}
            className="absolute w-48 h-48 rounded-full bg-blue-600/30 blur-[60px] pointer-events-none opacity-0 z-0"
          />
          
          {/* Static Gradient Blobs (Like Image) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Product Image Section */}
          <div className="relative h-[60%] flex items-center justify-center p-6 z-10">
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-md">
                <span className="text-blue-400 text-xs font-bold">-{discount}% OFF</span>
              </div>
            )}
            
            <img
              ref={imageRef}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] z-10 will-change-transform"
            />
          </div>

          {/* Content Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-[#0a0a0a] via-[#121212] to-transparent">
            {/* Category Tag */}
            <p className="text-purple-400 text-[10px] font-bold tracking-widest uppercase mb-2">
              WEARABLES
            </p>

            <div className="flex justify-between items-start mb-4">
              <div>
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-1 leading-tight">
                    {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span className="text-sm font-medium text-white">{product.rating || 4.5}</span>
                </div>
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-medium">Price</span>
                <span className="text-2xl font-bold text-white">
                  PKR {product.price.toLocaleString()}
                </span>
              </div>

              {/* Add Button - Circular with Gradient */}
              <button
                onClick={handleAddToCart}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-90 group-hover:scale-110"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
