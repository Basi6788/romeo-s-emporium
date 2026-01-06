import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// --- 1. Three.js Background (Optimized for performance) ---
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Mobile pe heavy animation avoid karne ke liye check
    if (!mountRef.current || window.innerWidth < 768) return; 

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Performance fix
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none'; // Click-through enabled
    
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800; // Count reduced slightly for optimization
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 20; 
      posArray[i+1] = (Math.random() - 0.5) * 20;
      posArray[i+2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x8b5cf6, 
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
      // Rotation thori slow ki hai smooth feel ke liye
      particlesMesh.rotation.y = elapsedTime * 0.03; 
      particlesMesh.rotation.x = elapsedTime * 0.01;
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
      if(mountRef.current) {
         // Safe cleanup
         while(mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
         }
      }
      particlesGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />;
};

// --- 2. Animated Text Component ---
const AnimatedText = ({ text, className = "", delay = 0 }) => {
  // Safe guard agar text undefined ho
  if (!text) return null;
  
  const letters = text.split("");
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 40, opacity: 0, rotateX: -90 },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0,
          duration: 0.8,
          delay,
          stagger: 0.02,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [text, delay]);

  return (
    <span ref={containerRef} className={`inline-flex flex-wrap ${className}`}>
      {letters.map((letter, i) => (
        <span key={i} className="inline-block" style={{ whiteSpace: letter === " " ? "pre" : "normal" }}>
          {letter}
        </span>
      ))}
    </span>
  );
};

// --- 3. Hero Card ---
const HeroCard = ({ slide, index, isActive }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }
      );
    }
  }, [isActive]);

  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
        isActive ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible'
      }`}
    >
      <div ref={cardRef} className="relative w-full h-full">
        {/* Image Layer */}
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-purple-500/20 to-blue-500/20'} mix-blend-overlay`} />

        {/* Text Content */}
        <div className="absolute inset-0 flex items-center md:items-end pb-12 md:pb-24 px-6 md:px-12 container mx-auto">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold text-white shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {slide.badge || 'Featured'}
            </span>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
              {isActive && <AnimatedText text={slide.title} delay={0.2} />}
            </h1>
            
            <p className="text-lg sm:text-2xl text-gray-200 font-medium max-w-xl drop-shadow-md">
              {slide.subtitle}
            </p>
            
            <Button 
              asChild 
              size="lg" 
              className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl hover:scale-105 transition-transform"
            >
              <Link to={slide.link || '/products'}>
                Shop Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Skeletons ---
const HeroSkeleton = () => (
  <div className="w-full h-[500px] md:h-[600px] bg-muted/20 animate-pulse flex items-center justify-center">
    <div className="text-muted-foreground">Loading Offers...</div>
  </div>
);

const ProductSkeletonCard = () => (
  <div className="bg-card rounded-2xl border p-4 animate-pulse h-full">
    <div className="aspect-square w-full bg-muted rounded-xl mb-4"></div>
    <div className="h-4 bg-muted rounded-full w-3/4 mb-2"></div>
    <div className="h-4 bg-muted rounded-full w-1/2"></div>
  </div>
);

