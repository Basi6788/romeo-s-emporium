import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/data/products';

const heroSlides = [
  {
    title: 'iPhone 16 Pro',
    subtitle: 'Extraordinary Visual & Exceptional Power',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    gradient: 'from-blue-600 to-violet-600',
  },
  {
    title: 'MacBook Pro',
    subtitle: 'Unleash Pro Performance',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    gradient: 'from-gray-800 to-gray-900',
  },
  {
    title: 'Apple Watch Ultra',
    subtitle: 'Adventure Awaits',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    gradient: 'from-orange-500 to-red-600',
  },
];

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const flashDeals = products.filter(p => p.originalPrice).slice(0, 6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl animate-fade-in">
                  <p className="text-primary-foreground/80 text-sm md:text-base uppercase tracking-widest mb-2">
                    Future is here
                  </p>
                  <h1 className="text-4xl md:text-7xl font-display font-bold text-primary-foreground mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
                    {slide.subtitle}
                  </p>
                  <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                    Shop Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">Categories</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 card-hover"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: Zap, title: 'Fast Delivery', desc: '2-3 business days' },
              { icon: Sparkles, title: 'Best Quality', desc: 'Authentic products' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title flex items-center gap-2">
              <Zap className="w-8 h-8 text-warning" />
              Flash Deals
            </h2>
            <Link to="/products" className="text-primary hover:underline flex items-center gap-1">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {flashDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title gradient-text mb-6">Future is Here</h2>
            <p className="text-lg text-muted-foreground mb-8">
              At Romeo, we believe in bringing the future to your doorstep. Our curated selection of premium 
              technology and lifestyle products represents the pinnacle of innovation and design. From the latest 
              smartphones to cutting-edge wearables, every product we offer is chosen for its excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/products" className="btn-primary">
                Explore Products
              </Link>
              <Link to="/about" className="btn-secondary">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
