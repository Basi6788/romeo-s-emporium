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

// --- 1. Three.js Background (Fixed z-index & Scroll) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || window.innerWidth < 768) return; 

    // Clean up
    while(mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    // Important: Pointer events none to ensure scrolling works through the canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 20; 
      posArray[i+1] = (Math.random() - 0.5) * 20;
      posArray[i+2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x8b5cf6, // Violet color fixed
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

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />;
};

// --- 2. Animated Text Component (More Bounce) ---
const AnimatedText = ({ text, className = "", delay = 0 }) => {
  const letters = text.split("");
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { 
          y: 40, 
          opacity: 0, 
          scale: 0.5,
          rotateX: -90
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          rotateX: 0,
          duration: 0.9,
          delay,
          stagger: 0.03,
          ease: "elastic.out(1, 0.5)" // More bouncy
        }
      );
    }
  }, [text, delay]);

  return (
    <span ref={containerRef} className={`inline-flex flex-wrap ${className}`}>
      {letters.map((letter, i) => (
        <span 
          key={i} 
          className="inline-block hover:text-primary transition-colors duration-200"
          style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
};

// --- 3. Hero Card (Fixed Colors & Removed Buttons logic visual) ---
const HeroCard = ({ slide, index, slideRefs, contentRefs, imageRefs, isActive }) => {
  return (
    <div
      key={slide.id || index}
      ref={el => slideRefs.current[index] = el}
      className="absolute inset-0 overflow-hidden flex items-center md:items-end pb-12 md:pb-24"
      style={{ visibility: isActive ? 'visible' : 'hidden', zIndex: isActive ? 10 : 0 }}
    >
      {/* Fixed Overlay: Using strict black gradients to ensure text is always white regardless of theme */}
      <div className="absolute inset-0 z-[-1] rounded-3xl overflow-hidden bg-black">
        <img
          ref={el => imageRefs.current[index] = el}
          src={slide.image}
          alt={slide.title}
          className="w-full h-[120%] object-cover opacity-80 transition-all duration-700"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        {/* Gradient forcing dark bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-40 mix-blend-overlay`} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div ref={el => contentRefs.current[index] = el} className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-bold mb-6 text-white shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            {slide.badge || 'Trending Now'}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight leading-none">
            <AnimatedText text={slide.title} delay={0.1} />
          </h1>
          <p className="text-lg sm:text-2xl text-gray-200 mb-8 font-medium max-w-xl drop-shadow-md leading-relaxed">
            {slide.subtitle}
          </p>
          <Button 
            asChild 
            size="lg" 
            className="h-16 px-10 text-xl rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)] bg-primary hover:bg-primary/90 text-white hover:scale-105 transition-all duration-300 transform-gpu"
          >
            <Link to={slide.link || '/products'}>
              Shop Now <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductSkeletonCard = () => (
  <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 animate-pulse h-full">
    <div className="aspect-square w-full bg-muted rounded-xl mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded-full w-3/4"></div>
      <div className="h-4 bg-muted rounded-full w-1/2"></div>
    </div>
  </div>
);

// --- 4. Main HomePage ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const heroRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRefs = useRef([]);
  const imageRefs = useRef([]);
  const featuresRef = useRef(null);
  
  // Touch Handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  const heroSlides = useMemo(() => {
    if (dbHeroImages && dbHeroImages.length > 0) return dbHeroImages;
    return [
      {
        id: '1',
        title: 'New Season Arrival',
        subtitle: 'Upgrade your style with our latest premium collection.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070',
        gradient: 'from-purple-500 to-blue-500',
        badge: 'Exclusive',
      },
      {
        id: '2',
        title: 'Tech Revolution',
        subtitle: 'Next-gen gadgets that define the future.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070',
        gradient: 'from-cyan-500 to-blue-600',
        badge: 'Best Seller',
      }
    ];
  }, [dbHeroImages]);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  // --- Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for Hero Images
      if(window.innerWidth > 768 && imageRefs.current.length) {
         gsap.to(imageRefs.current, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: { 
              trigger: heroRef.current, 
              start: "top top", 
              end: "bottom top", 
              scrub: true 
            }
         });
      }

      // Features Stagger
      if(featuresRef.current) {
        gsap.from(featuresRef.current.children, {
          y: 60,
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          }
        });
      }

      // Products Stagger (More pronounced)
      const productCards = gsap.utils.toArray('.product-anim');
      if(productCards.length) {
        gsap.from(productCards, {
          y: 100,
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.products-grid',
            start: "top 85%",
          }
        });
      }
    });
    return () => ctx.revert();
  }, [heroSlides, products]);

  // --- Slide Logic ---
  const animateSlide = useCallback((newIndex) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const curr = { el: slideRefs.current[currentSlide], content: contentRefs.current[currentSlide] };
    const next = { el: slideRefs.current[newIndex], content: contentRefs.current[newIndex] };

    const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(newIndex); setIsAnimating(false); } });
    
    tl.to(curr.content, { y: -20, opacity: 0, duration: 0.4 })
      .to(curr.el, { opacity: 0, scale: 1.1, duration: 0.6 }, 0)
      .set(curr.el, { visibility: 'hidden', zIndex: 0 })
      .set(next.el, { visibility: 'visible', zIndex: 10, opacity: 0, scale: 1.1 })
      .to(next.el, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" })
      .fromTo(next.content, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" }, "-=0.4");

  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    animateSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    animateSlide(currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1);
  }, [currentSlide, heroSlides.length, animateSlide]);

  // Touch Swipe
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => { if(!isAnimating) nextSlide(); }, 6000);
    return () => clearInterval(interval);
  }, [isAnimating, nextSlide]);

  // 3D Tilt for Products
  const handleTilt = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height/2) / rect.height) * -10;
    const rotateY = ((x - rect.width/2) / rect.width) * 10;
    
    gsap.to(card, { 
      rotateX, 
      rotateY, 
      scale: 1.02, 
      boxShadow: "0 20px 30px -10px rgba(0,0,0,0.2)",
      duration: 0.4 
    });
  };

  const resetTilt = (card) => {
    gsap.to(card, { 
      rotateX: 0, 
      rotateY: 0, 
      scale: 1, 
      boxShadow: "none",
      duration: 0.5 
    });
  };

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden">
        {/* HERO SECTION */}
        <section 
          ref={heroRef} 
          className="relative w-full h-[500px] md:h-[600px] bg-background"
          onTouchStart={e => touchStartX.current = e.targetTouches[0].clientX}
          onTouchMove={e => touchEndX.current = e.targetTouches[0].clientX}
          onTouchEnd={onTouchEnd}
        >
          <ParticleBackground />
          
          <div className="relative h-full w-full md:w-[95%] mx-auto md:mt-4 rounded-none md:rounded-3xl overflow-hidden shadow-2xl">
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
            
            {/* Buttons removed as requested. Only Dots remain. */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
              {heroSlides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => i !== currentSlide && animateSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentSlide ? 'w-12 bg-white' : 'w-4 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div ref={featuresRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100', color: 'bg-blue-500/10 text-blue-500' },
                { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'bg-green-500/10 text-green-500' },
                { icon: Clock, title: 'Fast Delivery', desc: 'Global shipping', color: 'bg-orange-500/10 text-orange-500' },
                { icon: Headphones, title: '24/7 Support', desc: 'Always here for you', color: 'bg-purple-500/10 text-purple-500' },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                  <div className={`p-4 rounded-full ${f.color} mb-4`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Browse Categories</h2>
                <div className="h-1 w-20 bg-primary rounded-full"></div>
              </div>
              <Button variant="ghost" asChild className="group">
                <Link to="/products">View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <Link 
                  key={cat.id || i} 
                  to={`/products?category=${cat.id}`}
                  className="group flex flex-col items-center gap-3"
                  onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -5, duration: 0.3 })}
                  onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.3 })}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-md">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-accent flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TRENDING PRODUCTS (Fixed Area & Animation) */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold mb-4">Trending Now</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Top picks from our premium collection.</p>
            </div>

            <div className="products-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {productsLoading ? (
                [...Array(8)].map((_, i) => <ProductSkeletonCard key={i} />)
              ) : featuredProducts.map((product) => (
                // Added h-full to Link to fix clickable area
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="product-anim block h-full" 
                >
                  <div 
                    className="h-full transform-style-3d perspective-1000"
                    onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                    onMouseLeave={(e) => resetTilt(e.currentTarget)}
                  >
                    <div className="bg-card h-full rounded-2xl border border-border/50 hover:border-primary/50 overflow-hidden transition-all duration-300">
                      {/* ProductCard needs to take full height inside */}
                      <ProductCard product={product} className="h-full" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/products">Explore All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
