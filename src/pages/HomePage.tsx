import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Shield, Headphones, Clock, Sparkles } from 'lucide-react';
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

// Lazy load heavy components
const ParticleBackground = lazy(() => import('@/components/ParticleBackground'));
const HeroCard = lazy(() => import('@/components/HeroCard'));

gsap.registerPlugin(ScrollTrigger);

// --- Scroll To Top Fix Component ---
// Ye function har bar page load hone par scroll ko 0 (top) par le ayega
const useScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
};

// --- Skeletons ---
const HeroSkeleton = () => (
  <div className="w-full h-[500px] md:h-[600px] bg-gradient-to-r from-muted/10 via-muted/20 to-muted/10 animate-pulse overflow-hidden rounded-none md:rounded-3xl">
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
  </div>
);

// --- Swipe Handler Component ---
const SwipeHandler = ({ 
  onSwipedLeft, 
  onSwipedRight, 
  children 
}) => {
  const handlers = useSwipeable({
    onSwipedLeft,
    onSwipedRight,
    trackMouse: true, // Mouse drag enabled for PC
    delta: 15, // Sensitivity adjust ki hai
    preventScrollOnSwipe: true
  });

  return (
    <div {...handlers} className="w-full h-full touch-pan-y">
      {children}
    </div>
  );
};

// --- Main HomePage ---
const HomePage = () => {
  useScrollToTop(); // ✅ FIX: Page ab hamesha top se shuru hoga
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  
  const { trackInteraction, getRecommendations } = useTracking();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Hero Slides Data
  const heroSlides = useMemo(() => {
    if (!dbHeroImages || dbHeroImages.length === 0) {
      return [
        {
          id: '1',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
          title: 'Premium Collection',
          subtitle: 'Discover amazing deals',
          badge: 'Limited Time',
          link: '/products',
          gradient: 'from-purple-600/20 to-pink-600/20'
        },
        {
          id: '2',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
          title: 'Summer Sale',
          subtitle: 'Up to 60% off',
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

  const featuredProducts = useMemo(() => {
    if (products.length === 0) return [];
    return getRecommendations(products);
  }, [products, getRecommendations]);

  // Preload Images
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
        setLoading(false);
      }
    };

    if (heroSlides.length > 0) preloadImages();
  }, [heroSlides]);

  // --- GSAP Animations (FIXED for Visibility) ---
  useEffect(() => {
    if (productsLoading || heroLoading) return;

    // Wait slightly for DOM to settle
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    const ctx = gsap.context(() => {
      // ✅ FIX: `autoAlpha` use kia taa ke elements flicker na karein
      gsap.fromTo('.hero-content', 
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
      );

      gsap.fromTo('.feature-card', 
        { y: 40, autoAlpha: 0 },
        { 
          y: 0, 
          autoAlpha: 1, 
          duration: 0.6, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.features-section',
            start: 'top 90%', // Thora jaldi trigger hoga
            toggleActions: 'play none none none', // Reverse hata dia taa ke gayab na ho
          }
        }
      );

      gsap.fromTo('.product-card', 
        { y: 50, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.products-section',
            start: 'top 85%',
            toggleActions: 'play none none none' // Fix: Wapis scroll karne par gayab nahi hoga
          }
        }
      );

      gsap.fromTo('.category-card', 
        { scale: 0.8, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.05,
          scrollTrigger: {
            trigger: '.categories-section',
            start: 'top 90%'
          }
        }
      );
    });

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [productsLoading, heroLoading]);

  // --- Slider Logic ---
  const goToSlide = useCallback((index) => {
    if (heroSlides.length <= 1) return;
    const newIndex = (index + heroSlides.length) % heroSlides.length;
    setCurrentSlide(newIndex);
  }, [heroSlides.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Auto-slide
  useEffect(() => {
    if (heroSlides.length <= 1 || isSwiping) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length, nextSlide, isSwiping]);

  // Navigation Handler
  const handleCardClick = useCallback((e, productId) => {
    if ((e.target).closest('button') || (e.target).closest('a')) return;
    navigate(`/product/${productId}`);
  }, [navigate]);

  if (loading && heroSlides.length > 0) {
    return <Layout><ProductLoader /></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-background to-muted/10">
        
        {/* HERO SECTION - Updated: No Buttons, Swipe Only */}
        <section 
          ref={heroRef}
          className="relative w-full h-[500px] md:h-[600px] mb-12 md:mb-16 group"
        >
          <Suspense fallback={<div className="absolute inset-0 bg-muted" />}>
            <ParticleBackground />
          </Suspense>
          
          {heroLoading ? (
            <HeroSkeleton />
          ) : heroSlides.length > 0 ? (
            <div className="relative h-full w-full mx-auto rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-black">
              
              {/* ✅ FIX: Buttons removed, only SwipeHandler */}
              <SwipeHandler onSwipedLeft={nextSlide} onSwipedRight={prevSlide}>
                <div className="relative h-full w-full cursor-grab active:cursor-grabbing">
                  {heroSlides.map((slide, index) => (
                    <Suspense key={slide.id || index} fallback={<HeroSkeleton />}>
                      <HeroCard
                        slide={slide}
                        isActive={index === currentSlide}
                      />
                    </Suspense>
                  ))}
                </div>
              </SwipeHandler>
              
              {/* Pagination Dots (Only navigation left) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => goToSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide 
                        ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                        : 'w-2 bg-white/40 hover:bg-white hover:w-4'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/10 rounded-3xl">
              <p>No offers available</p>
            </div>
          )}
        </section>

        {/* FEATURES */}
        <section className="features-section py-8 container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders $100+' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Secure' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global Ship' },
              { icon: Headphones, title: '24/7 Support', desc: 'Contact us' },
            ].map((f, i) => (
              <div key={i} className="feature-card flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:shadow-lg transition-all invisible">
                <f.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-base">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="categories-section py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/products?category=${cat.id}`}
                  className="category-card flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-card hover:shadow-lg transition-all invisible"
                >
                  <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                     {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover"/>}
                  </div>
                  <span className="text-sm font-medium text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS SECTION */}
        <section className="products-section py-16 container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {productsLoading ? (
              [...Array(4)].map((_, i) => <ProductSkeletonCard key={i} />)
            ) : (
              featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card h-full invisible"
                  onClick={(e) => handleCardClick(e, product.id)}
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
