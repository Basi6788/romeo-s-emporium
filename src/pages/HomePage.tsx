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

// --- 1. Three.js Background (Floating Wave Effect) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Safety check: Don't run heavily on mobile to avoid crashes
    if (!mountRef.current || window.innerWidth < 768) return; 

    // Cleanup previous
    while(mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
    mountRef.current.appendChild(renderer.domElement);

    // Particles Wave Setup
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1200;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 25; 
      posArray[i+1] = (Math.random() - 0.5) * 15;
      posArray[i+2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Violet color suited for both modes
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

    // Animation Loop
    let animationId;
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      // Wave motion
      particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2; 
      particlesMesh.rotation.z += 0.0005; // Gentle spin
      
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
      if(mountRef.current) mountRef.current.innerHTML = ''; // Force cleanup
      particlesGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-60" />;
};

// --- 2. Compact Hero Skeleton ---
const HeroSkeleton = () => (
  <div className="relative h-[500px] md:h-[600px] w-full bg-muted/20 animate-pulse flex items-center justify-center">
    <div className="container mx-auto px-4 flex flex-col justify-end h-full pb-20">
      <div className="max-w-xl space-y-4">
        <div className="h-8 w-32 bg-muted-foreground/10 rounded-full" />
        <div className="h-14 w-3/4 bg-muted-foreground/10 rounded-3xl" />
        <div className="h-6 w-1/2 bg-muted-foreground/10 rounded-xl" />
        <div className="h-12 w-36 bg-muted-foreground/10 rounded-full mt-4" />
      </div>
    </div>
  </div>
);

// --- 3. Main HomePage Component ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs for Animations
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const featuresRef = useRef(null);
  
  // Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Hero Data with Fallback
  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    // Show default only if not loading
    if (!heroLoading) {
      return [{
        id: 'def-1',
        title: 'Future of Tech',
        subtitle: 'Experience innovation like never before.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-violet-600/60 via-purple-600/60 to-indigo-800/60',
        badge: 'New Collection',
        link: '/products',
      }]; 
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  const featuredProducts = products.slice(0, 8);

  // --- Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Parallax (Desktop)
      if (window.innerWidth > 768) {
        gsap.to(imageRefs.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // 2. Features Reveal (Staggered Bounce)
      if(featuresRef.current) {
        gsap.fromTo(featuresRef.current.children,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 85%' }
          }
        );
      }

      // 3. Products & Cats
      gsap.utils.toArray('.anim-up').forEach(el => {
        gsap.fromTo(el,
           { y: 30, opacity: 0 },
           { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }}
        );
      });
    });
    return () => ctx.revert();
  }, [heroSlides.length, categories, products]);

  // --- 3D Tilt Effect Logic (Desktop Only) ---
  const handleTilt = (e, card) => {
    if(window.innerWidth < 768 || !card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height/2) / rect.height) * -8; // Max 8 deg
    const rotateY = ((x - rect.width/2) / rect.width) * 8;

    gsap.to(card, { 
      rotateX, rotateY, scale: 1.02, 
      boxShadow: "0 20px 30px -10px rgba(0,0,0,0.2)",
      duration: 0.3 
    });
  };

  const resetTilt = (card) => {
    if(!card) return;
    gsap.to(card, { 
      rotateX: 0, rotateY: 0, scale: 1, 
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      duration: 0.5, ease: "elastic.out(1, 0.5)" 
    });
  };

  // --- Slide Logic ---
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    const curr = { el: slideRefs.current[currentSlide], content: contentRefs.current[currentSlide], img: imageRefs.current[currentSlide] };
    const next = { el: slideRefs.current[newIndex], content: contentRefs.current[newIndex], img: imageRefs.current[newIndex] };

    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }});
    
    // Out
    tl.to(curr.content, { y: -30, opacity: 0, duration: 0.4 }, 0)
      .to(curr.img, { scale: 1.1, opacity: 0, duration: 0.4 }, 0)
      .set(curr.el, { visibility: 'hidden', zIndex: 0 });

    // In
    tl.set(next.el, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(next.img, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1)
      .fromTo(next.content, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out' }, 0.3);
  }, [currentSlide, isAnimating]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => { if(!isAnimating) animateSlide((currentSlide + 1) % heroSlides.length); }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isAnimating, currentSlide, animateSlide]);

  return (
    <Layout>
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden bg-background">
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
          <div className="relative h-[500px] md:h-[600px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                ref={el => slideRefs.current[index] = el}
                className="absolute inset-0 overflow-hidden flex items-center md:items-end pb-16 md:pb-28"
                style={{ visibility: index === 0 ? 'visible' : 'hidden', zIndex: index === 0 ? 10 : 0 }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-[-1]">
                    <img
                        ref={el => imageRefs.current[index] = el}
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-[115%] object-cover brightness-[0.85] dark:brightness-75"
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-50 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10">
                  <div ref={el => contentRefs.current[index] = el} className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-4 text-white shadow-lg">
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                      {slide.badge || 'Trending'}
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 text-white drop-shadow-xl tracking-tight">
                      {slide.title}
                    </h1>
                    <p className="text-lg text-white/90 mb-8 font-medium max-w-lg drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <Button 
                      asChild 
                      size="lg" 
                      className="h-14 px-8 text-lg rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-300"
                    >
                      <Link to={slide.link || '/products'}>
                        Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Dots */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, i) => (
                    <button key={i} onClick={() => i !== currentSlide && animateSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]' : 'w-2 bg-white/50 hover:bg-white'}`}
                    aria-label={`Slide ${i + 1}`} />
                ))}
                </div>
            )}
          </div>
        )}
      </section>

      {/* FEATURES SECTION - Moved Below Hero */}
      <section className="py-12 bg-muted/20 relative z-10">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Worldwide shipping' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated team' },
            ].map((f, i) => (
              <div key={i} className="group flex flex-col items-center text-center p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-primary font-bold tracking-wider text-xs uppercase">Collections</span>
              <h2 className="text-3xl font-bold mt-1">Browse Categories</h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categoriesLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />) :
             categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="anim-up group flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all duration-300 shadow-sm group-hover:shadow-lg">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent text-2xl">{cat.icon || '📦'}</div>
                  )}
                </div>
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS - 3D TILT EFFECT */}
      <section className="py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {productsLoading ? [...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted rounded-3xl animate-pulse" />) :
             featuredProducts.map((product) => (
               <div 
                 key={product.id} 
                 className="anim-up perspective-1000" // Required for 3D tilt
                 onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                 onMouseLeave={(e) => resetTilt(e.currentTarget)}
               >
                 <div className="h-full transform-style-3d transition-transform duration-100 ease-out will-change-transform">
                    <ProductCard product={product} />
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
