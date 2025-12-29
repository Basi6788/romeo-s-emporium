import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Star, Truck, Shield, RotateCcw, Check, ArrowRight, Share2, ChevronLeft, Lock, X } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProduct, useProducts } from '@/hooks/useApi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const infoRef = useRef(null);
  const suggestionsRef = useRef(null);
  const productCardsRef = useRef([]);
  const authModalRef = useRef(null);

  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 1. Entrance & Background Animations
  useEffect(() => {
    if (!product || !containerRef.current) return;

    gsap.to('.bg-blob', {
      y: 'random(-40, 40)',
      x: 'random(-40, 40)',
      scale: 'random(0.9, 1.1)',
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 2
    });

    const tl = gsap.timeline();
    tl.fromTo(imageRef.current, 
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(infoRef.current?.children || [],
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out' },
      '-=0.4'
    );
  }, [product]);

  // 2. Auth Modal Animation
  useEffect(() => {
    if (showAuthModal && authModalRef.current) {
      gsap.fromTo(authModalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [showAuthModal]);

  // 3. Faster Suggestions Animation
  useEffect(() => {
    if (suggestionsRef.current && productCardsRef.current.length > 0) {
      const cards = productCardsRef.current.filter(Boolean);
      
      ScrollTrigger.create({
        trigger: suggestionsRef.current,
        start: 'top 85%', // Start animation a bit earlier
        onEnter: () => {
          gsap.to(cards, {
            y: 0, 
            opacity: 1, 
            duration: 0.6, // Faster duration
            stagger: 0.1, 
            ease: 'power2.out', // Smoother, faster ease
          });
        },
        once: true
      });
    }
  }, [allProducts, product]);

  const handleAction = (action) => {
    gsap.to(`.btn-${action}`, { scale: 0.95, yoyo: true, repeat: 1, duration: 0.1 });

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color: product.colors?.[selectedColor]
    };

    if (action === 'cart') {
      addToCart(cartItem);
      toast.success('Added to cart!');
    } else {
      addToCart(cartItem);
      navigate('/checkout');
    }
  };

  const handleWishlist = () => {
    gsap.fromTo('.wishlist-icon', { scale: 1 }, { scale: 1.4, duration: 0.2, yoyo: true, repeat: 1 });
    
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

  const animateIcon = (e) => {
    gsap.to(e.currentTarget, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
  };

  if (isLoading || !product) return <div className="min-h-screen bg-background" />;

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const productImages = product.images || [product.image, product.image, product.image];

  return (
    <Layout>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-background">
        <div className="bg-blob absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
        <div className="bg-blob absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
      </div>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            ref={authModalRef}
            className="w-full max-w-sm rounded-[2rem] bg-white/10 dark:bg-black/80 backdrop-blur-xl border border-white/20 p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">Login Required</h3>
              <p className="text-muted-foreground text-sm">Jani, order place karne ke liye pehle login karna paray ga. Sirf aik minute lagay ga!</p>
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                 <Button onClick={() => navigate('/auth?mode=login')} className="w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 h-12">Login</Button>
                 <Button onClick={() => navigate('/auth?mode=signup')} className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold h-12">Sign Up</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} className="container mx-auto px-4 pb-10 pt-4 md:pt-8 min-h-screen relative z-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6 sticky top-4 z-40">
          <button onClick={() => navigate(-1)} onMouseEnter={animateIcon} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-110 transition-transform">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-3">
            <button onClick={handleWishlist} onMouseEnter={animateIcon} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-110 transition-transform">
              <Heart className={`wishlist-icon w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-foreground'}`} />
            </button>
            <button onClick={() => { navigator.share({ title: product.name, url: window.location.href }); }} onMouseEnter={animateIcon} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* IMAGE SECTION */}
          <div ref={imageRef} className="space-y-4">
            <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 shadow-2xl">
               <img src={productImages[selectedImage]} alt={product.name} className="w-full h-full object-contain p-6 drop-shadow-2xl" />
            </div>
            <div className="flex justify-center gap-3 overflow-x-auto py-2 no-scrollbar">
              {productImages.map((img, index) => (
                <button key={index} onClick={() => setSelectedImage(index)} className={`w-16 h-16 rounded-xl border-2 transition-all ${selectedImage === index ? 'border-amber-500 scale-110' : 'border-transparent opacity-60'}`}>
                  <img src={img} className="w-full h-full object-contain p-1" alt={`Thumbnail ${index}`} />
                </button>
              ))}
            </div>
          </div>

          {/* DETAILS & ACTIONS SECTION */}
          <div ref={infoRef} className="space-y-6">
            {/* Title, Price & Rating */}
            <div>
              <div className="flex justify-between items-start mb-2">
                 <span className="text-amber-500 font-bold tracking-widest text-xs uppercase block">{product.category}</span>
                 <div className="flex items-center text-amber-500 text-sm font-bold gap-1"><Star className="fill-current w-4 h-4"/> {product.rating}</div>
              </div>
              <h1 className="text-3xl font-black text-foreground mb-2 leading-tight">{product.name}</h1>
              {/* Price Moved Here and Rs:1 Removed */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
                  Rs. {product.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Color & Qty */}
            <div className="flex flex-wrap gap-6 items-center">
               {product.colors && (
                 <div className="flex gap-2">
                   {product.colors.map((c, i) => (
                     <button key={i} onClick={() => setSelectedColor(i)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${selectedColor === i ? 'border-amber-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }}>
                       {selectedColor === i && <Check className="w-4 h-4 text-white drop-shadow-md"/>}
                     </button>
                   ))}
                 </div>
               )}
               <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="p-2 hover:text-amber-500"><Minus className="w-4 h-4"/></button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity+1)} className="p-2 hover:text-amber-500"><Plus className="w-4 h-4"/></button>
               </div>
            </div>

            {/* --- BIG BUTTONS --- */}
            <div className="pt-4 space-y-3">
               {/* CLEAN BUY NOW BUTTON */}
               <button
                 onClick={() => handleAction('buy')}
                 className="btn-buy w-full h-16 rounded-2xl flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition-all active:scale-95"
               >
                  <span className="text-xl font-bold uppercase tracking-wider">Buy Now</span>
                  <ArrowRight className="w-6 h-6 animate-pulse" />
               </button>

               {/* ADD TO CART */}
               <button
                 onClick={() => handleAction('cart')}
                 className="btn-cart w-full h-14 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
               >
                 <ShoppingBag className="w-5 h-5" /> Add to Cart
               </button>

               {/* TRUST BADGES */}
               <div className="flex justify-center gap-6 pt-2 opacity-70">
                  <div className="flex flex-col items-center gap-1"><Shield className="w-5 h-5 text-green-500" /><span className="text-[10px]">Secure</span></div>
                  <div className="flex flex-col items-center gap-1"><Truck className="w-5 h-5 text-blue-500" /><span className="text-[10px]">Fast Ship</span></div>
                  <div className="flex flex-col items-center gap-1"><RotateCcw className="w-5 h-5 text-orange-500" /><span className="text-[10px]">Returns</span></div>
               </div>
            </div>

            {/* Description Tab */}
            <div className="pt-6 border-t border-white/10">
               <h3 className="font-bold mb-2">Description</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">{product.description || "Experience premium quality with Basit Shop. Best in class materials."}</p>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS (Faster Animation) */}
        <section ref={suggestionsRef} className="mt-20">
          <h2 className="text-2xl font-bold mb-6 pl-4 border-l-4 border-amber-500">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p, index) => (
              <div key={p.id} ref={el => productCardsRef.current[index] = el} className="opacity-0 translate-y-10">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
