import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Star, Truck, Shield, RotateCcw, Check, Box, ArrowRight, Share2, ChevronLeft, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import Product3DViewer from '@/components/Product3DViewer';
import ProductReviews from '@/components/ProductReviews';
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
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const productCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [show3D, setShow3D] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Animations
  useEffect(() => {
    if (!product || !containerRef.current) return;

    // Background Blobs Float Animation
    gsap.to('.bg-blob', {
      y: 'random(-50, 50)',
      x: 'random(-50, 50)',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 2
    });

    // Content Entry
    const tl = gsap.timeline();
    
    tl.fromTo(imageRef.current, 
      { opacity: 0, x: -50, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(infoRef.current?.children || [],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)' },
      '-=0.4'
    );

  }, [product]);

  // Wave Animation for Suggestions
  useEffect(() => {
    if (suggestionsRef.current && productCardsRef.current.length > 0) {
      ScrollTrigger.create({
        trigger: suggestionsRef.current,
        start: 'top 75%',
        onEnter: () => {
          gsap.fromTo(productCardsRef.current.filter(Boolean),
            { y: 100, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.8, 
              stagger: 0.1, 
              ease: 'elastic.out(1, 0.75)' 
            }
          );
        },
        once: true
      });
    }
  }, [allProducts, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
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

  const productImages = [product.image, product.image, product.image];

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

  return (
    <Layout>
      {/* BACKGROUND BLOBS FOR LIQUID EFFECT */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="bg-blob absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="bg-blob absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="bg-blob absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
      </div>

      <div ref={containerRef} className="container mx-auto px-4 pb-32 pt-4 md:pt-8 min-h-screen">
        
        {/* Mobile Navigation Header */}
        <div className="flex items-center justify-between mb-6 md:hidden sticky top-4 z-40">
          <button onClick={() => navigate(-1)} className="p-3 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button onClick={handleWishlist} className="p-3 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-transform">
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-3 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-8 p-4 rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/10 w-fit">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* LEFT: IMAGE GALLERY (GLASS CARD) */}
          <div ref={imageRef} className="space-y-4">
            <div className="relative aspect-[4/5] md:aspect-square w-full rounded-[2.5rem] overflow-hidden bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl group">
              
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-6 left-6 z-20 px-4 py-2 rounded-2xl bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black font-bold text-sm shadow-xl">
                  SAVE {discount}%
                </div>
              )}

              {/* 3D / Image View */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                {show3D ? (
                  <Product3DViewer 
                    productImage={product.image} 
                    color={product.colors?.[selectedColor] || '#8B5CF6'} 
                  />
                ) : (
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                  />
                )}
              </div>

              {/* 3D Toggle Button */}
              <button
                onClick={() => setShow3D(!show3D)}
                className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/20 shadow-lg hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Box className="w-5 h-5" />
                <span className="font-semibold text-sm">{show3D ? '2D View' : '3D View'}</span>
              </button>
            </div>

            {/* Thumbnails (Glass Pills) */}
            <div className="flex justify-center gap-4 overflow-x-auto pb-2 px-2 no-scrollbar">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 backdrop-blur-md bg-white/20 dark:bg-black/20 ${
                    selectedImage === index 
                      ? 'border-primary shadow-lg scale-105' 
                      : 'border-transparent hover:border-white/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO (GLASS PANELS) */}
          <div ref={infoRef} className="space-y-6">
            
            {/* Title & Price Card */}
            <div className="p-6 md:p-8 rounded-[2rem] bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-10 -mt-10" />
              
              <div className="flex justify-between items-start mb-4">
                <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">{product.rating}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through mb-1.5 decoration-2">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-500 font-medium flex items-center gap-1">
                <Zap className="w-4 h-4 fill-current" /> Fast Delivery Available
              </p>
            </div>

            {/* Selectors Card (Color & Quantity) */}
            <div className="p-6 rounded-[2rem] bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/10 dark:border-white/5 shadow-lg space-y-6">
              
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
                            ? 'border-primary scale-110 shadow-lg shadow-primary/20' 
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
                <div className="flex items-center gap-4 bg-white/40 dark:bg-black/40 rounded-2xl w-fit p-1.5 border border-white/10 shadow-inner">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Actions (Hidden on Mobile) */}
            <div className="hidden md:flex gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 h-16 text-lg rounded-2xl bg-white/80 dark:bg-black/80 hover:bg-white text-foreground border border-white/20 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]"
              >
                Add to Cart
              </Button>
              <Button 
                onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                className="flex-[2] h-16 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 transition-all hover:scale-[1.02]"
              >
                Buy Now <ArrowRight className="w-5 h-5 ml-2" />
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
                { icon: Truck, label: 'Free Ship', desc: 'On orders $50+' },
                { icon: Shield, label: 'Warranty', desc: '2 Years Full' },
                { icon: RotateCcw, label: 'Returns', desc: '30 Days' },
              ].map(({ icon: Icon, label, desc }, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/5 text-center hover:bg-white/20 transition-colors">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="font-bold text-xs md:text-sm">{label}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DETAILS TABS (Glass Style) */}
        <div className="mt-16 md:mt-24">
          <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                    : 'bg-white/10 dark:bg-black/10 text-muted-foreground hover:bg-white/20 backdrop-blur-md'
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
            {/* Specs Tab Content... (Simpler version for brevity) */}
          </div>
        </div>

        {/* RELATED PRODUCTS (Wave Animation) */}
        <section ref={suggestionsRef} className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 pl-4 border-l-4 border-primary">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, index) => (
              <div key={p.id} ref={el => productCardsRef.current[index] = el} className="opacity-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MOBILE STICKY ACTION BAR (Floating Glass) */}
      <div className="fixed bottom-24 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-10 duration-500">
        <div className="p-2 rounded-[2rem] bg-black/80 dark:bg-white/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-2">
          <div className="pl-4 pr-2 flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase">Total</span>
            <span className="text-lg font-bold text-white dark:text-black leading-none">${(product.price * quantity).toFixed(0)}</span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="h-12 w-12 rounded-full bg-gray-700/50 dark:bg-gray-200/50 flex items-center justify-center text-white dark:text-black"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>

          <button 
            onClick={() => { handleAddToCart(); navigate('/checkout'); }}
            className="flex-1 h-12 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/40 flex items-center justify-center gap-2"
          >
            Buy Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </Layout>
  );
};

export default ProductDetailPage;
