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
import * as THREE from 'three'; // Make sure three is installed: npm install three

gsap.registerPlugin(ScrollTrigger);

// --- 1. Three.js Background Component (Optimized) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for mobile
    mountRef.current.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 500 : 1500; // Less particles on mobile
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15; // Spread
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x8b5cf6, // Violet tint
      transparent: true,
      opacity: 0.5,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 3;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    };

    if (window.matchMedia("(pointer: fine)").matches) {
       document.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    const animate = () => {
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.001;
      
      // Gentle reaction to mouse
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
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Cleanup Three.js resources
      particlesGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// --- 2. Skeleton Loader Component ---
const HeroSkeleton = () => (
  <div className="relative min-h-[520px] md:min-h-[600px] w-full bg-muted/20 overflow-hidden flex items-end pb-20 px-4">
    <div className="container mx-auto">
      <div className="max-w-xl space-y-4">
        <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
        <div className="h-16 w-3/4 bg-muted animate-pulse rounded-2xl" />
        <div className="h-6 w-1/2 bg-muted animate-pulse rounded-lg" />
        <div className="flex gap-3 pt-2">
          <div className="h-12 w-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-12 w-32 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// --- 3. Main HomePage Component ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseGlowRef = useRef(null);
  
  // Section refs for parallax
  const featuresRef = useRef(null);
  const categoriesRef = useRef(null);
  const dealsRef = useRef(null);
  const featuredRef = useRef(null);
  const promoRef = useRef(null);
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  // IMPORTANT: Ensure useHeroImages returns 'isLoading'
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Logic: Show DB images if exist, otherwise wait. Don't show default immediately if loading.
  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) {
      return dbHeroImages.map(hero => ({
        id: hero.id,
        title: hero.title,
        subtitle: hero.subtitle || '',
        image: hero.image,
        gradient: hero.gradient,
        badge: hero.badge,
        link: hero.link,
      }));
    }
    // Only return defaults if NOT loading and DB is empty
    if (!heroLoading) {
      return [
          {
            id: 'def-1',
            title: 'Welcome to Future',
            subtitle: 'Experience the best technology.',
            image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop', // Abstract tech
            gradient: 'from-violet-600 via-purple-600 to-indigo-800',
            badge: 'New Era',
            link: '/products',
          }
      ]; 
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 4);

  // Mouse Glow Effect
  useEffect(() => {
    const glow = mouseGlowRef.current;
    if (!glow) return;

    const moveGlow = (e) => {
      gsap.to(glow, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  // Parallax & ScrollTrigger setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Features - Stagger Reveal
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.querySelectorAll('.feature-item'),
          { y: 50, opacity: 0, scale: 0.8 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 85%' }
          }
        );
      }

      // Categories - Smooth Fade Up
      if (categoriesRef.current) {
        gsap.fromTo(categoriesRef.current.querySelectorAll('.category-item'),
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.5, stagger: 0.05, ease: 'power2.out',
            scrollTrigger: { trigger: categoriesRef.current, start: 'top 80%' }
          }
        );
      }

      // Product Cards - 3D Flip Effect
      const cards = document.querySelectorAll('.product-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, rotateY: 30, y: 50 },
          {
            opacity: 1, rotateY: 0, y: 0,
            duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 90%' }
          }
        );
      });
    });

    return () => ctx.revert();
  }, [products, categories]);

  // Slide Animation Logic
  const animateSlide = useCallback((newIndex, direction) => {
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

    // Exit Current
    tl.to(currentContent, { y: -50, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(currentImage, { scale: 1.1, opacity: 0, duration: 0.5 }, 0)
      .set(currentSlideEl, { visibility: 'hidden', zIndex: 0 });

    // Enter New
    tl.set(newSlideEl, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(newImage, 
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1
      )
      .fromTo(newContent,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' }, 0.3
      );

  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    if (heroSlides.length < 2) return;
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next, 'next');
  }, [currentSlide, animateSlide, heroSlides.length]);

  const prevSlide = useCallback(() => {
    if (heroSlides.length < 2) return;
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev, 'prev');
  }, [currentSlide, animateSlide, heroSlides.length]);

  // Touch Swipe Logic
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  };

  // Autoplay
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const autoplay = setInterval(() => {
        if(!isAnimating) nextSlide();
    }, 5000);
    return () => clearInterval(autoplay);
  }, [heroSlides.length, isAnimating, nextSlide]);

  return (
    <Layout>
      {/* Mouse Follower Glow (Desktop Only visually, hidden on touch via CSS usually) */}
      <div 
        ref={mouseGlowRef}
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block"
      />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden bg-background"
        onTouchStart={e => touchStartX.current = e.touches[0].clientX}
        onTouchMove={e => touchEndX.current = e.touches[0].clientX}
        onTouchEnd={handleTouchEnd}
      >
        {/* Three.js Background Layer */}
        <div className="absolute inset-0 z-0">
           <ParticleBackground />
        </div>

        {/* Conditional Rendering: Skeleton vs Real Content */}
        {heroLoading || heroSlides.length === 0 ? (
          <HeroSkeleton />
        ) : (
          <div className="relative min-h-[520px] md:min-h-[600px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                ref={el => slideRefs.current[index] = el}
                className="absolute inset-0 overflow-hidden flex items-end pb-20"
                style={{ 
                    visibility: index === 0 ? 'visible' : 'hidden',
                    zIndex: index === 0 ? 10 : 0 
                }}
              >
                {/* Background Image with optimized blending */}
                <div className="absolute inset-0 z-[-1]">
                    <img
                        ref={el => imageRefs.current[index] = el}
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-50 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10">
                  <div ref={el => contentRefs.current[index] = el} className="max-w-xl">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 text-foreground shadow-lg">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      {slide.badge}
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 tracking-tight leading-[1.1] text-foreground drop-shadow-2xl">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md font-light leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        asChild 
                        size="lg" 
                        className="h-14 px-8 text-lg rounded-full shadow-primary/30 shadow-lg hover:scale-105 transition-transform duration-300"
                      >
                        <Link to={slide.link || '/products'}>
                          Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Dots Indicator only - No Buttons */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {heroSlides.map((_, i) => (
                    <button
                    key={i}
                    onClick={() => {
                        const dir = i > currentSlide ? 'next' : 'prev';
                        animateSlide(i, dir);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === currentSlide 
                        ? 'w-10 bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]' 
                        : 'w-2 bg-muted-foreground/50 hover:bg-primary/50'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
                </div>
            )}
          </div>
        )}
      </section>

      {/* Features Bar - Glassmorphism */}
      <section ref={featuresRef} className="relative z-10 -mt-8 mb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-background/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global tracking' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated team' },
            ].map((f, i) => (
              <div key={i} className="feature-item flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-2">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2 sm:mb-0">
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section ref={categoriesRef} className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-primary font-medium tracking-wider text-sm uppercase">Collections</span>
              <h2 className="text-3xl font-bold mt-2">Browse Categories</h2>
            </div>
            <Link to="/products" className="group flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-item group flex flex-col items-center gap-4 p-6 rounded-3xl bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-primary/20 transition-all">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl">
                      {cat.icon || '📦'}
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products (Using Skeleton if Loading) */}
      <section ref={featuredRef} className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trending Now</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                 <div className="product-card" key={product.id}>
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
