// pages/HomePage.tsx
import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, Moon, Sun } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { useTracking } from '@/hooks/useTracking';
import { Button } from '@/components/ui/button';
import ProductLoader from '@/components/Loaders/ProductLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSwipeable } from 'react-swipeable';
import ThreeScene from '@/components/ThreeScene';

// Lazy load heavy components
const ParticleBackground = lazy(() => import('@/components/ParticleBackground'));
const HeroCard = lazy(() => import('@/components/HeroCard'));

gsap.registerPlugin(ScrollTrigger);

// --- Skeletons ---
const HeroSkeleton = () => (
  <div className="w-full h-[500px] md:h-[600px] bg-gradient-to-r from-muted/10 via-muted/20 to-muted/10 animate-pulse overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground font-medium">Loading Amazing Offers...</p>
      </div>
    </div>
  </div>
);

const ThreeSceneSkeleton = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-pulse" />
);

// --- Swipe Handler Component ---
const SwipeHandler = ({ 
  onSwipedLeft, 
  onSwipedRight, 
  children 
}: { 
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
  children: React.ReactNode;
}) => {
  const handlers = useSwipeable({
    onSwipedLeft,
    onSwipedRight,
    trackMouse: true,
    trackTouch: true,
    delta: 10,
    preventScrollOnSwipe: true,
    swipeDuration: 500
  });

  return (
    <div {...handlers} className="w-full h-full">
      {children}
    </div>
  );
};

