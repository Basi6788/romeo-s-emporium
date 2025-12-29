import { useRef, useState, useCallback, useEffect, useMemo, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Three.js Background (Optimized for Light/Dark) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    // Cleanup previous children if any (React strict mode fix)
    while(mountRef.current.firstChild){
        mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 400 : 1000; 
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Violet color that looks good on dark, and visible on light
    const material = new THREE.PointsMaterial({
      size: 0.025,
      color: 0x7c3aed, 
      transparent: true,
      opacity: 0.6,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 3;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    };

    if (window.matchMedia("(pointer: fine)").matches) {
       document.addEventListener('mousemove', handleMouseMove);
    }

    const animate = () => {
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.y += 0.05 * (mouseX - particlesMesh.rotation.y) * 0.1;
      particlesMesh.rotation.x += 0.05 * (mouseY - particlesMesh.rotation.x) * 0.1;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      particlesGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
};

// --- 2. Compact Hero Skeleton ---
const HeroSkeleton = () => (
  <div className="relative min-h-[450px] md:min-h-[550px] w-full bg-muted/20 overflow-hidden flex items-center justify-center">
    <div className="container mx-auto px-4 flex flex-col justify-end h-full pb-20">
      <div className="max-w-xl space-y-4">
        <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
        <div className="h-12 w-3/4 bg-muted animate-pulse rounded-2xl" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded-lg" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// --- 3. Main HomePage ---
const HomePage = () => {
  // SCROLL FIX: Page load hote hi top par le aye ga
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseGlowRef = useRef(null);
  
  // Data Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Hero Logic
  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    if (!heroLoading) {
      return [{
        id: 'def-1',
        title: 'Next Gen Tech',
        subtitle: 'Upgrade your lifestyle today.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-violet-600 via-purple-600 to-indigo-800',
        badge: 'New Arrival',
        link: '/products',
      }]; 
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  // Optimized Slicing
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  // Mouse Glow
  useEffect(() => {
    const glow = mouseGlowRef.current;
    if (!glow) return;
    const moveGlow = (e) => {
      gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
    };
    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  // Animations Setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Categories Reveal - Faster & Smoother
      const catItems = document.querySelectorAll('.category-item');
      if (catItems.length > 0) {
        gsap.fromTo(catItems,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out',
            scrollTrigger: { trigger: '#categories-section', start: 'top 85%' }
          }
        );
      }

      // Products Reveal
      const productCards = document.querySelectorAll('.product-card-anim');
      if (productCards.length > 0) {
        gsap.fromTo(productCards,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out',
            scrollTrigger: { trigger: '#featured-section', start: 'top 85%' }
          }
        );
      }
    });
    return () => ctx.revert();
  }, [categories, products]); // Re-run when data loads

  // Slide Animation
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);

    const currentContent = contentRefs.current[currentSlide];
    const currentImage = imageRefs.current[currentSlide];
    const currentSlideEl = slideRefs.current[currentSlide];
    
    const newContent = contentRefs.current[newIndex];
    const newImage = imageRefs.current[newIndex];
    const newSlideEl = slideRefs.current[newIndex];

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSlide(newIndex);
        setIsAnimating(false);
      }
    });

    tl.to(currentContent, { y: -30, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
      .to(currentImage, { scale: 1.05, opacity: 0, duration: 0.4 }, 0)
      .set(currentSlideEl, { visibility: 'hidden', zIndex: 0 });

    tl.set(newSlideEl, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(newImage, 
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.1
      )
      .fromTo(newContent,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }, 0.2
      );
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    if (heroSlides.length < 2) return;
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next);
  }, [currentSlide, animateSlide, heroSlides.length]);

  const prevSlide = useCallback(() => {
    if (heroSlides.length < 2) return;
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev);
  }, [currentSlide, animateSlide, heroSlides.length]);

  // Touch Swipe
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  };

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const autoplay = setInterval(() => { if(!isAnimating) nextSlide(); }, 6000);
    return () => clearInterval(autoplay);
  }, [heroSlides.length, isAnimating, nextSlide]);

  return (
    <Layout>
      {/* Light Mode Glow Fix: visible darker glow in light mode, bright in dark */}
      <div 
        ref={mouseGlowRef}
        className="fixed top-0 left-0 w-[300px] h-[300px] bg-primary/20 blur-[80px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block mix-blend-multiply dark:mix-blend-normal"
      />

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-background"
        onTouchStart={e => touchStartX.current = e.touches[0].clientX}
        onTouchMove={e => touchEndX.current = e.touches[0].clientX}
        onTouchEnd={handleTouchEnd}
      >
        <ParticleBackground />

        {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
          <div className="relative min-h-[450px] md:min-h-[550px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                ref={el => slideRefs.current[index] = el}
                className="absolute inset-0 overflow-hidden flex items-center md:items-end pb-20"
                style={{ visibility: index === 0 ? 'visible' : 'hidden', zIndex: index === 0 ? 10 : 0 }}
              >
                <div className="absolute inset-0 z-[-1]">
                    <img
                        ref={el => imageRefs.current[index] = el}
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover brightness-[0.85] dark:brightness-75"
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-40 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                  <div ref={el => contentRefs.current[index] = el} className="max-w-lg">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/20 backdrop-blur-md border border-white/20 text-xs font-semibold mb-4 text-foreground shadow-sm">
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      {slide.badge || 'Featured'}
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-3 tracking-tight text-foreground drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-base md:text-lg text-white/90 dark:text-muted-foreground mb-6 font-medium leading-relaxed drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <Button 
                      asChild 
                      size="lg" 
                      className="h-12 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Link to={slide.link || '/products'}>
                        Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Compact Indicators */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, i) => (
                    <button
                    key={i}
                    onClick={() => i !== currentSlide && animateSlide(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                        i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
                </div>
            )}
          </div>
        )}
      </section>

      {/* Compact Features Bar */}
      <section className="relative z-10 -mt-6 mb-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-card/80 backdrop-blur-md border border-border/40 p-3 rounded-2xl shadow-xl dark:shadow-none">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Over $100' },
              { icon: Shield, title: 'Secure Pay', desc: '100% Safe' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global' },
              { icon: Headphones, title: 'Support', desc: '24/7' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 p-2 hover:bg-accent/30 rounded-xl transition-colors">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground leading-tight">{f.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Optimized Categories */}
      <section id="categories-section" className="py-10 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          {categoriesLoading ? (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
               {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
             </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="category-item group flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/40 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-95"
                >
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-muted">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-primary/5 text-primary">
                        {cat.icon || '📦'}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-center truncate w-full px-1">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Section - Faster Load Perception */}
      <section id="featured-section" className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold">Trending Now</h2>
             <div className="h-1 w-16 bg-primary rounded-full hidden sm:block" />
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                   <div className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
                   <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                   <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                 <div className="product-card-anim h-full" key={product.id}>
                    <ProductCard product={product} />
                 </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </Layout>
  );
};

export default HomePage;
