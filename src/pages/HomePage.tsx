import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, Loader2, Grid } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Three.js Background (Subtle for this design) ---
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
    const particlesCount = 800; // Thora kam kiya taake clean look rahe
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 20; 
      posArray[i+1] = (Math.random() - 0.5) * 15;
      posArray[i+2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x4f46e5, // Indigo tone
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

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none hidden md:block opacity-40" />;
};

// --- 2. Custom Loading Component ---
const LoadingSpinner = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 min-h-[300px]">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  </div>
);

// --- 3. Hero Skeleton (Matches Card Shape) ---
const HeroSkeleton = () => (
  <div className="w-full aspect-[16/9] md:aspect-[2.5/1] bg-muted/50 rounded-3xl animate-pulse flex items-center p-8">
    <div className="space-y-4 w-1/2">
      <div className="h-6 w-24 bg-muted-foreground/10 rounded-full" />
      <div className="h-10 w-3/4 bg-muted-foreground/10 rounded-xl" />
      <div className="h-10 w-1/2 bg-muted-foreground/10 rounded-xl" />
      <div className="h-10 w-32 bg-muted-foreground/10 rounded-full mt-4" />
    </div>
  </div>
);

// --- 4. Main HomePage Component ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  
  // Touch Handling State
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
        title: 'iPhone 16 Pro',
        subtitle: 'Extraordinary Visual & Exceptional Power',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop', // Updated to look more like a phone promo
        gradient: 'from-blue-600 to-indigo-600', // Matches screenshot blue
        badge: 'New Arrival',
        link: '/products',
      },
      {
        id: 'def-2',
        title: 'Sony Headphones',
        subtitle: 'Pure Bass. Zero Noise.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-purple-600 to-pink-600',
        badge: 'Best Seller',
        link: '/products?category=headphones',
      }]; 
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  const featuredProducts = products.slice(0, 8);

  // --- Slide Animation Logic (Optimized for Card) ---
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    const curr = { el: slideRefs.current[currentSlide], content: contentRefs.current[currentSlide], img: imageRefs.current[currentSlide] };
    const next = { el: slideRefs.current[newIndex], content: contentRefs.current[newIndex], img: imageRefs.current[newIndex] };

    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }});
    
    // Fade out current
    tl.to(curr.content, { x: -20, opacity: 0, duration: 0.3 }, 0)
      .to(curr.img, { x: 20, opacity: 0, duration: 0.3 }, 0)
      .set(curr.el, { visibility: 'hidden', zIndex: 0 });

    // Fade in next
    tl.set(next.el, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(next.img, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
      .fromTo(next.content, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.2);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next);
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev);
  }, [currentSlide, heroSlides.length, animateSlide]);

  // --- SWIPE LOGIC ---
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

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => { if(!isAnimating) nextSlide(); }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isAnimating, nextSlide]);

  // --- 3D Tilt for Products ---
  const handleTilt = (e, card) => {
    if(window.innerWidth < 768 || !card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height/2) / rect.height) * -8;
    const rotateY = ((x - rect.width/2) / rect.width) * 8;
    gsap.to(card, { rotateX, rotateY, scale: 1.02, duration: 0.3 });
  };
  const resetTilt = (card) => {
    if(!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5 });
  };

  return (
    <Layout>
      <ParticleBackground />
      
      <div className="container mx-auto px-4 pt-4 pb-20 relative z-10 space-y-8">
        
        {/* HERO SECTION - REPLICATING THE IMAGE CARD STYLE */}
        <section 
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
            <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] md:aspect-[2.4/1] bg-card">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id || index}
                  ref={el => slideRefs.current[index] = el}
                  className={`absolute inset-0 w-full h-full bg-gradient-to-br ${slide.gradient}`}
                  style={{ visibility: index === 0 ? 'visible' : 'hidden', zIndex: index === 0 ? 10 : 0 }}
                >
                  {/* Content Container */}
                  <div className="absolute inset-0 flex items-center justify-between px-6 md:px-12 lg:px-16">
                    
                    {/* Text Side (Left) */}
                    <div ref={el => contentRefs.current[index] = el} className="w-[60%] md:w-1/2 z-20 flex flex-col items-start justify-center h-full space-y-3 md:space-y-5">
                       <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-lg text-white/90 font-medium line-clamp-2">
                        {slide.subtitle}
                      </p>
                      <Button asChild className="bg-white text-black hover:bg-white/90 rounded-xl px-6 h-9 sm:h-11 text-xs sm:text-sm font-bold shadow-lg mt-2">
                        <Link to={slide.link || '/products'}>
                          Shop Now
                        </Link>
                      </Button>
                    </div>

                    {/* Image Side (Right) */}
                    <div className="absolute right-0 bottom-0 h-[90%] w-[55%] md:w-1/2 z-10 flex items-end justify-end pointer-events-none">
                       <img
                          ref={el => imageRefs.current[index] = el}
                          src={slide.image}
                          alt={slide.title}
                          className="h-full w-full object-contain object-right-bottom drop-shadow-2xl"
                       />
                    </div>
                  </div>
                </div>
              ))}

              {/* Dots Pagination */}
              {heroSlides.length > 1 && (
                <div className="absolute bottom-4 left-6 md:left-12 z-30 flex gap-2">
                  {heroSlides.map((_, i) => (
                    <button key={i} onClick={() => i !== currentSlide && animateSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                      aria-label={`Slide ${i + 1}`} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* CATEGORIES SECTION - MATCHING THE GRID IMAGE */}
        <section>
            <h3 className="text-lg font-bold mb-4 px-1">Categories</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {categoriesLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded-3xl animate-pulse" />) : (
                <>
                {categories.slice(0, 5).map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.id}`} className="group flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-transparent hover:border-indigo-500/30 transition-all duration-300 aspect-square">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                            {cat.image_url ? (
                                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                            ) : (
                                // Fallback icons based on name roughly
                                cat.name.toLowerCase().includes('phone') ? <div className="text-2xl">📱</div> :
                                cat.name.toLowerCase().includes('head') ? <Headphones className="w-8 h-8 text-indigo-500" /> :
                                cat.name.toLowerCase().includes('laptop') ? <div className="text-2xl">💻</div> :
                                <div className="text-2xl">📦</div>
                            )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-center text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{cat.name}</span>
                    </Link>
                ))}
                {/* 'More' Button replicating the image */}
                <Link to="/categories" className="group flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-transparent hover:border-indigo-500/30 transition-all duration-300 aspect-square">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/50 transition-colors">
                        <Grid className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">More</span>
                </Link>
                </>
            )}
            </div>
        </section>

        {/* FLASH DEALS / TRENDING - MATCHING HEADER STYLE */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Flash Deals for You</h2>
            <Link to="/products" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {productsLoading ? (
               <LoadingSpinner />
            ) : (
             featuredProducts.map((product) => (
               <div 
                 key={product.id} 
                 className="perspective-1000"
                 onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                 onMouseLeave={(e) => resetTilt(e.currentTarget)}
               >
                 <div className="h-full transform-style-3d transition-transform duration-100 will-change-transform">
                    {/* Using existing ProductCard but ensuring it fits the new clean theme via props or css */}
                    <ProductCard product={product} className="bg-white dark:bg-zinc-900 rounded-2xl border-none shadow-sm hover:shadow-md" />
                 </div>
               </div>
            )))}
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default HomePage;
