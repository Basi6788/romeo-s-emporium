import { useEffect, useRef, useState } from 'react';
import { Search, Menu, ShoppingBag, Sun, Moon } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeScene from '@/three/ThreeScene';
import { useThemeStore } from '@/theme/themeStore';

gsap.registerPlugin(ScrollTrigger);

// Dummy Data for UI (based on image)
const PRODUCTS = [
  { id: 1, name: 'Airpods Pro', price: '$499.00', img: '🎧', bg: 'bg-white' },
  { id: 2, name: 'Speakers', price: '$359.00', img: '🔊', bg: 'bg-blue-900' },
  { id: 3, name: 'Headphones', price: '$650.00', img: '🎧', bg: 'bg-red-400' },
  { id: 4, name: 'Earphones', price: '$60.00', img: '🎵', bg: 'bg-gray-100' },
];

const CATEGORIES = ['All', 'Headphones', 'Speakers', 'Cables'];

const HomePage = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [scrollY, setScrollY] = useState(0);
  
  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Scroll Listener for ThreeJS bridge
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Entry
      gsap.from('.header-item', {
        y: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // Hero Text Entry
      gsap.from(heroTextRef.current, {
        x: -50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
      });

      // Categories Entry
      gsap.from('.category-pill', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.6,
        ease: 'back.out(1.7)'
      });

      // Product Cards Stagger Entry
      gsap.from('.product-card', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.product-grid',
          start: 'top 80%',
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`relative min-h-screen w-full transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      
      {/* 1. THE 3D BACKGROUND LAYER */}
      <ThreeScene scrollY={scrollY} />

      {/* 2. THE UI CONTENT LAYER */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-md md:max-w-lg lg:max-w-2xl bg-transparent">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10 header-item">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg cursor-pointer">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${isDarkMode ? 'bg-white/10 text-yellow-400' : 'bg-white text-gray-800'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`p-3 rounded-full shadow-lg backdrop-blur-md ${isDarkMode ? 'bg-white/10' : 'bg-white'}`}>
             <Menu size={20} />
          </button>
        </header>

        {/* Search Bar */}
        <div className="header-item mb-8">
          <div className={`flex items-center px-6 py-4 rounded-full shadow-xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
            <Search className="text-gray-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-transparent border-none outline-none w-full text-lg placeholder-gray-400"
            />
          </div>
        </div>

        {/* Hero / Title Section */}
        <div ref={heroTextRef} className="mb-8">
          <h1 className="text-4xl font-bold leading-tight">
            New <br />
            <span className="text-5xl">arrivals</span>
          </h1>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar mb-4">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`category-pill px-6 py-3 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300
                ${i === 0 
                  ? 'bg-black text-white shadow-lg scale-105' 
                  : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 border border-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid grid grid-cols-2 gap-5 mb-20" ref={cardsRef}>
          {PRODUCTS.map((product) => (
            <div 
              key={product.id}
              className={`product-card group relative p-4 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer
                ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80'}
              `}
              onMouseEnter={() => {
                 // GSAP Hover effect via React event
                 gsap.to(`.p-img-${product.id}`, { scale: 1.1, duration: 0.3 });
              }}
              onMouseLeave={() => {
                 gsap.to(`.p-img-${product.id}`, { scale: 1, duration: 0.3 });
              }}
            >
              <div className="flex justify-center items-center h-32 mb-4 relative">
                {/* Visual Representation of product (using emoji placeholder or 3D canvas could go here) */}
                <div className={`p-img-${product.id} text-6xl drop-shadow-2xl transition-transform`}>
                  {product.img}
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm opacity-60 font-medium">{product.price}</p>
              </div>

              {/* Floating Action Button */}
              {/* Special styling for highlighted items like the black button in image */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                 <button className="bg-black text-white p-3 rounded-full shadow-lg flex items-center gap-2 px-5">
                    <span className="text-xs font-bold">Buy</span>
                    <ShoppingBag size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation Fake */}
        <div className={`fixed bottom-0 left-0 w-full p-4 backdrop-blur-md z-50 flex justify-around items-center rounded-t-3xl border-t ${isDarkMode ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-gray-100'}`}>
           <div className="w-1/3 flex justify-center"><div className="w-12 h-1 bg-gray-300 rounded-full" /></div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
