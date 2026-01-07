
import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { useTracking } from '@/hooks/useTracking';
import { Button } from '@/components/ui/button';
import ProductLoader from '@/components/Loaders/ProductLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSwipeable } from 'react-swipeable';

// Lazy load heavy components
const ParticleBackground = lazy(() => import('@/components/ParticleBackground'));
const HeroCard = lazy(() => import('@/components/HeroCard'));

gsap.registerPlugin(ScrollTrigger);

// --- Skeletons ---
const HeroSkeleton = () => (

  <div className="w-full h-[500px] md:h-[600px] bg-gradient-to-r from-muted/10 via-muted/20 to-muted/10 animate-pulse overflow-hidden">  
    <div className="absolute inset-0 flex items-center justify-center">  
      <div className="text-center">  
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>  
        <p className="text-muted-foreground font-medium">Loading Amazing Offers...</p>  
      </div>  
    </div>  
  </div>  
);  const ProductSkeletonCard = () => (

  <div className="bg-card rounded-2xl border p-4 h-full">  
    <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 animate-pulse"></div>  
    <div className="h-4 bg-gradient-to-r from-muted to-muted/70 rounded-full w-3/4 mb-2 animate-pulse"></div>  
    <div className="h-4 bg-gradient-to-r from-muted to-muted/70 rounded-full w-1/2 animate-pulse"></div>  
    <div className="mt-4 h-10 bg-gradient-to-r from-muted to-muted/70 rounded-lg animate-pulse"></div>  
  </div>  
);  // --- Swipe Handler Component ---
const SwipeHandler = ({
onSwipedLeft,
onSwipedRight,
children
}: {
onSwipedLeft: () => void;
onSwipedRight: () => void;
children: React.ReactNode;
}) => {
const handlers = useSwipeable({
onSwipedLeft,
onSwipedRight,
trackMouse: true,
trackTouch: true,
delta: 10,
preventScrollOnSwipe: true,
swipeDuration: 500
});

return (
<div {...handlers} className="w-full h-full">
{children}
</div>
);
};

