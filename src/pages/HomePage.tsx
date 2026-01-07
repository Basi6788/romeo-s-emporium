import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, X, ChevronRight, Star, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSwipeable } from 'react-swipeable';
import { useTheme } from '@/hooks/useTheme';

// Lazy load heavy components
const BackgroundScene = lazy(() => import('@/scenes/SceneContainer'));
const ProductCard = lazy(() => import('@/components/ProductCard'));
const FloatingCart = lazy(() => import('@/components/FloatingCart'));

gsap.registerPlugin(ScrollTrigger);

// --- Skeletons ---
const HeroSkeleton = () => (
  <div className="w-full h-64 bg-gradient-to-r from-muted/10 via-muted/20 to-muted/10 animate-pulse rounded-3xl" />
);

const ProductSkeletonCard = () => (
  <div className="bg-card rounded-2xl border p-4 h-full">
    <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 animate-pulse"></div>
    <div className="h-4 bg-gradient-to-r from-muted to-muted/70 rounded-full w-3/4 mb-2 animate-pulse"></div>
    <div className="h-4 bg-gradient-to-r from-muted to-muted/70 rounded-full w-1/2 animate-pulse"></div>
    <div className="mt-4 h-10 bg-gradient-to-r from-muted to-muted/70 rounded-lg animate-pulse"></div>
  </div>
);

