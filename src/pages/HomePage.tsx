import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const heroSlides = [
  {
    id: 1,
    title: 'iPhone 16 Pro',
    subtitle: 'Extraordinary Visual & Power',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch_GEO_US?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1726187221849',
    gradient: 'from-violet-600 via-purple-600 to-indigo-800',
    badge: 'New',
  },
  {
    id: 2,
    title: 'Galaxy Watch Ultra',
    subtitle: 'Ultimate Smartwatch',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/uk/2407/gallery/uk-galaxy-watch-ultra-l310-sm-l310nttaeub-542342134?$1300_1038_PNG$',
    gradient: 'from-orange-500 via-rose-500 to-pink-600',
    badge: 'Popular',
  },
  {
    id: 3,
    title: 'AirPods Pro 2',
    subtitle: 'Immersive Sound',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=976&hei=916&fmt=jpeg&qlt=90&.v=1724041668836',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    badge: 'Hot',
  },
  {
    id: 4,
    title: 'MacBook Pro M3',
    subtitle: 'Power. Performance.',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200',
    gradient: 'from-slate-600 via-gray-700 to-zinc-900',
    badge: 'Pro',
  },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  // Section refs for parallax
  const featuresRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const dealsRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const promoRef = useRef<HTMLElement>(null);
  
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 4);

  // Parallax ScrollTrigger setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Features section parallax
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.querySelectorAll('.feature-item'),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Categories section parallax
      if (categoriesRef.current) {
        gsap.fromTo(categoriesRef.current.querySelector('.section-header'),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: categoriesRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );
        gsap.fromTo(categoriesRef.current.querySelectorAll('.category-item'),
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: categoriesRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Deals section parallax
      if (dealsRef.current) {
        gsap.fromTo(dealsRef.current,
          { backgroundPosition: '0% 50%' },
          {
            backgroundPosition: '100% 50%',
            scrollTrigger: {
              trigger: dealsRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            }
          }
        );
        gsap.fromTo(dealsRef.current.querySelectorAll('.product-card'),
          { y: 80, opacity: 0, rotateY: -15 },
          {
            y: 0,
            opacity: 1,
            rotateY: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: dealsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Featured section parallax
      if (featuredRef.current) {
        gsap.fromTo(featuredRef.current.querySelectorAll('.product-card'),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuredRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Promo section parallax
      if (promoRef.current) {
        gsap.fromTo(promoRef.current.querySelectorAll('.promo-card'),
          { y: 100, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: promoRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, [products, categories]);

  // Hero slide animation
  const animateSlide = useCallback((newIndex: number, direction: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);

    const currentContent = contentRefs.current[currentSlide];
    const currentImage = imageRefs.current[currentSlide];
    const currentSlideEl = slideRefs.current[currentSlide];
    
    const newContent = contentRefs.current[newIndex];
    const newImage = imageRefs.current[newIndex];
    const newSlideEl = slideRefs.current[newIndex];

    const xOffset = direction === 'next' ? 100 : -100;

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSlide(newIndex);
        setIsAnimating(false);
      }
    });

    tl.to(currentContent, {
      opacity: 0,
      x: -xOffset,
      duration: 0.4,
      ease: 'power2.inOut'
    }, 0)
    .to(currentImage, {
      opacity: 0,
      scale: 0.8,
      x: -xOffset * 0.5,
      duration: 0.4,
      ease: 'power2.inOut'
    }, 0)
    .set(currentSlideEl, { 
      visibility: 'hidden',
      zIndex: 0 
    }, 0.4);

    tl.set(newSlideEl, { 
      visibility: 'visible',
      zIndex: 10 
    }, 0.35)
    .fromTo(newContent, 
      { opacity: 0, x: xOffset },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      0.4
    )
    .fromTo(newImage,
      { opacity: 0, scale: 1.2, x: xOffset * 0.5 },
      { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      0.4
    );
  }, [currentSlide, isAnimating]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide || isAnimating) return;
    const direction = index > currentSlide ? 'next' : 'prev';
    animateSlide(index, direction);
  }, [currentSlide, isAnimating, animateSlide]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    animateSlide(next, 'next');
  }, [currentSlide, animateSlide]);

  const prevSlide = useCallback(() => {
    const prev = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    animateSlide(prev, 'prev');
  }, [currentSlide, animateSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  };

  // Initial setup and autoplay
  useEffect(() => {
    slideRefs.current.forEach((slide, index) => {
      if (slide) {
        gsap.set(slide, {
          visibility: index === 0 ? 'visible' : 'hidden',
          zIndex: index === 0 ? 10 : 0
        });
      }
    });

    const firstContent = contentRefs.current[0];
    const firstImage = imageRefs.current[0];
    
    if (firstContent && firstImage) {
      gsap.fromTo(firstContent,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
      );
      gsap.fromTo(firstImage,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
      );
    }

    const autoplay = setInterval(() => {
      setCurrentSlide(current => (current + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(autoplay);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAnimating && slideRefs.current[currentSlide]) {
        slideRefs.current.forEach((slide, index) => {
          if (slide) {
            gsap.set(slide, {
              visibility: index === currentSlide ? 'visible' : 'hidden',
              zIndex: index === currentSlide ? 10 : 0
            });
          }
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentSlide, isAnimating]);

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative min-h-[480px] md:min-h-[540px]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              ref={el => slideRefs.current[index] = el}
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
              style={{ visibility: index === 0 ? 'visible' : 'hidden' }}
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
              </div>

              <div className="container mx-auto px-4 h-full relative z-10">
                <div className="grid md:grid-cols-2 gap-6 items-center min-h-[480px] md:min-h-[540px] py-10">
                  <div 
                    ref={el => contentRefs.current[index] = el}
                    className="order-2 md:order-1"
                  >
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-4 border border-white/20 text-white">
                      <Sparkles className="w-3.5 h-3.5" />
                      {slide.badge}
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 tracking-tight leading-tight text-white drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-base md:text-lg text-white/90 mb-6 max-w-sm drop-shadow">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        asChild 
                        size="lg" 
                        className="h-12 px-6 bg-white text-gray-900 hover:bg-white/90 rounded-xl font-semibold shadow-xl"
                      >
                        <Link to="/products">
                          Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="lg" 
                        className="h-12 px-6 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white rounded-xl backdrop-blur-sm"
                      >
                        <Link to="/products">Learn More</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="relative order-1 md:order-2 flex justify-center items-center">
                    <div className="relative w-full max-w-[280px] md:max-w-[360px] aspect-square">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-75" />
                      <img
                        ref={el => imageRefs.current[index] = el}
                        src={slide.image}
                        alt={slide.title}
                        className="relative w-full h-full object-contain drop-shadow-2xl"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                      {/* Explore Button */}
                      <Link
                        to="/products"
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-medium border border-white/30 hover:bg-white/30 transition-all duration-300 group"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isAnimating}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all text-white border border-white/30 disabled:opacity-50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          disabled={isAnimating}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all text-white border border-white/30 disabled:opacity-50"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              disabled={isAnimating}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide 
                  ? 'w-8 bg-white' 
                  : 'w-2.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section ref={featuresRef} className="py-6 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders $100+' },
              { icon: Shield, title: 'Secure Payment', desc: 'Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-3 Days' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always Here' },
            ].map((f, i) => (
              <div key={i} className="feature-item flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section ref={categoriesRef} className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="section-header flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Categories</h2>
            <Link to="/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-item flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-xs font-medium text-center text-foreground">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      {dealProducts.length > 0 && (
        <section ref={dealsRef} className="py-10 bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 dark:from-rose-500/5 dark:via-orange-500/5 dark:to-amber-500/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold">🔥 HOT</span>
                <h2 className="text-2xl font-bold text-foreground">Flash Deals</h2>
              </div>
              <Link to="/products" className="text-sm text-primary hover:underline font-medium">See All</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dealProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section ref={featuredRef} className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Featured</h2>
            <Link to="/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banners */}
      <section ref={promoRef} className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="promo-card relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 min-h-[220px] group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-white/70 text-xs font-medium tracking-wide uppercase">Limited Offer</span>
                <h3 className="text-3xl font-bold text-white mt-2 mb-3">Up to 50% Off</h3>
                <p className="text-white/80 mb-5 text-sm">On selected electronics</p>
                <Button asChild className="bg-white text-violet-600 hover:bg-white/90 rounded-lg h-10 px-5 font-semibold text-sm">
                  <Link to="/products">Shop Now</Link>
                </Button>
              </div>
            </div>
            <div className="promo-card relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 min-h-[220px] group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-white/70 text-xs font-medium tracking-wide uppercase">New Arrivals</span>
                <h3 className="text-3xl font-bold text-white mt-2 mb-3">Latest Tech</h3>
                <p className="text-white/80 mb-5 text-sm">Discover new products</p>
                <Button asChild className="bg-white text-emerald-600 hover:bg-white/90 rounded-lg h-10 px-5 font-semibold text-sm">
                  <Link to="/products">Explore</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-10 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Stay Updated</h2>
            <p className="text-muted-foreground text-sm mb-5">Get the latest deals and news</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 h-11 px-4 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <Button type="submit" className="h-11 px-5 rounded-lg font-medium">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