// --- Main HomePage ---
const HomePage = () => {
const [currentSlide, setCurrentSlide] = useState(0);
const [isAnimating, setIsAnimating] = useState(false);
const [loading, setLoading] = useState(true);
const heroRef = useRef<HTMLDivElement>(null);
const sliderRef = useRef<HTMLDivElement>(null);
const navigate = useNavigate();

// Tracking hook
const { trackInteraction, getRecommendations } = useTracking();

// Real Data Hooks
const { data: products = [], isLoading: productsLoading } = useProducts();
const { data: categories = [], isLoading: categoriesLoading } = useCategories();
const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

// Filter and memoize hero slides
const heroSlides = useMemo(() => {
if (!dbHeroImages || dbHeroImages.length === 0) {
return [
{
id: '1',
image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
title: 'Premium Collection',
subtitle: 'Discover amazing deals on trending products',
badge: 'Limited Time',
link: '/products',
gradient: 'from-purple-600/20 to-pink-600/20'
},
{
id: '2',
image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
title: 'Summer Sale',
subtitle: 'Up to 60% off on selected items',
badge: 'Hot Deal',
link: '/products?category=electronics',
gradient: 'from-blue-600/20 to-cyan-600/20'
},
{
id: '3',
image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999',
title: 'New Arrivals',
subtitle: 'Fresh styles added daily',
badge: 'Just In',
link: '/products?new=true',
gradient: 'from-green-600/20 to-emerald-600/20'
}
];
}
return dbHeroImages;
}, [dbHeroImages]);

// Get personalized recommendations
const featuredProducts = useMemo(() => {
if (products.length === 0) return [];
return getRecommendations(products);
}, [products, getRecommendations]);

// --- Preload Images ---
useEffect(() => {
const preloadImages = async () => {
const imagePromises = heroSlides.map(slide => {
return new Promise((resolve, reject) => {
const img = new Image();
img.src = slide.image;
img.onload = resolve;
img.onerror = reject;
});
});

try {  
    await Promise.all(imagePromises);  
    setLoading(false);  
  } catch (error) {  
    console.error('Failed to preload images:', error);  
    setLoading(false);  
  }  
};  

if (heroSlides.length > 0) {  
  preloadImages();  
}

}, [heroSlides]);

// --- GSAP Animations (Optimized) ---
useEffect(() => {
if (productsLoading || heroLoading) return;

// Kill existing ScrollTriggers  
ScrollTrigger.getAll().forEach(trigger => trigger.kill());  

const ctx = gsap.context(() => {  
  // Hero entrance animation  
  gsap.from('.hero-content', {  
    y: 30,  
    opacity: 0,  
    duration: 0.8,  
    ease: 'power2.out',  
    delay: 0.3  
  });  

  // Features animation  
  gsap.from('.feature-card', {  
    y: 40,  
    opacity: 0,  
    duration: 0.6,  
    stagger: 0.1,  
    scrollTrigger: {  
      trigger: '.features-section',  
      start: 'top 85%',  
      toggleActions: 'play none none reverse',  
      markers: false  
    }  
  });  

  // Products animation  
  gsap.from('.product-card', {  
    y: 50,  
    opacity: 0,  
    duration: 0.7,  
    stagger: 0.08,  
    scrollTrigger: {  
      trigger: '.products-section',  
      start: 'top 80%',  
      toggleActions: 'play none none reverse'  
    }  
  });  

  // Categories animation  
  gsap.from('.category-card', {  
    scale: 0.8,  
    opacity: 0,  
    duration: 0.5,  
    stagger: 0.05,  
    scrollTrigger: {  
      trigger: '.categories-section',  
      start: 'top 85%'  
    }  
  });  

  // Fix for sections not appearing  
  gsap.utils.toArray<HTMLElement>('section').forEach((section) => {  
    ScrollTrigger.create({  
      trigger: section,  
      start: 'top 90%',  
      onEnter: () => {  
        gsap.to(section, {  
          opacity: 1,  
          duration: 0.5,  
          ease: 'power2.out'  
        });  
      }  
    });  
  });  
});  

// Refresh ScrollTrigger after animations  
ScrollTrigger.refresh();  

return () => ctx.revert();

}, [productsLoading, heroLoading]);

// --- Swipeable Slide Logic with Animation ---
const goToSlide = useCallback((index: number) => {
if (heroSlides.length <= 1 || isAnimating) return;

setIsAnimating(true);  
  
// Get current and next slide elements  
const currentSlideEl = sliderRef.current?.children[currentSlide] as HTMLElement;  
const nextSlideEl = sliderRef.current?.children[index] as HTMLElement;  
  
// Animation timeline  
const tl = gsap.timeline({  
  onComplete: () => {  
    setCurrentSlide(index);  
    setIsAnimating(false);  
    trackInteraction('click', `hero_slide_${index}`, { slide: index });  
  }  
});  

if (currentSlideEl && nextSlideEl) {  
  // Determine swipe direction  
  const direction = index > currentSlide ? 'left' : 'right';  
    
  // Outgoing slide animation  
  tl.to(currentSlideEl, {  
    x: direction === 'left' ? '-100%' : '100%',  
    opacity: 0,  
    duration: 0.5,  
    ease: 'power2.out'  
  })  
  // Incoming slide animation  
  .fromTo(nextSlideEl,  
    {  
      x: direction === 'left' ? '100%' : '-100%',  
      opacity: 0  
    },  
    {  
      x: 0,  
      opacity: 1,  
      duration: 0.5,  
      ease: 'power2.out'  
    },  
    '-=0.25' // Overlap animations  
  );  
} else {  
  // Fallback if elements not found  
  setCurrentSlide(index);  
  setIsAnimating(false);  
}

}, [heroSlides.length, currentSlide, isAnimating, trackInteraction]);

const nextSlide = useCallback(() => {
const nextIndex = (currentSlide + 1) % heroSlides.length;
goToSlide(nextIndex);
}, [currentSlide, heroSlides.length, goToSlide]);

const prevSlide = useCallback(() => {
const prevIndex = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
goToSlide(prevIndex);
}, [currentSlide, heroSlides.length, goToSlide]);

// Auto-slide with pause on hover/swipe
useEffect(() => {
if (heroSlides.length <= 1 || isAnimating) return;

const interval = setInterval(() => {  
  nextSlide();  
}, 5000);  
  
return () => clearInterval(interval);

}, [heroSlides.length, nextSlide, isAnimating]);

// Handle keyboard navigation
useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
if (e.key === 'ArrowLeft') prevSlide();
if (e.key === 'ArrowRight') nextSlide();
};

