import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- WIRING FOR CUSTOMIZATION PAGE (FUTURE PROOFING) ---
// Jab tumhara customization page ban jaye, to ye settings DB se fetch karna
// Aur niche component me 'themeConfig' state me set karna.
const defaultThemeConfig = {
  colors: {
    primary: 'from-violet-600 via-purple-600 to-indigo-800', // Gradient preset
    accent: '#ffffff',
    text: '#ffffff',
  },
  layout: {
    heroHeight: 'min-h-[600px] md:min-h-[700px]', // Thora aur luxury height
    cardStyle: 'rounded-2xl',
    animationSpeed: 0.8,
  },
  overlay: {
    opacity: 0.6, // Dark luxury overlay
    color: 'bg-black',
  }
};

// --- MOCK DATA (FALLBACK ONLY - Will not show during loading) ---
const defaultHeroSlides = [
  {
    id: 'default-1',
    title: 'Welcome to ZARAE',
    subtitle: 'Premium Quality, Delivered to Your Doorstep.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=3270&auto=format&fit=crop', // A darker, generic luxury placeholder
    gradient: defaultThemeConfig.colors.primary,
    badge: 'Welcome',
    link: '/products',
  },
];

// --- SKELETON LOADER COMPONENT (Luxury Style) ---
const HeroSkeleton = () => (
  <div className={`relative w-full ${defaultThemeConfig.layout.heroHeight} bg-black overflow-hidden`}>
    <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
    <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-20">
      <div className="w-32 h-8 bg-neutral-800 rounded-full mb-4 animate-pulse" />
      <div className="w-3/4 md:w-1/2 h-16 bg-neutral-800 rounded-xl mb-4 animate-pulse" />
      <div className="w-1/2 md:w-1/3 h-6 bg-neutral-800 rounded-lg mb-8 animate-pulse" />
      <div className="flex gap-4">
        <div className="w-36 h-12 bg-neutral-800 rounded-xl animate-pulse" />
        <div className="w-36 h-12 bg-neutral-800 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  // Theme Config State (Isy future me DB se connect kar dena)
  const [themeConfig] = useState(defaultThemeConfig);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  
  // Touch Handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  // Section refs for parallax
  const featuresRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const dealsRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const promoRef = useRef<HTMLElement>(null);
  
  // Data Fetching
  const { data: products = [], isLoading: isProductsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  
  // NOTE: Ensure useHeroImages returns 'isLoading'. If not, we handle undefined check.
  const { data: dbHeroImages, isLoading: isHeroLoading } = useHeroImages();

  // Logic to prevent Mock Data Flash
  const heroSlides = useMemo(() => {
    // Agar DB se data aa gaya hai aur empty nahi hai:
    if (dbHeroImages && dbHeroImages.length > 0) {
      return dbHeroImages.map(hero => ({
        id: hero.id,
        title: hero.title,
        subtitle: hero.subtitle || '',
        image: hero.image,
        gradient: hero.gradient || themeConfig.colors.primary,
        badge: hero.badge || 'New',
        link: hero.link || '/products',
      }));
    }
    // Agar loading khatam ho gayi lekin DB khali hai, tabhi default dikhao
    if (!isHeroLoading && (!dbHeroImages || dbHeroImages.length === 0)) {
        return defaultHeroSlides;
    }
    return []; // Jab tak load ho raha hai, empty return karo (Skeleton handle karega)
  }, [dbHeroImages, isHeroLoading, themeConfig]);

  // Derived Data
  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 4);

  // Animations Setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Improved Parallax & Reveal Animations
      const revealAnim = (elem: any, delay = 0) => {
        return {
          y: 0,
          opacity: 1,
          duration: themeConfig.layout.animationSpeed,
          delay: delay,
          ease: 'power3.out',
        };
      };

      if (featuresRef.current) {
        gsap.set(featuresRef.current.querySelectorAll('.feature-item'), { y: 30, opacity: 0 });
        ScrollTrigger.batch(featuresRef.current.querySelectorAll('.feature-item'), {
            start: 'top 90%',
            onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 })
        });
      }

      // Add other GSAP animations here as needed (kept simplified for performance)
      
    });
    return () => ctx.revert();
  }, [products, themeConfig]);

  // Slide Controls
  const animateSlide = useCallback((newIndex: number, direction: 'next' | 'prev') => {
    if (isAnimating || heroSlides.length === 0) return;
    setIsAnimating(true);

    const currentContent = contentRefs.current[currentSlide];
    const currentImage = imageRefs.current[currentSlide];
    const currentSlideEl = slideRefs.current[currentSlide];
    
    const newContent = contentRefs.current[newIndex];
    const newImage = imageRefs.current[newIndex];
    const newSlideEl = slideRefs.current[newIndex];

    const xOffset = direction === 'next' ? 50 : -50; // Reduced movement for luxury feel

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSlide(newIndex);
        setIsAnimating(false);
      }
    });

    // Fade Out Current
    tl.to(currentContent, { opacity: 0, x: -xOffset, duration: 0.5, ease: 'power2.inOut' }, 0)
      .to(currentImage, { opacity: 0, scale: 1.05, duration: 0.5 }, 0) // Subtle scale
      .set(currentSlideEl, { visibility: 'hidden', zIndex: 0 }, 0.5);

    // Fade In New
    tl.set(newSlideEl, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(newImage, 
        { opacity: 0, scale: 1.1 }, 
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 0.1)
      .fromTo(newContent, 
        { opacity: 0, x: xOffset }, 
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, 0.2);

  }, [currentSlide, isAnimating, heroSlides.length]);

  const nextSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next, 'next');
  }, [currentSlide, animateSlide, heroSlides.length]);

  const prevSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev, 'prev');
  }, [currentSlide, animateSlide, heroSlides.length]);

  // Initial Slide Animation
  useEffect(() => {
    if (heroSlides.length > 0 && !isHeroLoading) {
       // Reset styles
       slideRefs.current.forEach((slide, idx) => {
         if(slide) {
           gsap.set(slide, { 
             visibility: idx === 0 ? 'visible' : 'hidden', 
             zIndex: idx === 0 ? 10 : 0 
           });
         }
       });
       
       // Animate first slide entry
       const firstContent = contentRefs.current[0];
       const firstImage = imageRefs.current[0];
       if(firstContent && firstImage) {
         gsap.fromTo(firstImage, {scale: 1.1, opacity: 0}, {scale: 1, opacity: 1, duration: 1});
         gsap.fromTo(firstContent, {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, delay: 0.3});
       }
    }
  }, [heroSlides.length, isHeroLoading]);

  // Autoplay
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const autoplay = setInterval(() => {
        if (!document.hidden) nextSlide();
    }, 6000); // 6 seconds
    return () => clearInterval(autoplay);
  }, [heroSlides.length, nextSlide]);

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`relative overflow-hidden bg-black ${themeConfig.layout.heroHeight}`}
        onTouchStart={(e) => touchStartX.current = e.touches[0].clientX}
        onTouchMove={(e) => touchEndX.current = e.touches[0].clientX}
        onTouchEnd={() => {
            const diff = touchStartX.current - touchEndX.current;
            if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
        }}
      >
        {/* LOGIC: Show Skeleton if Loading, otherwise Real Slides */}
        {isHeroLoading || (!dbHeroImages && heroSlides.length === 0) ? (
          <HeroSkeleton />
        ) : (
          <div className={`relative ${themeConfig.layout.heroHeight}`}>
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                ref={el => slideRefs.current[index] = el}
                className="absolute inset-0 overflow-hidden"
                style={{ visibility: index === 0 ? 'visible' : 'hidden' }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-black">
                    <img
                    ref={el => imageRefs.current[index] = el}
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    />
                </div>
                
                {/* Customizable Overlay (Wiring Ready) */}
                <div className={`absolute inset-0 ${themeConfig.overlay.color} opacity-${themeConfig.overlay.opacity * 100}`} style={{opacity: themeConfig.overlay.opacity}} />
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90`} />

                {/* Content */}
                <div className="container mx-auto px-4 h-full relative z-10">
                  <div className={`flex flex-col justify-end ${themeConfig.layout.heroHeight} pb-20 md:pb-28`}>
                    <div ref={el => contentRefs.current[index] = el} className="max-w-2xl">
                      
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium mb-6 border border-white/20 text-white w-fit uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        {slide.badge}
                      </span>
                      
                      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 tracking-tight leading-none text-white drop-shadow-2xl">
                        {slide.title}
                      </h1>
                      
                      <p className="text-base md:text-xl text-gray-200 mb-8 max-w-lg font-light leading-relaxed">
                        {slide.subtitle}
                      </p>
                      
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          asChild 
                          size="lg" 
                          className="h-14 px-8 bg-white text-black hover:bg-gray-100 rounded-full font-bold text-base transition-transform hover:scale-105"
                        >
                          <Link to={slide.link}>
                            Shop Collection <ArrowRight className="ml-2 w-5 h-5" />
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="outline" 
                          size="lg" 
                          className="h-14 px-8 border-white/30 bg-black/20 text-white hover:bg-white/10 rounded-full backdrop-blur-md text-base"
                        >
                          <Link to="/products">View All</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Controls (Only show if multiple slides) */}
            {heroSlides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/50 transition-all text-white border border-white/10 group">
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button onClick={nextSlide} className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/50 transition-all text-white border border-white/10 group">
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {heroSlides.map((_, i) => (
                        <button
                        key={i}
                        onClick={() => animateSlide(i, i > currentSlide ? 'next' : 'prev')}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            i === currentSlide ? 'w-10 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        />
                    ))}
                    </div>
                </>
            )}
          </div>
        )}
      </section>

      {/* Features Bar - Minimal & Clean */}
      <section ref={featuresRef} className="py-8 bg-background border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Express Delivery', desc: 'Ships within 24h' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: '24/7 Support', desc: 'Dedicated Team' },
              { icon: Sparkles, title: 'Authentic', desc: 'Genuine Products' },
            ].map((f, i) => (
              <div key={i} className="feature-item flex flex-col items-center text-center md:flex-row md:text-left gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                <div className="p-3 rounded-full bg-primary/5 text-primary">
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid - Wiring Ready for Customization */}
      <section ref={categoriesRef} className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
                <span className="text-primary font-medium tracking-wider text-xs uppercase">Collections</span>
                <h2 className="text-3xl font-bold text-foreground mt-2">Browse Categories</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-sm font-semibold hover:text-primary transition-colors">
                View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat: any) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/5] bg-muted ${themeConfig.layout.cardStyle}`}
              >
                {cat.image_url ? (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-4xl">{cat.icon}</span>
                    </div>
                )}
                {/* Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <h3 className="text-white font-medium text-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {cat.name}
                    </h3>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="rounded-full w-full">
                <Link to="/products">View All Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products - Cleaned Layout */}
      <section ref={featuredRef} className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
             <Link to="/products" className="text-sm font-semibold hover:text-primary">See All</Link>
          </div>
          
          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card group">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern Newsletter Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black">
            {/* Abstract Background Wiring */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block p-3 rounded-full bg-white/10 mb-6 backdrop-blur-sm border border-white/10">
             <Sparkles className="w-6 h-6 text-white" />
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Join the Club</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Subscribe to receive exclusive access to limited edition drops and early sales.
          </p>
          
          <form className="max-w-md mx-auto flex gap-3 relative">
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full h-14 pl-6 pr-32 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all backdrop-blur-md"
            />
            <Button 
                type="submit" 
                className="absolute right-1.5 top-1.5 h-11 px-6 rounded-full bg-white text-black hover:bg-gray-200 font-bold"
            >
              Sign Up
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
