import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Star, Truck, Shield, RotateCcw, Check, ArrowRight, Share2, ChevronLeft, Lock, X, Store as StoreIcon, BadgeCheck, MessageSquare, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Added missing import based on usage

// 🔥 Hooks
import { useProduct, useProducts, useProductReviews, useStoreFollow } from '@/hooks/useApi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Refs
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const mainImageRef = useRef(null); 
  const infoRef = useRef(null);
  const recommendedRef = useRef(null);
  const productCardsRef = useRef([]);
  const authModalRef = useRef(null);

  // Data Fetching
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  const { data: reviews = [], isLoading: isLoadingReviews } = useProductReviews(id || '');
  
  // --- Store Data Logic (FIXED FOR NEW STORES) ---
  // Agar product.store null hai, to hum try karte hain fallback data create karne ki
  const displayStore = product?.store || {
      id: product?.store_id, // Fallback ID from flat product object
      name: product?.store_name || "New Store", // Fallback name
      logo_url: null,
      rating: 0,
      followers_count: 0,
      is_verified: false,
      location: 'Online'
  };

  const storeId = displayStore.id;
  
  // 🔥 Store Follow Hook
  const { 
    isFollowing, 
    toggleFollow, 
    isLoading: isFollowLoading, 
    isAuthenticated: isClerkAuthenticated 
  } = useStoreFollow(storeId || '');

  // Local State
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Swipe State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const productImages = product?.images || [product?.image].filter(Boolean);

  // --- Animations ---
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

  // Auth Modal Animation
  useEffect(() => {
    if (showAuthModal) {
      if (authModalRef.current) {
        gsap.fromTo(authModalRef.current,
          { scale: 0.8, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }
    }
  }, [showAuthModal]);

  // Recommended Animation
  useEffect(() => {
    if (recommendedRef.current && productCardsRef.current.length > 0) {
      const cards = productCardsRef.current.filter(Boolean);
      ScrollTrigger.create({
        trigger: recommendedRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cards, {
            y: 0, 
            opacity: 1, 
            duration: 0.6,
            stagger: 0.1, 
            ease: 'power2.out',
          });
        },
        once: true
      });
    }
  }, [allProducts, product]);

  // Image Transition
  useEffect(() => {
    if (mainImageRef.current) {
      gsap.fromTo(mainImageRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [selectedImage]);


  // --- Handlers ---
  const handleAction = (action) => {
    gsap.to(`.btn-${action}`, { scale: 0.95, yoyo: true, repeat: 1, duration: 0.1 });

    if (action === 'buy' && !isClerkAuthenticated) {
       setShowAuthModal(true);
       return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color: product.colors?.[selectedColor],
      size: selectedSize
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

  const handleFollowStore = () => {
    if (!isClerkAuthenticated) {
        toast.error("Please login to follow this store");
        setShowAuthModal(true);
        return;
    }
    toggleFollow();
  };

  const animateIcon = (e) => {
    gsap.to(e.currentTarget, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
  };

  // --- SWIPE LOGIC ---
  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) setSelectedImage((prev) => (prev + 1) % productImages.length);
    if (isRightSwipe) setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };


  if (isLoading || !product) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div></div>;

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm overflow-hidden">
          <div ref={authModalRef} className="w-full max-w-sm rounded-[2rem] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 p-6 shadow-2xl relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10">
              <X className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-1">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Login Required</h3>
              <p className="text-muted-foreground text-sm px-2">Join us to follow stores and checkout seamlessly.</p>
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                 <Button onClick={() => navigate('/auth')} className="w-full bg-gray-100 dark:bg-white/10 text-foreground">Login</Button>
                 <Button onClick={() => navigate('/auth')} className="w-full bg-amber-500 text-black font-bold">Sign Up</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Layout>
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-background">
          <div className="bg-blob absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
          <div className="bg-blob absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
        </div>

        <div ref={containerRef} className="container mx-auto px-4 pb-10 pt-4 md:pt-8 min-h-screen relative z-10 max-w-full overflow-x-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sticky top-4 z-40">
            <button onClick={() => navigate(-1)} onMouseEnter={animateIcon} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg hover:scale-110 transition-transform">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex gap-3">
              <button onClick={handleWishlist} onMouseEnter={animateIcon} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg hover:scale-110 transition-transform">
                <Heart className={`wishlist-icon w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-foreground'}`} />
              </button>
              <button onClick={() => navigator.share({ title: product.name, url: window.location.href })} onMouseEnter={animateIcon} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* --- IMAGE SECTION --- */}
            <div ref={imageRef} className="space-y-4">
              <div 
                className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-gray-100 to-white dark:from-white/10 dark:to-transparent backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-xl touch-pan-y"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
              >
                 <img ref={mainImageRef} src={productImages[selectedImage]} alt={product.name} className="w-full h-full object-contain pointer-events-none" />
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                    {productImages.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${selectedImage === idx ? 'w-6 bg-amber-500' : 'w-2 bg-gray-300 dark:bg-white/20'}`} />
                    ))}
                 </div>
              </div>
              <div className="flex justify-center gap-3 overflow-x-auto py-2 no-scrollbar px-2">
                {productImages.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 transition-all ${selectedImage === index ? 'border-amber-500 scale-110' : 'border-transparent opacity-60'}`}>
                    <img src={img} className="w-full h-full object-contain p-1 rounded-lg" alt="thumb" />
                  </button>
                ))}
              </div>
            </div>

            {/* --- DETAILS SECTION --- */}
            <div ref={infoRef} className="space-y-6">
              <div>
                <div className="flex justify-between items-start mb-2">
                   <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 px-3 py-1 rounded-full font-bold tracking-wide text-xs uppercase">{product.category}</span>
                   <div className="flex items-center bg-yellow-400/10 px-2 py-1 rounded-lg text-amber-500 text-sm font-bold gap-1"><Star className="fill-current w-4 h-4"/> {product.rating.toFixed(1)}</div>
                </div>
                <h1 className="text-3xl font-black text-foreground leading-tight mb-2">{product.name}</h1>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Rs. {product.price.toLocaleString()}</span>
              </div>

              {/* Selections */}
              <div className="space-y-4">
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                     <h3 className="font-bold mb-2 text-foreground text-sm">Select Color</h3>
                     <div className="flex flex-wrap gap-3">
                       {product.colors.map((c, i) => (
                         <button key={i} onClick={() => setSelectedColor(i)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform ${selectedColor === i ? 'border-amber-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }}>
                           {selectedColor === i && <Check className="w-5 h-5 text-white drop-shadow-md"/>}
                         </button>
                       ))}
                     </div>
                  </div>
                )}
                
                <div className="flex gap-6">
                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex-1">
                        <h3 className="font-bold mb-2 text-foreground text-sm">Select Size</h3>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size, i) => (
                            <button key={i} onClick={() => setSelectedSize(size)} className={`min-w-[3rem] h-10 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center ${selectedSize === size ? 'border-amber-500 bg-amber-500/10 text-amber-500 scale-105' : 'border-gray-200 dark:border-white/10 text-foreground hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Quantity */}
                    <div>
                       <h3 className="font-bold mb-2 text-foreground text-sm">Quantity</h3>
                       <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-1 w-max">
                          <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="p-2 hover:text-amber-500"><Minus className="w-4 h-4 text-foreground"/></button>
                          <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
                          <button onClick={() => setQuantity(quantity+1)} className="p-2 hover:text-amber-500"><Plus className="w-4 h-4 text-foreground"/></button>
                       </div>
                    </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                 <button onClick={() => handleAction('cart')} className="btn-cart flex-1 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95">
                   <ShoppingBag className="w-5 h-5" /> Add to Cart
                 </button>
                 <button onClick={() => handleAction('buy')} className="btn-buy flex-[2] h-14 rounded-2xl flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black shadow-lg shadow-amber-500/30 transition-all active:scale-95">
                    <span className="text-lg font-bold uppercase tracking-wider">Buy Now</span>
                    <ArrowRight className="w-5 h-5" />
                 </button>
              </div>

              {/* 🔥 REDESIGNED & FIXED: Store Profile Card */}
              {/* Check agar displayStore.id exist karta hai, to render karega, bhale hi baki info missing ho */}
              {displayStore.id && (
                <div className="relative overflow-hidden bg-white dark:bg-white/5 rounded-3xl p-5 border border-gray-100 dark:border-white/10 mt-8 shadow-sm group">
                   <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <StoreIcon className="w-24 h-24" />
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start relative z-10">
                      {/* Store Avatar */}
                      <div className="relative">
                         <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-purple-600">
                             <img 
                                src={displayStore.logo_url || displayStore.avatar_url || "/placeholder.svg"} 
                                onError={(e) => e.target.src = "https://placehold.co/100x100?text=Store"}
                                alt="Store" 
                                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-zinc-900 bg-white"
                             />
                         </div>
                         {displayStore.is_verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-zinc-900" title="Verified Seller">
                                <BadgeCheck className="w-3 h-3" />
                            </div>
                         )}
                      </div>

                      {/* Store Details */}
                      <div className="flex-1 text-center sm:text-left">
                         <h4 className="font-bold text-lg text-foreground flex items-center justify-center sm:justify-start gap-2">
                            {displayStore.name || "Store Name"} 
                         </h4>
                         <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500"/> {displayStore.rating || 'New'}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{displayStore.followers_count || '0'} Followers</span>
                         </div>
                      </div>

                      {/* Follow Button */}
                      <div className="w-full sm:w-auto">
                        <Button 
                           onClick={handleFollowStore} 
                           disabled={isFollowLoading}
                           className={`w-full sm:w-auto rounded-xl px-6 h-11 font-bold transition-all shadow-md ${
                               isFollowing 
                               ? 'bg-white dark:bg-transparent border-2 border-gray-200 dark:border-white/20 text-foreground hover:bg-gray-50' 
                               : 'bg-foreground text-background hover:opacity-90'
                           }`}
                        >
                           {isFollowLoading ? (
                               <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                           ) : (
                               isFollowing ? "Following" : "Follow Store"
                           )}
                        </Button>
                      </div>
                   </div>
                   
                   {/* Extra Store Info (Optional) */}
                   <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-around text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {displayStore.location || 'Pakistan'}</div>
                        <div className="flex items-center gap-1"><Check className="w-3 h-3"/> {displayStore.rating ? '98% Positive' : 'New Seller'}</div>
                   </div>
                </div>
              )}

              {/* Tabs (Description & Reviews) */}
              <div className="pt-8">
                <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl mb-4">
                  {['description', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all capitalize ${
                        activeTab === tab 
                          ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm scale-[1.02]' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="min-h-[100px]">
                  {activeTab === 'description' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                        {product.description || "No description available for this product."}
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                         <div className="bg-green-500/10 p-3 rounded-2xl flex flex-col items-center gap-2 text-center">
                            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <span className="text-[10px] font-bold text-green-700 dark:text-green-300">100% Secure</span>
                         </div>
                         <div className="bg-blue-500/10 p-3 rounded-2xl flex flex-col items-center gap-2 text-center">
                            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">Fast Delivery</span>
                         </div>
                         <div className="bg-orange-500/10 p-3 rounded-2xl flex flex-col items-center gap-2 text-center">
                            <RotateCcw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300">Easy Returns</span>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       {isLoadingReviews ? (
                         <div className="text-center py-4 text-muted-foreground">Loading reviews...</div>
                       ) : reviews.length > 0 ? (
                         reviews.map((review) => (
                           <div key={review.id} className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback>{review.customer_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold text-sm text-foreground">{review.customer_name}</span>
                                </div>
                                <div className="flex text-amber-500"><Star className="w-3 h-3 fill-current" /> <span className="text-xs ml-1 font-bold">{review.rating}</span></div>
                              </div>
                              <p className="text-xs text-muted-foreground pl-10">{review.comment}</p>
                              {review.seller_reply && (
                                <div className="mt-3 ml-10 pl-3 border-l-2 border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-r-lg">
                                   <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1 flex items-center gap-1"><StoreIcon className="w-3 h-3"/> Seller Reply:</p>
                                   <p className="text-[10px] text-muted-foreground">{review.seller_reply}</p>
                                </div>
                              )}
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-10 flex flex-col items-center opacity-60 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                            <MessageSquare className="w-8 h-8 mb-2 text-muted-foreground"/>
                            <p className="text-sm text-muted-foreground">No reviews yet.</p>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Section */}
          <section ref={recommendedRef} className="mt-20">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-amber-500 rounded-full block"></span>
                Recommended For You
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
              {relatedProducts.map((p, index) => (
                <div key={p.id} ref={el => productCardsRef.current[index] = el} className="opacity-0 translate-y-10">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default ProductDetailPage;