// --- Main HomePage ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeScene, setActiveScene] = useState<'hero' | 'products' | 'categories' | 'features'>('hero');
  
  const heroRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const navigate = useNavigate();
  
  // Tracking hook
  const { trackInteraction, getRecommendations } = useTracking();

  // Real Data Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Filter and memoize hero slides
  const heroSlides = useMemo(() => {
    if (!dbHeroImages || dbHeroImages.length === 0) {
      return [
        {
          id: '1',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
          title: 'Premium Collection',
          subtitle: 'Discover amazing deals on trending products',
          badge: 'Limited Time',
          link: '/products',
          gradient: 'from-purple-600/20 to-pink-600/20'
        },
        {
          id: '2',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
          title: 'Summer Sale',
          subtitle: 'Up to 60% off on selected items',
          badge: 'Hot Deal',
          link: '/products?category=electronics',
          gradient: 'from-blue-600/20 to-cyan-600/20'
        },
        {
          id: '3',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999',
          title: 'New Arrivals',
          subtitle: 'Fresh styles added daily',
          badge: 'Just In',
          link: '/products?new=true',
          gradient: 'from-green-600/20 to-emerald-600/20'
        }
      ];
    }
    return dbHeroImages;
  }, [dbHeroImages]);

  // Get personalized recommendations
  const featuredProducts = useMemo(() => {
    if (products.length === 0) return [];
    return getRecommendations(products);
  }, [products, getRecommendations]);

  // Toggle dark/light mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      // Animate mode change
      gsap.to('body', {
        backgroundColor: newMode ? '#000' : '#fff',
        duration: 0.5,
        ease: 'power2.inOut'
      });
      trackInteraction('click', `toggle_${newMode ? 'dark' : 'light'}_mode`);
      return newMode;
    });
  }, [trackInteraction]);

  // --- Preload Images ---
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroSlides.map(slide => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = slide.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setLoading(false);
      } catch (error) {
        console.error('Failed to preload images:', error);
        setLoading(false);
      }
    };

    if (heroSlides.length > 0) {
      preloadImages();
    }
  }, [heroSlides]);

  // --- GSAP Animations with Scene Transitions ---
  useEffect(() => {
    if (productsLoading || heroLoading) return;

    // Kill existing ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    const ctx = gsap.context(() => {
      // Hero entrance animation with Three.js
      gsap.from('.hero-content', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5
      });

      // Features animation with scene transition
      const featuresTrigger = ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top 80%',
        onEnter: () => {
          setActiveScene('features');
          gsap.from('.feature-card', {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)'
          });
        }
      });

      // Products animation with scene transition
      const productsTrigger = ScrollTrigger.create({
        trigger: '.products-section',
        start: 'top 70%',
        onEnter: () => {
          setActiveScene('products');
          gsap.from('.product-card', {
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
          });
        }
      });

      // Categories animation with scene transition
      const categoriesTrigger = ScrollTrigger.create({
        trigger: '.categories-section',
        start: 'top 75%',
        onEnter: () => {
          setActiveScene('categories');
          gsap.from('.category-card', {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'elastic.out(1, 0.5)'
          });
        }
      });

      // Banner animation
      gsap.from('.banner-content', {
        y: 30,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: '.banner-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      // Scene fade transitions
      const sections = ['hero', 'features', 'categories', 'products'];
      sections.forEach(section => {
        const element = scenesRef.current.get(section);
        if (element) {
          ScrollTrigger.create({
            trigger: element,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
              gsap.to(element, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
              });
            },
            onLeaveBack: () => {
              gsap.to(element, {
                opacity: 0.3,
                duration: 0.3,
                ease: 'power2.in'
              });
            }
          });
        }
      });
    });

    // Refresh ScrollTrigger after animations
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [productsLoading, heroLoading]);

  // --- Swipeable Slide Logic with 3D Effects ---
  const goToSlide = useCallback((index: number) => {
    if (heroSlides.length <= 1 || isAnimating) return;
    
    setIsAnimating(true);
    
    // Get current and next slide elements
    const currentSlideEl = sliderRef.current?.children[currentSlide] as HTMLElement;
    const nextSlideEl = sliderRef.current?.children[index] as HTMLElement;
    
    // Determine direction for 3D effect
    const direction = index > currentSlide ? 1 : -1;
    
    // Create 3D perspective animation
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSlide(index);
        setIsAnimating(false);
        trackInteraction('click', `hero_slide_${index}`, { slide: index });
      }
    });

    if (currentSlideEl && nextSlideEl) {
      // Add 3D perspective to container
      gsap.set(sliderRef.current, { perspective: 1000 });
      
      // Current slide rotates out
      tl.to(currentSlideEl, {
        rotationY: direction * 90,
        opacity: 0,
        scale: 0.8,
        duration: 0.7,
        ease: "power2.in",
        transformOrigin: "50% 50% -300px"
      })
      // Next slide rotates in
      .fromTo(nextSlideEl,
        {
          rotationY: -direction * 90,
          opacity: 0,
          scale: 0.8,
          transformOrigin: "50% 50% -300px"
        },
        {
          rotationY: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "power2.out"
        },
        "-=0.5"
      )
      // Add blur effect during transition
      .to('.hero-slide-blur', {
        filter: 'blur(10px)',
        duration: 0.3,
        ease: 'power2.inOut'
      }, 0)
      .to('.hero-slide-blur', {
        filter: 'blur(0px)',
        duration: 0.3,
        ease: 'power2.inOut'
      }, 0.7);
    } else {
      setCurrentSlide(index);
      setIsAnimating(false);
    }
  }, [heroSlides.length, currentSlide, isAnimating, trackInteraction]);

  const nextSlide = useCallback(() => {
    const nextIndex = (currentSlide + 1) % heroSlides.length;
    goToSlide(nextIndex);
  }, [currentSlide, heroSlides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    goToSlide(prevIndex);
  }, [currentSlide, heroSlides.length, goToSlide]);

  // Auto-slide with pause on hover/swipe
  useEffect(() => {
    if (heroSlides.length <= 1 || isAnimating) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroSlides.length, nextSlide, isAnimating]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Show loader while initializing
  if (loading && heroSlides.length > 0) {
    return (
      <Layout>
        <ProductLoader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-black' 
          : 'bg-gradient-to-b from-white via-gray-50 to-gray-100'
      }`}>
        
        {/* Dark/Light Mode Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <Button
            onClick={toggleDarkMode}
            size="icon"
            variant="outline"
            className="rounded-full h-12 w-12 backdrop-blur-lg bg-white/10 dark:bg-black/10 border-white/20 dark:border-gray-700"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </Button>
        </div>

        {/* HERO SECTION with 3D Effects */}
        <section 
          ref={(el) => el && scenesRef.current.set('hero', el)}
          className="relative w-full h-[600px] md:h-[700px] mb-12 md:mb-20 opacity-100"
        >
          {/* Three.js Background for Hero */}
          <div className="absolute inset-0 overflow-hidden rounded-none md:rounded-3xl">
            <Suspense fallback={<ThreeSceneSkeleton />}>
              <ThreeScene 
                isDarkMode={isDarkMode} 
                sceneType={activeScene === 'hero' ? 'hero' : 'products'}
                intensity={1}
              />
            </Suspense>
            
            {/* Gradient overlay */}
            <div className={`absolute inset-0 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-black/70 via-gray-900/50 to-black/70' 
                : 'bg-gradient-to-br from-white/70 via-blue-50/50 to-white/70'
            }`} />
          </div>
          
          {heroLoading ? (
            <HeroSkeleton />
          ) : heroSlides.length > 0 ? (
            <SwipeHandler onSwipedLeft={nextSlide} onSwipedRight={prevSlide}>
              <div className="relative h-full w-full mx-auto overflow-hidden hero-slide-blur">
                <div ref={sliderRef} className="relative h-full w-full">
                  {heroSlides.map((slide, index) => (
                    <div
                      key={slide.id || index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                      style={{
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <Suspense fallback={<HeroSkeleton />}>
                        <div className="hero-content relative z-10 h-full flex items-center justify-center px-4 md:px-8">
                          <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-block mb-4 px-4 py-2 rounded-full backdrop-blur-lg bg-white/10 dark:bg-black/10 border border-white/20 dark:border-gray-700">
                              <span className="text-sm font-semibold text-primary dark:text-primary-light">
                                {slide.badge}
                              </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                              {slide.title}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                              {slide.subtitle}
                            </p>
                            <Button 
                              asChild 
                              size="lg" 
                              className="rounded-full px-8 h-12 text-base group"
                              onClick={() => trackInteraction('click', 'hero_cta')}
                            >
                              <Link to={slide.link}>
                                Shop Now
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Suspense>
                    </div>
                  ))}
                </div>
                
                {/* Navigation Dots with 3D effect */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                  {heroSlides.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => goToSlide(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentSlide 
                          ? 'w-10 h-2 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]' 
                          : 'w-2 h-2 bg-white/50 hover:bg-white hover:w-6'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                      disabled={isAnimating}
                    />
                  ))}
                </div>
                
                {/* Navigation Arrows with 3D hover */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full backdrop-blur-lg bg-white/10 dark:bg-black/10 border border-white/20 dark:border-gray-700 flex items-center justify-center hover:scale-110 hover:bg-white/20 transition-all duration-300"
                  disabled={isAnimating}
                >
                  <ArrowRight className="h-6 w-6 text-white rotate-180" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full backdrop-blur-lg bg-white/10 dark:bg-black/10 border border-white/20 dark:border-gray-700 flex items-center justify-center hover:scale-110 hover:bg-white/20 transition-all duration-300"
                  disabled={isAnimating}
                >
                  <ArrowRight className="h-6 w-6 text-white" />
                </button>
              </div>
            </SwipeHandler>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Sparkles className="w-12 h-12 text-primary mx-auto" />
                <p className="text-xl font-semibold">No Offers Available</p>
                <p className="text-muted-foreground">Check back soon for amazing deals!</p>
              </div>
            </div>
          )}
        </section>

        {/* FEATURES SECTION with Three.js Background */}
        <section 
          ref={(el) => el && scenesRef.current.set('features', el)}
          className="features-section relative py-16 md:py-24 opacity-100"
        >
          {/* Three.js Background for Features */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />}>
              <ThreeScene 
                isDarkMode={isDarkMode} 
                sceneType="features"
                intensity={0.3}
              />
            </Suspense>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Why Choose Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Experience shopping like never before with our premium services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-green-500', bg: 'bg-green-500/10' },
                { icon: Clock, title: 'Fast Delivery', desc: 'Global shipping', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { icon: Headphones, title: '24/7 Support', desc: 'Always here for you', color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((f, i) => (
                <div 
                  key={i} 
                  className="feature-card group relative bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-2xl p-6 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  onClick={() => trackInteraction('click', `feature_${f.title}`)}
                >
                  {/* 3D hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`w-16 h-16 rounded-full ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <f.icon className={`w-8 h-8 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 relative z-10">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 relative z-10">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION with Three.js */}
        <section 
          ref={(el) => el && scenesRef.current.set('categories', el)}
          className="categories-section relative py-16 md:py-24 opacity-100"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />}>
              <ThreeScene 
                isDarkMode={isDarkMode} 
                sceneType="categories"
                intensity={0.2}
              />
            </Suspense>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Browse Categories
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-3">Shop by your favorite categories</p>
              </div>
              <Button variant="outline" asChild className="rounded-full backdrop-blur-lg bg-white/10 dark:bg-black/10">
                <Link to="/categories">View All Categories</Link>
              </Button>
            </div>
            
            {categoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                {categories.slice(0, 12).map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/products?category=${cat.id}`}
                    className="category-card group relative bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-2xl p-4 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    onClick={() => trackInteraction('click', `category_${cat.name}`)}
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
                      {/* 3D rotation effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:from-primary/40 group-hover:to-secondary/40 transition-all duration-500 group-hover:rotate-180" />
                      
                      {cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          alt={cat.name} 
                          className="relative w-full h-full rounded-full object-cover border-2 border-transparent group-hover:border-primary/50 transition-all duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-2xl">
                          📦
                        </div>
                      )}
                    </div>
                    <span className="block text-center font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PRODUCTS SECTION with Three.js */}
        <section 
          ref={(el) => el && scenesRef.current.set('products', el)}
          className="products-section relative py-16 md:py-24 opacity-100"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />}>
              <ThreeScene 
                isDarkMode={isDarkMode} 
                sceneType="products"
                intensity={0.4}
              />
            </Suspense>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-gray-700 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Personalized For You</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {featuredProducts.length > 0 ? 'Recommended Just For You' : 'Trending Now'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {featuredProducts.length > 0 
                  ? 'Based on your browsing history and preferences'
                  : 'Top picks from our collection'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsLoading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/10 dark:bg-black/10 rounded-2xl p-4 h-96 animate-pulse" />
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="product-card group relative"
                    style={{ perspective: '1000px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      trackInteraction('product_click', product.id);
                      navigate(`/product/${product.id}`);
                    }}
                  >
                    {/* 3D card container */}
                    <div className="relative h-full bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                      {/* Product image with 3D effect */}
                      <div className="relative h-48 md:h-56 overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* 3D gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      {/* Product info */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          {product.rating >= 4.5 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                                {product.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          <Button 
                            size="sm" 
                            className="rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackInteraction('add_to_cart', product.id);
                            }}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-lg font-semibold">No products available</p>
                    <p className="text-gray-600 dark:text-gray-400">Check back soon for new arrivals!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-12">
              <Button 
                asChild 
                size="lg" 
                className="rounded-full px-8 h-12 text-base backdrop-blur-lg bg-white/10 dark:bg-black/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => trackInteraction('click', 'explore_store_button')}
              >
                <Link to="/products">Explore Full Store</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* BANNER SECTION */}
        <section className="banner-section relative py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="banner-content relative rounded-3xl overflow-hidden">
              {/* Three.js background for banner */}
              <div className="absolute inset-0">
                <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />}>
                  <ThreeScene 
                    isDarkMode={isDarkMode} 
                    sceneType="hero"
                    intensity={0.6}
                  />
                </Suspense>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-secondary/90" />
              </div>
              
              <div className="relative z-10 p-8 md:p-12 lg:p-16 text-white">
                <div className="max-w-2xl">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    Start Shopping Today!
                  </h3>
                  <p className="text-lg text-white/90 mb-8">
                    Join millions of happy customers. Get exclusive deals, early access to sales, and personalized recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      asChild 
                      size="lg" 
                      className="bg-white text-primary hover:bg-white/90 rounded-full px-8"
                      onClick={() => trackInteraction('click', 'banner_shop_now')}
                    >
                      <Link to="/products">Shop Now</Link>
                    </Button>
                    <Button 
                      asChild 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/10 rounded-full px-8"
                    >
                      <Link to="/signup">Create Account</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;