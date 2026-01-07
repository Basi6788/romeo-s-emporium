import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { useTracking } from '@/hooks/useTracking';
import ProductLoader from '@/components/Loaders/ProductLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from "@/lib/utils";

// Components
import ParticleBackground from '@/components/ParticleBackground';
import HeroCard from '@/components/HeroCard';
import RoundedContentWrapper from '@/components/ui/RoundedContentWrapper'; // User ka suggested component

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();
  const { getRecommendations } = useTracking();

  const heroSlides = useMemo(() => {
    if (!dbHeroImages || dbHeroImages.length === 0) {
      return [
        { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', title: 'Premium Collection', subtitle: 'Discover amazing deals', badge: 'Limited Time' },
        { id: '2', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070', title: 'Summer Sale', subtitle: 'Up to 60% off', badge: 'Hot Deal' }
      ];
    }
    return dbHeroImages;
  }, [dbHeroImages]);

  const featuredProducts = useMemo(() => getRecommendations(products), [products, getRecommendations]);

  useEffect(() => {
    if (!productsLoading && !heroLoading) setInitialLoad(false);
  }, [productsLoading, heroLoading]);

  // --- CINEMATIC SCENE LOGIC (GSAP) ---
  useEffect(() => {
    if (initialLoad) return;

    const ctx = gsap.context(() => {
      // 1. Hero Fade & Scale Scene
      // Jaise hi scroll start hoga, Hero piche move karega aur fade hoga
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "30% top",
          scrub: 1, // Smooth scrolling interaction
        },
        opacity: 0,
        scale: 0.8, // Cinematic shrink effect
        filter: "blur(10px)",
        y: -50,
      });

      // 2. Products Entrance Scene
      gsap.from('.product-grid-item', {
        y: 100,
        opacity: 0,
        stagger: 0.1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: '.products-section',
          start: "top 85%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [initialLoad]);

  if (initialLoad) return <Layout><ProductLoader /></Layout>;

  return (
    <Layout>
      <div ref={containerRef} className="relative min-h-screen w-full overflow-x-hidden bg-black">
        
        {/* SCENE 1: FIXED HERO LAYER */}
        <section 
          ref={heroRef}
          className="sticky top-0 w-full h-screen z-10 flex flex-col justify-center items-center"
        >
          <ParticleBackground />
          <div className="relative h-full w-full overflow-hidden">
            {heroSlides.map((slide, index) => (
              <div 
                key={slide.id} 
                className={cn(
                  "absolute inset-0 transition-all duration-1000 ease-in-out", 
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                )}
              >
                <HeroCard slide={slide} isActive={index === currentSlide} />
              </div>
            ))}
          </div>

          {/* Slide Indicators - Minimal Look */}
          <div className="absolute bottom-32 flex gap-2 z-30">
            {heroSlides.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-1 transition-all duration-500 cursor-pointer",
                  currentSlide === i ? "w-8 bg-white" : "w-3 bg-white/30"
                )} 
              />
            ))}
          </div>
        </section>

        {/* SCENE 2: LIQUID GLASS CONTENT WRAPPER */}
        {/* Is component mein Three.js background aur Liquid animations pehle se hain */}
        <RoundedContentWrapper className="min-h-screen">
          
          {/* Features Section - Simplified */}
          <section className="features-section py-12 border-b border-white/10 mb-10">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Aapke existing feature cards yahan honge */}
                <div className="text-center space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                    <Sparkles className="mx-auto text-purple-400" />
                    <h3 className="font-semibold">Premium Quality</h3>
                </div>
                {/* ... baki cards ... */}
             </div>
          </section>

          {/* Featured Products Scene */}
          <section className="products-section py-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <span className="text-purple-400 text-sm font-bold tracking-widest uppercase italic">Collection</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Recommended For You</h2>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="product-grid-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* Extra Content Space for Cinematic Feel */}
          <div className="h-[20vh]" /> 

        </RoundedContentWrapper>

      </div>
    </Layout>
  );
};

export default HomePage;
