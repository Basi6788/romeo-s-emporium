import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Plus, GitCompare } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';
import gsap from 'gsap';
import * as THREE from 'three';

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
  const threeRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Three.js 3D Animation
  useEffect(() => {
    if (!threeRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    threeRef.current.appendChild(renderer.domElement);

    // Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Create Geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const mesh = new THREE.Mesh(geometry, glassMaterial);
    scene.add(mesh);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 5;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    meshRef.current = mesh;

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (threeRef.current && rendererRef.current?.domElement) {
        threeRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // GSAP Hover Animation
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
      
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.2,
        ease: 'power2.out',
        transformPerspective: 800,
      });

      gsap.to(glow, {
        x: x - rect.width / 2,
        y: y - rect.height / 2,
        opacity: 0.4,
        duration: 0.2,
      });

      // Three.js interaction
      if (meshRef.current) {
        gsap.to(meshRef.current.rotation, {
          x: rotateX * 0.3,
          y: rotateY * 0.3,
          duration: 0.3,
        });
      }
    };

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
      gsap.to(image, { scale: 1.15, duration: 0.4, ease: 'power2.out' });
      
      // Card lift effect
      gsap.to(card, {
        y: -10,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        y: 0,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(image, { scale: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(glow, { opacity: 0, duration: 0.3 });
      
      if (meshRef.current) {
        gsap.to(meshRef.current.rotation, {
          x: 0,
          y: 0,
          duration: 0.5,
        });
      }
    };

    // Initial animation
    gsap.from(card, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power2.out',
      delay: Math.random() * 0.2,
    });

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
      { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }
    );

    // Button ripple effect
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);

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
      { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: 'elastic.out(1, 0.3)' }
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.currentTarget;
    gsap.fromTo(button, 
      { scale: 1 }, 
      { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }
    );

    // Add to cart first
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    // Redirect to checkout
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 300);
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  // Convert USD to PKR (current rate approx 280)
  const priceInPKR = product.price * 280;
  const originalPriceInPKR = product.originalPrice ? product.originalPrice * 280 : null;

  return (
    <>
      <Link to={`/products/${product.id}`} className="group block relative">
        {/* 3D Glass Effect Background */}
        <div 
          ref={threeRef} 
          className="absolute inset-0 w-full h-full rounded-3xl pointer-events-none"
        />
        
        <div 
          ref={cardRef}
          className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0)'
          }}
        >
          {/* 3D Glow Effect */}
          <div 
            ref={glowRef}
            className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-3xl pointer-events-none opacity-0"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_1px,transparent_1px),linear-gradient(0deg,transparent_1px,transparent_1px)] bg-[size:20px_20px] opacity-10" />

          {/* Image Container */}
          <div className="relative aspect-square bg-gradient-to-br from-muted/20 to-transparent overflow-hidden">
            <img
              ref={imageRef}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-8 transition-transform will-change-transform"
            />
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg animate-pulse">
                -{discount}% OFF
              </div>
            )}

            {/* Stock Status */}
            {!product.inStock && (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-bold backdrop-blur-sm">
                Out of Stock
              </div>
            )}

            {/* Quick Actions - Glass Morphic Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all shadow-lg ${
                  isInWishlist(product.id)
                    ? 'bg-gradient-to-r from-rose-500/90 to-pink-500/90 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white hover:scale-110'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleCompare}
                className={`p-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all shadow-lg ${
                  isInCompare(product.id)
                    ? 'bg-gradient-to-r from-primary/90 to-blue-500/90 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white hover:scale-110'
                }`}
              >
                <GitCompare className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddToCart}
                className="p-3 rounded-2xl backdrop-blur-md border border-white/20 bg-white/10 hover:bg-white/20 text-white hover:scale-110 transition-all shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>

            {/* Buy Now Button - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-500">
              <button
                onClick={handleBuyNow}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md border border-white/20"
              >
                <ShoppingCart className="w-4 h-4" />
                BUY NOW
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-muted-foreground/80 uppercase tracking-wider font-semibold">
                {product.category}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-medium">In Stock</span>
              </div>
            </div>
            
            <h3 className="font-semibold text-foreground text-base line-clamp-1 mb-3">
              {product.name}
            </h3>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
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
                <span className="text-xs font-medium text-foreground">{product.rating}</span>
                <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            )}

            {/* Price & Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground">
                    ₨ {priceInPKR.toLocaleString('en-PK')}
                  </span>
                  {originalPriceInPKR && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₨ {originalPriceInPKR.toLocaleString('en-PK')}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  (${product.price.toFixed(0)} USD)
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 text-primary hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 hover:scale-110 border border-primary/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Add CSS for ripple effect */}
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple 0.6s linear;
        }
        
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;