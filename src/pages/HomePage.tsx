import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star, Heart, Menu, Search, Filter } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Layout from '@/components/Layout';
import { useProducts, useCategories } from '@/hooks/useApi'; // Assuming these exist per your old code
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Standard shadcn utility

gsap.registerPlugin(ScrollTrigger);

// --- THREE.JS BACKGROUND COMPONENT ---
// Creates a subtle floating particle field that reacts to mouse
const Particles = (props) => {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#fda4af" // Tailwind rose-300
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const ThreeBackground = () => (
  <div className="absolute inset-0 -z-10 opacity-50 dark:opacity-20 pointer-events-none">
    <Canvas camera={{ position: [0, 0, 1] }}>
      <Suspense fallback={null}>
        <Particles />
      </Suspense>
    </Canvas>
  </div>
);

// --- CUSTOM UI COMPONENTS BASED ON IMAGES ---

// 1. The "Pill" Tab Selector (from Center Image)
const CategoryPills = ({ active, setActive }) => {
  const categories = ['All', 'Headphones', 'Speakers', 'Wearables'];
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar my-6">
      {categories.map((cat, i) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={cn(
            "px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
            active === cat
              ? "bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105"
              : "bg-transparent border border-gray-200 dark:border-gray-800 text-gray-500 hover:border-black dark:hover:border-white"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

// 2. The "App Style" Product Card (From Right/Center Image)
const AppProductCard = ({ product, index }) => {
  const cardRef = useRef(null);
  const imgRef = useRef(null);

  // GSAP Hover Effect
  const handleMouseEnter = () => {
    gsap.to(cardRef.current, { y: -10, duration: 0.3, ease: 'power2.out' });
    gsap.to(imgRef.current, { scale: 1.1, rotation: 5, duration: 0.4, ease: 'back.out(1.7)' });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
    gsap.to(imgRef.current, { scale: 1, rotation: 0, duration: 0.4, ease: 'power2.out' });
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="product-card-gsap group relative w-full aspect-[9/11] rounded-[2.5rem] bg-[#FFF0F0] dark:bg-[#1e1e1e] p-6 overflow-hidden transition-colors duration-300"
    >
      {/* Top UI */}
      <div className="flex justify-between items-start z-10 relative">
        <span className="bg-white/80 dark:bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-black dark:text-white">
          New
        </span>
        <button className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Image Center */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <img 
          ref={imgRef}
          src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"} 
          alt={product.name}
          className="w-full h-auto object-contain drop-shadow-2xl z-0" 
        />
      </div>

      {/* Floating Price Pill (Bottom - Matches Image 2) */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="bg-black/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-black p-2 pr-2 pl-6 rounded-full flex items-center justify-between shadow-xl">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-70 leading-none mb-1">Price</span>
            <span className="font-bold text-lg leading-none">${product.price}</span>
          </div>
          <button className="w-10 h-10 bg-white dark:bg-black rounded-full flex items-center justify-center text-black dark:text-white hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Title Overlay (Hidden initially, shown on interaction or distinct layout) */}
      <div className="absolute top-16 left-6 z-0 opacity-10 pointer-events-none">
         <h3 className="text-4xl font-black uppercase text-black dark:text-white tracking-tighter leading-none break-all">
            {product.name.split(' ')[0]}
         </h3>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const heroRef = useRef(null);
  const sectionRef = useRef(null);
  
  // Using your existing hooks (mocked fallback if data missing)
  const { data: products = [] } = useProducts();
  
  // Dummy data to match the visual if API is empty
  const displayProducts = products.length > 0 ? products : [
    { id: 1, name: 'AirPods Max', price: '499.00', category: 'Headphones', image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600&auto=format&fit=crop&q=60' },
    { id: 2, name: 'Sony XM5', price: '349.00', category: 'Headphones', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&auto=format&fit=crop&q=60' },
    { id: 3, name: 'HomePod Mini', price: '99.00', category: 'Speakers', image: 'https://images.unsplash.com/photo-1543512214-318c77a07293?w=600&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Beats Studio', price: '299.00', category: 'Headphones', image: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=600&auto=format&fit=crop&q=60' },
  ];

  // --- GSAP ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Text Reveal
      const tl = gsap.timeline();
      tl.from(".hero-text-char", {
        y: 100,
        opacity: 0,
        stagger: 0.05,
        duration: 1,
        ease: "power4.out"
      })
      .from(".hero-image", {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out"
      }, "-=0.8");

      // 2. Product Grid Stagger
      ScrollTrigger.batch(".product-card-gsap", {
        onEnter: batch => gsap.to(batch, {
          opacity: 1, 
          y: 0, 
          stagger: 0.15, 
          duration: 0.8, 
          ease: "power2.out"
        }),
        start: "top 85%"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden transition-colors duration-500">
        <ThreeBackground />

        {/* --- HERO SECTION (Based on Left Image) --- */}
        <section ref={heroRef} className="relative container mx-auto px-4 pt-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[600px]">
            
            {/* Text Content */}
            <div className="space-y-6 z-10">
              <div className="inline-flex items-center gap-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 px-4 py-2 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                15 new arrivals 🔥
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                <div className="overflow-hidden"><span className="hero-text-char inline-block">Old</span> <span className="hero-text-char inline-block text-gray-400">Tracks.</span></div>
                <div className="overflow-hidden"><span className="hero-text-char inline-block text-rose-500">New</span></div>
                <div className="overflow-hidden"><span className="hero-text-char inline-block">Sounds.</span></div>
              </h1>
              
              <p className="text-lg text-gray-500 max-w-md">
                Experience music like never before with our latest collection of high-fidelity audio gear.
              </p>

              <div className="flex gap-4 pt-4">
                <Button className="h-14 px-8 rounded-full bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform text-lg">
                  Shop Collection
                </Button>
                <button className="h-14 w-14 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-colors">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black dark:border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                </button>
              </div>
            </div>

            {/* Hero Image / Card */}
            <div className="relative hero-image">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-transparent rounded-[3rem] opacity-50 blur-3xl transform rotate-6"></div>
              <div className="relative bg-[#FFEEEE] dark:bg-[#1a1a1a] rounded-[3rem] aspect-[4/5] overflow-hidden shadow-2xl p-10 flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop" 
                  alt="Headphones" 
                  className="w-full h-full object-cover rounded-[2rem] transform hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Player UI Element from Image */}
                <div className="absolute bottom-10 left-10 right-10 bg-white/90 dark:bg-black/80 backdrop-blur-xl p-4 rounded-3xl flex items-center gap-4 shadow-xl">
                  <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                      <div className="h-full w-2/3 bg-rose-500 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>2:45</span>
                      <span>4:20</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CATALOG SECTION (Center/Right Images) --- */}
        <section ref={sectionRef} className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">New Arrivals</h2>
              <p className="text-gray-500">Explore the future of sound technology</p>
            </div>
            {/* Search Bar stylized */}
            <div className="mt-4 md:mt-0 relative w-full md:w-auto">
               <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 w-full md:w-80">
                  <Search className="w-5 h-5 text-gray-400 mr-2" />
                  <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-sm w-full" />
               </div>
            </div>
          </div>

          <CategoryPills active={activeCategory} setActive={setActiveCategory} />

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {displayProducts.map((product, idx) => (
              <div key={product.id} className="opacity-0 translate-y-10 product-card-gsap">
                <AppProductCard product={product} index={idx} />
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
             <Button variant="outline" className="rounded-full px-10 py-6 text-lg border-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                View All Products <ArrowRight className="ml-2 w-5 h-5" />
             </Button>
          </div>
        </section>

        {/* --- BOTTOM BANNER (To match layout balance) --- */}
        <section className="container mx-auto px-4 py-20">
           <div className="bg-black dark:bg-rose-900 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-black dark:from-rose-800 dark:to-rose-950 opacity-100 group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="relative z-10">
                 <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Level Up Your Audio</h2>
                 <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Get 50% off on your first order when you subscribe to our exclusive newsletter.</p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <input type="email" placeholder="Email address" className="px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500 flex-1" />
                    <Button className="rounded-full h-auto py-4 px-8 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg">Subscribe</Button>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </Layout>
  );
};

export default HomePage;
