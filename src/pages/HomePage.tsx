import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { cn } from "@/lib/utils"; // Tailwind merge utility

// Lazy load heavy components
const ParticleBackground = lazy(() => import('@/components/ParticleBackground'));
const HeroCard = lazy(() => import('@/components/HeroCard'));

gsap.registerPlugin(ScrollTrigger);

// --- NEW: Section Wrapper Component (Inverted Border Radius Effect) ---
const SectionWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("relative w-full bg-background z-20 -mt-10 pt-10", className)}>
      {/* Ye hai wo "Inverted" Curve ka logic */}
      <div className="absolute -top-[40px] left-0 w-full h-[40px] overflow-hidden pointer-events-none">
        <div className="w-full h-[80px] bg-background rounded-t-[40px] shadow-[0_-20px_25px_-5px_rgba(0,0,0,0.1)]" />
      </div>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
};

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

const SwipeHandler = ({ onSwipedLeft, onSwipedRight, children }: any) => {
  const handlers = useSwipeable({ onSwipedLeft, onSwipedRight, trackMouse: true });
  return <div {...handlers} className="w-full h-full">{children}</div>;
};

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { trackInteraction, getRecommendations } = useTracking();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  const heroSlides = useMemo(() => {
    if (!dbHeroImages || dbHeroImages.length === 0) {
      return [
        { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', title: 'Premium Collection', subtitle: 'Discover amazing deals', badge: 'Limited Time', link: '/products' },
        { id: '2', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070', title: 'Summer Sale', subtitle: 'Up to 60% off', badge: 'Hot Deal', link: '/products?category=electronics' }
      ];
    }
    return dbHeroImages;
  }, [dbHeroImages]);

  const featuredProducts = useMemo(() => getRecommendations(products), [products, getRecommendations]);

  useEffect(() => {
    if (heroSlides.length > 0) setLoading(false);
  }, [heroSlides]);

  useEffect(() => {
    if (productsLoading || heroLoading) return;
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', { y: 40, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: '.features-section', start: 'top 85%' } });
    });
    return () => ctx.revert();
  }, [productsLoading, heroLoading]);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);

  const handleCardClick = (productId: string) => navigate(`/product/${productId}`);

  if (loading && heroSlides.length > 0) return <Layout><ProductLoader /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-black"> {/* Hero section background will be black */}

        {/* HERO SECTION */}
        <section ref={heroRef} className="relative w-full h-[500px] md:h-[600px] z-10">
          <Suspense fallback={<HeroSkeleton />}>
            <ParticleBackground />
          </Suspense>
          
          {heroLoading ? <HeroSkeleton /> : (
            <SwipeHandler onSwipedLeft={nextSlide} onSwipedRight={prevSlide}>
              <div className="relative h-full w-full overflow-hidden">
                {heroSlides.map((slide, index) => (
                  <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700", index === currentSlide ? 'opacity-100' : 'opacity-0')}>
                    <HeroCard slide={slide} isActive={index === currentSlide} />
                  </div>
                ))}
              </div>
            </SwipeHandler>
          )}
        </section>

        {/* --- ALL SECTIONS INSIDE THE ROUNDED WRAPPER --- */}
        <SectionWrapper>
          
          {/* FEATURES */}
          <section className="features-section py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Truck, title: 'Free Shipping', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { icon: Shield, title: 'Secure Payment', color: 'text-green-500', bg: 'bg-green-500/10' },
                { icon: Clock, title: 'Fast Delivery', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { icon: Headphones, title: '24/7 Support', color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((f, i) => (
                <div key={i} className="feature-card flex flex-col items-center p-6 rounded-2xl bg-card border hover:shadow-md transition-all">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", f.bg)}>
                    <f.icon className={cn("w-6 h-6", f.color)} />
                  </div>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* CATEGORIES */}
          <section className="categories-section py-12">
            <h2 className="text-2xl font-bold mb-8">Browse Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-accent overflow-hidden">
                    <img src={cat.image_url || 'https://via.placeholder.com/100'} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* PRODUCTS */}
          <section className="products-section py-12">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Recommended For You</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {productsLoading ? [...Array(4)].map((_, i) => <ProductSkeletonCard key={i} />) : 
                featuredProducts.slice(0, 8).map((product) => (
                  <div key={product.id} onClick={() => handleCardClick(product.id)} className="product-card cursor-pointer transform transition-transform hover:scale-[1.02]">
                    <ProductCard product={product} />
                  </div>
                ))
              }
            </div>
          </section>

          {/* BANNER */}
          <section className="py-12">
            <div className="bg-primary rounded-3xl p-8 text-primary-foreground text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to upgrade your style?</h3>
              <Button variant="secondary" className="rounded-full px-8" asChild>
                <Link to="/products">Shop All Products</Link>
              </Button>
            </div>
          </section>

        </SectionWrapper>
      </div>
    </Layout>
  );
};

export default HomePage;
