import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Headphones, Clock, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const heroSlides = [
  {
    id: 1,
    title: 'iPhone 16 Pro',
    subtitle: 'Extraordinary Visual & Exceptional Power',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch_GEO_US?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1726187221849',
    bg: 'from-violet-600/20 via-blue-600/10 to-transparent',
    badge: 'New Release',
  },
  {
    id: 2,
    title: 'Galaxy Watch Ultra',
    subtitle: 'The Ultimate Smartwatch Experience',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/uk/2407/gallery/uk-galaxy-watch-ultra-l310-sm-l310nttaeub-542342134?$1300_1038_PNG$',
    bg: 'from-orange-600/20 via-amber-600/10 to-transparent',
    badge: 'Best Seller',
  },
  {
    id: 3,
    title: 'AirPods Pro 2',
    subtitle: 'Immersive Sound, Adaptive Audio',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=976&hei=916&fmt=jpeg&qlt=90&.v=1724041668836',
    bg: 'from-emerald-600/20 via-teal-600/10 to-transparent',
    badge: 'Popular',
  },
  {
    id: 4,
    title: 'MacBook Pro M3',
    subtitle: 'Power. Performance. Pro.',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200',
    bg: 'from-slate-600/20 via-gray-600/10 to-transparent',
    badge: 'Pro Series',
  },
  {
    id: 5,
    title: 'Sony WH-1000XM5',
    subtitle: 'Industry Leading Noise Cancellation',
    image: 'https://electronics.sony.com/image/5d02da5df552836db364cec8a7c56a52?fmt=png-alpha&wid=960',
    bg: 'from-rose-600/20 via-pink-600/10 to-transparent',
    badge: 'Award Winner',
  },
  {
    id: 6,
    title: 'iPad Pro M2',
    subtitle: 'Supercharged by M2 Chip',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202210?wid=940&hei=1112&fmt=p-jpg&qlt=95&.v=1664411207213',
    bg: 'from-indigo-600/20 via-purple-600/10 to-transparent',
    badge: 'Featured',
  },
];

const SLIDE_DURATION = 4000; // 4 seconds per slide

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 4);

  const animateSlide = useCallback(() => {
    if (contentRef.current && imageRef.current) {
      const tl = gsap.timeline();
      
      // Animate out
      tl.to([contentRef.current, imageRef.current], {
        opacity: 0,
        x: -30,
        duration: 0.3,
        ease: 'power2.in'
      })
      // Animate in
      .fromTo(contentRef.current, 
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
      )
      .fromTo(imageRef.current,
        { opacity: 0, scale: 0.9, x: 30 },
        { opacity: 1, scale: 1, x: 0, duration: 0.6, ease: 'back.out(1.2)' },
        '-=0.4'
      );
    }
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    animateSlide();
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
  }, [currentSlide, isAnimating, animateSlide]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  // Auto-slide with progress
  useEffect(() => {
    if (isPaused) return;
    
    // Reset and animate progress bar
    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: SLIDE_DURATION / 1000, ease: 'none' }
      );
    }

    const interval = setInterval(() => {
      if (!isAnimating) nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [currentSlide, isAnimating, isPaused, nextSlide]);

  // Scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.category-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
          scrollTrigger: { trigger: '.categories-section', start: 'top 85%' }
        }
      );

      gsap.fromTo('.product-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: '.products-section', start: 'top 85%' }
        }
      );
    });

    return () => ctx.revert();
  }, [products, categories]);

  const currentHero = heroSlides[currentSlide];

  return (
    <Layout>
      {/* Hero Slider */}
      <section 
        ref={heroRef} 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`relative min-h-[520px] md:min-h-[580px] bg-gradient-to-br ${currentHero.bg} transition-all duration-700`}>
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[520px] md:min-h-[580px] py-12">
              {/* Content */}
              <div ref={contentRef} className="order-2 md:order-1">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  <Zap className="w-3 h-3" />
                  {currentHero.badge}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  {currentHero.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6 max-w-md">
                  {currentHero.subtitle}
                </p>
                <div className="flex gap-3">
                  <Button asChild size="lg" className="h-11 px-6">
                    <Link to="/products">
                      Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-11 px-6">
                    <Link to="/products">Learn More</Link>
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="relative order-1 md:order-2 flex justify-center items-center">
                <div className="relative w-full max-w-[350px] md:max-w-[400px] aspect-square">
                  <img
                    ref={imageRef}
                    src={currentHero.image}
                    alt={currentHero.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20">
            <div ref={progressRef} className="h-full bg-primary origin-left" style={{ transform: 'scaleX(0)' }} />
          </div>

          {/* Slider Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="p-2.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  disabled={isAnimating}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="p-2.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Counter */}
          <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium">
            {currentSlide + 1} / {heroSlides.length}
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-5 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-3 Business Days' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always Here' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Categories</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-card flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      {dealProducts.length > 0 && (
        <section className="py-10 bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-amber-500/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold">HOT</span>
                <h2 className="text-xl font-bold">Flash Deals</h2>
              </div>
              <Link to="/products" className="text-sm text-primary hover:underline">See All</Link>
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
      <section className="products-section py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">View All</Link>
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
                <div key={product.id} className="product-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banners */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 p-8 min-h-[220px]">
              <div className="relative z-10">
                <span className="text-white/70 text-sm">Limited Offer</span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-3">Up to 50% Off</h3>
                <p className="text-white/80 text-sm mb-4">On selected electronics</p>
                <Button asChild size="sm" className="bg-white text-violet-600 hover:bg-white/90">
                  <Link to="/products">Shop Now</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-8 min-h-[220px]">
              <div className="relative z-10">
                <span className="text-white/70 text-sm">New Arrivals</span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-3">Latest Tech</h3>
                <p className="text-white/80 text-sm mb-4">Discover the newest gadgets</p>
                <Button asChild size="sm" className="bg-white text-emerald-600 hover:bg-white/90">
                  <Link to="/products">Explore</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-10 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-xl font-bold mb-2">Subscribe to Newsletter</h2>
            <p className="text-sm text-muted-foreground mb-5">Get 15% off your first order</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
