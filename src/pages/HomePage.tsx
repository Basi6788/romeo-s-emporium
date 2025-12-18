import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, Zap, Shield, Truck, Star, Gift, Headphones, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/data/products';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const dealsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero content animation
      if (heroContentRef.current) {
        gsap.fromTo(
          heroContentRef.current.children,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power4.out',
          }
        );
      }

      // Features bar animation
      gsap.fromTo(
        '.feature-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Categories animation
      gsap.fromTo(
        '.category-item',
        { opacity: 0, scale: 0.8, y: 60 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Flash deals animation
      gsap.fromTo(
        '.deal-card',
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: dealsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Featured products animation
      gsap.fromTo(
        '.featured-item',
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuredRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats animation
      gsap.fromTo(
        '.stat-item',
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // CTA animation
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Parallax effect on hero orbs
      gsap.to('.hero-orb-1', {
        y: -100,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to('.hero-orb-2', {
        y: -60,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const flashDeals = products.filter(p => p.originalPrice).slice(0, 6);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100', color: 'text-emerald' },
    { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-violet' },
    { icon: Headphones, title: '24/7 Support', desc: 'Always available', color: 'text-amber' },
    { icon: Gift, title: 'Gift Wrapping', desc: 'Special packaging', color: 'text-rose' },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Customers', icon: Star },
    { value: '10K+', label: 'Products', icon: Sparkles },
    { value: '99%', label: 'Satisfaction', icon: Zap },
    { value: '24/7', label: 'Support', icon: Gift },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="hero-orb-1 absolute top-10 left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet/20 to-primary/10 blur-3xl" />
        <div className="hero-orb-2 absolute bottom-10 right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-rose/15 to-amber/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-emerald/5 to-primary/5 blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div ref={heroContentRef} className="max-w-4xl">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" />
              New Collection 2024
            </span>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.1] mb-8">
              <span className="text-foreground">Future is</span>
              <br />
              <span className="gradient-text">Here.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              Discover a curated collection of premium products from around the world. 
              Experience shopping reimagined with quality, style, and innovation at BASITSHOP.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="btn-primary text-lg h-14 px-8">
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-border/50 hover:bg-muted/50">
                <Link to="/products?featured=true">
                  View Collection
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section ref={featuresRef} className="py-10 border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="feature-item flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-muted/80 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary tracking-wider uppercase mb-2 block">Browse</span>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-primary hover:underline font-medium">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="category-item group flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-muted flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="text-xs md:text-sm font-medium text-center text-foreground">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      <section ref={dealsRef} className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber tracking-wider uppercase mb-2">
                <Zap className="w-4 h-4" />
                Limited Time
              </span>
              <h2 className="section-title">Flash Deals</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-primary hover:underline font-medium">
              See All Deals <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {flashDeals.map((product, index) => (
              <div key={product.id} className="deal-card">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-emerald/5 to-rose/10 p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-sm mb-4">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section ref={featuredRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-emerald tracking-wider uppercase mb-2 block">Handpicked</span>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-primary hover:underline font-medium">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="featured-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-sm font-semibold text-primary tracking-wider uppercase mb-4 block">Our Story</span>
            <h2 className="section-title gradient-text mb-6">Future is Here</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              At BASITSHOP, we believe in bringing the future to your doorstep. Our curated selection of premium 
              technology and lifestyle products represents the pinnacle of innovation and design. From the latest 
              smartphones to cutting-edge wearables, every product we offer is chosen for its excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="btn-primary">
                <Link to="/products">Explore Products</Link>
              </Button>
              <Button asChild variant="outline" className="border-border/50">
                <Link to="/products">Our Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section ref={ctaRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-10 md:p-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-background/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-background/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
                Join the BASITSHOP Family
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Subscribe to our newsletter and get 15% off your first order, plus exclusive access to new arrivals and special offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-4 rounded-2xl bg-background/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/40"
                />
                <Button size="lg" className="px-8 py-4 bg-background text-primary hover:bg-background/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
