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

// --- 2. Enhanced Hero Card Component (New Rounded Style) ---
const HeroCard = ({ slide, index, slideRefs, contentRefs, imageRefs, isActive }) => {
  return (
    <div
      key={slide.id || index}
      ref={el => slideRefs.current[index] = el}
      className="absolute inset-0 overflow-hidden flex items-center md:items-end pb-16 md:pb-28"
      style={{ visibility: isActive ? 'visible' : 'hidden', zIndex: isActive ? 10 : 0 }}
    >
      <div className="absolute inset-0 z-[-1]">
        <img
          ref={el => imageRefs.current[index] = el}
          src={slide.image}
          alt={slide.title}
          className="w-full h-[115%] object-cover brightness-[0.85] dark:brightness-75 transition-all duration-700"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-50 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={el => contentRefs.current[index] = el} className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-semibold mb-4 text-white shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            {slide.badge || 'Trending'}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 text-white drop-shadow-xl tracking-tight leading-tight">
            {slide.title}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 font-medium max-w-lg drop-shadow-md leading-relaxed">
            {slide.subtitle}
          </p>
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-300 transform-gpu">
            <Link to={slide.link || '/products'}>
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- 3. Custom Loading Component with Better UI ---
const LoadingSpinner = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 min-h-[400px]">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    </div>
    <p className="mt-8 text-lg font-medium text-muted-foreground animate-pulse tracking-wide">
      Products loading...
    </p>
    <p className="text-sm text-muted-foreground/70 mt-2">Please wait a moment</p>
  </div>
);

// --- 4. Product Skeleton Cards ---
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
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const featuresRef = useRef(null);
  
  // Touch Handling State
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Data
  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

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

  const featuredProducts = useMemo(() => {
    if (products.length > 0) {
      setProductsLoaded(true);
      return products.slice(0, 8);
    }
    return [];
  }, [products]);

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

  // --- Slide Animation Logic ---
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

  // --- FIXED SWIPE LOGIC ---
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
    
    // Reset
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
      {/* HERO SECTION with Enhanced Rounded Cards */}
      <section 
        ref={heroRef} 
        className="relative overflow-hidden bg-background"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? (
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
        ) : (
          <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden mx-4 mt-4 md:mx-8 md:mt-6 shadow-2xl">
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
            
            {/* Dots with new style */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => i !== currentSlide && animateSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      i === currentSlide 
                        ? 'w-10 bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_12px_theme(colors.primary.DEFAULT)]' 
                        : 'w-4 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Slide ${i + 1}`} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* FEATURES SECTION with Rounded Cards */}
      <section className="py-8 bg-gradient-to-b from-background to-muted/10 relative z-10">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Over $100', color: 'from-blue-500 to-cyan-500' },
              { icon: Shield, title: 'Secure Pay', desc: '100% Safe', color: 'from-green-500 to-emerald-500' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global', color: 'from-orange-500 to-red-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Online', color: 'from-purple-500 to-pink-500' },
            ].map((f, i) => (
              <div 
                key={i} 
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 active:scale-95 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${f.color} text-white mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES with Improved Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-primary font-bold tracking-wider text-xs uppercase">Collections</span>
              <h2 className="text-3xl font-bold mt-1">Browse Categories</h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
            {categoriesLoading ? [...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            )) : categories.slice(0, 8).map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`} 
                className="anim-up group flex flex-col items-center gap-3"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 shadow-md group-hover:shadow-xl bg-gradient-to-br from-background to-accent/20">
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-accent/70 text-2xl text-accent-foreground">
                      {cat.icon || '📦'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span className="text-sm font-semibold group-hover:text-primary transition-colors text-center px-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS - Fixed Click Issue & Better Loading */}
      <section className="py-16 bg-gradient-to-b from-muted/10 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Trending Now</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Discover our most popular products loved by thousands of customers
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 min-h-[450px]">
            {/* Loading State */}
            {productsLoading && !productsLoaded ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="anim-up">
                  <ProductSkeletonCard />
                </div>
              ))
            ) : productsError ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="text-destructive text-lg mb-4">Failed to load products</div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="text-muted-foreground text-lg mb-4">No products available</div>
                <Button asChild>
                  <Link to="/products">Browse All Products</Link>
                </Button>
              </div>
            ) : (
              // Products Grid with Link fix
              featuredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="anim-up block"
                >
                  <div 
                    className="h-full transform-style-3d transition-transform duration-100 ease-out will-change-transform rounded-2xl hover:shadow-xl transition-shadow duration-300"
                    onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                    onMouseLeave={(e) => resetTilt(e.currentTarget)}
                  >
                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden h-full hover:border-primary/20 transition-all duration-300">
                      <ProductCard product={product} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {!productsLoading && featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Button asChild size="lg" className="rounded-full px-8 py-6 text-base">
                <Link to="/products" className="flex items-center gap-2">
                  View All Products <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;