import { useRef, useState, useLayoutEffect } from 'react';
import { Search, AlignRight, User } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import clsx from 'clsx';

import SceneContainer from '@/scenes/SceneContainer';
import ProductCard from '@/components/ProductCard';
import FloatingCart from '@/components/FloatingCart';
import { useTheme } from '@/hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

// --- Mock Data ---
const PRODUCTS = [
  { id: '1', name: 'AirPods Pro', price: 499.00, category: 'Headphones', image: 'https://pngimg.com/d/airpods_PNG2.png' },
  { id: '2', name: 'HomePod Mini', price: 349.00, category: 'Speakers', image: 'https://pngimg.com/d/homepod_PNG10.png' },
  { id: '3', name: 'Sony XM5', price: 650.00, category: 'Headphones', image: 'https://pngimg.com/d/headphones_PNG101967.png' },
  { id: '4', name: 'Earphones', price: 60.00, category: 'Earphones', image: 'https://pngimg.com/d/earphones_PNG1.png' },
  { id: '5', name: 'JBL Pulse', price: 220.00, category: 'Speakers', image: 'https://pngimg.com/d/wireless_speaker_PNG36.png' },
  { id: '6', name: 'Beats Studio', price: 300.00, category: 'Headphones', image: 'https://pngimg.com/d/headphones_PNG7647.png' },
];

const CATEGORIES = ['All', 'Headphones', 'Speakers', 'Cables'];

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeCat, setActiveCat] = useState('All');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // --- Animations ---
  useGSAP(() => {
    const tl = gsap.timeline();

    // Initial Load Animation
    tl.from(headerRef.current, { y: -50, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(titleRef.current, { x: -30, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(chipsRef.current, { x: 50, opacity: 0, duration: 0.8 }, "-=0.6")
      .from('.product-grid-item', { y: 100, opacity: 0, stagger: 0.1, duration: 0.8 }, "-=0.4");

    // Scroll Interaction: Fade out header as grid scrolls up
    ScrollTrigger.create({
      trigger: gridRef.current,
      start: "top 60%", 
      end: "top 20%",
      scrub: 1,
      animation: gsap.to([titleRef.current, chipsRef.current], {
        opacity: 0,
        y: -50,
        filter: 'blur(10px)',
        stagger: 0.05
      })
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen w-full font-sans overflow-hidden">
      
      {/* 3D Background Layer */}
      <SceneContainer />

      {/* Main Content Overlay */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-6 pt-8 pb-32">
        
        {/* Top Header */}
        <header ref={headerRef} className="flex items-center justify-between mb-8">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-white dark:bg-white/10 backdrop-blur-sm rounded-full py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary/20 shadow-sm dark:text-white transition-colors"
            />
          </div>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-black dark:bg-white overflow-hidden flex items-center justify-center transition-transform active:scale-90"
          >
            {theme === 'light' ? (
              <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover opacity-90 hover:opacity-100" />
            ) : (
               <User className="text-black" size={20} />
            )}
          </button>
        </header>

        {/* Hero Title & Filters */}
        <div className="mb-8 relative z-20">
          <div ref={titleRef} className="flex justify-between items-end mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
              New <br /> arrivals
            </h1>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
              <AlignRight size={24} className="text-gray-900 dark:text-white" />
            </button>
          </div>

          <div ref={chipsRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={clsx(
                  "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border",
                  activeCat === cat
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white scale-105 shadow-lg"
                    : "bg-transparent text-gray-500 border-gray-200 dark:border-white/20 hover:border-gray-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div ref={gridRef} className="grid grid-cols-2 gap-4 auto-rows-fr">
          {PRODUCTS.filter(p => activeCat === 'All' || p.category === activeCat).map((product) => (
             <div key={product.id} className="product-grid-item">
               <ProductCard product={product} />
             </div>
          ))}
        </div>

      </div>

      {/* Fixed Floating Cart */}
      <FloatingCart />

    </div>
  );
};

export default HomePage;
