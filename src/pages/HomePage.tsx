import { useRef, useState, useEffect, useMemo, memo, useCallback, useLayoutEffect } from 'react';  
import { Check } from 'lucide-react'; 
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Navigate hook import kiya hai (agar Next.js use kar rahe hain to useRouter use karein)
import { useNavigate } from 'react-router-dom'; 

// Components
import Layout from '@/components/Layout';  
import ProductCard from '@/components/ProductCard';  
import { AuroraText } from "@/components/magicui/aurora-text";   
import ParticleBackground from '@/components/ParticleBackground';  
import HeroCard from '@/components/HeroCard';  

// Hooks & Utils
import { useProducts, useCategories } from '@/hooks/useApi';  
import { useHeroImages } from '@/hooks/useHeroImages';  
import { cn } from "@/lib/utils";  

// --- LOCAL FONT IMPORT ---
import momoFontPath from '@/fonts/MomoTrustDisplay.ttf';

// GSAP Register
gsap.registerPlugin(ScrollTrigger);

const MemoizedParticles = memo(ParticleBackground);

const HomePage = () => {  
  
  const navigate = useNavigate(); // Navigation ke liye hook

  // --- LOAD LOCAL FONT (MOMO TRUST) ---
  useEffect(() => {
    const font = new FontFace('MomoTrustLocal', `url(${momoFontPath})`);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
    }).catch((err) => {
      console.error("Font loading failed:", err);
    });
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);  
  const [selectedCategory, setSelectedCategory] = useState('All');  
  const [sortOrder, setSortOrder] = useState(null);  
  const [isFilterOpen, setIsFilterOpen] = useState(false);  
  
  const dropdownRef = useRef(null);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const filterIconRef = useRef(null);
  const filterTlRef = useRef(null);
  
  // Touch/Drag State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const minSwipeDistance = 50;

  const { data: products = [] } = useProducts();  
  const { data: categories = [] } = useCategories();  
  const { data: dbHeroImages = [] } = useHeroImages();  

  // --- Animations Setup (General) ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".hero-section", 
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" }
      );

      gsap.fromTo(".category-item", 
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out",
          scrollTrigger: { trigger: ".category-list", start: "top 90%" }
        }
      );

    }, containerRef);
    return () => ctx.revert();
  }, []); 

  // --- FILTER ICON ANIMATION SETUP ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ 
        paused: true, 
        defaults: { duration: 0.5, ease: "power2.inOut" } 
      });

      tl.to(".filter-line-1", { rotation: 45, y: 7 }, 0);
      tl.to(".filter-line-2", { width: 0, opacity: 0 }, 0);
      tl.to(".filter-line-3", { rotation: -45, width: "100%", y: -7 }, 0);

      filterTlRef.current = tl;
    }, filterIconRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (filterTlRef.current) {
      if (isFilterOpen) {
        filterTlRef.current.play(); 
      } else {
        filterTlRef.current.reverse(); 
      }
    }
  }, [isFilterOpen]);


  // --- Product Reveal ---
  useLayoutEffect(() => {
    if (products.length > 0) {
      const cards = gsap.utils.toArray('.product-card-item');
      gsap.killTweensOf(cards); 
      gsap.set(cards, { y: 60, opacity: 0, filter: 'blur(10px)' });

      ScrollTrigger.batch(cards, {
        onEnter: batch => gsap.to(batch, {
          y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.1, duration: 0.8, ease: "power3.out", overwrite: true
        }),
        start: "top 85%", once: true
      });
    }
  }, [products, selectedCategory, sortOrder]);

  // --- Handlers ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const processedProducts = useMemo(() => {  
    let filtered = Array.isArray(products) ? [...products] : [];
    if (selectedCategory !== 'All') {  
      filtered = filtered.filter(p => String(p.category_id) === String(selectedCategory));  
    }  
    if (sortOrder === 'lowToHigh') {  
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));  
    } else if (sortOrder === 'highToLow') {  
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));  
    }  
    return filtered;  
  }, [products, selectedCategory, sortOrder]);  

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % dbHeroImages.length);
  }, [dbHeroImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + dbHeroImages.length) % dbHeroImages.length);
  }, [dbHeroImages.length]);

  useEffect(() => {  
    if (dbHeroImages.length <= 1 || isDragging) return;
    const interval = setInterval(nextSlide, 5000);  
    return () => clearInterval(interval);  
  }, [dbHeroImages.length, nextSlide, isDragging]);  

  const onTouchStart = (e) => { setTouchStart(e.targetTouches[0].clientX); setIsDragging(true); };
  const onTouchMoveTrack = (e) => { if (touchStart) setDragOffset(e.targetTouches[0].clientX - touchStart); setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) { setDragOffset(0); setIsDragging(false); return; }
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
    setDragOffset(0); setIsDragging(false);
  };

  // --- Click Handler for Products ---
  const handleProductClick = (id) => {
    // Yahan apne route structure ke hisaab se URL update karein
    navigate(`/product/${id}`); 
  };

  return (  
    <Layout>  
      <div ref={containerRef} className="min-h-screen w-full bg-background overflow-x-hidden">
        
        {/* HERO */}
        <section className="hero-section relative w-full h-[550px] md:h-[750px] z-30 overflow-hidden rounded-t-[32px] md:rounded-t-[48px] bg-black">  
          <MemoizedParticles />  
          <div 
            ref={sliderRef}
            className="relative h-full w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMoveTrack}
            onTouchEnd={onTouchEnd}
            onMouseDown={(e) => { e.preventDefault(); setTouchStart(e.clientX); setIsDragging(true); }}
            onMouseMove={(e) => { if (isDragging && touchStart) { setDragOffset(e.clientX - touchStart); setTouchEnd(e.clientX); } }}
            onMouseUp={onTouchEnd}
            onMouseLeave={() => { if (isDragging) onTouchEnd(); }}
          >  
            {dbHeroImages.map((slide, index) => (
                <div 
                  key={slide.id || index} 
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-out", 
                    index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  )}
                  style={{ transform: index === currentSlide && isDragging ? `translateX(${dragOffset}px)` : 'none' }}
                >  
                  <HeroCard slide={slide} isActive={index === currentSlide} />  
                </div>  
            ))}
            
            {dbHeroImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {dbHeroImages.map((_, index) => (
                  <button key={index} onClick={() => setCurrentSlide(index)} className={cn("h-1.5 rounded-full transition-all duration-500", index === currentSlide ? "bg-white w-10" : "bg-white/40 w-3 hover:bg-white/60")} />
                ))}
              </div>
            )}
          </div>  
        </section>  
  
        {/* Rounded Container */}
        <div className="relative z-40 bg-zinc-50 dark:bg-zinc-900 rounded-t-[40px] -mt-12 pt-12 pb-32 shadow-2xl overflow-visible">  
          <div className="container mx-auto px-6">  
            
            {/* --- TITLE SECTION --- */}
            <div className="mb-12 flex justify-center w-full">
               <h1 
                 // FIX 1: Added 'py-4', 'pr-4' and 'leading-normal' to fix clipping of 'W'
                 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase text-center flex items-center gap-3 py-4 pr-4 leading-normal"
                 style={{ fontFamily: 'MomoTrustLocal, sans-serif', fontWeight: 900 }}
               >
                TRENDING <AuroraText className="font-black">NOW</AuroraText>
              </h1>
            </div>

            {/* FILTERS & CATEGORIES */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
               {/* ... (Category list code remains same) ... */}
               <div className="category-list flex gap-3 overflow-x-auto pb-4 no-scrollbar items-center max-w-full md:max-w-3xl">  
                <button 
                    onClick={() => setSelectedCategory('All')} 
                    className={cn(
                    "category-item px-6 py-2.5 rounded-[30px] text-sm font-medium transition-all flex-shrink-0", 
                    selectedCategory === 'All' 
                        ? "bg-black text-white dark:bg-white dark:text-black" 
                        : "bg-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    )}
                >
                    All
                </button>  
                {categories.map((cat) => (  
                    <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.id)} 
                    className={cn(
                        "category-item px-6 py-2.5 rounded-[30px] text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0", 
                        selectedCategory === cat.id 
                        ? "bg-black text-white dark:bg-white dark:text-black" 
                        : "bg-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    )}
                    >
                        {(cat.image_url || cat.icon) && (
                        <img src={cat.image_url || cat.icon} alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        {cat.name}
                    </button>  
                ))}  
                </div>

                {/* Filter Button */}
                <div className="relative self-end md:self-auto" ref={dropdownRef}>
                    <button 
                        ref={filterIconRef} 
                        onClick={() => setIsFilterOpen(!isFilterOpen)} 
                        className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex items-center justify-center gap-2 group"
                    >  
                        <div className="flex flex-col gap-[5px] items-center justify-center w-6 h-5 relative">
                           <span className="filter-line-1 w-full h-[2.5px] bg-foreground rounded-full origin-center"></span>
                           <span className="filter-line-2 w-[70%] h-[2.5px] bg-foreground rounded-full origin-center"></span>
                           <span className="filter-line-3 w-[40%] h-[2.5px] bg-foreground rounded-full origin-center"></span>
                        </div>
                    </button>

                    {isFilterOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-popover border border-border shadow-2xl rounded-3xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                        <button onClick={() => { setSortOrder('lowToHigh'); setIsFilterOpen(false); }} className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold hover:bg-accent transition-colors">Price: Low to High {sortOrder === 'lowToHigh' && <Check className="w-4 h-4 text-primary" />}</button>
                        <button onClick={() => { setSortOrder('highToLow'); setIsFilterOpen(false); }} className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold hover:bg-accent transition-colors">Price: High to Low {sortOrder === 'highToLow' && <Check className="w-4 h-4 text-primary" />}</button>
                    </div>
                    )}
                </div>
            </div>
  
            {/* GRID */}
            <div className="product-grid grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 min-h-[400px]">  
              {processedProducts.length > 0 ? (  
                processedProducts.map((product) => (
                  // FIX 2: Added onClick handler and cursor-pointer to enable navigation
                  <div 
                    key={product.id} 
                    className="product-card-item opacity-0 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  > 
                    <ProductCard product={product} />
                  </div>
                ))  
              ) : (  
                <div className="col-span-full text-center py-32 text-muted-foreground font-bold italic text-xl uppercase tracking-widest opacity-20">No Products Found</div>
              )}  
            </div>  
          </div>  
        </div>  
      </div>  
    </Layout>  
  );  
};  

export default HomePage;

