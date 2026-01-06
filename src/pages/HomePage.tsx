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
import { useToast } from '@/hooks/use-toast';

// ==================== NEW SYSTEMS ====================
// User Activity Tracking Context & Hooks
import { useUserTracking } from '@/hooks/useUserTracking';
import { useProductTracking } from '@/hooks/useProductTracking';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
// =====================================================

gsap.registerPlugin(ScrollTrigger);

// ==================== OPTIMIZED THREE.JS BACKGROUND ====================
const ParticleBackground = () => {
  const mountRef = useRef(null);
  const animationRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const particlesMeshRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Performance check - disable on low-end devices
    const isLowPerformance = window.innerWidth < 768 || 
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           (navigator.deviceMemory && navigator.deviceMemory < 4);

    if (isLowPerformance) {
      // Fallback to simple gradient
      mountRef.current.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
      `;
      return;
    }

    // Initialize Three.js with error handling
    try {
      sceneRef.current = new THREE.Scene();
      cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      rendererRef.current = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "low-power" // Battery saving
      });
      
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      rendererRef.current.domElement.style.position = 'absolute';
      rendererRef.current.domElement.style.top = '0';
      rendererRef.current.style.left = '0';
      rendererRef.current.domElement.style.pointerEvents = 'none';
      rendererRef.current.domElement.classList.add('three-bg');
      
      mountRef.current.appendChild(rendererRef.current.domElement);

      // Optimized particles with LOD
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = Math.min(500, Math.floor(window.innerWidth * window.innerHeight / 5000));
      const posArray = new Float32Array(particlesCount * 3);
      
      for(let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 15;
        posArray[i + 1] = (Math.random() - 0.5) * 15;
        posArray[i + 2] = (Math.random() - 0.5) * 8;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.03,
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      particlesMeshRef.current = new THREE.Points(particlesGeometry, material);
      sceneRef.current.add(particlesMeshRef.current);
      cameraRef.current.position.z = 5;

      // Optimized animation loop with frame skipping for performance
      let lastTime = 0;
      const frameInterval = 1000 / 30; // 30 FPS target
      
      const animate = (currentTime) => {
        animationRef.current = requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameInterval) return;
        
        lastTime = currentTime - (deltaTime % frameInterval);
        
        if (particlesMeshRef.current) {
          const elapsedTime = currentTime * 0.001;
          particlesMeshRef.current.rotation.y = elapsedTime * 0.02;
          particlesMeshRef.current.rotation.x = elapsedTime * 0.008;
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      animate(0);

      // Debounced resize handler
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
          }
        }, 100);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        
        // Proper disposal
        if (particlesMeshRef.current) {
          particlesMeshRef.current.geometry.dispose();
          particlesMeshRef.current.material.dispose();
          sceneRef.current?.remove(particlesMeshRef.current);
        }
        
        if (rendererRef.current) {
          rendererRef.current.dispose();
          if (mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
          }
        }
        
        clearTimeout(resizeTimeout);
      };
    } catch (error) {
      console.error('Three.js initialization failed:', error);
      // Fallback gradient
      if (mountRef.current) {
        mountRef.current.innerHTML = `
          <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        `;
      }
    }
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

// ==================== ENHANCED ANIMATED TEXT ====================
const AnimatedText = ({ text, className = "", delay = 0 }) => {
  const containerRef = useRef(null);
  const animationId = useRef(null);
  
  useEffect(() => {
    if (!text || !containerRef.current) return;
    
    const letters = text.split("");
    const spans = letters.map((letter, i) => (
      <span 
        key={i} 
        className="inline-block opacity-0 transform translate-y-8"
        style={{ 
          whiteSpace: letter === " " ? "pre" : "normal",
          animationDelay: `${delay + (i * 0.03)}s`
        }}
      >
        {letter}
      </span>
    ));
    
    // Force re-render with spans
    containerRef.current.innerHTML = '';
    spans.forEach(span => {
      const div = document.createElement('div');
      div.className = span.props.className;
      div.style.animationDelay = span.props.style.animationDelay;
      div.textContent = span.props.children;
      div.style.whiteSpace = span.props.style.whiteSpace;
      containerRef.current.appendChild(div);
    });
    
    // Use CSS animation for better performance
    const elements = containerRef.current.children;
    animationId.current = setTimeout(() => {
      Array.from(elements).forEach(el => {
        el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }, 10);
    
    return () => {
      if (animationId.current) clearTimeout(animationId.current);
    };
  }, [text, delay]);

  return (
    <span ref={containerRef} className={`inline-flex flex-wrap ${className}`} />
  );
};

// ==================== NEW LOADER COMPONENT (GSAP + Lottie-like) ====================
const EnhancedLoader = ({ isLoading }) => {
  const loaderRef = useRef(null);
  
  useEffect(() => {
    if (!loaderRef.current || !isLoading) return;
    
    const ctx = gsap.context(() => {
      // Create pulsing circles
      const circles = Array.from({ length: 3 }, (_, i) => {
        const circle = document.createElement('div');
        circle.className = 'absolute w-4 h-4 rounded-full bg-primary';
        circle.style.left = `${30 + i * 20}%`;
        loaderRef.current.appendChild(circle);
        return circle;
      });
      
      circles.forEach((circle, i) => {
        gsap.to(circle, {
          y: -20,
          scale: 1.5,
          opacity: 0.5,
          duration: 0.6,
          repeat: -1,
          delay: i * 0.2,
          yoyo: true,
          ease: "power1.inOut"
        });
      });
      
      // Background shimmer
      gsap.to(loaderRef.current, {
        backgroundPosition: '200% 0',
        duration: 2,
        repeat: -1,
        ease: "linear"
      });
    }, loaderRef);
    
    return () => ctx.revert();
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div 
        ref={loaderRef} 
        className="relative w-48 h-48 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">Loading Offers</div>
            <div className="text-sm text-muted-foreground">Best deals incoming...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== HERO CARD WITH SWIPE SUPPORT ====================
const HeroCard = ({ slide, index, isActive, onSwipe }) => {
  const cardRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isActive && cardRef.current) {
      gsap.killTweensOf(cardRef.current);
      gsap.fromTo(cardRef.current,
        { 
          scale: 1.05, 
          opacity: 0,
          filter: 'blur(10px)'
        },
        { 
          scale: 1, 
          opacity: 1, 
          filter: 'blur(0px)',
          duration: 0.8, 
          ease: "power3.out",
          clearProps: "all"
        }
      );
    }
  }, [isActive]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipe) onSwipe('next');
    if (isRightSwipe && onSwipe) onSwipe('prev');
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (e.deltaX > 30 && onSwipe) onSwipe('next');
      if (e.deltaX < -30 && onSwipe) onSwipe('prev');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 w-full h-full transition-all duration-500 ${
        isActive ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Optimized Image with BlurHash Placeholder */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            contentVisibility: 'auto',
            willChange: 'transform'
          }}
          onLoad={(e) => {
            // Fade in image when loaded
            gsap.to(e.target, { opacity: 1, duration: 0.5 });
          }}
        />
        
        {/* Low-quality placeholder while loading */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30 blur-xl"
          style={{ contentVisibility: 'auto' }}
        />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-purple-600/20 to-blue-600/20'} mix-blend-soft-light`} />

      {/* Text Content */}
      <div className="absolute inset-0 flex items-end md:items-center pb-12 md:pb-0 px-6 md:px-16 container mx-auto">
        <div className="max-w-3xl space-y-4 md:space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-lg border border-white/30 text-sm font-bold text-white shadow-2xl animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
            {slide.badge || 'LIMITED TIME'}
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
            {isActive ? <AnimatedText text={slide.title} delay={0.1} /> : slide.title}
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-xl drop-shadow-lg leading-relaxed">
            {slide.subtitle}
          </p>
          
          <Button 
            asChild 
            size="lg" 
            className="h-14 px-10 text-lg rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
          >
            <Link to={slide.link || '/products'}>
              <span className="flex items-center gap-2">
                Shop Now 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==================== SKELETONS ====================
const HeroSkeleton = () => (
  <div className="w-full h-[500px] md:h-[600px] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 animate-shimmer bg-[length:200%_100%]" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-lg font-semibold text-muted-foreground">Loading Amazing Offers...</div>
      </div>
    </div>
  </div>
);

const ProductSkeletonCard = () => (
  <div className="bg-card rounded-2xl border p-4 overflow-hidden h-full animate-pulse">
    <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded-full w-3/4"></div>
      <div className="h-4 bg-muted rounded-full w-1/2"></div>
      <div className="h-6 bg-muted rounded-full w-1/3 mt-4"></div>
    </div>
  </div>
);

// ==================== MAIN HOMEPAGE ====================
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ==================== NEW TRACKING SYSTEMS ====================
  // Initialize tracking systems
  const { trackUserActivity, getUserPreferences, isSuspiciousActivity } = useUserTracking();
  const { trackProductView, getPersonalizedProducts, trackPurchaseIntent } = useProductTracking();
  const { monitorActivity, warnUser, banUser } = useSecurityMonitor();
  // ==============================================================
  
  // Real Data Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  // Track user activity on mount
  useEffect(() => {
    trackUserActivity('homepage_visit');
    monitorActivity('page_view', { page: 'homepage' });
  }, [trackUserActivity, monitorActivity]);

  // Hero Slides with fallback
  const heroSlides = useMemo(() => {
    if (!dbHeroImages || dbHeroImages.length === 0) {
      return [{
        id: 'fallback',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
        title: 'Welcome to Our Store',
        subtitle: 'Discover amazing products at unbeatable prices',
        badge: 'NEW SEASON',
        gradient: 'from-rose-500/20 to-orange-500/20'
      }];
    }
    return dbHeroImages;
  }, [dbHeroImages]);

  // Personalized products based on user behavior
  const personalizedProducts = useMemo(() => {
    if (products.length === 0) return [];
    
    const userPrefs = getUserPreferences();
    const trendingProducts = products
      .filter(p => p.rating >= 4)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 4);
    
    // For new users, show trending products
    if (!userPrefs || Object.keys(userPrefs).length === 0) {
      return trendingProducts;
    }
    
    // For returning users, personalize
    const preferredCategory = userPrefs.mostViewedCategory;
    const personalized = products
      .filter(p => 
        p.category === preferredCategory || 
        p.tags?.some(tag => userPrefs.interests?.includes(tag))
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
    
    return personalized.length > 3 ? personalized : trendingProducts;
  }, [products, getUserPreferences]);

  // Featured products (fallback if no personalization)
  const featuredProducts = useMemo(() => {
    return personalizedProducts.length > 0 ? personalizedProducts : products.slice(0, 8);
  }, [personalizedProducts, products]);

  // ==================== LOADING OPTIMIZATION ====================
  useEffect(() => {
    if (!heroLoading && !productsLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setInitialLoad(false);
        
        // Track page load completion
        trackUserActivity('homepage_loaded', {
          loadTime: performance.now(),
          heroCount: heroSlides.length,
          productCount: products.length
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [heroLoading, productsLoading, heroSlides.length, products.length, trackUserActivity]);

  // ==================== GSAP ANIMATIONS (Optimized) ====================
  useEffect(() => {
    if (isLoading || initialLoad) return;
    
    ScrollTrigger.refresh(true);
    
    const ctx = gsap.context(() => {
      // Hero entrance animation (only on first load)
      if (initialLoad) {
        gsap.from('.hero-container', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        });
      }

      // Features animation
      gsap.from(".feature-card", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 85%",
          toggleActions: "play none none reverse",
          once: true
        }
      });

      // Products stagger with better performance
      gsap.from(".product-anim", {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".products-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
          once: true
        }
      });

      // Category animation
      gsap.from(".category-card", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        scrollTrigger: {
          trigger: ".categories-section",
          start: "top 90%",
          toggleActions: "play none none reverse",
          once: true
        }
      });
    });
    
    return () => {
      ctx.revert();
      gsap.killTweensOf('.product-anim, .feature-card, .category-card');
    };
  }, [isLoading, initialLoad]);

  // ==================== SLIDER LOGIC WITH SWIPE SUPPORT ====================
  const goToSlide = useCallback((index) => {
    if (index < 0) index = heroSlides.length - 1;
    if (index >= heroSlides.length) index = 0;
    
    gsap.to(heroRef.current, {
      opacity: 0.8,
      duration: 0.2,
      onComplete: () => {
        setCurrentSlide(index);
        gsap.to(heroRef.current, { opacity: 1, duration: 0.2 });
      }
    });
  }, [heroSlides.length]);

  const handleSwipe = useCallback((direction) => {
    if (direction === 'next') {
      goToSlide(currentSlide + 1);
    } else {
      goToSlide(currentSlide - 1);
    }
    
    // Track slider interaction
    trackUserActivity('hero_slider_swipe', { direction, slide: currentSlide });
  }, [currentSlide, goToSlide, trackUserActivity]);

  // Auto-slide with pause on hover
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    
    let interval;
    const startInterval = () => {
      interval = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 6000);
    };
    
    const pauseInterval = () => {
      if (interval) clearInterval(interval);
    };
    
    startInterval();
    
    // Pause on hover
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mouseenter', pauseInterval);
      heroElement.addEventListener('mouseleave', startInterval);
      heroElement.addEventListener('touchstart', pauseInterval);
      heroElement.addEventListener('touchend', startInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (heroElement) {
        heroElement.removeEventListener('mouseenter', pauseInterval);
        heroElement.removeEventListener('mouseleave', startInterval);
        heroElement.removeEventListener('touchstart', pauseInterval);
        heroElement.removeEventListener('touchend', startInterval);
      }
    };
  }, [heroSlides.length, currentSlide, goToSlide]);

  // ==================== 3D TILT (Performance Optimized) ====================
  const tiltTimeout = useRef(null);
  
  const handleTilt = useCallback((e, card) => {
    if (window.innerWidth < 1024) return;
    
    if (tiltTimeout.current) clearTimeout(tiltTimeout.current);
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const rotateX = ((y - rect.height / 2) / rect.height) * -5;
    const rotateY = ((x - rect.width / 2) / rect.width) * 5;
    
    // Use transform for better performance than gsap
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.transition = 'transform 0.2s ease-out';
  }, []);

  const resetTilt = useCallback((card) => {
    tiltTimeout.current = setTimeout(() => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }, 50);
  }, []);

  // ==================== CARD CLICK HANDLER WITH TRACKING ====================
  const handleCardClick = useCallback((e, product) => {
    // Prevent navigation if clicking interactive elements
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[data-interactive]')) {
      return;
    }
    
    // Track product view
    trackProductView(product.id, {
      source: 'homepage_featured',
      position: featuredProducts.findIndex(p => p.id === product.id)
    });
    
    // Track purchase intent
    trackPurchaseIntent(product.id);
    
    // Navigate to product page
    navigate(`/product/${product.id}`);
  }, [navigate, trackProductView, trackPurchaseIntent, featuredProducts]);

  // ==================== SECURITY MONITORING ====================
  useEffect(() => {
    // Check for suspicious activity
    const checkActivity = () => {
      if (isSuspiciousActivity()) {
        warnUser('Unusual activity detected. Please browse normally.');
        
        // If multiple violations, ban user
        const violations = JSON.parse(localStorage.getItem('security_violations') || '0');
        if (violations > 3) {
          banUser('Multiple policy violations detected');
          toast({
            title: "Account Suspended",
            description: "Your account has been suspended due to policy violations.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkActivity, 30000);
    return () => clearInterval(interval);
  }, [isSuspiciousActivity, warnUser, banUser, toast]);

  // ==================== RENDER ====================
  if (heroLoading && initialLoad) {
    return (
      <Layout>
        <EnhancedLoader isLoading={true} />
        <HeroSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <EnhancedLoader isLoading={isLoading} />
      
      <div className="min-h-screen w-full overflow-hidden bg-background">
        
        {/* HERO SECTION */}
        <section 
          ref={heroRef} 
          className="relative w-full h-[500px] md:h-[600px] mb-8 md:mb-12 hero-container"
        >
          <ParticleBackground />
          
          <div className="relative h-full w-full md:w-[95%] mx-auto md:mt-4 rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-black/90 border border-border/50">
            {heroSlides.map((slide, index) => (
              <HeroCard
                key={slide.id || index}
                slide={slide}
                index={index}
                isActive={index === currentSlide}
                onSwipe={handleSwipe}
              />
            ))}
            
            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    goToSlide(i);
                    trackUserActivity('hero_dot_click', { slide: i });
                  }}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                    i === currentSlide 
                      ? 'w-8 bg-gradient-to-r from-primary to-purple-600' 
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            
            {/* Previous/Next Buttons (Hidden but accessible via keyboard) */}
            <button
              onClick={() => handleSwipe('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              onClick={() => handleSwipe('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="features-section py-8 container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100', color: 'text-blue-500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-green-500' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Global shipping', color: 'text-orange-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here for you', color: 'text-purple-500' },
            ].map((f, i) => (
              <div key={i} className="feature-card flex flex-col items-center text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`p-3 rounded-full bg-${f.color.split('-')[1]}-500/10 mb-3`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="categories-section py-12 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse Categories</h2>
                <p className="text-muted-foreground">Shop by your favorite categories</p>
              </div>
              <Button variant="outline" asChild className="rounded-full">
                <Link to="/products">View All</Link>
              </Button>
            </div>
            
            {categoriesLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="category-card flex flex-col items-center gap-3 p-4">
                    <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
                    <div className="h-4 bg-muted rounded-full w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {categories.length > 0 ? categories.slice(0, 6).map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/products?category=${cat.id}`}
                    className="category-card group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-background transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    onClick={() => trackUserActivity('category_click', { category: cat.name })}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 relative">
                      {cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          alt={cat.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-2xl">
                          📦
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                )) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No categories found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* PERSONALIZED/Trending Products */}
        <section className="products-grid py-16 container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {getUserPreferences() ? 'Picked For You' : 'Trending Now'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              {getUserPreferences() ? 'Personalized Recommendations' : 'Trending Products'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {getUserPreferences() 
                ? 'Products we think you\'ll love based on your browsing history'
                : 'Top picks from our collection loved by many shoppers'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {productsLoading ? (
              [...Array(8)].map((_, i) => <ProductSkeletonCard key={i} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-anim h-full perspective-1000 cursor-pointer group"
                  onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                  onMouseLeave={(e) => resetTilt(e.currentTarget)}
                  onClick={(e) => handleCardClick(e, product)}
                >
                  <div className="bg-card h-full rounded-2xl border hover:border-primary/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform-style-3d">
                    <ProductCard 
                      product={product} 
                      className="h-full"
                      showQuickView={true}
                      onQuickView={() => {
                        trackProductView(product.id, { source: 'quick_view' });
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 text-muted-foreground">
                  📦
                </div>
                <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
                <p className="text-muted-foreground mb-6">Check back soon for new arrivals!</p>
                <Button asChild>
                  <Link to="/products">Browse All Products</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button 
              asChild 
              size="lg" 
              className="rounded-full px-10 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              onClick={() => trackUserActivity('explore_store_click')}
            >
              <Link to="/products">
                Explore Full Store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;