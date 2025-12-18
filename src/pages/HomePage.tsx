import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Headphones, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const heroSlides = [
  {
    id: 1,
    title: 'iPhone 16 Pro',
    subtitle: 'Extraordinary Visual & Exceptional Power',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch_GEO_US?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1726187221849',
    bg: 'from-violet-600/20 to-blue-600/20',
    accent: 'violet',
  },
  {
    id: 2,
    title: 'Galaxy Watch Ultra',
    subtitle: 'The Ultimate Smartwatch Experience',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/uk/2407/gallery/uk-galaxy-watch-ultra-l310-sm-l310nttaeub-542342134?$1300_1038_PNG$',
    bg: 'from-orange-600/20 to-amber-600/20',
    accent: 'orange',
  },
  {
    id: 3,
    title: 'AirPods Pro',
    subtitle: 'Immersive Sound, Adaptive Audio',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=976&hei=916&fmt=jpeg&qlt=90&.v=1724041668836',
    bg: 'from-emerald-600/20 to-teal-600/20',
    accent: 'emerald',
  },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 4);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        nextSlide();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, isAnimating]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  useEffect(() => {
    if (slideRef.current) {
      gsap.fromTo(slideRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [currentSlide]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.category-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
          scrollTrigger: { trigger: '.categories-section', start: 'top 85%' }
        }
      );

      gsap.fromTo('.product-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: '.products-section', start: 'top 85%' }
        }
      );
    });

    return () => ctx.revert();
  }, [products, categories]);

  const currentHero = heroSlides[currentSlide];

  return (
    <Layout>
      {/* Hero Slider */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className={`relative min-h-[500px] md:min-h-[600px] bg-gradient-to-br ${currentHero.bg} transition-all duration-700`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 h-full">
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[500px] md:min-h-[600px] py-12">
              {/* Content */}
              <div ref={slideRef} key={currentSlide} className="relative z-10 order-2 md:order-1">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  New Arrival
                </span>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {currentHero.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                  {currentHero.subtitle}
                </p>
                <div className="flex gap-3">
                  <Button asChild size="lg" className="h-12 px-8">
                    <Link to="/products">
                      Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8">
                    <Link to="/products">Learn More</Link>
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="relative order-1 md:order-2 flex justify-center items-center">
                <div className="relative w-full max-w-[400px] aspect-square">
                  <img
                    key={currentSlide}
                    src={currentHero.image}
                    alt={currentHero.title}
                    className="w-full h-full object-contain drop-shadow-2xl animate-fade-in"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (!isAnimating) { setIsAnimating(true); setCurrentSlide(i); setTimeout(() => setIsAnimating(false), 600); }}}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-6 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-3 Business Days' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always Here' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Categories</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-card flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <span className="text-2xl md:text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      {dealProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">HOT</span>
                <h2 className="text-xl font-bold">Flash Deals</h2>
              </div>
              <Link to="/products" className="text-sm text-primary hover:underline">See All</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="products-section py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
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

      {/* Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 p-8 min-h-[250px]">
              <div className="relative z-10">
                <span className="text-white/70 text-sm">Limited Offer</span>
                <h3 className="text-2xl font-bold text-white mt-2 mb-4">Up to 50% Off</h3>
                <p className="text-white/80 mb-6">On selected electronics and accessories</p>
                <Button asChild className="bg-white text-violet-600 hover:bg-white/90">
                  <Link to="/products">Shop Now</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-8 min-h-[250px]">
              <div className="relative z-10">
                <span className="text-white/70 text-sm">New Arrivals</span>
                <h3 className="text-2xl font-bold text-white mt-2 mb-4">Latest Tech</h3>
                <p className="text-white/80 mb-6">Discover the newest gadgets and gear</p>
                <Button asChild className="bg-white text-emerald-600 hover:bg-white/90">
                  <Link to="/products">Explore</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Subscribe to Newsletter</h2>
            <p className="text-muted-foreground mb-6">Get 15% off your first order and stay updated</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary"
              />
              <Button className="px-6">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
