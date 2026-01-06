import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client'
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-40 dark:opacity-30" />;
};

// --- 2. Animated Text Component ---
const AnimatedText = ({ text, className = "", delay = 0 }) => {
  const letters = text.split("");
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { 
          y: 20, 
          opacity: 0, 
          rotateX: -90,
          transformOrigin: "50% 50% -20px"
        },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0,
          duration: 0.8,
          delay,
          stagger: 0.05,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [text, delay]);

  return (
    <span ref={containerRef} className={`inline-flex ${className}`}>
      {letters.map((letter, i) => (
        <span 
          key={i} 
          className="inline-block hover:scale-110 hover:text-primary transition-transform duration-300 origin-bottom"
          style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
};

// --- 3. Enhanced Hero Card Component with 3D Swipe Animation ---
const HeroCard = ({ slide, index, slideRefs, contentRefs, imageRefs, isActive }) => {
  const cardRef = useRef(null);
  const badgeRef = useRef(null);
  
  // Animation for badge on hover
  useEffect(() => {
    if (isActive && badgeRef.current) {
      const badgeLetters = badgeRef.current.querySelectorAll('span');
      gsap.fromTo(
        badgeLetters,
        { 
          scale: 0,
          rotationY: 180,
          opacity: 0
        },
        { 
          scale: 1,
          rotationY: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "back.out(1.5)"
        }
      );
    }
  }, [isActive]);

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        scale: 1.1,
        rotation: 2,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  return (
    <div
      key={slide.id || index}
      ref={el => {
        slideRefs.current[index] = el;
        cardRef.current = el;
      }}
      className="absolute inset-0 overflow-hidden flex items-center md:items-end pb-12 md:pb-20"
      style={{ visibility: isActive ? 'visible' : 'hidden', zIndex: isActive ? 10 : 0 }}
    >
      {/* FIXED: Removed blur line and improved gradient transition */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/20 to-transparent dark:from-background/50 dark:via-background/30 dark:to-transparent z-[-2] rounded-3xl"></div>
      
      <div className="absolute inset-0 z-[-1] rounded-3xl overflow-hidden">
        <img
          ref={el => imageRefs.current[index] = el}
          src={slide.image}
          alt={slide.title}
          className="w-full h-[115%] object-cover brightness-[0.85] dark:brightness-75 transition-all duration-700"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-60 dark:opacity-70 mix-blend-overlay`} />
        {/* Enhanced gradient for smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent dark:via-background/50" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div ref={el => contentRefs.current[index] = el} className="max-w-2xl">
          {/* Enhanced badge with spread animation */}
          <span 
            ref={badgeRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/40 dark:border-white/20 text-sm font-semibold mb-4 text-white shadow-2xl overflow-hidden cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            {slide.badge?.split("").map((letter, i) => (
              <span key={i} className="inline-block hover:scale-125 hover:rotate-12 transition-all duration-300">
                {letter}
              </span>
            )) || 'Trending'}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-2xl tracking-tight leading-tight">
            <AnimatedText text={slide.title} delay={0.2} />
          </h1>
          <p className="text-lg sm:text-xl text-white/95 dark:text-white/90 mb-8 font-medium max-w-lg drop-shadow-lg leading-relaxed backdrop-blur-sm">
            <AnimatedText text={slide.subtitle} delay={0.4} />
          </p>
          <Button 
            asChild 
            size="lg" 
            className="h-14 px-8 text-lg rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-300 transform-gpu backdrop-blur-sm group"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget.querySelectorAll('span'), {
                x: 5,
                duration: 0.3,
                stagger: 0.05
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget.querySelectorAll('span'), {
                x: 0,
                duration: 0.3
              });
            }}
          >
            <Link to={slide.link || '/products'}>
              {'Shop Now'.split("").map((letter, i) => (
                <span key={i} className="inline-block group-hover:scale-110 transition-transform duration-200">
                  {letter}
                </span>
              ))}
              <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- 4. Custom Loading Component with Better UI ---
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

// --- 5. Product Skeleton Cards ---
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

// --- 6. Main HomePage Component ---
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
      // Parallax - Added safety check for imageRefs
      if (window.innerWidth > 768 && imageRefs.current.length > 0) {
        gsap.to(imageRefs.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true }
        });
      }
      // Features Reveal with enhanced animation
      if(featuresRef.current) {
        // --- FIX IS HERE: Converted HTMLCollection to Array using Array.from() ---
        const features = Array.from(featuresRef.current.children);
        
        gsap.fromTo(features,
          { 
            y: 100, 
            opacity: 0, 
            scale: 0.8,
            rotationY: 30
          },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            rotationY: 0,
            duration: 0.8, 
            stagger: 0.15, 
            ease: 'back.out(1.7)',
            scrollTrigger: { 
              trigger: featuresRef.current, 
              start: 'top 85%',
              toggleActions: "play none none reverse"
            }
          }
        );
        
        // Add hover effects to features - NOW this works properly because 'features' is an Array
        features.forEach(feature => {
          feature.addEventListener('mouseenter', () => {
            gsap.to(feature, {
              y: -10,
              scale: 1.05,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          
          feature.addEventListener('mouseleave', () => {
            gsap.to(feature, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });
      }
      // General Reveal
      gsap.utils.toArray('.anim-up').forEach(el => {
        gsap.fromTo(el,
           { 
             y: 50, 
             opacity: 0,
             rotationX: 10
           },
           { 
             y: 0, 
             opacity: 1,
             rotationX: 0,
             duration: 0.6, 
             ease: 'power3.out', 
             scrollTrigger: { 
               trigger: el, 
               start: 'top 90%',
               once: true
             }
           }
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
    const rotateX = ((y - rect.height/2) / rect.height) * -15;
    const rotateY = ((x - rect.width/2) / rect.width) * 15;
    const depth = 20;
    
    gsap.to(card, { 
      rotateX, 
      rotateY,
      translateZ: depth,
      scale: 1.05,
      boxShadow: `0 ${depth}px ${depth*2}px -10px rgba(0,0,0,0.3)`,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const resetTilt = (card) => {
    if(!card) return;
    gsap.to(card, { 
      rotateX: 0, 
      rotateY: 0,
      translateZ: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      duration: 0.5, 
      ease: "elastic.out(1, 0.5)" 
    });
  };

  // --- Enhanced 3D Slide Animation Logic ---
  const animateSlide = useCallback((newIndex, direction = 'next') => {
    if (isAnimating || !slideRefs.current[newIndex]) return;
    setIsAnimating(true);
    
    const curr = { 
      el: slideRefs.current[currentSlide], 
      content: contentRefs.current[currentSlide], 
      img: imageRefs.current[currentSlide] 
    };
    const next = { 
      el: slideRefs.current[newIndex], 
      content: contentRefs.current[newIndex], 
      img: imageRefs.current[newIndex] 
    };

    const tl = gsap.timeline({ 
      onComplete: () => { 
        setCurrentSlide(newIndex); 
        setIsAnimating(false); 
      } 
    });
    
    // Determine 3D rotation direction
    const rotationY = direction === 'next' ? -120 : 120;
    const xPercent = direction === 'next' ? -100 : 100;
    
    // Animate current slide out with 3D effect
    tl.to(curr.el, {
      rotationY: rotationY,
      xPercent: xPercent,
      opacity: 0,
      duration: 0.8,
      ease: "power3.inOut",
      transformPerspective: 1000,
      transformOrigin: "50% 50% -300px"
    }, 0)
    .to(curr.content, { 
      y: -40, 
      opacity: 0, 
      duration: 0.4 
    }, 0)
    .to(curr.img, { 
      scale: 1.3, 
      opacity: 0, 
      duration: 0.6 
    }, 0)
    .set(curr.el, { 
      visibility: 'hidden', 
      zIndex: 0,
      rotationY: 0,
      xPercent: 0
    });

    // Prepare next slide with 3D effect
    tl.set(next.el, { 
      visibility: 'visible', 
      zIndex: 10,
      rotationY: direction === 'next' ? 120 : -120,
      xPercent: direction === 'next' ? 100 : -100,
      opacity: 0
    }, 0.2)
    
    // Animate next slide in with 3D effect
    .to(next.el, {
      rotationY: 0,
      xPercent: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.inOut",
      transformPerspective: 1000,
      transformOrigin: "50% 50% -300px"
    }, 0.4)
    .fromTo(next.img, { 
      scale: 1.3, 
      opacity: 0 
    }, { 
      scale: 1, 
      opacity: 1, 
      duration: 0.8, 
      ease: 'power2.out' 
    }, 0.4)
    .fromTo(next.content, { 
      y: 40, 
      opacity: 0,
      rotationX: 30
    }, { 
      y: 0, 
      opacity: 1,
      rotationX: 0,
      duration: 0.6, 
      ease: 'back.out(1.7)' 
    }, 0.6);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next, 'next');
  }, [currentSlide, heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev, 'prev');
  }, [currentSlide, heroSlides.length, animateSlide]);

  // --- Enhanced Touch Handling with 3D Feedback ---
  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.targetTouches[0].clientX;
    
    // Add 3D tilt feedback during swipe
    const delta = touchEndX.current - touchStartX.current;
    const rotationY = delta * 0.1; // Reduced sensitivity
    
    gsap.to(slideRefs.current[currentSlide], {
      rotationY,
      duration: 0.1,
      transformPerspective: 1000,
      transformOrigin: "50% 50% -300px"
    });
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;

    // Reset rotation
    gsap.to(slideRefs.current[currentSlide], {
      rotationY: 0,
      duration: 0.3,
      ease: "power2.out"
    });

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Enhanced Autoplay with smoother transitions
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => { 
      if(!isAnimating) nextSlide(); 
    }, 5000); // Reduced to 5 seconds for better UX
    return () => clearInterval(interval);
  }, [heroSlides.length, isAnimating, nextSlide]);

  // Animate labels/text on hover
  const animateLabelHover = (e, type = 'spread') => {
    const text = e.currentTarget.textContent;
    const letters = e.currentTarget.querySelectorAll('span') || e.currentTarget.children;
    
    if (type === 'spread') {
      gsap.to(letters, {
        x: (i) => (i - text.length/2) * 10,
        y: (i) => Math.sin(i) * 10,
        rotation: (i) => (i - text.length/2) * 5,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: 0.05
      });
    } else {
      gsap.to(letters, {
        scale: 1.2,
        y: -5,
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.03
      });
    }
  };

  const animateLabelLeave = (e) => {
    const letters = e.currentTarget.querySelectorAll('span') || e.currentTarget.children;
    gsap.to(letters, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
      stagger: 0.02
    });
  };

  return (
    <Layout>
      {/* HERO SECTION with Enhanced 3D Swipe Animation */}
      <section 
        ref={heroRef} 
        className="relative overflow-hidden bg-background"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ParticleBackground />
        
        {heroLoading || heroSlides.length === 0 ? (
          <div className="relative h-[400px] md:h-[500px] w-full bg-muted/20 animate-pulse flex items-center justify-center">
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
          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mx-4 mt-4 md:mx-8 md:mt-6 shadow-2xl transform-style-3d perspective-1000">
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
            
            {/* Navigation Arrows */}
            {heroSlides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Dots with new 3D style */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => i !== currentSlide && animateSlide(i, i > currentSlide ? 'next' : 'prev')}
                    className={`h-2 rounded-full transition-all duration-300 hover:scale-110 transform-style-3d ${
                      i === currentSlide 
                        ? 'w-10 bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_12px_theme(colors.primary.DEFAULT)] scale-110' 
                        : 'w-4 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1.3,
                        y: -3,
                        duration: 0.2
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: i === currentSlide ? 1.1 : 1,
                        y: 0,
                        duration: 0.2
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* FEATURES SECTION with Enhanced Animation */}
      <section className="py-8 bg-gradient-to-b from-background via-background/80 to-background relative z-10">
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
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-95 hover:scale-[1.02] dark:from-card/90 dark:to-card/70 dark:backdrop-blur-2xl cursor-pointer"
                onMouseEnter={(e) => {
                  animateLabelHover(e, 'spread');
                  gsap.to(e.currentTarget.querySelector('.feature-icon'), {
                    rotationY: 360,
                    duration: 0.6,
                    ease: "power2.out"
                  });
                }}
                onMouseLeave={animateLabelLeave}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${f.color} text-white mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg group-hover:shadow-xl feature-icon`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors dark:text-white/90 overflow-hidden">
                  {f.title.split("").map((letter, i) => (
                    <span key={i} className="inline-block">
                      {letter}
                    </span>
                  ))}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-white/70 overflow-hidden">
                  {f.desc.split("").map((letter, i) => (
                    <span key={i} className="inline-block">
                      {letter}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES with Improved Animation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span 
                className="text-primary font-bold tracking-wider text-xs uppercase cursor-pointer inline-block"
                onMouseEnter={animateLabelHover}
                onMouseLeave={animateLabelLeave}
              >
                {'Collections'.split("").map((letter, i) => (
                  <span key={i} className="inline-block">
                    {letter}
                  </span>
                ))}
              </span>
              <h2 className="text-3xl font-bold mt-1 dark:text-white/90">
                <AnimatedText text="Browse Categories" />
              </h2>
            </div>
            <Link 
              to="/products" 
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group"
              onMouseEnter={animateLabelHover}
              onMouseLeave={animateLabelLeave}
            >
              {'View All'.split("").map((letter, i) => (
                <span key={i} className="inline-block">
                  {letter}
                </span>
              ))}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
            {categoriesLoading ? [...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted/50 dark:bg-muted/30 rounded-2xl animate-pulse backdrop-blur-sm" />
            )) : categories.slice(0, 8).map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`} 
                className="anim-up group flex flex-col items-center gap-3"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    y: -10,
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                  animateLabelHover(e.currentTarget.querySelector('span:last-child'));
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                  animateLabelLeave(e.currentTarget.querySelector('span:last-child'));
                }}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 shadow-lg group-hover:shadow-xl bg-gradient-to-br from-background/80 to-accent/10 dark:from-background/90 dark:to-accent/20 backdrop-blur-sm">
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
                <span className="text-sm font-semibold group-hover:text-primary transition-colors text-center px-2 dark:text-white/80 overflow-hidden">
                  {cat.name.split("").map((letter, i) => (
                    <span key={i} className="inline-block">
                      {letter}
                    </span>
                  ))}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS with Enhanced 3D Cards */}
      <section className="py-16 bg-gradient-to-b from-muted/5 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 dark:text-white/90">
              <AnimatedText text="Trending Now" />
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
            <p className="text-muted-foreground dark:text-white/70 mt-4 max-w-md mx-auto">
              <AnimatedText text="Discover our most popular products loved by thousands of customers" delay={0.1} />
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 min-h-[450px]">
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
              featuredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="anim-up block"
                >
                  <div 
                    className="h-full transform-style-3d transition-transform duration-100 ease-out will-change-transform rounded-2xl hover:shadow-2xl transition-shadow duration-300 perspective-1000"
                    onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                    onMouseLeave={(e) => resetTilt(e.currentTarget)}
                  >
                    <div className="bg-gradient-to-br from-card/90 to-card/80 dark:from-card/95 dark:to-card/85 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden h-full hover:border-primary/30 transition-all duration-300 transform-style-3d preserve-3d">
                      <ProductCard product={product} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {!productsLoading && featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                asChild 
                size="lg" 
                className="rounded-full px-8 py-6 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group overflow-hidden"
                onMouseEnter={(e) => {
                  const letters = e.currentTarget.querySelectorAll('span');
                  gsap.to(letters, {
                    y: -5,
                    scale: 1.1,
                    duration: 0.3,
                    stagger: 0.05,
                    ease: "power2.out"
                  });
                }}
                onMouseLeave={(e) => {
                  const letters = e.currentTarget.querySelectorAll('span');
                  gsap.to(letters, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    stagger: 0.02,
                    ease: "elastic.out(1, 0.5)"
                  });
                }}
              >
                <Link to="/products" className="flex items-center gap-2">
                  {'View All Products'.split("").map((letter, i) => (
                    <span key={i} className="inline-block">
                      {letter}
                    </span>
                  ))}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
