import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, Loader2 } from 'lucide-react';
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

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-60" />;
};

// --- 2. Custom Loading Component ---
const LoadingSpinner = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 min-h-[300px]">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      </div>
    </div>
    <p className="mt-6 text-muted-foreground font-medium animate-pulse tracking-wide">
      Please wait loading......
    </p>
  </div>
);

// --- 3. Hero Skeleton ---
const HeroSkeleton = () => (
  <div className="relative h-[400px] md:h-[500px] w-full bg-gradient-to-r from-slate-200/50 via-gray-200/50 to-zinc-200/50 dark:from-slate-800/50 dark:via-gray-800/50 dark:to-zinc-800/50 animate-pulse flex items-center justify-center">
    <div className="container mx-auto px-4 flex flex-col justify-center h-full">
      <div className="max-w-xl space-y-4">
        <div className="h-8 w-40 bg-slate-300/50 dark:bg-slate-600/50 rounded-full" />
        <div className="h-10 w-3/4 bg-slate-300/50 dark:bg-slate-600/50 rounded-2xl" />
        <div className="h-5 w-1/2 bg-slate-300/50 dark:bg-slate-600/50 rounded-xl" />
        <div className="h-11 w-32 bg-slate-300/50 dark:bg-slate-600/50 rounded-full mt-6" />
      </div>
    </div>
  </div>
);

// --- 4. Main HomePage Component (Image Design Updated) ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const featuresRef = useRef(null);
  
  // Touch Handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Data
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Fixed hero slides as per image design
  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    
    return [{
      id: 'def-1',
      title: 'iPhone 16 Pro',
      subtitle: 'Extraordinary Visual Experience',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop',
      gradient: 'from-slate-900/70 via-gray-900/60 to-black/60',
      badge: 'New Launch',
      link: '/products',
    }, {
      id: 'def-2',
      title: 'Premium Audio',
      subtitle: 'Immerse in Crystal Clear Sound',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
      gradient: 'from-indigo-900/70 via-purple-900/60 to-violet-900/60',
      badge: 'Flash Deal',
      link: '/products',
    }];
  }, [dbHeroImages]);

  const featuredProducts = products.slice(0, 8);

  // --- Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax
      if (window.innerWidth > 768) {
        gsap.to(imageRefs.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true }
        });
      }
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
  }, [heroSlides.length, categories, products]);

  // --- 3D Tilt ---
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

  // --- Slide Animation ---
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    const curr = { el: slideRefs.current[currentSlide], content: contentRefs.current[currentSlide], img: imageRefs.current[currentSlide] };
    const next = { el: slideRefs.current[newIndex], content: contentRefs.current[newIndex], img: imageRefs.current[newIndex] };

    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }});
    
    tl.to(curr.content, { y: -30, opacity: 0, duration: 0.4 }, 0)
      .to(curr.img, { scale: 1.1, opacity: 0, duration: 0.4 }, 0)
      .set(curr.el, { visibility: 'hidden', zIndex: 0 });

    tl.set(next.el, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(next.img, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1)
      .fromTo(next.content, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out' }, 0.3);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next);
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev);
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
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Autoplay
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => { if(!isAnimating) nextSlide(); }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isAnimating, nextSlide]);

  return (
    <Layout>
      {/* HERO SECTION - Image Design Updated */}
      <section 
        ref={heroRef} 
        className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
          <div className="relative h-[400px] md:h-[500px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                ref={el => slideRefs.current[index] = el}
                className="absolute inset-0 overflow-hidden flex items-center"
                style={{ visibility: index === 0 ? 'visible' : 'hidden', zIndex: index === 0 ? 10 : 0 }}
              >
                {/* Background Image with Gradient */}
                <div className="absolute inset-0 z-[-1]">
                    <img
                        ref={el => imageRefs.current[index] = el}
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center"
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
                </div>

                {/* Content Container - Left Aligned as per image */}
                <div className="container mx-auto px-4 md:px-8">
                  <div ref={el => contentRefs.current[index] = el} className="max-w-xl md:max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-semibold mb-4 text-white">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      {slide.badge || 'Trending'}
                    </span>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                      {slide.title}
                    </h1>
                    
                    <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">
                      {slide.subtitle}
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="h-12 px-8 rounded-full bg-white text-slate-900 hover:bg-white/90 hover:scale-105 transition-all duration-300 font-semibold">
                        <Link to={slide.link || '/products'}>
                          Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full border-white/50 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300">
                        <Link to="/categories">
                          Explore More
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Navigation Dots */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, i) => (
                    <button key={i} onClick={() => i !== currentSlide && animateSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                    aria-label={`Slide ${i + 1}`} />
                ))}
                </div>
            )}
          </div>
        )}
      </section>

      {/* QUICK ACCESS CATEGORIES - As per image design */}
      <section className="py-10 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Shop by Category</h2>
            <Link to="/categories" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categoriesLoading ? [...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            )) :
             categories.slice(0, 8).map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`}
                className="anim-up group flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-lg transition-all duration-300">
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name} 
                      className="w-full h-full object-cover p-2 group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <span className="text-2xl">{cat.icon || '📱'}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FLASH DEALS SECTION - As per image */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Flash Deals for You</h2>
              <p className="text-slate-600 dark:text-slate-400">Limited time offers. Grab them before they're gone!</p>
            </div>
            <Link to="/deals" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[400px]">
            {productsLoading ? (
              <LoadingSpinner />
            ) : (
              featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="anim-up perspective-1000"
                  onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                  onMouseLeave={(e) => resetTilt(e.currentTarget)}
                >
                  <div className="h-full transform-style-3d transition-transform duration-100 ease-out will-change-transform">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - Clean Design */}
      <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: '24/7 Support', desc: 'Dedicated support' },
              { icon: Headphones, title: 'Easy Returns', desc: '30-day policy' },
            ].map((f, i) => (
              <div key={i} className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;