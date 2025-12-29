import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, Sparkles, X, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: Rainbow Orb & Liquid Glass ---
const styles = `
  /* Rainbow Glow Animation */
  @keyframes rainbow-border {
    0% { border-color: rgba(255, 0, 0, 0.5); box-shadow: 0 0 15px rgba(255, 0, 0, 0.3); }
    20% { border-color: rgba(255, 165, 0, 0.5); box-shadow: 0 0 15px rgba(255, 165, 0, 0.3); }
    40% { border-color: rgba(255, 255, 0, 0.5); box-shadow: 0 0 15px rgba(255, 255, 0, 0.3); }
    60% { border-color: rgba(0, 128, 0, 0.5); box-shadow: 0 0 15px rgba(0, 128, 0, 0.3); }
    80% { border-color: rgba(0, 0, 255, 0.5); box-shadow: 0 0 15px rgba(0, 0, 255, 0.3); }
    100% { border-color: rgba(238, 130, 238, 0.5); box-shadow: 0 0 15px rgba(238, 130, 238, 0.3); }
  }

  .rainbow-hover:hover {
    animation: rainbow-border 2s linear infinite;
    transform: scale(1.05);
  }

  /* Deep Liquid Glass */
  .liquid-glass {
    background: rgba(10, 10, 10, 0.65);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  }

  /* Search Suggestions Glass */
  .suggestions-glass {
    background: rgba(20, 20, 20, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Reset on Route Change ---
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // --- Search Logic (Mock) ---
  useEffect(() => {
    if (searchQuery.length > 1) {
      // Fake API call or filter logic
      const mockData = ["Wireless Headphones", "Gaming Mouse", "Mechanical Keyboard", "Smart Watch", "Liquid Case"];
      setSuggestions(mockData.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // --- GSAP Animations for Menu ---
  useEffect(() => {
    if (menuOpen && modalRef.current && overlayRef.current) {
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      tl.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0, rotationX: 20 },
        { scale: 1, opacity: 1, rotationX: 0, duration: 0.6, ease: "elastic.out(1, 0.75)" }
      );
      
      // Stagger items
      gsap.fromTo(".menu-item-anim", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, delay: 0.2 }
      );
    }
  }, [menuOpen]);

  const closeMenu = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, { scale: 0.8, opacity: 0, duration: 0.3 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => setMenuOpen(false) });
    } else {
      setMenuOpen(false);
    }
  };

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  // --- PORTAL CONTENT (Menu Window) ---
  const MenuModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 1. Backdrop Blur */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-opacity"
        onClick={closeMenu}
      />

      {/* 2. Liquid Glass Window (Centered) */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md liquid-glass rounded-[30px] p-6 opacity-0 transform-gpu"
      >
        {/* Header inside Modal */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
            Menu
          </span>
          <button onClick={closeMenu} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Grid Items */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={idx}
                to={item.to}
                className={`
                  menu-item-anim group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300
                  ${isActive ? 'bg-white/10 border-yellow-500/50' : 'bg-white/5 border-transparent'}
                  rainbow-hover
                `}
                onClick={closeMenu}
              >
                <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-200 group-hover:text-white">{item.label}</span>
                
                {item.badge ? (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Extra Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>Theme</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>

      {/* MAIN HEADER BAR */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled && !searchOpen ? 'bg-black/60 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 z-[60]">
               {/* Replace with your M Logo Image */}
               <img src="/logo-m.png" alt="M" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
               <span className="text-xl font-bold tracking-widest text-white hidden sm:block">MIRAE</span>
            </Link>

            {/* Right Controls */}
            <div className="flex items-center gap-3 z-[60]">
              
              {/* Search Toggle */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-3 rounded-full transition-all duration-300 ${searchOpen ? 'bg-white text-black rotate-90' : 'text-white hover:bg-white/10'}`}
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Animated Hamburger Menu */}
              <button 
                onClick={() => setMenuOpen(true)}
                className="group relative p-3 w-12 h-12 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-white/5 transition-colors"
              >
                <span className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-8 group-hover:bg-yellow-400 group-hover:shadow-[0_0_10px_orange]"></span>
                <span className="w-4 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-8 group-hover:bg-yellow-400 group-hover:shadow-[0_0_10px_orange]"></span>
                <span className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-8 group-hover:bg-yellow-400 group-hover:shadow-[0_0_10px_orange]"></span>
                
                {/* Notification Dot on Menu */}
                {(itemCount > 0) && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR & SUGGESTIONS (Slide Down) */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ease-in-out ${searchOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-black/80 backdrop-blur-xl border-b border-white/10 pb-6 px-4">
            <div className="container mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  autoFocus={searchOpen}
                />
              </div>

              {/* Suggestions List */}
              {suggestions.length > 0 && (
                <div className="mt-4 suggestions-glass rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  {suggestions.map((item, i) => (
                    <Link 
                      key={i} 
                      to={`/products?search=${item}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between px-5 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="flex items-center gap-3">
                        <Search className="w-4 h-4 opacity-50" />
                        {item}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* RENDER MENU OUTSIDE LAYOUT (PORTAL) */}
      {menuOpen && createPortal(<MenuModal />, document.body)}
    </>
  );
};

export default Header;
