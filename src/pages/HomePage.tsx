import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListFilter, X } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<string | null>(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // --- Filter & Sort Logic (Fix) ---
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter (ID ya Name dono check karega)
    if (selectedCategory !== 'All') {
      result = result.filter(p => 
        p.category === selectedCategory || p.category_id === selectedCategory
      );
    }

    // Sort Logic
    if (sortOrder === 'highToLow') result.sort((a, b) => b.price - a.price);
    if (sortOrder === 'lowToHigh') result.sort((a, b) => a.price - b.price);

    return result;
  }, [products, selectedCategory, sortOrder]);

  const heroSlides = useMemo(() => {
    return dbHeroImages.length > 0 ? dbHeroImages : [
      { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', title: 'Premium Collection' }
    ];
  }, [dbHeroImages]);

  // --- Smooth GSAP Animation ---
  useEffect(() => {
    if (initialLoad) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "50% top",
        scrub: 1, // Smoothness badha di
      }
    });

    tl.to(heroRef.current, {
      opacity: 0,
      scale: 0.8,
      y: -50,
      filter: "blur(10px)",
      ease: "power1.inOut"
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [initialLoad]);

  useEffect(() => {
    if (!productsLoading && !heroLoading) setInitialLoad(false);
  }, [productsLoading, heroLoading]);

  if (initialLoad) return <Layout><ProductLoader /></Layout>;

  return (
    <Layout>
      <div ref={containerRef} className="relative min-h-screen w-full bg-black">
        
        {/* HERO SECTION (Fixed for smooth fade) */}
        <section ref={heroRef} className="fixed top-0 left-0 w-full h-[60vh] md:h-[70vh] z-0">
          <ParticleBackground />
          <div className="relative h-full w-full">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-1000", index === currentSlide ? 'opacity-100' : 'opacity-0')}>
                <HeroCard slide={slide} isActive={index === currentSlide} />
              </div>
            ))}
          </div>
        </section>

        {/* CONTENT WRAPPER */}
        <div 
          ref={contentRef}
          className="relative z-10 mt-[55vh] bg-background rounded-t-[45px] shadow-[0_-30px_50px_rgba(0,0,0,0.3)] pt-12 pb-24"
        >
          <div className="container mx-auto px-6">
            
            {/* Header Area */}
            <div className="flex justify-between items-start mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground leading-[0.9]">
                TRENDING <br /> NOW
              </h1>
              
              {/* Filter Button (Image Like) */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="mt-2 p-3 bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all border border-border/50"
              >
                <ListFilter className="w-7 h-7" />
              </button>
            </div>

            {/* Filter Dropdown (Real & Working) */}
            {isFilterOpen && (
              <div className="mb-6 p-4 bg-secondary/5 rounded-3xl border border-border animate-in fade-in slide-in-from-top-4">
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setSortOrder('highToLow')} className={cn("px-4 py-2 rounded-xl text-xs font-bold border", sortOrder === 'highToLow' ? "bg-primary text-primary-foreground" : "bg-background")}>Price: High to Low</button>
                  <button onClick={() => setSortOrder('lowToHigh')} className={cn("px-4 py-2 rounded-xl text-xs font-bold border", sortOrder === 'lowToHigh' ? "bg-primary text-primary-foreground" : "bg-background")}>Price: Low to High</button>
                  <button onClick={() => setSortOrder(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-destructive/10 text-destructive">Clear</button>
                </div>
              </div>
            )}

            {/* CATEGORIES PILLS (Image Style) */}
            <div className="flex gap-3 overflow-x-auto pb-10 no-scrollbar">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={cn(
                  "px-8 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                  selectedCategory === 'All' ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border"
                )}
              >
                All
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)} // Agar ye kaam na kare to cat.id use karna
                  className={cn(
                    "px-8 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                    selectedCategory === cat.name ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground text-lg">Koi products nahi mile is category mein.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </Layout>
  );
};

export default HomePage;
