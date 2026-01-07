import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
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
import { cn } from "@/lib/utils";

// Direct imports (Error 426 se bachne ke liye lazy hata dein)
import ParticleBackground from '@/components/ParticleBackground';
import HeroCard from '@/components/HeroCard';

gsap.registerPlugin(ScrollTrigger);

// --- Section Wrapper (Inverted Curve) ---
const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full bg-background z-20 -mt-10 pt-10">
    <div className="absolute -top-[40px] left-0 w-full h-[40px] overflow-hidden pointer-events-none">
      <div className="w-full h-[80px] bg-background rounded-t-[40px] shadow-[0_-20px_25px_-5px_rgba(0,0,0,0.1)]" />
    </div>
    <div className="container mx-auto px-4">
      {children}
    </div>
  </div>
);

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // Initial loading ko false rakhein agar data hooks handling kar rahe hain
  const [initialLoad, setInitialLoad] = useState(true);
  
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
    // Sirf tab loading khatam karein jab data aa jaye
    if (!productsLoading && !heroLoading) {
      setInitialLoad(false);
    }
  }, [productsLoading, heroLoading]);

  // GSAP Animations
  useEffect(() => {
    if (initialLoad) return;
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', { y: 30, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: '.features-section', start: 'top 90%' } });
    });
    return () => ctx.revert();
  }, [initialLoad]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // Error Prevention: Agar loading ho to loader dikhayein
  if (initialLoad) return <Layout><ProductLoader /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-black">
        
        {/* HERO SECTION */}
        <section className="relative w-full h-[500px] md:h-[600px] z-10">
          <ParticleBackground />
          <div className="relative h-full w-full overflow-hidden">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700", index === currentSlide ? 'opacity-100' : 'opacity-0')}>
                <HeroCard slide={slide} isActive={index === currentSlide} />
              </div>
            ))}
          </div>
          
          {/* Swipe controls (Optional) */}
          <div className="absolute inset-0 z-20 flex justify-between items-center px-4 pointer-events-none">
             <button onClick={prevSlide} className="pointer-events-auto bg-white/10 p-2 rounded-full">←</button>
             <button onClick={nextSlide} className="pointer-events-auto bg-white/10 p-2 rounded-full">→</button>
          </div>
        </section>

        <SectionWrapper>
          {/* Baaki saara content (Features, Categories, etc.) yahan aayega */}
          <section className="features-section py-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Feature cards yahan copy-paste kar dein */}
                <p className="text-center col-span-full text-muted-foreground">Scroll down to explore</p>
             </div>
          </section>

          <section className="products-section py-12">
            <h2 className="text-2xl font-bold mb-8">Recommended For You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </SectionWrapper>

      </div>
    </Layout>
  );
};

export default HomePage;
