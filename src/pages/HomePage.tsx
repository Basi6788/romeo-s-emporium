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
import { SplitText } from 'gsap/all'; // Note: If you don't have SplitText (premium), we use a custom manual split below
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Three.js Background (Kept as is, optimized) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || window.innerWidth < 768) return; 

    while(mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1200;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 25; 
      posArray[i+1] = (Math.random() - 0.5) * 15;
      posArray[i+2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x6d28d9, 
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 5;

    let animationId;
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2; 
      particlesMesh.rotation.z += 0.0005;
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

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-40 dark:opacity-30" />;
};

// --- Helper: Animated Text Component ---
// Ye component text ko letters me torega aur animation lagayega
const AnimatedText = ({ text, className, delay = 0 }) => {
  const letters = text.split("");
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance Animation (Writing effect)
      gsap.fromTo(".char", 
        { y: 50, opacity: 0, rotateX: -90 },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0, 
          stagger: 0.03, 
          duration: 0.8, 
          ease: "back.out(1.7)",
          delay: delay 
        }
      );

      // 2. Idle Animation (Wave effect)
      gsap.to(".char", {
        y: -5,
        stagger: {
          each: 0.1,
          repeat: -1,
          yoyo: true
        },
        duration: 1.5,
        ease: "sine.inOut",
        delay: delay + 1
      });
    }, containerRef);
    return () => ctx.revert();
  }, [text, delay]);

  const handleMouseEnter = () => {
    // 3. Hover Spread Animation
    gsap.to(containerRef.current.querySelectorAll(".char"), {
      letterSpacing: "5px", // Text phail jayega
      color: "#a855f7", // Purple tint
      duration: 0.4,
      ease: "power2.out",
      stagger: 0.01
    });
  };

  const handleMouseLeave = () => {
    // Back to normal
    gsap.to(containerRef.current.querySelectorAll(".char"), {
      letterSpacing: "0px",
      color: "inherit",
      duration: 0.4,
      ease: "power2.in",
      stagger: 0.01
    });
  };

  return (
    <div 
      ref={containerRef} 
      className={`inline-block cursor-default ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {letters.map((char, index) => (
        <span key={index} className="char inline-block" style={{ minWidth: char === " " ? "0.3em" : "0" }}>
          {char}
        </span>
      ))}
    </div>
  );
};

// --- 2. Enhanced Hero Card Component (Fixed Gradients) ---
const HeroCard = ({ slide, index, slideRefs, isActive }) => {
  return (
    <div
      key={slide.id || index}
      ref={el => slideRefs.current[index] = el}
      className="absolute inset-0 overflow-hidden flex items-center md:items-end pb-12 md:pb-24"
      style={{ 
        visibility: isActive ? 'visible' : 'hidden', 
        zIndex: isActive ? 10 : 0,
        transformStyle: 'preserve-3d', // Crucial for 3D effect
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Background Image without bad fade */}
      <div className="absolute inset-0 z-[-1]">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover transition-all duration-700"
        />
        {/* Soft overlay for readability, removed the hard bottom cut */}
        <div className="absolute inset-0 bg-black/30" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-40 mix-blend-overlay`} />
        
        {/* Fixed Gradient: Only at very bottom for text legibility, no white flash */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 perspective-1000">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="mb-4 overflow-hidden">
             <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-sm font-semibold text-white shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                {slide.badge || 'New Arrival'}
             </span>
          </div>

          {/* Animated Titles */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 text-white drop-shadow-lg leading-tight">
            {isActive && <AnimatedText text={slide.title} delay={0.2} />}
          </h1>
          
          <div className="text-lg sm:text-xl text-gray-200 mb-8 font-medium max-w-lg leading-relaxed">
            {isActive && <AnimatedText text={slide.subtitle} className="text-base md:text-xl" delay={0.4} />}
          </div>

          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-white hover:scale-105 transition-all duration-300 transform-gpu border-none">
            <Link to={slide.link || '/products'}>
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Product Skeleton ---
const ProductSkeletonCard = () => (
  <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 animate-pulse">
    <div className="aspect-square w-full bg-muted rounded-xl mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded-full w-3/4"></div>
      <div className="h-4 bg-muted rounded-full w-1/2"></div>
      <div className="h-6 bg-muted rounded-lg w-1/3 mt-3"></div>
    </div>
  </div>
);

// --- 5. Main HomePage Component ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  
  // Refs
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  const featuresRef = useRef(null);
  
  // Touch Handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Data
  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    return [
      {
        id: 'def-1',
        title: 'Future Tech',
        subtitle: 'Experience innovation with our latest collection.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-violet-600 to-indigo-900',
        badge: 'Trending',
      },
      {
        id: 'def-2',
        title: 'Urban Style',
        subtitle: 'Redefine your look with premium aesthetics.',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-blue-600 to-cyan-900',
        badge: 'New Season',
      }
    ];
  }, [dbHeroImages]);

  const featuredProducts = useMemo(() => {
    if (products.length > 0) {
      setProductsLoaded(true);
      return products.slice(0, 8);
    }
    return [];
  }, [products]);

  // --- Initial Page Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Features Reveal
      if(featuresRef.current) {
        gsap.fromTo(featuresRef.current.children,
          { y: 50, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 85%' }
          }
        );
      }
      // General Reveal
      gsap.utils.toArray('.anim-up').forEach(el => {
        gsap.fromTo(el,
           { y: 30, opacity: 0 },
           { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }}
        );
      });
    });
    return () => ctx.revert();
  }, [categories, products]);

  // --- 3D Tilt Logic ---
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

  // --- 3D CARD ANIMATION LOGIC (UPDATED) ---
  const animateSlide = useCallback((newIndex, direction = 'next') => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    
    const currentEl = slideRefs.current[currentSlide];
    const nextEl = slideRefs.current[newIndex];

    // Set initial state for next element
    gsap.set(nextEl, { visibility: 'visible', zIndex: 10 });
    gsap.set(currentEl, { zIndex: 0 });

    const timeline = gsap.timeline({
      onComplete: () => {
        setCurrentSlide(newIndex);
        setIsAnimating(false);
        gsap.set(currentEl, { visibility: 'hidden', x: 0, rotationY: 0, opacity: 1, scale: 1 });
      }
    });

    // 3D Cube Rotation Effect
    if (direction === 'next') {
      // Current slide goes OUT to LEFT
      timeline
        .to(currentEl, { 
          xPercent: -50, 
          rotationY: 45, 
          opacity: 0, 
          scale: 0.8, 
          duration: 1, 
          ease: "power3.inOut" 
        }, 0)
      // Next slide comes IN from RIGHT
        .fromTo(nextEl, 
          { xPercent: 100, rotationY: -45, opacity: 0, scale: 0.8 },
          { xPercent: 0, rotationY: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.inOut" }, 0
        );
    } else {
      // PREV: Current slide goes OUT to RIGHT
      timeline
        .to(currentEl, { 
          xPercent: 50, 
          rotationY: -45, 
          opacity: 0, 
          scale: 0.8, 
          duration: 1, 
          ease: "power3.inOut" 
        }, 0)
      // Next slide comes IN from LEFT
        .fromTo(nextEl, 
          { xPercent: -100, rotationY: 45, opacity: 0, scale: 0.8 },
          { xPercent: 0, rotationY: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.inOut" }, 0
        );
    }
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next, 'next');
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev, 'prev');
  }, [currentSlide, heroSlides.length, animateSlide]);

  // --- Swipe Logic ---
  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    
    if (distance > 50) nextSlide();
    else if (distance < -50) prevSlide();
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Autoplay (3D Effect enabled)
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => { if(!isAnimating) nextSlide(); }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isAnimating, nextSlide]);

  return (
    <Layout>
      {/* HERO SECTION - 3D Perspective Enabled */}
      <section 
        ref={heroRef} 
        className="relative overflow-hidden bg-background pb-10" // Added padding bottom to separate from features
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? (
          <div className="relative h-[400px] md:h-[550px] w-full bg-muted/20 animate-pulse flex items-center justify-center">
            {/* Loading Skeleton */}
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          // Container needs perspective for 3D effect
          <div className="relative h-[400px] md:h-[550px] w-full max-w-[95%] mx-auto mt-4 rounded-3xl [perspective:1500px] group">
            <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-black transform-style-3d">
              {heroSlides.map((slide, index) => (
                <HeroCard
                  key={slide.id || index}
                  slide={slide}
                  index={index}
                  slideRefs={slideRefs}
                  isActive={index === currentSlide}
                />
              ))}
            </div>

            {/* Controls */}
            {heroSlides.length > 1 && (
              <>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                  {heroSlides.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => i !== currentSlide && animateSlide(i, i > currentSlide ? 'next' : 'prev')}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentSlide 
                          ? 'w-12 bg-primary shadow-glow' 
                          : 'w-3 bg-white/40 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
                {/* Side Arrows */}
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40">
                  <ArrowRight className="rotate-180 w-6 h-6" />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40">
                  <ArrowRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* FEATURES SECTION - Gap Fix */}
      <section className="py-4 relative z-10 -mt-2">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Over $100', color: 'bg-blue-500' },
              { icon: Shield, title: 'Secure Pay', desc: '100% Safe', color: 'bg-green-500' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global', color: 'bg-orange-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Online', color: 'bg-purple-500' },
            ].map((f, i) => (
              <div 
                key={i} 
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`p-3 rounded-full ${f.color} bg-opacity-10 text-${f.color.replace('bg-', '')} mb-3 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 text-${f.color.replace('bg-', '')}-500`} />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Categories</h2>
            <Link to="/products" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categoriesLoading ? [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            )) : categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="anim-up group flex flex-col items-center gap-2">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all shadow-md group-hover:shadow-lg bg-muted">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">{cat.icon || '📦'}</div>
                  )}
                </div>
                <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Trending Now</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {productsLoading && !productsLoaded ? (
              [...Array(8)].map((_, i) => <div key={i} className="anim-up"><ProductSkeletonCard /></div>)
            ) : featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="anim-up block">
                <div 
                  className="h-full rounded-2xl transition-all duration-300 hover:-translate-y-2"
                  onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                  onMouseLeave={(e) => resetTilt(e.currentTarget)}
                >
                  <ProductCard product={product} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
