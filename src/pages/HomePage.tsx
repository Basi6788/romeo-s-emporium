import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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

// --- 1. Three.js Background (Subtle & Optimized) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || window.innerWidth < 768) return; 

    // Cleanup previous scene if exists
    while(mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800; // Optimized count
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 20; 
      posArray[i+1] = (Math.random() - 0.5) * 12;
      posArray[i+2] = (Math.random() - 0.5) * 8;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Theme aware color (using generic violet/blue that works on both)
    const material = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x8b5cf6, 
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 5;

    let animationId;
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = elapsedTime * 0.02;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
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
      cancelAnimationFrame(animationId);
      if(mountRef.current) mountRef.current.innerHTML = '';
      particlesGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-50" />;
};

// --- 2. Enhanced Hero Card Component (Fixed Height & Bleed) ---
const HeroCard = ({ slide, index, slideRefs, contentRefs, imageRefs, isActive }) => {
  return (
    <div
      key={slide.id || index}
      ref={el => slideRefs.current[index] = el}
      // Added flex items-end to position text properly
      className="absolute inset-0 overflow-hidden flex items-center md:items-end pb-12 md:pb-20"
      style={{ visibility: isActive ? 'visible' : 'hidden', zIndex: isActive ? 10 : 0 }}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-[-1]">
        <img
          ref={el => imageRefs.current[index] = el}
          src={slide.image}
          alt={slide.title}
          // Changed brightness and added object-cover with h-full
          className="w-full h-full object-cover scale-105 brightness-[0.90] dark:brightness-75 transition-all duration-700"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        {/* Gradients to fix the "White/Dark" bleed issue */}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-40 mix-blend-multiply`} />
        {/* Bottom fade to blend with next section */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pl-6 md:pl-12">
        <div ref={el => contentRefs.current[index] = el} className="max-w-xl backdrop-blur-sm bg-black/5 p-6 rounded-3xl border border-white/10 shadow-lg">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold mb-4 text-white shadow-sm">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
            {slide.badge || 'Trending'}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-3 text-white drop-shadow-xl tracking-tight leading-tight">
            {slide.title}
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-6 font-medium leading-relaxed line-clamp-2">
            {slide.subtitle}
          </p>
          <Button asChild size="lg" className="h-12 px-8 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-300">
            <Link to={slide.link || '/products'}>
              Shop Now <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- 3. Optimized Skeleton ---
const ProductSkeletonCard = () => (
  <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm p-4 animate-pulse">
    <div className="aspect-square w-full bg-muted/50 rounded-xl mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-muted/50 rounded-full w-3/4"></div>
      <div className="h-4 bg-muted/50 rounded-full w-1/2"></div>
      <div className="h-6 bg-muted/50 rounded-lg w-1/3 mt-3"></div>
    </div>
  </div>
);

// --- 4. Main HomePage Component ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  
  // Refs
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const featuresRef = useRef(null);
  
  // Touch
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Data
  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Hero Slides
  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    if (!heroLoading) {
      return [
        {
          id: 'def-1',
          title: 'Future of Tech',
          subtitle: 'Experience innovation like never before with our cutting-edge technology.',
          image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
          gradient: 'from-violet-600/60 via-purple-600/60 to-indigo-800/60',
          badge: 'New Collection',
          link: '/products',
        },
        {
          id: 'def-2',
          title: 'Premium Quality',
          subtitle: 'Discover products crafted with excellence and attention to detail.',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
          gradient: 'from-blue-600/60 via-cyan-600/60 to-teal-800/60',
          badge: 'Limited Offer',
          link: '/products',
        }
      ]; 
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  // FIX: Moved setProductsLoaded to useEffect to prevent slow rendering/lag
  const featuredProducts = useMemo(() => {
    if (products.length > 0) {
      return products.slice(0, 8);
    }
    return [];
  }, [products]);

  useEffect(() => {
    if (products.length > 0) {
      setProductsLoaded(true);
      // Force refresh scroll trigger once products load
      ScrollTrigger.refresh();
    }
  }, [products]);

  // --- Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect on Hero Image
      if (window.innerWidth > 768) {
        gsap.to(imageRefs.current, {
          yPercent: 10, // Reduced from 15 to prevent background bleed
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true }
        });
      }

      // Quick Features Reveal
      if(featuresRef.current) {
        gsap.fromTo(featuresRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 95%' } // Triggers earlier
          }
        );
      }
      
      // Faster Product Reveal
      if (productsLoaded) {
        gsap.utils.toArray('.anim-up').forEach(el => {
          gsap.fromTo(el,
             { y: 20, opacity: 0 },
             { y: 0, opacity: 1, duration: 0.4, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 95%' }}
          );
        });
      }
    });
    return () => ctx.revert();
  }, [heroSlides.length, categories, productsLoaded]); // Added productsLoaded dependency

  // --- 3D Tilt ---
  const handleTilt = (e, card) => {
    if(window.innerWidth < 768 || !card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height/2) / rect.height) * -5; // Reduced intensity
    const rotateY = ((x - rect.width/2) / rect.width) * 5;
    gsap.to(card, { rotateX, rotateY, scale: 1.02, duration: 0.3 });
  };

  const resetTilt = (card) => {
    if(!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5, ease: "power2.out" });
  };

  // --- Slide Logic ---
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    const curr = { el: slideRefs.current[currentSlide], content: contentRefs.current[currentSlide], img: imageRefs.current[currentSlide] };
    const next = { el: slideRefs.current[newIndex], content: contentRefs.current[newIndex], img: imageRefs.current[newIndex] };

    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }});
    
    tl.to(curr.content, { y: -20, opacity: 0, duration: 0.4 }, 0)
      .to(curr.img, { scale: 1.1, opacity: 0, duration: 0.4 }, 0)
      .set(curr.el, { visibility: 'hidden', zIndex: 0 });

    tl.set(next.el, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(next.img, { scale: 1.1, opacity: 0 }, { scale: 1.05, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1)
      .fromTo(next.content, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next);
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev);
  }, [currentSlide, heroSlides.length, animateSlide]);

  // Touch Swipe
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
      {/* HERO SECTION:
        - Height Reduced to h-[400px] md:h-[500px]
        - Added overflow-hidden properly
      */}
      <section 
        ref={heroRef} 
        className="relative overflow-hidden bg-background pb-6"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? (
          <div className="relative h-[400px] md:h-[500px] w-full bg-muted/20 animate-pulse rounded-b-3xl" />
        ) : (
          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mx-3 mt-3 md:mx-6 md:mt-4 shadow-2xl border border-white/10">
            {heroSlides.map((slide, index) => (
              <HeroCard
                key={slide.id || index}
                slide={slide}
                index={index}
                slideRefs={slideRefs}
                contentRefs={contentRefs}
                imageRefs={imageRefs}
                isActive={index === currentSlide}
              />
            ))}
            
            {/* Dots */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => i !== currentSlide && animateSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide 
                        ? 'w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                        : 'w-2 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* FEATURES - Glassmorphism */}
      <section className="py-6 relative z-10 -mt-2">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Over $100', color: 'text-blue-500' },
              { icon: Shield, title: 'Secure Pay', desc: '100% Safe', color: 'text-green-500' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global', color: 'text-orange-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Online', color: 'text-purple-500' },
            ].map((f, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-lg hover:shadow-xl transition-all hover:bg-white/10"
              >
                <div className={`p-2.5 rounded-xl bg-background/50 backdrop-blur-sm ${f.color} mb-2 shadow-sm`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES - Clean & Transparent */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Browse Categories
            </h2>
            <Link to="/products" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {categoriesLoading ? [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted/30 rounded-2xl animate-pulse" />
            )) : categories.slice(0, 6).map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`} 
                className="anim-up group flex flex-col items-center gap-2"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">{cat.icon || '✨'}</div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS - Fast Load & Better UI */}
      <section className="py-12 bg-gradient-to-b from-transparent to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <p className="text-muted-foreground mt-2 text-sm">Most popular picks for you</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 min-h-[400px]">
            {productsLoading && !productsLoaded ? (
              [...Array(8)].map((_, i) => <ProductSkeletonCard key={i} />)
            ) : productsError ? (
              <div className="col-span-full text-center py-10 text-destructive">Failed to load products</div>
            ) : (
              featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="anim-up block h-full">
                  <div 
                    className="h-full transform-style-3d transition-transform duration-200"
                    onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                    onMouseLeave={(e) => resetTilt(e.currentTarget)}
                  >
                    {/* Added Glassmorphism to Product Card Container */}
                    <div className="bg-white/5 backdrop-blur-md dark:bg-black/20 rounded-2xl border border-white/10 overflow-hidden h-full hover:border-primary/30 hover:shadow-2xl transition-all duration-300 group">
                      <ProductCard product={product} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {!productsLoading && featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg" className="rounded-full border-primary/20 hover:bg-primary/5">
                <Link to="/products">Explore Store</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
