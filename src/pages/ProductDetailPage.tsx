import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Star, Truck, Shield, RotateCcw, Check, ArrowRight, Share2, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews'; // Ensure this exists
import { useProduct, useProducts } from '@/hooks/useApi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Refs for Animations
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const productCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);

  // 1. Entrance Animations (Premium Feel)
  useEffect(() => {
    if (!product || !containerRef.current) return;

    // Background Golden Blobs Animation
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

    // Content Slide Up Animation
    const tl = gsap.timeline();
    
    tl.fromTo(imageRef.current, 
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
    )
    .fromTo(infoRef.current?.children || [],
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo(stickyBarRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' },
      '-=0.4'
    );

  }, [product]);

  // 2. Suggestions Scroll Animation
  useEffect(() => {
    if (suggestionsRef.current && productCardsRef.current.length > 0) {
      ScrollTrigger.create({
        trigger: suggestionsRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(productCardsRef.current.filter(Boolean),
            { y: 80, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.8, 
              stagger: 0.1, 
              ease: 'power3.out' 
            }
          );
        },
        once: true
      });
    }
  }, [allProducts, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  // Use array of images if available, otherwise fallback
  const productImages = product.images || [product.image, product.image, product.image];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color: product.colors?.[selectedColor]
    });
    toast.success('Added to cart!');
  };

  const handleWishlist = () => {
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

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  // Helper to format currency to PKR
  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <Layout>
      {/* GOLDEN LIQUID BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-background">
        <div className="bg-blob absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] opacity-60 mix-blend-screen" />
        <div className="bg-blob absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[100px] opacity-50 mix-blend-screen" />
      </div>

      <div ref={containerRef} className="container mx-auto px-4 pb-40 pt-4 md:pt-8 min-h-screen relative z-10">
        
        {/* Mobile Header (Glass) */}
        <div className="flex items-center justify-between mb-6 md:hidden sticky top-4 z-40">
          <button onClick={() => navigate(-1)} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-105 transition-transform active:scale-95">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-3">
            <button onClick={handleWishlist} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-105 transition-transform active:scale-95">
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-foreground'}`} />
            </button>
            <button onClick={handleShare} className="p-3 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-105 transition-transform active:scale-95">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Desktop Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-8 p-4 rounded-2xl bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 w-fit">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-500 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* LEFT: IMAGE GALLERY (NO 3D) */}
          <div ref={imageRef} className="space-y-4">
            <div className="relative aspect-[4/5] md:aspect-square w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-transparent backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl group">
              
              {/* Discount Badge (Golden) */}
              {discount > 0 && (
                <div className="absolute top-6 left-6 z-20 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 animate-pulse">
                  -{discount}% OFF
                </div>
              )}

              {/* Main Image */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-700 ease-in-out group-hover:scale-110 drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Thumbnails (Glass Pills) */}
            <div className="flex justify-center gap-4 overflow-x-auto pb-2 px-2 no-scrollbar">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 backdrop-blur-md bg-white/30 dark:bg-black/30 ${
                    selectedImage === index 
                      ? 'border-amber-500 shadow-lg shadow-amber-500/20 scale-105' 
                      : 'border-transparent hover:border-amber-500/50'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div ref={infoRef} className="space-y-6">
            
            {/* Title & Price Card */}
            <div className="p-6 md:p-8 rounded-[2rem] bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl relative overflow-hidden">
              {/* Golden Glow effect inside card */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4">
                <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">{product.rating}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 drop-shadow-sm">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through decoration-2 decoration-rose-500/50">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-sm text-emerald-500 font-bold flex items-center gap-1.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                In Stock & Ready to Ship
              </p>
            </div>

            {/* Selectors Card */}
            <div className="p-6 rounded-[2rem] bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/10 dark:border-white/5 shadow-lg space-y-6">
              
              {/* Colors */}
              {product.colors && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(index)}
                        className={`w-12 h-12 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center border-2 ${
                          selectedColor === index 
                            ? 'border-amber-500 scale-110 shadow-lg shadow-amber-500/20' 
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === index && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quantity</h3>
                <div className="flex items-center gap-4 bg-white/50 dark:bg-black/50 rounded-2xl w-fit p-1.5 border border-white/20 shadow-inner">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 h-16 text-lg rounded-2xl bg-white/80 dark:bg-black/80 hover:bg-white text-foreground border border-amber-500/20 hover:border-amber-500 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]"
              >
                Add to Cart
              </Button>
              <Button 
                onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                className="flex-[2] h-16 text-lg rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] border-0"
              >
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Buy Now
              </Button>
              <button 
                onClick={handleWishlist}
                className={`h-16 w-16 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 ${
                  isInWishlist(product.id) ? 'text-rose-500 bg-rose-500/10 border-rose-500/50' : 'text-muted-foreground hover:text-rose-500'
                }`}
              >
                <Heart className={`w-7 h-7 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery', desc: 'All over Pakistan' },
                { icon: Shield, label: 'Warranty', desc: '1 Year Brand' },
                { icon: RotateCcw, label: 'Returns', desc: '7 Days Check' },
              ].map(({ icon: Icon, label, desc }, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/10 text-center hover:bg-white/30 transition-colors group">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="font-bold text-xs md:text-sm text-foreground">{label}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DETAILS TABS */}
        <div className="mt-16 md:mt-24">
          <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all duration-300 whitespace-nowrap border ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-500/30 scale-105' 
                    : 'bg-white/10 dark:bg-black/10 text-muted-foreground border-white/10 hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10 rounded-[2.5rem] bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || 'Experience the perfect blend of innovation and design. This product represents the pinnacle of quality.'}
                </p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} productRating={product.rating || 4.5} reviewCount={product.reviews || 0} />
            )}
             {/* Specs placeholder */}
             {activeTab === 'specifications' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                   <span className="text-muted-foreground">Brand</span>
                   <span className="font-semibold">Basit Shop</span>
                 </div>
                 <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-semibold">{product.id.substring(0,8).toUpperCase()}</span>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <section ref={suggestionsRef} className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 pl-4 border-l-4 border-amber-500">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, index) => (
              <div key={p.id} ref={el => productCardsRef.current[index] = el} className="opacity-0">
                {/* Note: ProductCard needs to handle currency separately or via context, 
                    but layout here ensures it fits */}
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MOBILE STICKY ACTION BAR (FLOATING ABOVE BOTTOM NAV) */}
      <div 
        ref={stickyBarRef}
        className="fixed bottom-[80px] md:bottom-0 left-4 right-4 z-40 md:hidden"
      >
        <div className="p-2.5 rounded-[2rem] bg-black/80 dark:bg-white/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-3 ring-1 ring-white/10">
          <div className="pl-4 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total</span>
            <span className="text-lg font-bold text-white dark:text-black leading-none font-mono">
              Rs.{(product.price * quantity).toLocaleString()}
            </span>
          </div>
          
          <div className="flex-1 flex gap-2 justify-end">
            <button 
              onClick={handleAddToCart}
              className="h-12 w-12 rounded-full bg-gray-700/50 dark:bg-gray-200/50 flex items-center justify-center text-white dark:text-black hover:bg-amber-500 hover:text-white transition-colors border border-white/5"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>

            <button 
              onClick={() => { handleAddToCart(); navigate('/checkout'); }}
              className="flex-1 max-w-[160px] h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Buy Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default ProductDetailPage;
