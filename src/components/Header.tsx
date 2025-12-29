import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // Ensure paths are correct
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: Rainbow Neon & Liquid Glass ---
const styles = `
  /* Rainbow Glow Keyframes for CSS Fallback */
  @keyframes rainbow-pulse {
    0% { box-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000; border-color: #ff0000; }
    20% { box-shadow: 0 0 5px #ff8800, 0 0 10px #ff8800; border-color: #ff8800; }
    40% { box-shadow: 0 0 5px #ffff00, 0 0 10px #ffff00; border-color: #ffff00; }
    60% { box-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; border-color: #00ff00; }
    80% { box-shadow: 0 0 5px #0088ff, 0 0 10px #0088ff; border-color: #0088ff; }
    100% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff; border-color: #ff00ff; }
  }

  .liquid-glass {
    background: rgba(15, 15, 15, 0.8);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  }

  .suggestions-glass {
    background: rgba(20, 20, 20, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const Header = React.memo(() => { // <--- Added React.memo to prevent auto-closing
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
  const logoTextRef = useRef<HTMLSpanElement>(null);

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
      const mockData = ["Wireless Headphones", "Gaming Mouse", "Mechanical Keyboard", "Smart Watch", "Liquid Case"];
      setSuggestions(mockData.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // --- ANIMATIONS ---

  // 1. Menu Modal Animation
  useEffect(() => {
    if (menuOpen && modalRef.current && overlayRef.current) {
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      tl.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0, rotationX: 20 },
        { scale: 1, opacity: 1, rotationX: 0, duration: 0.6, ease: "elastic.out(1, 0.75)" }
      );
      gsap.fromTo(".menu-item-anim", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, delay: 0.2 }
      );
    }
  }, [menuOpen]);

  // 2. Rainbow Neon Hover Effect (GSAP)
  const handleRainbowHover = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    gsap.to(target, {
      scale: 1.1,
      duration: 0.3,
      boxShadow: "0 0 20px rgba(255, 0, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4)", // Neon glow mix
      borderColor: "rgba(255, 255, 255, 0.8)",
      color: theme === 'light' ? '#000' : '#fff', // Keep text visible
      ease: "power2.out"
    });
    
    // Rainbow cycling animation
    gsap.to(target, {
      keyframes: {
        "0%":   { borderColor: "#ff0000" },
        "25%":  { borderColor: "#ffff00" },
        "50%":  { borderColor: "#00ff00" },
        "75%":  { borderColor: "#00ffff" },
        "100%": { borderColor: "#ff00ff" },
      },
      duration: 2,
      repeat: -1,
      ease: "none"
    });
  };

  const handleRainbowLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    gsap.killTweensOf(target); // Stop animations
    gsap.to(target, {
      scale: 1,
      boxShadow: "none",
      borderColor: "transparent",
      color: theme === 'light' ? (scrolled ? '#000' : '#000') : '#fff', // Reset color based on theme
      duration: 0.3,
      ease: "power2.out"
    });
  };

  // 3. Logo Spread Animation
  const handleLogoHover = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.3em",
        color: "#FFD700", // Gold
        duration: 0.5,
        ease: "power3.out"
      });
    }
  };

  const handleLogoLeave = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.05em",
        color: theme === 'light' && scrolled ? "#000000" : "#ffffff", // Dynamic reset
        duration: 0.5,
        ease: "power3.out"
      });
    }
  };

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

  // --- Dynamic Text Color Logic for Light/Dark Mode ---
  // Agar theme light hai: Text Black hoga. 
  // Agar theme dark hai: Text White hoga.
  const textColorClass = theme === 'light' ? 'text-black' : 'text-white';
  const iconColorClass = theme === 'light' ? 'text-gray-900' : 'text-white';
  const headerBgClass = scrolled 
    ? (theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-black/60 border-white/10')
    : 'bg-transparent border-transparent';

  const MenuModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-opacity"
        onClick={closeMenu}
      />
      <div 
        ref={modalRef}
        className="relative w-full max-w-md liquid-glass rounded-[30px] p-6 opacity-0 transform-gpu"
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
            Menu
          </span>
          <button onClick={closeMenu} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={idx}
                to={item.to}
                className={`menu-item-anim group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-white/10 border-yellow-500/50' : 'bg-white/5 border-transparent'}`}
                onClick={closeMenu}
                onMouseEnter={handleRainbowHover}
                onMouseLeave={handleRainbowLeave}
              >
                <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-200">{item.label}</span>
                {item.badge ? (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
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

      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg border-b ${headerBgClass}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            
            {/* LOGO SECTION */}
            <Link 
              to="/" 
              className="flex items-center gap-3 z-[60] group"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
            >
               <img 
                 src="/logo-m.png" 
                 alt="M" 
                 className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] transition-transform duration-300 group-hover:scale-110" 
               />
               <span 
                 ref={logoTextRef}
                 className={`text-xl font-bold tracking-widest transition-colors duration-300 hidden sm:block ${textColorClass}`}
                 style={{ fontFamily: "'Orbitron', sans-serif" }} 
               >
                 MIRAE
               </span>
            </Link>

            {/* CONTROLS (Search & Menu) */}
            <div className="flex items-center gap-4 z-[60]">
              
              {/* Search Toggle */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                onMouseEnter={handleRainbowHover}
                onMouseLeave={handleRainbowLeave}
                className={`p-3 rounded-full transition-all duration-300 border border-transparent ${iconColorClass}`}
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Menu Toggle */}
              <button 
                onClick={() => setMenuOpen(true)}
                onMouseEnter={handleRainbowHover}
                onMouseLeave={handleRainbowLeave}
                className={`group relative p-3 flex items-center justify-center rounded-full border border-transparent ${iconColorClass}`}
              >
                 {/* Custom Animated Hamburger */}
                 <div className="flex flex-col gap-1.5 items-end">
                    <span className={`w-6 h-0.5 rounded-full transition-all duration-300 group-hover:w-8 ${theme === 'light' ? 'bg-black' : 'bg-white'}`} />
                    <span className={`w-4 h-0.5 rounded-full transition-all duration-300 group-hover:w-8 ${theme === 'light' ? 'bg-black' : 'bg-white'}`} />
                    <span className={`w-6 h-0.5 rounded-full transition-all duration-300 group-hover:w-8 ${theme === 'light' ? 'bg-black' : 'bg-white'}`} />
                 </div>
                
                {itemCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR (Slide Down) */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ease-in-out ${searchOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`${theme === 'light' ? 'bg-white/90' : 'bg-black/80'} backdrop-blur-xl border-b border-white/10 pb-6 px-4`}>
            <div className="container mx-auto max-w-2xl">
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className={`w-full rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all ${
                    theme === 'light' 
                      ? 'bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500' 
                      : 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500'
                  }`}
                  autoFocus={searchOpen}
                />
              </div>

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

      {menuOpen && createPortal(<MenuModal />, document.body)}
    </>
  );
}); // End of React.memo

export default Header;