// --- Product Data based on provided images ---
const productsData = [
  {
    id: '1',
    name: 'AirPods Pro',
    price: 493.00,
    originalPrice: 600.00,
    image: 'https://images.unsplash.com/photo-1590658165737-15a047b8b5e8?q=80&w=2069',
    category: 'Headphones',
    rating: 4.8,
    reviews: 1243,
    badge: 'New',
    color: 'bg-gradient-to-br from-gray-900 to-gray-700'
  },
  {
    id: '2',
    name: 'HomePod Mini',
    price: 498.00,
    originalPrice: 0,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2065',
    category: 'Speakers',
    rating: 4.6,
    reviews: 892,
    badge: 'Trending',
    color: 'bg-gradient-to-br from-red-500 to-pink-500'
  },
  {
    id: '3',
    name: 'Wireless Headphone',
    price: 200.00,
    originalPrice: 350.00,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
    category: 'Headphones',
    rating: 4.3,
    reviews: 567,
    badge: 'Sale',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  {
    id: '4',
    name: 'Premium Speakers',
    price: 800.00,
    originalPrice: 1000.00,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1931',
    category: 'Speakers',
    rating: 4.7,
    reviews: 1105,
    badge: 'Premium',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500'
  }
];

// --- Category Data ---
const categories = [
  { id: 'all', name: 'All', count: 12 },
  { id: 'headphones', name: 'Headphones', count: 6 },
  { id: 'speakers', name: 'Speakers', count: 4 }
];

// --- Main HomePage ---
const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState(3);
  const [cartTotal, setCartTotal] = useState(1093.00);
  const { theme, toggleTheme } = useTheme();
  
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Filter products based on category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return productsData;
    return productsData.filter(product => 
      product.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory]);

  // --- GSAP Animations for Hero Swipe/Fade Effect ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2
      });

      gsap.from(categoriesRef.current?.children, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 0.4
      });

      // Hero fade out on scroll
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Fade out hero elements as user scrolls
          gsap.to(titleRef.current, {
            y: -50 * progress,
            opacity: 1 - progress * 0.8,
            duration: 0.1
          });

          gsap.to(categoriesRef.current, {
            y: -30 * progress,
            opacity: 1 - progress * 0.9,
            duration: 0.1
          });

          // Product grid slides up
          if (productsRef.current) {
            gsap.to(productsRef.current, {
              y: -20 * (1 - progress),
              opacity: 0.2 + progress * 0.8,
              duration: 0.1
            });
          }
        }
      });

      // Product card animations
      gsap.from('.product-card', {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.products-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Micro-interactions for category chips
      const categoryChips = categoriesRef.current?.children || [];
      gsap.utils.toArray(categoryChips).forEach((chip: any) => {
        chip.addEventListener('mouseenter', () => {
          gsap.to(chip, {
            scale: 1.05,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)'
          });
        });
        
        chip.addEventListener('mouseleave', () => {
          gsap.to(chip, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // Handle category change with animation
  const handleCategoryChange = useCallback((categoryId: string) => {
    // Animate current active chip
    const currentActive = categoriesRef.current?.querySelector('.bg-primary');
    if (currentActive) {
      gsap.to(currentActive, {
        scale: 0.95,
        duration: 0.2,
        onComplete: () => {
          setActiveCategory(categoryId);
          gsap.to(currentActive, {
            scale: 1,
            duration: 0.2
          });
        }
      });
    } else {
      setActiveCategory(categoryId);
    }

    // Animate product cards
    gsap.to('.product-card', {
      opacity: 0,
      y: 20,
      duration: 0.3,
      stagger: 0.05,
      onComplete: () => {
        // After changing category, animate new cards in
        setTimeout(() => {
          gsap.fromTo('.product-card',
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.1,
              ease: 'power2.out'
            }
          );
        }, 50);
      }
    });
  }, []);

  // Add to cart animation
  const handleAddToCart = useCallback((product: typeof productsData[0]) => {
    // Button animation
    const button = document.querySelector(`[data-product="${product.id}"]`);
    if (button) {
      gsap.to(button, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }

    // Update cart
    setCartItems(prev => prev + 1);
    setCartTotal(prev => prev + product.price);

    // Cart icon animation
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      gsap.to(cartIcon, {
        scale: 1.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'elastic.out(1, 0.5)'
      });
    }
  }, []);

  // Search toggle animation
  const toggleSearch = useCallback(() => {
    if (searchOpen) {
      gsap.to('.search-bar', {
        width: 40,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => setSearchOpen(false)
      });
    } else {
      setSearchOpen(true);
      gsap.fromTo('.search-bar',
        { width: 0, opacity: 0 },
        {
          width: 250,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out'
        }
      );
    }
  }, [searchOpen]);

  return (
    <Layout>
      {/* Three.js Background Scene */}
      <Suspense fallback={null}>
        <BackgroundScene theme={theme} />
      </Suspense>

      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        
        {/* HEADER */}
        <header className="sticky top-0 z-40 pt-8 px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              {searchOpen ? (
                <div className="search-bar flex items-center bg-background/80 backdrop-blur-lg rounded-full px-4 py-3 border shadow-lg">
                  <Search className="w-5 h-5 text-muted-foreground mr-3" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={toggleSearch}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-full bg-background/80 backdrop-blur-lg border"
                  onClick={toggleSearch}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              )}
            </div>

            {/* Theme Toggle & Profile */}
            <div className="flex items-center gap-3 ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-lg border"
                onClick={toggleTheme}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-lg border"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section ref={heroRef} className="px-4 md:px-6 mb-8">
          <div ref={titleRef} className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              New arrivals
            </h1>
            <p className="text-muted-foreground mt-2">Discover the latest tech gadgets</p>
          </div>

          {/* Category Filter Chips */}
          <div ref={categoriesRef} className="flex gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  activeCategory === category.id 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-background/80 backdrop-blur-lg border'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
                {category.count && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === category.id 
                      ? 'bg-white/20' 
                      : 'bg-muted'
                  }`}>
                    {category.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section className="px-4 md:px-6 pb-32">
          <div ref={productsRef} className="products-grid">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <Suspense fallback={
                <>
                  <ProductSkeletonCard />
                  <ProductSkeletonCard />
                </>
              }>
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <ProductCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </div>
                ))}
              </Suspense>
            </div>
          </div>
        </section>

        {/* FLOATING CART */}
        <Suspense fallback={null}>
          <FloatingCart
            itemCount={cartItems}
            total={cartTotal}
            theme={theme}
          />
        </Suspense>
      </div>
    </Layout>
  );
};

export default HomePage;