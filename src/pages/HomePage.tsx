import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, Truck, Shield, Headphones, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const featuredProducts = products.slice(0, 8);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content > *', 
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }
      );

      gsap.fromTo('.category-item',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '.categories-section', start: 'top 80%' }
        }
      );

      gsap.fromTo('.product-item',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.products-section', start: 'top 80%' }
        }
      );
    });

    return () => ctx.revert();
  }, [products, categories]);

  return (
    <Layout>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
        <div className="absolute top-20 left-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-20 right-[10%] w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="hero-content max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              New Collection 2024
            </span>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              <span className="text-foreground">Future is</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">Here.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mb-8">
              Discover premium products from around the world. Experience shopping reimagined at BASITSHOP.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 px-8">
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link to="/products">View Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
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
      <section className="categories-section py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-item flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="products-section py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary to-violet-600 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h20v20H0z%22 fill=%22none%22/%3E%3Ccircle cx=%221%22 cy=%221%22 r=%221%22 fill=%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join BASITSHOP Today</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">Get 15% off your first order when you subscribe to our newsletter.</p>
              <div className="flex gap-3 max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none"
                />
                <Button className="bg-white text-primary hover:bg-white/90 px-6">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
