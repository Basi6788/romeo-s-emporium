import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- Custom Styles for Liquid Glass & Golden Glow ---
const styles = `
  /* Premium Liquid Glass Surface */
  .glass-modal {
    background: rgba(20, 20, 20, 0.7); /* Dark semi-transparent base */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 20px 50px rgba(0, 0, 0, 0.5), 
      inset 0 0 20px rgba(255, 255, 255, 0.05);
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  /* Light Mode Adaptation */
  .light .glass-modal {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  }

  /* Glass Button Item */
  .glass-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform-style: preserve-3d;
  }

  .light .glass-item {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* Golden/Premium Glow Animation on Hover */
  .glass-item:hover, .glass-item:active {
    background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,255,255,0.05));
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.3); /* Golden Glow */
  }
  
  /* Badge Pulse */
  @keyframes badge-pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 66, 104, 0.7); }
    70% { box-shadow: 0 0 0 6px rgba(255, 66, 104, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 66, 104, 0); }
  }
  .animate-badge {
    animation: badge-pulse 2s infinite;
  }
`;

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const location = useLocation();
  
  // Refs for Animation
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock Body Scroll when Menu is Open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [menuOpen]);

  // --- GSAP Open/Close Animation ---
  useEffect(() => {
    if (menuOpen && modalRef.current && overlayRef.current) {
      const tl = gsap.timeline();

      // 1. Overlay Fade In
      tl.to(overlayRef.current, { 
        opacity: 1, 
        duration: 0.4, 
        ease: 'power2.out' 
      });

      // 2. Modal "POP" (Elastic Effect) - Center Screen
      tl.fromTo(modalRef.current,
        { scale: 0.5, opacity: 0, rotationX: 15 },
        { 
          scale: 1, 
          opacity: 1, 
          rotationX: 0,
          duration: 0.8, 
          ease: "elastic.out(1, 0.75)" 
        },
        "-=0.2"
      );

      // 3. Stagger Items
      tl.fromTo(itemsRef.current.filter(Boolean),
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.05, 
          duration: 0.4, 
          ease: "back.out(1.7)" 
        },
        "-=0.6"
      );
    }
  }, [menuOpen]);

  const closeMenu = () => {
    if (modalRef.current && overlayRef.current) {
      const tl = gsap.timeline({
        onComplete: () => setMenuOpen(false)
      });
      
      // Close Animation
      tl.to(itemsRef.current.filter(Boolean), { 
        y: 10, opacity: 0, duration: 0.2, stagger: 0.02 
      });
      tl.to(modalRef.current, { 
        scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in" 
      }, "-=0.1");
      tl.to(overlayRef.current, { 
        opacity: 0, duration: 0.3 
      }, "-=0.2");
    } else {
      setMenuOpen(false);
    }
  };

  // --- Reactive Button Animation (Hover/Touch) ---
  const handleHover = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleLeave = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  return (
    <>
      <style>{styles}</style>
      
      {/* --- Main Header Bar --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled && !menuOpen
            ? 'bg-background/70 backdrop-blur-md border-b border-white/10 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 relative z-[60]">
              <span className="text-xl font-bold tracking-tight">
                <span className={menuOpen ? 'text-white' : 'text-foreground'}>BASIT</span>
                <span className="text-yellow-500">SHOP</span>
              </span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3 relative z-[60]">
              
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-full transition-all ${
                  menuOpen ? 'text-white/80 hover:bg-white/10' : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`hidden md:block p-2.5 rounded-full transition-all ${
                  menuOpen ? 'text-white/80 hover:bg-white/10' : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Hamburger / Menu Trigger */}
              <button
                onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
                className={`p-2.5 rounded-full transition-all relative group ${
                  menuOpen ? 'text-white hover:rotate-90' : 'text-foreground hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {menuOpen ? (
                   <X className="w-6 h-6" />
                ) : (
                  <div className="flex flex-col gap-1.5 items-end">
                    <span className="w-6 h-0.5 bg-current rounded-full group-hover:w-4 transition-all" />
                    <span className="w-4 h-0.5 bg-current rounded-full group-hover:w-6 transition-all" />
                  </div>
                )}
                
                {/* Notification Dot */}
                {(itemCount > 0 || wishlistCount > 0) && !menuOpen && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-badge" />
                )}
              </button>
            </div>
          </div>

          {/* Inline Search Bar (Slide Down) */}
          <div className={`overflow-hidden transition-all duration-300 ${searchOpen && !menuOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
             <div className="pb-4 pt-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for luxury items..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500/50 text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* --- CENTERED GLASS MODAL OVERLAY --- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* 1. Background Blur Overlay */}
          <div 
            ref={overlayRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity"
            onClick={closeMenu}
          />
          
          {/* 2. Floating Glass Window (Center Pop) */}
          <div 
            ref={modalRef}
            className="relative w-full max-w-lg glass-modal rounded-[2rem] p-6 md:p-8 opacity-0"
          >
            {/* Window Header */}
            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
                 <Sparkles className="w-5 h-5 text-yellow-500" />
                 Menu
               </h2>
               <div className="h-1 w-12 bg-yellow-500/50 rounded-full mx-auto mt-2" />
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    ref={el => itemsRef.current[index] = el}
                    to={item.to}
                    onClick={closeMenu}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                    onTouchStart={handleHover}
                    onTouchEnd={handleLeave}
                    className={`
                      glass-item relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl group
                      ${isActive ? 'border-yellow-500/30 bg-white/10' : ''}
                    `}
                  >
                    {/* Icon Container */}
                    <div className={`
                      p-3 rounded-full transition-all duration-300
                      ${isActive ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white group-hover:bg-yellow-500 group-hover:text-black'}
                    `}>
                      <item.icon className="w-6 h-6" />
                    </div>

                    {/* Label */}
                    <span className={`text-sm font-medium transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-200 group-hover:text-white'}`}>
                      {item.label}
                    </span>

                    {/* Badges */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Footer inside Modal */}
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
               <button onClick={toggleTheme} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>Change Theme</span>
               </button>
               <span className="text-xs text-gray-500">v1.0.0</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default Header;
