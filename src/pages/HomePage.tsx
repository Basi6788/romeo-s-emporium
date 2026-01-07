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
  const wrapperRef = useRef(null);
  
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

  // GSAP Scroll Animation
  useEffect(() => {
    if (initialLoad) return;

    const ctx = gsap.context(() => {
      // Hero section fades out and moves up slightly
      gsap.to(heroRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -100,
        scrollTrigger: {
          trigger: ".hero-trigger",
          start: "top top",
          end: "bottom center",
          scrub: true,
        }
      });
    });

    return () => ctx.revert();
  }, [initialLoad]);

  useEffect(() => {
    if (!productsLoading && !heroLoading) setInitialLoad(false);
  }, [productsLoading, heroLoading]);

  if (initialLoad) return <Layout><ProductLoader /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-black hero-trigger">
        
        {/* HERO SECTION with Animation Ref */}
        <section ref={heroRef} className="fixed top-0 left-0 w-full h-[500px] md:h-[600px] z-0">
          <ParticleBackground />
          <div className="relative h-full w-full overflow-hidden">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700", index === currentSlide ? 'opacity-100' : 'opacity-0')}>
                <HeroCard slide={slide} isActive={index === currentSlide} />
              </div>
            ))}
          </div>
        </section>

        {/* MAIN CONTENT WRAPPER */}
        <div className="relative z-20 mt-[450px] md:mt-[550px] bg-background rounded-t-[40px] shadow-[0_-20px_25px_-5px_rgba(0,0,0,0.1)] pt-10 pb-20">
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

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {processedProducts.length > 0 ? (
                processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="col-span-full text-center py-20 text-muted-foreground italic">Is category me koi products nahi mile...</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Styles to hide scrollbar but keep functionality */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </Layout>
  );
};

export default HomePage;
