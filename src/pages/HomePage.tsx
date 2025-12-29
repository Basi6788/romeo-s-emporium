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

// --- Particle Background (Optimized for Light/Dark) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 400 : 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 15;

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    // Color logic: Primary color based (Violet)
    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x8b5cf6, 
      transparent: true,
      opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 3;

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    if (window.matchMedia("(pointer: fine)").matches) document.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.y += 0.05 * (mouseX - particlesMesh.rotation.y) * 0.1;
      particlesMesh.rotation.x += 0.05 * (mouseY - particlesMesh.rotation.x) * 0.1;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', () => {});
      document.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      particlesGeometry.dispose();
    };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-100" />;
};

// --- Compact Skeleton ---
const HeroSkeleton = () => (
  <div className="relative h-[400px] md:h-[500px] w-full bg-muted/20 animate-pulse flex items-center justify-center">
    <div className="text-muted-foreground/30 font-medium">Loading Experience...</div>
  </div>
);

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Hooks with optimized stale time if supported by your query client, 
  // otherwise standard fetch
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Refs
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Section Refs
  const sectionsRef = useRef([]);
  const addToRefs = (el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); };

  const heroSlides = useMemo(() => {
    if (dbHeroImages?.length > 0) {
      return dbHeroImages.map(hero => ({
        id: hero.id,
        title: hero.title,
        subtitle: hero.subtitle,
        image: hero.image,
        gradient: hero.gradient,
        badge: hero.badge,
        link: hero.link,
      }));
    }
    // Only fallback if NOT loading and DB empty
    if (!heroLoading) {
       return [{
         id: 'd1', title: 'New Arrivals', subtitle: 'Explore the future', 
         image: 'https://images.unsplash.com/photo-1468495244187-dcdb628943f3?auto=format&fit=crop&q=80',
         gradient: 'from-blue-600 to-violet-600', badge: 'Latest', link: '/products'
       }];
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  // Animation Logic (Same as before but cleaner)
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }});
    
    // Quick Snappy Transition
    tl.to(contentRefs.current[currentSlide], { opacity: 0, y: -20, duration: 0.3 })
      .to(imageRefs.current[currentSlide], { opacity: 0, scale: 1.05, duration: 0.3 }, 0)
      .set(slideRefs.current[currentSlide], { visibility: 'hidden', zIndex: 0 })
      .set(slideRefs.current[newIndex], { visibility: 'visible', zIndex: 10 })
      .fromTo(imageRefs.current[newIndex], { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.5 }, 0.2)
      .fromTo(contentRefs.current[newIndex], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.3);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    if (heroSlides.length < 2) return;
    animateSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, animateSlide, heroSlides.length]);

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : animateSlide(currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1);
  };

  useEffect(() => {
    const autoplay = setInterval(() => { if(!isAnimating && heroSlides.length > 1) nextSlide(); }, 5000);
    return () => clearInterval(autoplay);
  }, [heroSlides.length, isAnimating, nextSlide]);

  // Subtle Parallax for Sections
  useEffect(() => {
    sectionsRef.current.forEach(section => {
      gsap.fromTo(section, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, scrollTrigger: { trigger: section, start: "top 85%" } }
      );
    });
  }, []);

  return (
    <Layout>
      {/* Hero Section - Reduced Height & Better Light Mode Contrast */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden bg-background h-[450px] md:h-[550px]" // Reduced Height
        onTouchStart={e => touchStartX.current = e.touches[0].clientX}
        onTouchMove={e => touchEndX.current = e.touches[0].clientX}
        onTouchEnd={handleTouchEnd}
      >
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
          <div className="relative h-full w-full">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                ref={el => slideRefs.current[index] = el}
                className="absolute inset-0 flex items-center"
                style={{ visibility: index === 0 ? 'visible' : 'hidden', zIndex: index === 0 ? 10 : 0 }}
              >
                {/* Image & Gradient */}
                <div className="absolute inset-0 z-[-1]">
                    <img ref={el => imageRefs.current[index] = el} src={slide.image} className="w-full h-full object-cover" loading={index===0?'eager':'lazy'} />
                    {/* Stronger gradient for light mode text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent mix-blend-multiply" /> 
                </div>

                <div className="container mx-auto px-4 relative z-10 mt-10">
                  <div ref={el => contentRefs.current[index] = el} className="max-w-lg">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-xs font-bold text-white mb-4">
                      <Zap className="w-3 h-3 fill-current" /> {slide.badge}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-base md:text-lg text-gray-200 mb-6 font-medium max-w-sm drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <Button asChild size="lg" className="rounded-full px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                      <Link to={slide.link || '/products'}>Explore Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
             {/* Simple Dot Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => animateSlide(i)} 
                  className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} 
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Features - Compact Glass Bar */}
      <section className="relative z-20 -mt-6 mb-8 px-4">
        <div className="container mx-auto">
          <div className="bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg dark:shadow-none rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { i: Truck, t: 'Free Shipping', d: 'On all orders' },
               { i: Shield, t: 'Secure', d: 'Protected payments' },
               { i: Zap, t: 'Fast', d: 'Same day dispatch' },
               { i: Headphones, t: 'Support', d: '24/7 Online' }
             ].map((f, idx) => (
               <div key={idx} className="flex items-center gap-3 justify-center md:justify-start">
                 <div className="p-2 rounded-lg bg-primary/10 text-primary">
                   <f.i className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                   <p className="text-xs font-bold text-foreground">{f.t}</p>
                   <p className="text-[10px] text-muted-foreground">{f.d}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Categories - Smaller & Faster Feel */}
      <section ref={addToRefs} className="py-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Top Categories</h2>
            <Link to="/products" className="text-xs font-semibold text-primary hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="text-xl">📦</span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-center leading-tight line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending - Pre-mount skeleton handled */}
      <section ref={addToRefs} className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
            <Link to="/products" className="text-xs font-semibold text-primary hover:underline">See All</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productsLoading ? (
              // Compact Skeletons for faster feel
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted/40 rounded-xl animate-pulse" />
              ))
            ) : (
              products.slice(0, 8).map((product) => (
                <div key={product.id} className="transform transition-all hover:translate-y-[-5px]">
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Light Mode Enhancer Div (Adds subtle color to white background) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30 dark:opacity-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
    </Layout>
  );
};

export default HomePage;
