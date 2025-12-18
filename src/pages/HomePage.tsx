import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';

const heroSlides = [
  {
    id: 1,
    title: 'iPhone 16 Pro',
    subtitle: 'Extraordinary Visual & Exceptional Power',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch_GEO_US?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1726187221849',
    gradient: 'from-violet-600 via-purple-600 to-indigo-800',
    badge: 'New Release',
  },
  {
    id: 2,
    title: 'Galaxy Watch Ultra',
    subtitle: 'The Ultimate Smartwatch Experience',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/uk/2407/gallery/uk-galaxy-watch-ultra-l310-sm-l310nttaeub-542342134?$1300_1038_PNG$',
    gradient: 'from-orange-500 via-rose-500 to-pink-600',
    badge: 'Best Seller',
  },
  {
    id: 3,
    title: 'AirPods Pro 2',
    subtitle: 'Immersive Sound, Adaptive Audio',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=976&hei=916&fmt=jpeg&qlt=90&.v=1724041668836',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    badge: 'Popular',
  },
  {
    id: 4,
    title: 'MacBook Pro M3',
    subtitle: 'Power. Performance. Pro.',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200',
    gradient: 'from-slate-600 via-gray-700 to-zinc-900',
    badge: 'Pro Series',
  },
];

const HomePage = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 4);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    // Auto-play
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);
    
    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi, onSelect]);

  return (
    <Layout>
      {/* Hero Carousel - Swipeable */}
      <section className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {heroSlides.map((slide, index) => (
              <div 
                key={slide.id} 
                className="flex-[0_0_100%] min-w-0"
              >
                <div className={`relative min-h-[520px] md:min-h-[580px] bg-gradient-to-br ${slide.gradient}`}>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
                  </div>

                  <div className="container mx-auto px-4 h-full relative z-10">
                    <div className="grid md:grid-cols-2 gap-6 items-center min-h-[520px] md:min-h-[580px] py-12">
                      {/* Content */}
                      <div className="order-2 md:order-1 text-white">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-sm font-medium mb-6 border border-white/20">
                          <Sparkles className="w-4 h-4" />
                          {slide.badge}
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight leading-tight">
                          {slide.title}
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-md leading-relaxed">
                          {slide.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Button asChild size="lg" className="h-14 px-8 bg-white text-gray-900 hover:bg-white/90 rounded-2xl font-semibold text-base shadow-xl shadow-black/20">
                            <Link to="/products">
                              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="h-14 px-8 border-white/30 bg-white/10 text-white hover:bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Link to="/products">Learn More</Link>
                          </Button>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative order-1 md:order-2 flex justify-center items-center">
                        <div className="relative w-full max-w-[350px] md:max-w-[420px] aspect-square">
                          {/* Glow behind image */}
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-75" />
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="relative w-full h-full object-contain drop-shadow-2xl"
                            loading={index === 0 ? 'eager' : 'lazy'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all text-white border border-white/20 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all text-white border border-white/20 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === selectedIndex 
                  ? 'w-10 bg-white' 
                  : 'w-2.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-3 Business Days' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always Here' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground mt-1">Find what you need</p>
            </div>
            <Link to="/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-sm font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      {dealProducts.length > 0 && (
        <section className="py-14 bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 rounded-full bg-rose-500 text-white text-sm font-bold animate-pulse">🔥 HOT</span>
                <div>
                  <h2 className="text-3xl font-bold">Flash Deals</h2>
                  <p className="text-muted-foreground">Limited time offers</p>
                </div>
              </div>
              <Link to="/products" className="text-sm text-primary hover:underline font-medium">See All</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Handpicked for you</p>
            </div>
            <Link to="/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banners */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-10 min-h-[280px] group">
              <div className="relative z-10">
                <span className="text-white/70 text-sm font-medium tracking-wide uppercase">Limited Offer</span>
                <h3 className="text-4xl font-bold text-white mt-3 mb-4">Up to 50% Off</h3>
                <p className="text-white/80 mb-6 text-lg">On selected electronics</p>
                <Button asChild className="bg-white text-violet-600 hover:bg-white/90 rounded-xl h-12 px-6 font-semibold">
                  <Link to="/products">Shop Now</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
            </div>
            
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-10 min-h-[280px] group">
              <div className="relative z-10">
                <span className="text-white/70 text-sm font-medium tracking-wide uppercase">New Arrivals</span>
                <h3 className="text-4xl font-bold text-white mt-3 mb-4">Latest Tech</h3>
                <p className="text-white/80 mb-6 text-lg">Discover the newest gadgets</p>
                <Button asChild className="bg-white text-emerald-600 hover:bg-white/90 rounded-xl h-12 px-6 font-semibold">
                  <Link to="/products">Explore</Link>
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-14 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Newsletter</h2>
            <p className="text-muted-foreground mb-8 text-lg">Get 15% off your first order and stay updated with latest offers</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl bg-background border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" className="h-14 px-8 rounded-2xl">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;