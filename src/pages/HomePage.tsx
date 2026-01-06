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
import { useTheme } from 'next-themes';

// Lazy load heavy components
const ParticleBackground = lazy(() => import('@/components/ParticleBackground'));
const HeroCard = lazy(() => import('@/components/HeroCard'));
const ThreeScene = lazy(() => import('@/components/ThreeScene'));

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

const ProductSkeletonCard = () => (
  <div className="bg-card rounded-2xl border p-4 h-full">
    <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 animate-pulse"></div>
    <div className="h-4 bg-gradient-to-r from-muted to-muted/70 rounded-full w-3/4 mb-2 animate-pulse"></div>
    <div className="h-4 bg-gradient-to-r from-muted to-muted/70 rounded-full w-1/2 animate-pulse"></div>
    <div className="mt-4 h-10 bg-gradient-to-r from-muted to-muted/70 rounded-lg animate-pulse"></div>
  </div>
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

// --- Theme Toggle Component ---
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full w-10 h-10"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

// --- New Arrivals Card Component ---
const NewArrivalCard = ({ title, subtitle, price, image, badgeText }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = ((x - centerX) / centerX) * 5;
      const rotateX = ((centerY - y) / centerY) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative bg-gradient-to-br from-card to-card/80 rounded-3xl border p-6 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-primary/30"
    >
      {badgeText && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {badgeText}
          </span>
        </div>
      )}
      
      <div className="relative h-48 mb-6 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
        
        {price && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-2xl font-bold">${price}</span>
            <Button className="rounded-full px-6">
              Add to cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main HomePage ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('new-arrivals');
  const heroRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const oldTracksRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Tracking hook
  const { trackInteraction, getRecommendations } = useTracking();

  // Real Data Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Enhanced hero slides based on your images
  const heroSlides = useMemo(() => {
    return [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
        title: '15 New Arrivals',
        subtitle: 'Experience premium sound quality',
        badge: 'Limited Edition',
        link: '/products?new=true',
        gradient: 'from-blue-600/20 to-purple-600/20',
        content: (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-white drop-shadow-2xl">15</div>
              <div className="text-2xl font-semibold text-white">new arrivals</div>
            </div>
          </div>
        )
      },
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2068',
        title: 'Headphones & Speakers',
        subtitle: 'With new sounds',
        badge: 'Premium',
        link: '/products?category=audio',
        gradient: 'from-amber-600/20 to-orange-600/20',
        content: (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="text-4xl font-bold text-white">Headphones</div>
              <div className="text-4xl font-bold text-white">Speakers</div>
              <div className="text-xl text-white/80">With new sounds</div>
            </div>
          </div>
        )
      }
    ];
  }, []);

  // Get personalized recommendations
  const featuredProducts = useMemo(() => {
    if (products.length === 0) return [];
    return getRecommendations(products);
  }, [products, getRecommendations]);

  // New arrivals data based on your images
  const newArrivals = useMemo(() => [
    {
      id: 'airpods-pro',
      title: 'AirPods Pro',
      subtitle: 'Active noise cancellation',
      price: 249.00,
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=2070',
      badgeText: 'New'
    },
    {
      id: 'headphones-premium',
      title: 'Premium Headphones',
      subtitle: 'Mesh textile wraps the ear cushions',
      description: 'A mesh textile wraps the ear cushions to provide pillow-like softness',
      price: 499.00,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
      badgeText: 'Premium'
    },
    {
      id: 'speakers',
      title: 'Wireless Speakers',
      subtitle: '360° surround sound',
      price: 199.00,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2065',
      badgeText: 'Sale'
    }
  ], []);

  // Old tracks with new sounds
  const oldTracksWithNewSounds = useMemo(() => [
    {
      id: 'classic-revamped',
      title: 'Classic Headphones Revamped',
      subtitle: 'Old tracks with new sounds',
      description: 'Experience classic designs with modern audio technology',
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=2070'
    },
    {
      id: 'vintage-speakers',
      title: 'Vintage Speakers',
      subtitle: 'Retro look, modern sound',
      description: 'Blending vintage aesthetics with cutting-edge audio',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2065'
    }
  ], []);

  // --- Preload Images ---
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = [...heroSlides, ...newArrivals, ...oldTracksWithNewSounds]
        .filter(item => item.image)
        .map(slide => {
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

    preloadImages();
  }, [heroSlides, newArrivals, oldTracksWithNewSounds]);

  // --- GSAP Animations (Enhanced) ---
  useEffect(() => {
    if (loading) return;

    // Kill existing ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    const ctx = gsap.context(() => {
      // Hero entrance animation
      gsap.from('.hero-content', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2
      });

      // Three.js container animation
      gsap.from('.three-container', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
          trigger: '.three-container',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // New arrivals animation
      gsap.from('.new-arrival-card', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.new-arrivals-section',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      });

      // Old tracks animation
      gsap.from('.old-track-card', {
        x: -100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.old-tracks-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Section title animations
      gsap.utils.toArray('.section-title').forEach((title: any) => {
        gsap.from(title, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: title,
            start: 'top 85%'
          }
        });
      });

      // Floating animation for cards
      gsap.to('.floating-card', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    });

    // Refresh ScrollTrigger
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [loading]);

  // --- Three.js Scene Integration ---
  const [threeJsReady, setThreeJsReady] = useState(false);

  // --- Theme-based animations ---
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#ffffff' : '#000000';
    gsap.to('body', {
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
      duration: 0.5,
      ease: 'power2.out'
    });
  }, [theme]);

  // --- Navigation between sections ---
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: section,
          offsetY: 80
        },
        ease: 'power2.inOut'
      });
      setActiveSection(sectionId);
    }
  };

  // Show loader while initializing
  if (loading) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading amazing audio experience...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Theme Toggle */}
      <div className="fixed top-24 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-background via-background to-muted/5">
        
        {/* HERO SECTION with Animated Numbers */}
        <section 
          ref={heroRef}
          className="relative w-full h-[500px] md:h-[700px] mb-8 md:mb-12"
        >
          {/* Background with Three.js */}
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />}>
            <div className="absolute inset-0 three-container">
              <ThreeScene 
                onReady={() => setThreeJsReady(true)}
                theme={theme}
              />
            </div>
          </Suspense>
          
          <div className="relative h-full w-full mx-auto">
            <div ref={sliderRef} className="relative h-full w-full">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} backdrop-blur-sm`} />
                  <div className="container mx-auto px-4 h-full flex items-center justify-center">
                    <div className="hero-content text-center max-w-4xl space-y-6">
                      <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {slide.title.split(' ')[0]}
                      </div>
                      <div className="text-4xl md:text-6xl font-bold text-foreground">
                        {slide.title.split(' ').slice(1).join(' ')}
                      </div>
                      <p className="text-xl md:text-2xl text-muted-foreground">
                        {slide.subtitle}
                      </p>
                      <Button 
                        asChild 
                        size="lg" 
                        className="rounded-full px-8 mt-4 animate-pulse"
                        onClick={() => trackInteraction('click', 'hero_cta')}
                      >
                        <Link to={slide.link}>
                          Explore Collection <ArrowRight className="ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {heroSlides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setCurrentSlide(i);
                    trackInteraction('click', `hero_dot_${i}`);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide 
                      ? 'w-8 bg-primary shadow-lg' 
                      : 'w-2 bg-primary/30 hover:bg-primary hover:w-4'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* NEW ARRIVALS SECTION */}
        <section 
          id="new-arrivals" 
          ref={newArrivalsRef}
          className="new-arrivals-section py-16 container mx-auto px-4"
        >
          <div className="text-center mb-12">
            <div className="section-title">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Latest Releases</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                New Arrivals
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Discover the latest audio technology and premium sound experiences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newArrivals.map((item, index) => (
              <div 
                key={item.id} 
                className="new-arrival-card floating-card"
                onClick={() => {
                  trackInteraction('click', `new_arrival_${item.id}`);
                  navigate(`/product/${item.id}`);
                }}
              >
                <NewArrivalCard {...item} />
              </div>
            ))}
          </div>

          {/* Additional new arrivals showcase */}
          <div className="mt-16 bg-gradient-to-r from-card to-card/50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold">With New Sounds</h3>
                <p className="text-muted-foreground">
                  Experience revolutionary audio technology that brings your favorite tracks to life like never before.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Active Noise Cancellation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Spatial Audio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>High-Fidelity Sound</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=2070"
                  alt="Audio Technology"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* OLD TRACKS WITH NEW SOUNDS SECTION */}
        <section 
          id="old-tracks" 
          ref={oldTracksRef}
          className="old-tracks-section py-16 bg-gradient-to-b from-transparent to-muted/10"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="section-title">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Old Tracks
                </h2>
                <div className="text-2xl md:text-3xl font-semibold text-primary">
                  With New Sounds
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg mt-2">
                  Classic designs reimagined with modern audio technology
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {oldTracksWithNewSounds.map((item) => (
                <div 
                  key={item.id} 
                  className="old-track-card group relative bg-gradient-to-br from-card to-card/80 rounded-3xl border p-8 overflow-hidden hover:shadow-2xl transition-all duration-500"
                  onClick={() => {
                    trackInteraction('click', `old_track_${item.id}`);
                    navigate(`/product/${item.id}`);
                  }}
                >
                  <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-lg text-primary font-semibold">{item.subtitle}</p>
                    <p className="text-muted-foreground">{item.description}</p>
                    
                    <div className="pt-4">
                      <Button className="rounded-full px-8">
                        Experience the Sound
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Feature Highlight */}
            <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3">
                  <div className="text-6xl font-bold text-primary">$499.00</div>
                  <p className="text-muted-foreground mt-2">Premium Audio Experience</p>
                </div>
                <div className="md:w-2/3">
                  <h4 className="text-2xl font-bold mb-4">
                    A mesh textile wraps the ear cushions to provide pillow-like softness
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    Experience unparalleled comfort with our premium ear cushion technology. 
                    Designed for extended listening sessions without fatigue.
                  </p>
                  <div className="flex gap-4">
                    <Button className="rounded-full px-8">
                      Add to cart
                    </Button>
                    <Button variant="outline" className="rounded-full px-8">
                      Learn more
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED CATEGORIES */}
        <section className="categories-section py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
              <p className="text-muted-foreground">Find the perfect audio gear for your needs</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Headphones', count: '15+ models', icon: '🎧', color: 'from-blue-500/20 to-cyan-500/20' },
                { name: 'Speakers', count: '20+ models', icon: '🔊', color: 'from-purple-500/20 to-pink-500/20' },
                { name: 'Earbuds', count: '12+ models', icon: '🎵', color: 'from-green-500/20 to-emerald-500/20' },
                { name: 'Accessories', count: '30+ items', icon: '🎛️', color: 'from-orange-500/20 to-amber-500/20' },
              ].map((cat, i) => (
                <div
                  key={i}
                  className={`category-card group relative bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
                  onClick={() => {
                    trackInteraction('click', `category_${cat.name}`);
                    navigate(`/products?category=${cat.name.toLowerCase()}`);
                  }}
                >
                  <div className="text-4xl mb-4">{cat.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-16 container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-secondary" />
            
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10 p-8 md:p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Experience Premium Sound?
              </h3>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of audio enthusiasts who have upgraded their listening experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 rounded-full px-8"
                  onClick={() => {
                    trackInteraction('click', 'cta_shop_now');
                    navigate('/products');
                  }}
                >
                  Shop Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 rounded-full px-8"
                  onClick={() => {
                    trackInteraction('click', 'cta_browse');
                    navigate('/categories');
                  }}
                >
                  Browse All
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;