window.addEventListener('keydown', handleKeyDown);  
return () => window.removeEventListener('keydown', handleKeyDown);

}, [prevSlide, nextSlide]);

// --- Mouse Wheel Handling for Hero ---
const handleWheel = useCallback((e: WheelEvent) => {
if (heroRef.current?.contains(e.target as Node)) {
e.preventDefault();
if (e.deltaY > 0) {
nextSlide();
} else if (e.deltaY < 0) {
prevSlide();
}
}
}, [nextSlide, prevSlide]);

useEffect(() => {
const heroElement = heroRef.current;
if (heroElement) {
heroElement.addEventListener('wheel', handleWheel, { passive: false });
return () => heroElement.removeEventListener('wheel', handleWheel);
}
}, [handleWheel]);

// --- 3D Tilt Effect for Product Cards ---
const handleTilt = useCallback((e: React.MouseEvent, card: HTMLElement) => {
if (window.innerWidth < 768) return;

const rect = card.getBoundingClientRect();  
const x = e.clientX - rect.left;  
const y = e.clientY - rect.top;  
const centerX = rect.width / 2;  
const centerY = rect.height / 2;  
  
const rotateX = ((centerY - y) / centerY) * 3;  
const rotateY = ((x - centerX) / centerX) * 3;  
  
card.style.transform = `  
  perspective(1000px)   
  rotateX(${rotateX}deg)   
  rotateY(${rotateY}deg)   
  scale3d(1.02, 1.02, 1.02)  
`;

}, []);

const resetTilt = useCallback((card: HTMLElement) => {
card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
}, []);

// --- Navigation Handler ---
const handleCardClick = useCallback((e: React.MouseEvent, productId: string) => {
// Prevent navigation if clicking on interactive elements
if (
(e.target as HTMLElement).closest('button') ||
(e.target as HTMLElement).closest('a') ||
(e.target as HTMLElement).closest('input')
) {
return;
}

// Track product view  
const product = products.find(p => p.id === productId);  
if (product) {  
  trackInteraction('product_click', productId, {  
    category: product.category,  
    price: product.price  
  });  
}  
  
navigate(`/product/${productId}`);

}, [navigate, products, trackInteraction]);

// --- Fix for sections not appearing ---
useEffect(() => {
// Ensure all sections are visible initially
const sections = document.querySelectorAll('section');
sections.forEach(section => {
section.style.opacity = '1';
});
}, []);

// Show loader while initializing
if (loading && heroSlides.length > 0) {
return (
<Layout>
<ProductLoader />
</Layout>
);
}

