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

// --- 1. Enhanced Three.js Background (Floating Wave Effect) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || window.innerWidth < 768) return; // Optional: Disable on mobile if performance is bad

    // Cleanup previous
    while(mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

    const scene = new THREE.Scene();
    // Field of View increased for more immersive feel on desktop
    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio for performance
    mountRef.current.appendChild(renderer.domElement);

    // --- Particles in a Wave Pattern ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1200;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      // Spread particles wider on x-axis
      posArray[i] = (Math.random() - 0.5) * 25; 
      posArray[i+1] = (Math.random() - 0.5) * 15;
      posArray[i+2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Slightly darker violet for better visibility in light mode
    const material = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x6d28d9, // Violet-700
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 5;

    // Mouse Interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    if (window.matchMedia("(pointer: fine)").matches) {
       document.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;
      particlesMesh.rotation.y += 0.02 * (targetX - particlesMesh.rotation.y);
      particlesMesh.rotation.x += 0.02 * (targetY - particlesMesh.rotation.x);

      // Wave motion effect
      particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2; 
      
      // Gentle constant rotation
      particlesMesh.rotation.z += 0.0005;

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

  // Only show on Desktop for the "Hero Vibe", hide on mobile for performance/clean look
  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-70" />;
};

// --- 2. Skeleton Loader ---
const HeroSkeleton = () => (
  <div className="relative h-[500px] md:h-[650px] w-full bg-muted/30 overflow-hidden flex items-center justify-center animate-pulse">
    <div className="container mx-auto px-4 flex flex-col justify-end h-full pb-24">
      <div className="max-w-xl space-y-5">
        <div className="h-8 w-32 bg-muted-foreground/20 rounded-full" />
        <div className="h-16 w-4/5 bg-muted-foreground/20 rounded-3xl" />
        <div className="h-6 w-3/5 bg-muted-foreground/20 rounded-xl" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-36 bg-muted-foreground/20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// --- 3. Main HomePage ---
const HomePage = () => {
  // NOTE: Make sure to use your <ScrollToTop /> component in App.tsx!
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs used for GSAP Animations
  const heroSectionRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const featuresRef = useRef(null);
  
  // Data Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Hero Data Logic
  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    if (!heroLoading) {
      return [{
        id: 'def-1',
        title: 'Level Up Your Style',
        subtitle: 'Discover the newest trends in tech and fashion.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
        gradient: 'from-violet-600/60 via-purple-600/60 to-indigo-800/60',
        badge: 'New Season',
        link: '/products',
      }]; 
    }
    return [];
  }, [dbHeroImages, heroLoading]);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  // --- GSAP Animations Setup ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Parallax (Desktop Vibe)
      if (heroSectionRef.current && window.innerWidth > 768) {
        gsap.to(imageRefs.current, {
          yPercent: 20, // Move image slower than scroll
          ease: "none",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // 2. Features Reveal with elastic bounce
      const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
      if (featureCards) {
        gsap.fromTo(featureCards,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 90%' }
          }
        );
      }

      // 3. Categories & Products Reveal
      gsap.utils.toArray(['.category-item-anim', '.product-card-wrapper']).forEach(el => {
        gsap.fromTo(el,
           { y: 40, opacity: 0 },
           { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%' }}
        );
      });

    });
    return () => ctx.revert();
  }, [categories, products, heroSlides.length]);

  // --- 3D Tilt Effect for Product Cards (Desktop) ---
  const handleCardMouseMove = (e, cardRef) => {
    if (window.innerWidth < 768 || !cardRef) return;
    const rect = cardRef.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(cardRef, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        duration: 0.3,
        ease: "power2.out"
    });
  };

  const handleCardMouseLeave = (cardRef) => {
      if (window.innerWidth < 768 || !cardRef) return;
      gsap.to(cardRef, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          duration: 0.5,
          ease: "elastic.out(1, 0.5)" // Smooth elastic return
      });
  };


  // Hero Slide Animation Logic
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);

    const current = {
        content: contentRefs.current[currentSlide],
        image: imageRefs.current[currentSlide],
        slide: slideRefs.current[currentSlide]
    };
    const next = {
        content: contentRefs.current[newIndex],
        image: imageRefs.current[newIndex],
        slide: slideRefs.current[newIndex]
    };

    const tl = gsap.timeline({
      onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); }
    });

    // Out animation
    tl.to(current.content, { y: -50, opacity: 0, duration: 0.5, ease: 'power3.in' }, 0)
      .to(current.image, { scale: 1.1, opacity: 0, duration: 0.5 }, 0)
      .set(current.slide, { visibility: 'hidden', zIndex: 0 });

    // In animation
    tl.set(next.slide, { visibility: 'visible', zIndex: 10 }, 0)
      .fromTo(next.image, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }, 0.1)
      .fromTo(next.content, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' }, 0.3);

  }, [currentSlide, isAnimating]);

  // Autoplay
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const autoplay = setInterval(() => {
        if(!isAnimating) animateSlide((currentSlide + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(autoplay);
  }, [heroSlides.length, isAnimating, currentSlide, animateSlide]);


  return (
    <Layout>
      {/* Hero Section */}
      <section ref={heroSectionRef} className="relative overflow-hidden bg-background group">
        <ParticleBackground />

        {heroLoading || heroSlides.length === 0 ? <HeroSkeleton /> : (
          <div className="relative h-[500px] md:h-[650px]"> {/* Increased height for desktop vibe */}
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                ref={el => slideRefs.current[index] = el}
                className="absolute inset-0 overflow-hidden flex items-center pb-16 md:pb-0"
                style={{ visibility: index === 0 ? 'visible' : 'hidden', zIndex: index === 0 ? 10 : 0 }}
              >
                {/* Image with Parallax Ref */}
                <div className="absolute inset-0 z-[-1] overflow-hidden" style={{transform: 'translateZ(0)'}}> {/* Hardware acceleration fix */}
                    <img
                        ref={el => imageRefs.current[index] = el}
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-[110%] object-cover brightness-[0.9] dark:brightness-75 scale-105" // Start slightly scaled for parallax room
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Improved Gradient for Light Mode contrast */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-black/50 to-black/10'} mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 flex items-end h-full pb-20 md:pb-32">
                  <div ref={el => contentRefs.current[index] = el} className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-6 text-white shadow-sm">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      {slide.badge || 'Featured Collection'}
                    </span>
                    {/* Text Shadow Added for Light Mode "Pop" */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-8 font-medium leading-relaxed max-w-xl drop-shadow-sm">
                      {slide.subtitle}
                    </p>
                    <Button 
                      asChild 
                      size="lg" 
                      className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-105 hover:shadow-primary/40 active:scale-95 transition-all duration-300 bg-primary text-primary-foreground group-hover:animate-shimmer bg-[linear-gradient(110deg,#0000,45%,#fff3,55%,#0000)] bg-[length:200%_100%]"
                    >
                      <Link to={slide.link || '/products'}>
                        Shop Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicators */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {heroSlides.map((_, i) => (
                    <button
                    key={i}
                    onClick={() => i !== currentSlide && animateSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                        i === currentSlide ? 'w-10 bg-primary' : 'w-2 bg-white/50 hover:bg-white hover:w-4'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
                </div>
            )}
          </div>
        )}
      </section>

      {/* Features Section - MOVED DOWN & Glassmorphic Look */}
      <section ref={featuresRef} className="relative z-10 py-12 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected transactions' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Track your package worldwide' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support team' },
            ].map((f, i) => (
              // Feature Card with Hover Elevation
              <div key={i} className="feature-card flex flex-col items-center text-center p-6 rounded-3xl bg-card/50 backdrop-blur-lg border border-border/50 shadow-sm hover:shadow-xl hover:bg-card hover:-translate-y-2 transition-all duration-300 group">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
                <span className="text-primary font-semibold tracking-wider uppercase text-sm">Curated For You</span>
                <h2 className="text-3xl font-bold mt-2">Browse Categories</h2>
            </div>
            <Link to="/products" className="group flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {categoriesLoading ? (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
               {[...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-3xl bg-muted animate-pulse" />)}
             </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="category-item-anim group flex flex-col items-center text-center gap-3"
                >
                  {/* Hover: Subtle Rotate and Glow */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted shadow-md group-hover:shadow-primary/30 group-hover:rotate-3 transition-all duration-500 ease-out">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                        {cat.icon || '✨'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Section - With 3D Tilt on Desktop */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold">Trending Now</h2>
             <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mt-4" />
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => {
                 const cardRef = useRef(null);
                 return (
                 // Wrapper for 3D Tilt Effect
                 <div 
                    className="product-card-wrapper h-full perspective-1000" 
                    key={product.id}
                    ref={cardRef}
                    onMouseMove={(e) => handleCardMouseMove(e, cardRef.current)}
                    onMouseLeave={() => handleCardMouseLeave(cardRef.current)}
                 >
                    {/* Ensure ProductCard has h-full and w-full */}
                    <div className="h-full w-full transition-all duration-300" style={{ transformStyle: 'preserve-3d' }}>
                        <ProductCard product={product} />
                    </div>
                 </div>
              )})}
            </div>
          )}
        </div>
      </section>

    </Layout>
  );
};

export default HomePage;
