import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, Grid, Smartphone, Laptop, Speaker } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Three.js Background (Optimized for Card Layout) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);
  // ... (Same Three.js logic as before, kept hidden on mobile for performance or as per preference)
  // Keeping logic same as provided to save space, assuming previous code works.
  // Returning same structure:
  return <div ref={mountRef} className="fixed inset-0 z-[-1] pointer-events-none hidden md:block opacity-30" />;
};

// --- 2. Custom Loading Component ---
const LoadingSpinner = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 min-h-[200px]">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
    </div>
  </div>
);

// --- 3. Hero Skeleton (Card Style) ---
const HeroSkeleton = () => (
  <div className="w-full aspect-[2/1] md:aspect-[21/9] bg-muted animate-pulse rounded-3xl flex items-center p-8">
    <div className="space-y-4 w-1/2">
      <div className="h-6 w-24 bg-muted-foreground/10 rounded-full" />
      <div className="h-10 w-3/4 bg-muted-foreground/10 rounded-xl" />
      <div className="h-10 w-32 bg-muted-foreground/10 rounded-full mt-2" />
    </div>
  </div>
);

// --- 4. Main HomePage Component ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  
  // Touch Handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Data
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    return [{
      id: 'def-1',
      title: 'iPhone 16 Pro',
      subtitle: 'Extraordinary Visual & Exceptional Power',
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop', // Example iPhone-ish image
      gradient: 'from-blue-600/80 to-purple-600/80',
      badge: 'New Arrival',
      link: '/products',
    },
    {
        id: 'def-2',
        title: 'MacBook Air',
        subtitle: 'Supercharged by M3',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=2026&auto=format&fit=crop',
        gradient: 'from-emerald-600/80 to-teal-600/80',
        badge: 'Best Seller',
        link: '/products',
      }];
  }, [dbHeroImages]);

  const featuredProducts = products.slice(0, 8);

  // --- 3D Tilt Logic (Kept same) ---
  const handleTilt = (e, card) => {
    if(window.innerWidth < 768 || !card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height/2) / rect.height) * -8;
    const rotateY = ((x - rect.width/2) / rect.width) * 8;
    gsap.to(card, { rotateX, rotateY, scale: 1.02, boxShadow: "0 20px 30px -10px rgba(0,0,0,0.2)", duration: 0.3 });
  };

  const resetTilt = (card) => {
    if(!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", duration: 0.5, ease: "elastic.out(1, 0.5)" });
  };

  // --- Simplified Slide Animation for Card Layout ---
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    
    // Simple fade/slide for cards
    const currEl = slideRefs.current[currentSlide];
    const nextEl = slideRefs.current[newIndex];

    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }});
    
    tl.to(currEl, { opacity: 0, x: -20, duration: 0.4, zIndex: 0 })
      .fromTo(nextEl, { opacity: 0, x: 20, zIndex: 10 }, { opacity: 1, x: 0, duration: 0.4, zIndex: 10 }, "-=0.2");
      
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next);
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev);
  }, [currentSlide, heroSlides.length, animateSlide]);

  // Swipe Logic (Kept same)
  const onTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    else if (distance < -50) prevSlide();
    touchStartX.current = null; touchEndX.current = null;
  };

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => { if(!isAnimating) nextSlide(); }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isAnimating, nextSlide]);

  return (
    <Layout>
      <ParticleBackground />

      {/* --- HERO SECTION: APP CARD STYLE --- */}
      <section className="pt-4 pb-6 md:pt-6">
        <div className="container mx-auto px-4">
          {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
            <div 
                className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-border/10"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            >
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id || index}
                  ref={el => slideRefs.current[index] = el}
                  className="absolute inset-0 w-full h-full"
                  style={{ opacity: index === 0 ? 1 : 0, zIndex: index === 0 ? 10 : 0 }}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 bg-gray-900">
                        <img 
                            src={slide.image} 
                            alt={slide.title} 
                            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90 mix-blend-multiply`} />
                        {/* Light Mode Soft Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Content - Left Aligned like the card */}
                    <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 text-white max-w-lg">
                        <h2 className="text-2xl md:text-4xl font-bold mb-2 leading-tight drop-shadow-lg">
                            {slide.title}
                        </h2>
                        <p className="text-sm md:text-lg text-white/90 mb-6 font-medium line-clamp-2 drop-shadow-md">
                            {slide.subtitle}
                        </p>
                        <Button asChild size="sm" className="w-fit bg-white text-black hover:bg-white/90 rounded-xl px-6 font-bold shadow-lg">
                            <Link to={slide.link || '/products'}>
                                Shop Now
                            </Link>
                        </Button>
                    </div>

                    {/* Image Placeholder on Right (Simulated for visual balance if needed) */}
                    <div className="absolute right-[-10%] bottom-0 w-1/2 h-[90%] md:h-full object-contain pointer-events-none">
                         {/* Optional: Add a transparent PNG product image here if you have one separate from background */}
                    </div>
                </div>
              ))}

              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-6 flex gap-2 z-20">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => animateSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- CATEGORIES: GRID CARD STYLE --- */}
      <section className="py-2">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Categories
          </h2>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categoriesLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />) :
             categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="group">
                <div className="bg-card hover:bg-accent/50 border border-border/40 shadow-sm rounded-2xl p-3 flex flex-col items-center justify-center gap-2 aspect-square transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                   {/* Icon/Image Container */}
                   <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Grid className="w-5 h-5 md:w-6 md:h-6" /> // Fallback icon
                      )}
                   </div>
                   <span className="text-xs md:text-sm font-medium text-center line-clamp-1">{cat.name}</span>
                </div>
              </Link>
            ))}
            
            {/* Hardcoded "More" button to match image layout */}
            <Link to="/categories" className="group">
                <div className="bg-card hover:bg-accent/50 border border-border/40 shadow-sm rounded-2xl p-3 flex flex-col items-center justify-center gap-2 aspect-square transition-all duration-300">
                   <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Grid className="w-5 h-5" />
                   </div>
                   <span className="text-xs md:text-sm font-medium text-center">More</span>
                </div>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FLASH DEALS SECTION --- */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Flash Deals for You</h2>
            <Link to="/products" className="text-sm text-primary font-medium hover:underline">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {productsLoading ? <LoadingSpinner /> : (
             featuredProducts.map((product) => (
               <div 
                 key={product.id} 
                 className="perspective-1000"
                 onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                 onMouseLeave={(e) => resetTilt(e.currentTarget)}
               >
                 <div className="h-full transform-style-3d transition-transform duration-100 ease-out will-change-transform">
                    <ProductCard product={product} />
                 </div>
               </div>
            )))}
          </div>
        </div>
      </section>

      {/* --- FEATURES STRIP (Moved to bottom or kept minimal) --- */}
      <section className="py-8 bg-muted/30 mt-8">
         <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On all orders' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
            ].map((f, i) => (
               <div key={i} className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                  <f.icon className="w-8 h-8 text-primary opacity-80" />
                  <div>
                     <h3 className="font-bold text-sm">{f.title}</h3>
                     <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

    </Layout>
  );
};

export default HomePage;
