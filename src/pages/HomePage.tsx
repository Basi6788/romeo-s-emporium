import { useRef, useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import ProductLoader from '@/components/Loaders/ProductLoader';
import { ListFilter } from 'lucide-react';
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
  const [sortOrder, setSortOrder] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const heroRef = useRef(null);
  const wrapperRef = useRef(null);
  const heroContentRef = useRef(null); // Cards ke liye alag ref
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  const processedProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'All') filtered = products.filter(p => p.category === selectedCategory);
    if (sortOrder === 'lowToHigh') filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sortOrder === 'highToLow') filtered = [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, selectedCategory, sortOrder]);

  const heroSlides = useMemo(() => {
    return dbHeroImages.length > 0 ? dbHeroImages : [
      { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', title: 'Premium Collection' }
    ];
  }, [dbHeroImages]);

  useEffect(() => {
    if (initialLoad) return;

    const ctx = gsap.context(() => {
      // 1. Hero Content (Cards) Animation
      // Scroll karte waqt cards fade out aur scale up honge
      gsap.to(heroContentRef.current, {
        opacity: 0,
        scale: 1.1,
        y: -50,
        scrollTrigger: {
          trigger: ".hero-trigger",
          start: "top top",
          end: "40% top", // Jaldi fade out ho jaye
          scrub: 1, // Smoothness ke liye 1 second lag
        }
      });

      // 2. Main Wrapper Animation
      // Wrapper upar aayega aur border-radius zero ho jayegi
      gsap.fromTo(wrapperRef.current, 
        { 
          y: 0, 
          borderRadius: "40px 40px 0 0" 
        },
        {
          y: -150, // Hero area ko thora aur cover karne ke liye
          borderRadius: "0px 0px 0 0",
          scrollTrigger: {
            trigger: ".hero-trigger",
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          }
        }
      );

      // 3. Background Parallax
      gsap.to(".hero-bg", {
        y: 100,
        scrollTrigger: {
          trigger: ".hero-trigger",
          start: "top top",
          end: "bottom top",
          scrub: true
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
      {/* Container with "hero-trigger" to control all scroll events */}
      <div className="relative min-h-screen w-full bg-black hero-trigger overflow-hidden">
        
        {/* HERO SECTION - Fixed position */}
        <section ref={heroRef} className="fixed top-0 left-0 w-full h-[100vh] z-0 overflow-hidden">
          <div className="hero-bg absolute inset-0 w-full h-full">
            <ParticleBackground />
          </div>
          
          <div ref={heroContentRef} className="relative h-full w-full">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-1000", index === currentSlide ? 'opacity-100' : 'opacity-0')}>
                <HeroCard slide={slide} isActive={index === currentSlide} />
              </div>
            ))}
          </div>
        </section>

        {/* SPACER - Takay scroll karne ki jagah mile */}
        <div className="h-[70vh] md:h-[80vh] w-full pointer-events-none"></div>

        {/* MAIN CONTENT WRAPPER - Ye upar move karega */}
        <div 
          ref={wrapperRef} 
          className="relative z-20 bg-background shadow-[0_-30px_50px_rgba(0,0,0,0.3)] pt-12 pb-20 min-h-screen"
        >
          <div className="container mx-auto px-6">
            
            {/* Trending Section */}
            <div className="flex justify-between items-end mb-10">
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-foreground leading-none">
                TRENDING <br /> <span className="text-outline text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>NOW</span>
              </h1>
              
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-4 bg-secondary/10 backdrop-blur-md rounded-2xl hover:bg-secondary/20 transition-all border border-white/5"
              >
                <ListFilter className="w-6 h-6" />
              </button>
            </div>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-10 no-scrollbar">
              {['All', ...categories.map(c => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-8 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                    selectedCategory === cat 
                      ? "bg-foreground text-background border-foreground scale-105 shadow-lg" 
                      : "bg-transparent text-muted-foreground border-white/10 hover:border-white/40"
                  )}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {processedProducts.length > 0 ? (
                processedProducts.map((product) => (
                  <div key={product.id} className="reveal-card">
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center py-20 opacity-50 italic">No products found in this category...</p>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .text-outline { -webkit-text-stroke: 1px #888; }
      `}</style>
    </Layout>
  );
};

export default HomePage;
