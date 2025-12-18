import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, Check, Box, Loader2, ArrowRight, Share2, ChevronLeft } from 'lucide-react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const productCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [show3D, setShow3D] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Entry animation
  useEffect(() => {
    if (contentRef.current && product) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, [product]);

  // Wave animation for suggestions
  useEffect(() => {
    if (suggestionsRef.current && productCardsRef.current.length > 0) {
      const cards = productCardsRef.current.filter(Boolean);
      
      gsap.set(cards, { opacity: 0, y: 60, scale: 0.9 });
      
      ScrollTrigger.create({
        trigger: suggestionsRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: {
              each: 0.12,
              from: 'start',
              ease: 'power2.out'
            },
            ease: 'back.out(1.2)',
          });
          
          // Continuous wave animation
          gsap.to(cards, {
            y: -8,
            duration: 1.5,
            stagger: {
              each: 0.15,
              repeat: -1,
              yoyo: true,
              from: 'start'
            },
            ease: 'sine.inOut',
            delay: 0.8
          });
        },
        once: true
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [allProducts, product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-primary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-muted-foreground animate-pulse">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Box className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Product not found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')} className="rounded-xl">
              Browse Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const suggestedProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 8);

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

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color: product.colors?.[selectedColor]
    });
    navigate('/checkout');
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
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  const productImages = [product.image, product.image, product.image];

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[150px]">{product.name}</span>
            </nav>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="container mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Gallery */}
          <div className="space-y-4">
            {show3D ? (
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                <Product3DViewer 
                  productImage={product.image} 
                  color={product.colors?.[selectedColor] || '#8B5CF6'} 
                />
                <button
                  onClick={() => setShow3D(false)}
                  className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-background/90 backdrop-blur-sm text-sm font-medium shadow-lg hover:bg-background transition-colors"
                >
                  View Image
                </button>
              </div>
            ) : (
              <>
                <div className="relative aspect-square bg-gradient-to-br from-muted/30 via-card to-muted/30 rounded-3xl overflow-hidden border border-border/50 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg">
                      -{discount}% OFF
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={() => setShow3D(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background/90 backdrop-blur-sm text-sm font-medium shadow-lg hover:bg-background transition-all hover:scale-105"
                    >
                      <Box className="w-4 h-4" />
                      3D View
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2.5 rounded-xl bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background transition-all hover:scale-105"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-3">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index 
                          ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-2 bg-muted/30" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Title */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  {product.category}
                </span>
                {product.inStock !== false && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{product.rating}</span>
                </div>
                <span className="text-muted-foreground text-sm">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-sm font-semibold">
                    Save ${(product.originalPrice! - product.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description Preview */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description || 'Experience premium quality with this exceptional product. Designed with attention to detail and crafted for excellence.'}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Color: <span className="font-normal text-muted-foreground">{product.colors[selectedColor]}</span></h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`relative w-12 h-12 rounded-xl border-2 transition-all duration-300 ${
                        selectedColor === index 
                          ? 'border-primary scale-110 shadow-lg' 
                          : 'border-border hover:border-primary/50 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === index && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-muted rounded-xl overflow-hidden border border-border">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="p-3 hover:bg-background transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="p-3 hover:bg-background transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">${(product.price * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleAddToCart} 
                variant="outline"
                size="lg"
                className="flex-1 h-14 rounded-2xl font-semibold text-base border-2 hover:bg-muted"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow} 
                size="lg"
                className="flex-1 h-14 rounded-2xl font-semibold text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                Buy Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button
                onClick={handleWishlist}
                className={`h-14 w-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${
                  isInWishlist(product.id) 
                    ? 'bg-rose-500 border-rose-500 text-white scale-105' 
                    : 'border-border hover:border-rose-500 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-6">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'Orders $100+' },
                { icon: Shield, label: '2 Year Warranty', desc: 'Full coverage' },
                { icon: RotateCcw, label: 'Easy Returns', desc: '30 days' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl w-fit">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-background text-foreground shadow-lg' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray dark:prose-invert max-w-3xl">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description || 'Experience the perfect blend of innovation and design. This product represents the pinnacle of quality and craftsmanship, delivering exceptional performance and reliability for your everyday needs.'}
                </p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
              {[
                  { label: 'Brand', value: 'BASITSHOP' },
                  { label: 'Category', value: product.category },
                  { label: 'Model', value: product.name.split(' ')[0] },
                  { label: 'Warranty', value: '2 Years' },
                  { label: 'Return Policy', value: '30 Days' },
                  { label: 'Availability', value: product.inStock !== false ? 'In Stock' : 'Out of Stock' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center p-4 rounded-xl bg-muted/50 border border-border/50">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} productRating={product.rating || 4.5} reviewCount={product.reviews || 0} />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
              <Link to={`/products?category=${product.category}`} className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Suggestions Section with Wave Animation */}
        {suggestedProducts.length > 0 && (
          <section ref={suggestionsRef} className="mt-20 py-12 -mx-4 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-3xl border border-border/50">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                ✨ You Might Also Like
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-2">Suggested For You</h2>
              <p className="text-muted-foreground">Discover more products you'll love</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedProducts.map((p, index) => (
                <div 
                  key={p.id} 
                  ref={el => productCardsRef.current[index] = el}
                  className="suggestion-card"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;