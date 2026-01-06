import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { Button } from '@/components/ui/button';
import { useTracking } from '@/context/TrackingContext'; // Import the tracker
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Premium 3D Loader (Three.js + GSAP) ---
const PremiumLoader = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create a cool geometric shape
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    camera.position.z = 3;

    // Pulse Animation via GSAP
    gsap.to(sphere.scale, {
      x: 1.5, y: 1.5, z: 1.5,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
    });

    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.x += 0.02;
      sphere.rotation.y += 0.02;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      if(mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div ref={mountRef} className="absolute inset-0 z-0" />
      <h2 className="z-10 text-2xl font-bold tracking-widest text-primary animate-pulse mt-32">
        LOADING EXPERIENCE...
      </h2>
    </div>
  );
};

// --- 2. Optimized Hero Card (No Stretch/Lag) ---
const HeroCard = ({ slide, index, isActive }) => {
  const cardRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Text Animation
      const tl = gsap.timeline();
      tl.fromTo(cardRef.current.querySelector('.hero-content'), 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
      
      // Image slight zoom effect
      gsap.fromTo(imgRef.current,
        { scale: 1.1 },
        { scale: 1, duration: 6, ease: "none" } // Matches auto-swipe duration
      );
    }
  }, [isActive]);

  return (
    <div className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      }`}>
      {/* Aspect Ratio Container to prevent layout shift */}
      <div className="relative w-full h-full overflow-hidden bg-gray-900">
        <img
          ref={imgRef}
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          // Priority loading for first image
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-purple-900/30 to-blue-900/30'} mix-blend-overlay`} />

        {/* Content */}
        <div ref={cardRef} className="hero-content absolute inset-0 flex items-center px-6 md:px-12 container mx-auto">
          <div className="max-w-2xl space-y-6 pt-20">
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs md:text-sm font-bold uppercase tracking-wider">
              {slide.badge || 'Trending'}
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-medium line-clamp-2">
              {slide.subtitle}
            </p>
            {/* Button visible but navigation handled via card click mostly */}
            <div className="pt-4">
              <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-gray-200 border-0 font-bold px-8">
                 <Link to={slide.link || '/products'}>Check it out</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. Main HomePage Component ---
const HomePage = () => {
  const navigate = useNavigate();
  const { trackView, analyzeBehavior, sessionData } = useTracking(); // Use Tracking
  
  // Data Fetching
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: heroImages = [], isLoading: heroLoading } = useHeroImages();

  // State for Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  // --- Logic: Recommendation Engine (Frontend Mock) ---
  const displayedProducts = useMemo(() => {
    if (products.length === 0) return [];
    
    // Agar naya user hai (session data empty), to "Trending/High Rating" dikhao
    if (sessionData.viewedCategories.length === 0) {
      return products.sort((a, b) => b.rating - a.rating).slice(0, 8);
    }
    
    // Agar purana user hai, to uski history ke hisab se filter karo
    const relevant = products.filter(p => sessionData.viewedCategories.includes(p.category_id));
    // Agar relevant kam hain, to trending mix kardo
    return [...relevant, ...products].slice(0, 8); 
  }, [products, sessionData]);

  // --- Slider Navigation Logic (Wheel & Swipe) ---
  const nextSlide = useCallback(() => {
    if (heroImages.length > 0) setCurrentSlide(prev => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  const prevSlide = useCallback(() => {
    if (heroImages.length > 0) setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length);
  }, [heroImages.length]);

  // Auto Swipe
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Gesture Handlers
  const onTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const onTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 50) nextSlide(); // Swipe Left
    if (distance < -50) prevSlide(); // Swipe Right
    touchStart.current = null; touchEnd.current = null;
  };

  const onWheel = (e) => {
    // Sirf tab slide kare jab user Hero Section ke upar hover kar raha ho
    // Aur vertical scroll ko block na karein unless intention clear ho
    // Note: Wheel navigation can be annoying if it blocks page scroll. 
    // Isliye hum sirf horizontal wheel ya aggressive vertical pe trigger karenge.
    if (Math.abs(e.deltaX) > 20) {
      e.deltaX > 0 ? nextSlide() : prevSlide();
    }
  };

  // --- Security Check on Mount ---
  useEffect(() => {
    // Check for bot-like behavior or rapid refreshes
    analyzeBehavior("PAGE_LOAD", { path: '/' });
  }, []);

  if (heroLoading || productsLoading) return <Layout><PremiumLoader /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        
        {/* HERO SECTION - GESTURE ENABLED */}
        <section 
          className="relative w-full h-[60vh] md:h-[75vh] lg:h-[80vh] bg-black overflow-hidden cursor-grab active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onWheel={onWheel} // Mouse Wheel Support
        >
          {heroImages.length > 0 ? (
            heroImages.map((slide, index) => (
              <HeroCard
                key={slide.id || index}
                slide={slide}
                index={index}
                isActive={index === currentSlide}
              />
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-white">No Offers Active</div>
          )}

          {/* Minimalist Indicators (No Buttons) */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
            {heroImages.map((_, i) => (
              <div 
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-10 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </section>

        {/* FEATURES STRIP */}
        <div className="relative z-20 -mt-10 container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-border/50">
             {[
               { icon: Truck, t: "Fast Delivery", d: "All over Pakistan" },
               { icon: Shield, t: "Secure Payment", d: "100% Protected" },
               { icon: Sparkles, t: "Authentic", d: "Original Products" },
               { icon: Clock, t: "24/7 Support", d: "Dedicated Team" }
             ].map((f, i) => (
               <div key={i} className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
                 <div className="p-3 rounded-full bg-primary/10 text-primary">
                   <f.icon className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-sm md:text-base">{f.t}</h3>
                   <p className="text-xs text-muted-foreground">{f.d}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* CATEGORIES */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Explore Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`}
                className="snap-start min-w-[140px] flex flex-col items-center gap-3 group cursor-pointer"
                onClick={() => trackView(null, cat.id)} // Tracking Category Click
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-transparent group-hover:border-primary p-1 transition-all">
                  <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                <span className="font-medium text-sm group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* RECOMMENDATION ENGINE PRODUCTS */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold">
                  {sessionData.viewedCategories.length > 0 ? "Picked For You" : "Trending Now"}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {sessionData.viewedCategories.length > 0 
                    ? "Based on your recent interest" 
                    : "Most popular items this week"}
                </p>
              </div>
              <Link to="/products" className="text-primary hover:underline font-medium hidden md:block">
                View All Products
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {displayedProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  className="group relative h-full"
                  onClick={(e) => {
                    // PREVENT DOUBLE NAVIGATION
                    if(e.target.closest('button') || e.target.closest('a')) return;
                    trackView(product.id, product.category_id); // Track Interest
                    navigate(`/product/${product.id}`);
                  }}
                >
                  {/* Card Animation Stagger */}
                  <div className="h-full transform transition-transform duration-300 hover:-translate-y-2">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center md:hidden">
              <Button variant="outline" asChild className="w-full rounded-full">
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>
        
      </div>
    </Layout>
  );
};

export default HomePage;