return (
<Layout>
<div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-background to-muted/10">

{/* HERO SECTION with Swipeable Cards */}  
    <section   
      ref={heroRef}  
      className="relative w-full h-[500px] md:h-[600px] mb-12 md:mb-16"  
    >  
      {/* Background Effects */}  
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />}>  
        <ParticleBackground />  
      </Suspense>  
        
      {heroLoading ? (  
        <HeroSkeleton />  
      ) : heroSlides.length > 0 ? (  
        <SwipeHandler onSwipedLeft={nextSlide} onSwipedRight={prevSlide}>  
          <div className="relative h-full w-full mx-auto rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-black">  
            <div ref={sliderRef} className="relative h-full w-full">  
              {heroSlides.map((slide, index) => (  
                <div  
                  key={slide.id || index}  
                  className={`absolute inset-0 transition-opacity duration-500 ${  
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'  
                  }`}  
                  style={{  
                    transform: index === currentSlide ? 'translateX(0)' : 'translateX(100%)'  
                  }}  
                >  
                  <Suspense fallback={<HeroSkeleton />}>  
                    <HeroCard  
                      slide={slide}  
                      isActive={index === currentSlide}  
                    />  
                  </Suspense>  
                </div>  
              ))}  
            </div>  
              
            {/* Dots Navigation with Improved Visibility */}  
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">  
              {heroSlides.map((_, i) => (  
                <button   
                  key={i}   
                  onClick={() => goToSlide(i)}  
                  className={`h-2 rounded-full transition-all duration-300 ${  
                    i === currentSlide   
                      ? 'w-8 bg-white shadow-lg'   
                      : 'w-2 bg-white/50 hover:bg-white hover:w-4'  
                  }`}  
                  aria-label={`Go to slide ${i + 1}`}  
                  disabled={isAnimating}  
                />  
              ))}  
            </div>  
              
            {/* Swipe Instruction Hint */}  
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 opacity-70 animate-pulse">  
              <div className="flex items-center gap-2 text-white/80 text-sm bg-black/30 px-4 py-2 rounded-full">  
                <span className="hidden md:inline">Swipe or use arrow keys</span>  
                <span className="md:hidden">Swipe to navigate</span>  
                <div className="flex">  
                  <span className="animate-bounce">←</span>  
                  <span className="animate-bounce delay-100">→</span>  
                </div>  
              </div>  
            </div>  
          </div>  
        </SwipeHandler>  
      ) : (  
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl">  
          <div className="text-center space-y-4">  
            <Sparkles className="w-12 h-12 text-primary mx-auto" />  
            <p className="text-xl font-semibold">No Offers Available</p>  
            <p className="text-muted-foreground">Check back soon for amazing deals!</p>  
          </div>  
        </div>  
      )}  
    </section>  

    {/* FEATURES SECTION - Fixed Visibility */}  
    <section className="features-section py-8 container mx-auto px-4 opacity-100">  
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">  
        {[  
          { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100', color: 'text-blue-500', bg: 'bg-blue-500/10' },  
          { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-green-500', bg: 'bg-green-500/10' },  
          { icon: Clock, title: 'Fast Delivery', desc: 'Global shipping', color: 'text-orange-500', bg: 'bg-orange-500/10' },  
          { icon: Headphones, title: '24/7 Support', desc: 'Always here for you', color: 'text-purple-500', bg: 'bg-purple-500/10' },  
        ].map((f, i) => (  
          <div   
            key={i}   
            className="feature-card flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group opacity-100"  
            onClick={() => trackInteraction('click', `feature_${f.title}`)}  
          >  
            <div className={`w-14 h-14 rounded-full ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>  
              <f.icon className={`w-7 h-7 ${f.color}`} />  
            </div>  
            <h3 className="font-bold text-base md:text-lg mb-2">{f.title}</h3>  
            <p className="text-sm text-muted-foreground">{f.desc}</p>  
          </div>  
        ))}  
      </div>  
    </section>  

    {/* CATEGORIES SECTION - Fixed Layout */}  
    <section className="categories-section py-12 bg-gradient-to-b from-transparent to-muted/20 opacity-100">  
      <div className="container mx-auto px-4">  
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">  
          <div>  
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">  
              Browse Categories  
            </h2>  
            <p className="text-muted-foreground mt-2">Shop by your favorite categories</p>  
          </div>  
          <Button variant="outline" asChild className="rounded-full">  
            <Link to="/categories">View All Categories</Link>  
          </Button>  
        </div>  
          
        {categoriesLoading ? (  
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">  
            {[...Array(6)].map((_, i) => (  
              <div key={i} className="category-card animate-pulse">  
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3"></div>  
                <div className="h-4 bg-muted rounded-full w-3/4 mx-auto"></div>  
              </div>  
            ))}  
          </div>  
        ) : (  
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6">  
            {categories.length > 0 ? categories.slice(0, 12).map((cat) => (  
              <Link   
                key={cat.id}   
                to={`/products?category=${cat.id}`}  
                className="category-card group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-100"  
                onClick={() => trackInteraction('click', `category_${cat.name}`)}  
              >  
                <div className="relative w-16 h-16 md:w-20 md:h-20">  
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all" />  
                  {cat.image_url ? (  
                    <img   
                      src={cat.image_url}   
                      alt={cat.name}   
                      className="relative w-full h-full rounded-full object-cover border-2 border-transparent group-hover:border-primary/30 transition-all"  
                      loading="lazy"  
                    />  
                  ) : (  
                    <div className="relative w-full h-full rounded-full bg-accent flex items-center justify-center text-2xl">  
                      📦  
                    </div>  
                  )}  
                </div>  
                <span className="text-sm font-medium text-center line-clamp-1 group-hover:text-primary transition-colors">  
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

    {/* PERSONALIZED PRODUCTS SECTION - Fixed Positioning */}  
    <section className="products-section py-16 container mx-auto px-4 relative">  
      <div className="text-center mb-10">  
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">  
          <Sparkles className="w-4 h-4 text-primary" />  
          <span className="text-sm font-medium text-primary">Personalized For You</span>  
        </div>  
        <h2 className="text-3xl md:text-4xl font-bold mb-3">  
          {featuredProducts.length > 0 ? 'Recommended Just For You' : 'Trending Now'}  
        </h2>  
        <p className="text-muted-foreground max-w-2xl mx-auto">  
          {featuredProducts.length > 0   
            ? 'Based on your browsing history and preferences'  
            : 'Top picks from our collection'  
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
              className="product-card group relative h-full opacity-100"  
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}  
              onMouseLeave={(e) => resetTilt(e.currentTarget)}  
              onClick={(e) => handleCardClick(e, product.id)}  
            >  
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />  
              <div className="relative bg-card h-full rounded-2xl border hover:shadow-2xl transition-all duration-300 overflow-hidden">  
                <ProductCard   
                  product={product}   
                  className="h-full bg-transparent"  
                  showBadge={product.rating >= 4.5}  
                />  
                  
                {/* Quick view overlay */}  
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">  
                  <Button   
                    size="sm"   
                    className="rounded-full px-6"  
                    onClick={(e) => {  
                      e.stopPropagation();  
                      handleCardClick(e, product.id);  
                    }}  
                  >  
                    Quick View  
                  </Button>  
                </div>  
              </div>  
            </div>  
          ))  
        ) : (  
          <div className="col-span-full text-center py-10">  
            <div className="max-w-md mx-auto space-y-4">  
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">  
                <Sparkles className="w-10 h-10 text-muted-foreground" />  
              </div>  
              <p className="text-lg font-semibold">No products available</p>  
              <p className="text-muted-foreground">Check back soon for new arrivals!</p>  
            </div>  
          </div>  
        )}  
      </div>  

      <div className="text-center mt-12">  
        <Button   
          asChild   
          size="lg"   
          className="rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl transition-shadow"  
          onClick={() => trackInteraction('click', 'explore_store_button')}  
        >  
          <Link to="/products">Explore Full Store</Link>  
        </Button>  
      </div>  
    </section>  

    {/* BANNER SECTION - Fixed for all screen sizes */}  
    <section className="py-12 container mx-auto px-4 relative">  
      <div className="relative rounded-3xl overflow-hidden">  
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-secondary z-0" />  
        <div className="relative z-10 p-6 md:p-12 text-white">  
          <div className="max-w-2xl">  
            <h3 className="text-2xl md:text-3xl font-bold mb-4">  
              Start Shopping Today!  
            </h3>  
            <p className="text-white/90 mb-6">  
              Join millions of happy customers. Get exclusive deals, early access to sales, and personalized recommendations.  
            </p>  
            <div className="flex flex-col sm:flex-row gap-4">  
              <Button   
                asChild   
                size="lg"   
                className="bg-white text-primary hover:bg-white/90 rounded-full"  
                onClick={() => trackInteraction('click', 'banner_shop_now')}  
              >  
                <Link to="/products">Shop Now</Link>  
              </Button>  
              <Button   
                asChild   
                size="lg"   
                variant="outline"   
                className="border-white text-white hover:bg-white/10 rounded-full"  
              >  
                <Link to="/signup">Create Account</Link>  
              </Button>  
            </div>  
          </div>  
        </div>  
      </div>  
    </section>  
  </div>  
</Layout>

);
};

export default HomePage; 