// --- 4. Main HomePage ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  
  // Real Data Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // STRICTLY NO MOCK DATA - Agar DB khali hai, toh empty array rahega
  const heroSlides = useMemo(() => {
    return dbHeroImages && dbHeroImages.length > 0 ? dbHeroImages : [];
  }, [dbHeroImages]);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  // --- GSAP Animations ---
  useEffect(() => {
    if (productsLoading || heroLoading) return; // Wait for data
    
    // Refresh ScrollTrigger after DOM updates
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // Features Animation
      gsap.from(".feature-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        }
      });

      // Products Stagger
      gsap.from(".product-anim", {
        y: 60,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05, // Thora fast kiya hai
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".products-grid",
          start: "top 85%",
        }
      });
    });
    return () => ctx.revert();
  }, [productsLoading, heroLoading]);

  // --- Slider Logic ---
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // --- 3D Tilt Logic (Fixed for Click Bugs) ---
  const handleTilt = (e, card) => {
    if (window.innerWidth < 1024) return; // Disable on mobile/tablet
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height/2) / rect.height) * -8; // Reduced rotation
    const rotateY = ((x - rect.width/2) / rect.width) * 8;
    
    gsap.to(card, { 
      rotateX, 
      rotateY, 
      scale: 1.02, 
      duration: 0.4,
      ease: "power1.out"
    });
  };

  const resetTilt = (card) => {
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5 });
  };

  // --- Navigation Handler for Cards ---
  // Ye function link-in-link bug ko solve karta hai
  const handleCardClick = (e, productId) => {
    // Agar user ne button ya link pe click kiya hai inside card, toh navigate mat karo
    const target = e.target;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    navigate(`/product/${productId}`);
  };

  if (heroLoading) return <Layout><HeroSkeleton /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        
        {/* HERO SECTION */}
        <section ref={heroRef} className="relative w-full h-[500px] md:h-[600px] mb-12">
          <ParticleBackground />
          
          {heroSlides.length > 0 ? (
            <div className="relative h-full w-full md:w-[96%] mx-auto md:mt-4 rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-black">
              {heroSlides.map((slide, index) => (
                <HeroCard
                  key={slide.id || index}
                  slide={slide}
                  index={index}
                  isActive={index === currentSlide}
                />
              ))}
              
              {/* Dots Navigation */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Fallback agar DB me images nahi hain
            <div className="h-full flex items-center justify-center bg-muted">
              <p className="text-xl font-semibold">No Offers Available</p>
            </div>
          )}
        </section>

        {/* FEATURES (Static UI Icons are fine, not fake data) */}
        <section className="features-section py-8 container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100', color: 'text-blue-500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-green-500' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global shipping', color: 'text-orange-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here for you', color: 'text-purple-500' },
            ].map((f, i) => (
              <div key={i} className="feature-card flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/30 transition-colors">
                <f.icon className={`w-8 h-8 ${f.color} mb-3`} />
                <h3 className="font-bold text-sm md:text-base">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Browse Categories</h2>
              <Button variant="link" asChild>
                <Link to="/products">View All</Link>
              </Button>
            </div>
            
            {categoriesLoading ? (
               <div className="text-center py-10">Loading Categories...</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {categories.length > 0 ? categories.slice(0, 6).map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/products?category=${cat.id}`}
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-background transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-accent flex items-center justify-center">📦</div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-center">{cat.name}</span>
                  </Link>
                )) : <div className="col-span-full text-center text-muted-foreground">No categories found.</div>}
              </div>
            )}
          </div>
        </section>

        {/* TRENDING PRODUCTS (BUG FIXED: Link Wrapping) */}
        <section className="products-grid py-16 container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Trending Now</h2>
            <p className="text-muted-foreground">Top picks from our collection.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {productsLoading ? (
              [...Array(4)].map((_, i) => <ProductSkeletonCard key={i} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-anim h-full perspective-1000 cursor-pointer"
                  onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                  onMouseLeave={(e) => resetTilt(e.currentTarget)}
                  onClick={(e) => handleCardClick(e, product.id)} // Navigation logic here
                >
                  <div className="bg-card h-full rounded-2xl border hover:shadow-xl transition-all duration-300 transform-style-3d">
                    {/* Note: ProductCard ke andar <Link> mat lagana agar buttons hain.
                       Agar ProductCard sirf display hai toh theek hai, 
                       lekin yahan humne outer onClick laga diya hai safety ke liye.
                    */}
                    <ProductCard product={product} className="h-full pointer-events-none" />
                    {/* pointer-events-none on Card content ensures clicks pass through to container, 
                        UNLESS ProductCard has interactive buttons with pointer-events-auto */}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p>No products available right now.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/products">Explore Store</Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
