import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListFilter, ChevronDown } from 'lucide-react'; // Icons for filter
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { useTracking } from '@/hooks/useTracking';
import ProductLoader from '@/components/Loaders/ProductLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from "@/lib/utils";

import ParticleBackground from '@/components/ParticleBackground';
import HeroCard from '@/components/HeroCard';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<null | 'lowToHigh' | 'highToLow'>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const wrapperRef = useRef(null);
  const mainContentRef = useRef(null);
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();
  const { getRecommendations } = useTracking();

  // --- Filter & Sort Logic ---
  const processedProducts = useMemo(() => {
    let filtered = products;
    
    // Category Filter
    if (selectedCategory !== 'All') {
      filtered = products.filter(p => p.category === selectedCategory);
    }

    // Price Sorting
    if (sortOrder === 'lowToHigh') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'highToLow') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, selectedCategory, sortOrder]);

  const heroSlides = useMemo(() => {
    if (!dbHeroImages || dbHeroImages.length === 0) {
      return [
        { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', title: 'Premium Collection' },
      ];
    }
    return dbHeroImages;
  }, [dbHeroImages]);

  // GSAP Scroll Animation - Advanced
  useEffect(() => {
    if (initialLoad || !heroRef.current || !mainContentRef.current) return;

    const ctx = gsap.context(() => {
      // Hero section ki height shrink karo smoothly
      gsap.to(heroRef.current, {
        height: 300,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=400",
          scrub: 1,
          pin: true,
          pinSpacing: false,
          onUpdate: (self) => {
            // Hero content fade out as we scroll
            const progress = self.progress;
            if (heroContentRef.current) {
              heroContentRef.current.style.opacity = `${1 - progress * 1.5}`;
              heroContentRef.current.style.transform = `translateY(${progress * 50}px) scale(${1 - progress * 0.2})`;
            }
          }
        }
      });

      // Main content ko hero ke niche se smoothly appear karana
      gsap.fromTo(mainContentRef.current, 
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "center bottom",
            end: "+=300",
            scrub: 1,
          }
        }
      );

      // Hero cards ko fade out karne ke liye
      const heroCards = gsap.utils.toArray('.hero-card');
      heroCards.forEach((card: any, i) => {
        gsap.to(card, {
          opacity: 0,
          y: -50,
          scale: 0.9,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=200",
            scrub: 1,
          }
        });
      });

    }, heroRef);

    return () => ctx.revert();
  }, [initialLoad]);

  // Hero slideshow auto change
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    if (!productsLoading && !heroLoading) setInitialLoad(false);
  }, [productsLoading, heroLoading]);

  if (initialLoad) return <Layout><ProductLoader /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-black">
        
        {/* HERO SECTION with Sticky Animation */}
        <section 
          ref={heroRef} 
          className="sticky top-0 left-0 w-full h-[500px] md:h-[600px] z-30 overflow-hidden"
          style={{
            transition: 'height 0.3s ease-out'
          }}
        >
          <ParticleBackground />
          <div ref={heroContentRef} className="relative h-full w-full flex items-center justify-center transition-all duration-300">
            {heroSlides.map((slide, index) => (
              <div 
                key={slide.id} 
                className={cn(
                  "hero-card absolute inset-0 transition-all duration-700 ease-out",
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                )}
                style={{
                  transition: 'opacity 0.7s ease-out, transform 0.7s ease-out'
                }}
              >
                <HeroCard slide={slide} isActive={index === currentSlide} />
              </div>
            ))}
            
            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentSlide 
                      ? "bg-white w-6" 
                      : "bg-white/50 hover:bg-white/80"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
              <ChevronDown className="w-6 h-6 text-white/70" />
            </div>
          </div>
        </section>

        {/* MAIN CONTENT WRAPPER */}
        <div 
          ref={mainContentRef}
          className="relative z-20 bg-background rounded-t-[40px] shadow-[0_-20px_25px_-5px_rgba(0,0,0,0.1)] pt-10 pb-20"
        >
          <div className="container mx-auto px-6">
            
            {/* Heading & Filter Row */}
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-[32px] font-bold leading-tight tracking-tight text-foreground">
                TRENDING <br /> NOW
              </h1>
              
              {/* Filter Dropdown */}
              <div className="relative mt-2">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="p-3 bg-secondary/20 rounded-xl hover:bg-secondary/40 transition-colors"
                >
                  <ListFilter className="w-6 h-6" />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-50 p-2 overflow-hidden">
                    <button onClick={() => {setSortOrder('highToLow'); setIsFilterOpen(false)}} className="w-full text-left px-4 py-3 hover:bg-secondary/20 rounded-xl text-sm transition-colors">Price: High to Low</button>
                    <button onClick={() => {setSortOrder('lowToHigh'); setIsFilterOpen(false)}} className="w-full text-left px-4 py-3 hover:bg-secondary/20 rounded-xl text-sm transition-colors">Price: Low to High</button>
                    <button onClick={() => {setSortOrder(null); setIsFilterOpen(false)}} className="w-full text-left px-4 py-3 hover:bg-secondary/20 rounded-xl text-sm transition-colors text-destructive">Reset Filter</button>
                  </div>
                )}
              </div>
            </div>

            {/* CATEGORIES (Image Style) */}
            <div className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide no-scrollbar">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  selectedCategory === 'All' ? "bg-black text-white" : "bg-secondary/10 text-muted-foreground"
                )}
              >
                All
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    selectedCategory === cat.name ? "bg-black text-white" : "bg-secondary/10 text-muted-foreground"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* PRODUCT GRID with Fade-in Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {processedProducts.length > 0 ? (
                processedProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="opacity-0 animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center py-20 text-muted-foreground italic">
                  Is category me koi products nahi mile...
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Styles to hide scrollbar but keep functionality */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        
        /* Smooth scrolling for the whole page */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;