import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Three.js Background (Optimized) ---
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
    const particlesCount = 800; // Thora lighter kar dia performance ke liye
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 20; 
      posArray[i+1] = (Math.random() - 0.5) * 15;
      posArray[i+2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x8b5cf6, // Violet shade
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
      // Gentle floating movement
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

// --- 2. Custom Loading Component (Better Style) ---
const LoadingSpinner = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 min-h-[400px]">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-r-4 border-purple-400 rounded-full animate-spin animation-delay-200"></div>
      <div className="absolute inset-4 border-b-4 border-pink-400 rounded-full animate-spin animation-delay-500"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    </div>
    <h3 className="mt-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 animate-pulse">
      Loading Amazing Products...
    </h3>
  </div>
);

// --- 3. Modern Hero Skeleton (Rounded) ---
const HeroSkeleton = () => (
  <div className="container mx-auto px-4 py-6">
    <div className="relative h-[500px] md:h-[600px] w-full bg-muted/20 animate-pulse rounded-[2.5rem] flex items-center justify-center overflow-hidden">
      <div className="absolute bottom-10 left-10 space-y-4 w-1/3">
        <div className="h-10 w-40 bg-muted-foreground/10 rounded-full" />
        <div className="h-16 w-full bg-muted-foreground/10 rounded-3xl" />
        <div className="h-12 w-32 bg-muted-foreground/10 rounded-full mt-4" />
      </div>
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
  const textContainerRefs = useRef([]); // New ref for text glass card
  const imageRefs = useRef([]);
  
  // Touch Handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Data
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    if (!heroLoading) {
      return [{
        id: 'def-1',
        title: 'Next Gen Reality',
        subtitle: 'Upgrade your lifestyle with our premium collection.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-blue-600/40 via-purple-600/40 to-pink-600/40',
        badge: 'New Arrival',
        link: '/products',
      },
      {
        id: 'def-2',
        title: 'Summer Vibes',
        subtitle: 'Cool styles for hot days. Get 50% off today.',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-orange-500/40 via-red-500/40 to-yellow-500/40',
        badge: 'Hot Deal',
        link: '/products',
      }]; 
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  // --- Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
        // Hero Image Parallax
        imageRefs.current.forEach((img) => {
            gsap.to(img, {
                scale: 1.1,
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });

        // Products Stagger Reveal (Jab products load ho jayen)
        if (!productsLoading && products.length > 0) {
            gsap.fromTo('.product-card-anim',
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
            );
        }
    });
    return () => ctx.revert();
  }, [productsLoading, products]);

  // --- Slide Logic ---
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);

    const curr = { 
        el: slideRefs.current[currentSlide], 
        text: textContainerRefs.current[currentSlide], 
        img: imageRefs.current[currentSlide] 
    };
    const next = { 
        el: slideRefs.current[newIndex], 
        text: textContainerRefs.current[newIndex], 
        img: imageRefs.current[newIndex] 
    };

    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }});
    
    // Current Slide Exit
    tl.to(curr.text, { x: -50, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(curr.img, { scale: 1.2, opacity: 0, duration: 0.5 }, 0)
      .set(curr.el, { visibility: 'hidden', zIndex: 0 });

    // Next Slide Enter
    tl.set(next.el, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(next.img, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1)
      .fromTo(next.text, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }, 0.3);

  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next);
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev);
  }, [currentSlide, heroSlides.length, animateSlide]);

  // Touch/Swipe Logic
  const onTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    if (distance > 50) nextSlide();
    else if (distance < -50) prevSlide();
    touchStartX.current = null;
  };

  // Autoplay
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => { if(!isAnimating) nextSlide(); }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isAnimating, nextSlide]);

  return (
    <Layout>
      {/* 1. HERO SECTION (New Rounded "Floating" Style) */}
      <section 
        ref={heroRef} 
        className="relative pt-4 pb-8 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
          <div className="container mx-auto px-4">
             {/* Rounded Container */}
            <div className="relative h-[500px] md:h-[600px] w-full rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden transform transition-all hover:shadow-primary/20">
                
                {heroSlides.map((slide, index) => (
                <div
                    key={slide.id || index}
                    ref={el => slideRefs.current[index] = el}
                    className="absolute inset-0 w-full h-full"
                    style={{ visibility: index === 0 ? 'visible' : 'hidden', zIndex: index === 0 ? 10 : 0 }}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            ref={el => imageRefs.current[index] = el}
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay Gradients */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} mix-blend-multiply opacity-60`} />
                        <div className="absolute inset-0 bg-black/20" />
                    </div>

                    {/* Glassmorphism Text Card */}
                    <div className="absolute inset-0 flex items-center md:items-end md:pb-20 justify-start px-6 md:px-16">
                        <div 
                            ref={el => textContainerRefs.current[index] = el}
                            className="max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl shadow-lg relative overflow-hidden group"
                        >
                            {/* Shiny effect on hover */}
                            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out" />

                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/80 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-md">
                                <Zap className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                                {slide.badge || 'Featured'}
                            </span>
                            
                            <h1 className="text-3xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                                {slide.title}
                            </h1>
                            
                            <p className="text-base md:text-lg text-white/90 mb-8 font-medium line-clamp-2">
                                {slide.subtitle}
                            </p>
                            
                            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-xl font-bold">
                                <Link to={slide.link || '/products'}>
                                    Shop Collection <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                ))}

                {/* Navigation Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    {heroSlides.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => i !== currentSlide && animateSlide(i)}
                            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                                i === currentSlide 
                                ? 'w-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
                                : 'w-2.5 bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${i + 1}`} 
                        />
                    ))}
                </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. FEATURES STRIP */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Within 3-5 days' },
              { icon: Headphones, title: 'Support 24/7', desc: 'Anytime help' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/40 hover:border-primary/50 transition-colors">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
                    <p className="text-muted-foreground mt-2">Explore our wide range of collections</p>
                </div>
                <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link to="/products">See All <ArrowRight className="ml-2 w-4 h-4"/></Link>
                </Button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                {categoriesLoading 
                ? [...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-full bg-muted animate-pulse" />) 
                : categories.slice(0, 8).map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.id}`} className="group flex flex-col items-center gap-3">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-300 p-1">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center text-2xl">✨</div>
                                )}
                            </div>
                        </div>
                        <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">{cat.name}</span>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* 4. PRODUCTS SECTION (With Delay Effect) */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Exclusive</span>
            <h2 className="text-4xl font-bold mb-4">Trending Products</h2>
            <div className="w-20 h-1.5 bg-primary rounded-full" />
          </div>

          <div className="min-h-[400px]">
            {/* Logic: Jab tak loading hai, Spinner dikhao. Jab load ho jaye, Grid dikhao */}
            {productsLoading ? (
               <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                   <div key={product.id} className="product-card-anim">
                     {/* Product Card manages the Link internally usually, 
                         but wrapping just in case specific click handling is needed outside */}
                      <ProductCard product={product} />
                   </div>
                ))}
              </div>
            )}
          </div>
          
          {!productsLoading && (
            <div className="flex justify-center mt-12">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                    <Link to="/products">View All Products</Link>
                </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
