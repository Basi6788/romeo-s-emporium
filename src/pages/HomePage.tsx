import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Headphones, Clock, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

const heroSlides = [
  {
    id: 1,
    title: 'iPhone 16 Pro',
    subtitle: 'Extraordinary Visual & Exceptional Power',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch_GEO_US?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1726187221849',
    gradient: 'from-violet-600 to-indigo-800',
    badge: 'New Release',
  },
  {
    id: 2,
    title: 'Galaxy Watch Ultra',
    subtitle: 'The Ultimate Smartwatch Experience',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/uk/2407/gallery/uk-galaxy-watch-ultra-l310-sm-l310nttaeub-542342134?$1300_1038_PNG$',
    gradient: 'from-orange-600 to-rose-700',
    badge: 'Best Seller',
  },
  {
    id: 3,
    title: 'AirPods Pro 2',
    subtitle: 'Immersive Sound, Adaptive Audio',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=976&hei=916&fmt=jpeg&qlt=90&.v=1724041668836',
    gradient: 'from-emerald-600 to-teal-800',
    badge: 'Popular',
  },
  {
    id: 4,
    title: 'MacBook Pro M3',
    subtitle: 'Power. Performance. Pro.',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200',
    gradient: 'from-slate-700 to-zinc-900',
    badge: 'Pro Series',
  },
];

const SLIDE_DURATION = 5000;

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 4);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-slide
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Progress bar animation
  useEffect(() => {
    if (!progressRef.current || isPaused) return;
    progressRef.current.style.transition = 'none';
    progressRef.current.style.width = '0%';
    
    requestAnimationFrame(() => {
      if (progressRef.current) {
        progressRef.current.style.transition = `width ${SLIDE_DURATION}ms linear`;
        progressRef.current.style.width = '100%';
      }
    });
  }, [currentSlide, isPaused]);

  const currentHero = heroSlides[currentSlide];

  return (
    <Layout>
      {/* Hero Section - Simplified */}
      <section 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`relative min-h-[500px] md:min-h-[600px] bg-gradient-to-br ${currentHero.gradient} transition-colors duration-700`}>
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/5 blur-[120px]" />
          </div>

          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[500px] md:min-h-[600px] py-16">
              {/* Content */}
              <div className="order-2 md:order-1 text-white animate-fade-in" key={currentSlide}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  {currentHero.badge}
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
                  {currentHero.title}
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-md">
                  {currentHero.subtitle}
                </p>
                <div className="flex gap-4">
                  <Button asChild size="lg" className="h-12 px-8 bg-white text-gray-900 hover:bg-white/90">
                    <Link to="/products">
                      Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 border-white/30 bg-white/10 text-white hover:bg-white/20">
                    <Link to="/products">Learn More</Link>
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="relative order-1 md:order-2 flex justify-center items-center">
                <div className="relative w-full max-w-[400px] aspect-square animate-scale-in" key={`img-${currentSlide}`}>
                  <img
                    src={currentHero.image}
                    alt={currentHero.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div ref={progressRef} className="h-full bg-white/50" style={{ width: '0%' }} />
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-6 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-3 Business Days' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always Here' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Link to="/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      {dealProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-amber-500/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">HOT</span>
                <h2 className="text-2xl font-bold">Flash Deals</h2>
              </div>
              <Link to="/products" className="text-sm text-primary hover:underline font-medium">See All</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banners */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-800 p-10 min-h-[260px]">
              <div className="relative z-10">
                <span className="text-white/70 text-sm font-medium">Limited Offer</span>
                <h3 className="text-3xl font-bold text-white mt-2 mb-4">Up to 50% Off</h3>
                <p className="text-white/80 mb-6">On selected electronics</p>
                <Button asChild className="bg-white text-violet-600 hover:bg-white/90">
                  <Link to="/products">Shop Now</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-10 min-h-[260px]">
              <div className="relative z-10">
                <span className="text-white/70 text-sm font-medium">New Arrivals</span>
                <h3 className="text-3xl font-bold text-white mt-2 mb-4">Latest Tech</h3>
                <p className="text-white/80 mb-6">Discover the newest gadgets</p>
                <Button asChild className="bg-white text-emerald-600 hover:bg-white/90">
                  <Link to="/products">Explore</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Subscribe to Newsletter</h2>
            <p className="text-muted-foreground mb-6">Get 15% off your first order</p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" className="h-12">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
