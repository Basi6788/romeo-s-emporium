import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSwipeable } from 'react-swipeable';
import { Search, Menu, ShoppingBag, Heart } from 'lucide-react';
import ThreeScene from './ThreeScene'; // Import the scene above

gsap.registerPlugin(ScrollTrigger);

// --- Dummy Data (Images ke hisab se) ---
const PRODUCTS = [
  { id: 1, name: 'Airpods Pro', price: '499.00', img: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500&q=80', color: 'bg-white' },
  { id: 2, name: 'Speakers', price: '359.00', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80', color: 'bg-[#1a2e35]' },
  { id: 3, name: 'Headphones', price: '650.00', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', color: 'bg-[#ffcccb]' },
  { id: 4, name: 'Earphones', price: '60.00', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', color: 'bg-white' },
];

const CATEGORIES = ['All', 'Headphones', 'Speakers', 'Cables'];

const HomePage = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const productGridRef = useRef(null);

  // --- Theme Toggle (Scene change ke liye) ---
  const toggleTheme = () => setIsDark(!isDark);

  // --- Initial Entrance Animation (GSAP) ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".header-item", {
        y: -50,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out"
      });

      // Title Animation
      gsap.from(".hero-title", {
        x: -50,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out"
      });

      // Category Chips Stagger
      gsap.from(".category-chip", {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.6,
        ease: "back.out(1.7)"
      });

      // Product Cards Stagger (ScrollTrigger ke sath)
      gsap.from(".product-card", {
        y: 100,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".product-grid",
          start: "top 80%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- Swipe Logic for Hero Section ---
  const handleSwipe = (direction) => {
    const heroEl = heroRef.current;
    
    // 1. Fade Out Effect
    gsap.to(heroEl, {
      opacity: 0,
      x: direction === 'LEFT' ? -50 : 50,
      scale: 0.95,
      duration: 0.3,
      onComplete: () => {
        // State update (Scene change logic yahan simulate kar rahe hain)
        // Asal me yahan slide change hogi
        
        // 2. Fade In Effect (New Slide)
        gsap.fromTo(heroEl, 
          { x: direction === 'LEFT' ? 50 : -50, scale: 0.95, opacity: 0 },
          { x: 0, scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      }
    });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('LEFT'),
    onSwipedRight: () => handleSwipe('RIGHT'),
    trackMouse: true
  });

  // --- Button Hover Animation (GSAP) ---
  const onButtonHover = (e) => {
    gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2, ease: "power1.out" });
  };
  const onButtonLeave = (e) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power1.out" });
  };

  return (
    <div 
      ref={containerRef} 
      className={`min-h-screen transition-colors duration-500 overflow-x-hidden font-sans
      ${isDark ? 'bg-black text-white' : 'bg-[#ffe4e1] text-[#1f2937]'}`} // Soft Pink BG matches image
    >
      {/* 3D Background Component */}
      <ThreeScene isDark={isDark} />

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col p-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          {/* Search Pill */}
          <div className={`header-item flex items-center gap-3 px-4 py-3 rounded-full w-2/3 shadow-sm
            ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none w-full text-sm font-medium" 
            />
          </div>
          
          {/* Profile/Menu */}
          <div className="header-item relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" alt="Profile" className="w-full h-full object-cover" />
            </div>
            {/* Theme Toggle Button (Hidden feature) */}
            <button onClick={toggleTheme} className="absolute -bottom-2 -right-2 bg-black text-white p-1 rounded-full text-[10px] w-6 h-6 flex items-center justify-center">
              {isDark ? 'L' : 'D'}
            </button>
          </div>
        </header>

        {/* HERO / TITLE SECTION */}
        <div {...swipeHandlers} ref={heroRef} className="mb-8 cursor-grab active:cursor-grabbing">
          <div className="flex justify-between items-start">
            <h1 className="hero-title text-4xl font-extrabold tracking-tight leading-tight">
              New <br />
              arrivals
            </h1>
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-2">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onMouseEnter={onButtonHover}
              onMouseLeave={onButtonLeave}
              onClick={() => setActiveCategory(cat)}
              className={`category-chip px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border
              ${activeCategory === cat 
                ? (isDark ? 'bg-white text-black border-white' : 'bg-[#1f2937] text-white border-[#1f2937]') 
                : (isDark ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-transparent bg-white/50')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div ref={productGridRef} className="product-grid grid grid-cols-2 gap-5 pb-20">
          {PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className={`product-card group relative p-4 rounded-[2rem] h-64 flex flex-col justify-between transition-all duration-300 hover:shadow-xl
              ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}
            >
              {/* Product Image Area */}
              <div className="relative h-32 flex justify-center items-center">
                 {/* Circle Background behind image */}
                 <div className={`absolute w-24 h-24 rounded-full opacity-20 group-hover:scale-125 transition-transform duration-500 ${isDark ? 'bg-white' : 'bg-pink-500'}`}></div>
                 <img 
                    src={product.img} 
                    alt={product.name} 
                    className="relative z-10 h-full object-contain drop-shadow-xl group-hover:-translate-y-2 transition-transform duration-500" 
                 />
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                   ${product.price}
                </p>
              </div>

              {/* Floating Action / Price Tag */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 
                flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-transform group-hover:scale-110
                ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <span className="text-xs font-bold">${product.price}</span>
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white absolute -top-1 -right-1">
                    <ShoppingBag size={8} />
                  </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
