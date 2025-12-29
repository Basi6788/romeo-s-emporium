import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, Sparkles, X, Zap, AlertCircle, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  
  // UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Search States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for Animation
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const logoTextRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  
  // --- 1. Supabase Search Logic ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image, category, description') 
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) {
          console.error("Supabase Error:", error.message);
          throw error;
        }
        setSuggestions(data || []);
      } catch (error) {
        console.error('Search Code Crash:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  // --- 2. Scroll & Liquid Effect Logic ---
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      
      if (headerRef.current) {
        if (isScrolled) {
          gsap.to(headerRef.current, {
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(16px)",
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            paddingTop: "10px",
            paddingBottom: "10px",
            duration: 0.5,
            ease: "power2.out"
          });
        } else {
          gsap.to(headerRef.current, {
            backgroundColor: "transparent",
            backdropFilter: "blur(0px)",
            borderBottomColor: "transparent",
            paddingTop: "20px",
            paddingBottom: "20px",
            duration: 0.5,
            ease: "power2.out"
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 3. Logo Animation (MIRAE.) ---
  const handleLogoHover = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "8px",
        textShadow: "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.6)",
        scale: 1.1,
        duration: 0.4,
        ease: "back.out(1.7)"
      });
    }
  };

  const handleLogoLeave = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "2px",
        textShadow: "none",
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  // --- 4. Button Magnetic & Glow Animation ---
  const animateButton = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement> | React.TouchEvent, scale = 1.1) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      scale: scale,
      boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      duration: 0.3,
      ease: "power1.out"
    });
  };

  const resetButton = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement> | React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      scale: 1,
      boxShadow: "none",
      backgroundColor: "transparent",
      duration: 0.3,
      ease: "power1.out"
    });
  };

  // --- 5. Mobile Menu Animation ---
  useEffect(() => {
    if (menuOpen && menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(menuBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      tl.fromTo(menuRef.current, 
        { x: '100%', opacity: 0, rotationY: 45 }, 
        { x: '0%', opacity: 1, rotationY: 0, duration: 0.6, ease: 'power3.out' }
      );
      tl.fromTo(menuItemsRef.current.filter(Boolean), 
        { x: 50, opacity: 0 }, 
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'back.out(1.2)' }, 
        "-=0.4"
      );
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    if (menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline({ onComplete: () => setMenuOpen(false) });
      tl.to(menuItemsRef.current.filter(Boolean).reverse(), { x: 50, opacity: 0, duration: 0.2, stagger: 0.05 });
      tl.to(menuRef.current, { x: '100%', opacity: 0, duration: 0.4, ease: 'power2.in' }, "-=0.1");
      tl.to(menuBackdropRef.current, { opacity: 0, duration: 0.2 }, "-=0.3");
    } else {
      setMenuOpen(false);
    }
  }, []);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { to: '/products', label: 'Products', icon: Package, color: 'from-violet-500 to-purple-500' },
    { to: '/mepco-bill', label: 'Check Bill', icon: Zap, color: 'from-yellow-400 to-orange-500' },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, color: 'from-pink-500 to-rose-500' },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount, color: 'from-orange-500 to-amber-500' },
    { to: '/track-order', label: 'Track Order', icon: MapPin, color: 'from-emerald-500 to-teal-500' },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn, color: 'from-indigo-500 to-blue-500' },
  ];

  return (
    <>
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all border-b border-transparent py-5"
        style={{ perspective: '1000px' }} // Adds 3D depth context
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between relative">
            
            {/* --- BRAND LOGO --- */}
            <Link 
              to="/" 
              ref={logoRef}
              className="flex items-center gap-2 relative z-[60] group cursor-pointer"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
              onTouchStart={handleLogoHover}
              onTouchEnd={handleLogoLeave}
            >
              <span className="relative text-2xl md:text-3xl font-black tracking-widest">
                <span 
                  ref={logoTextRef}
                  className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 bg-clip-text text-transparent inline-block transition-all duration-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                  style={{ letterSpacing: '2px' }}
                >
                  MIRAE.
                </span>
                {/* Glow Element */}
                <div className="absolute -inset-4 bg-yellow-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </span>
            </Link>

            {/* --- DESKTOP NAV --- */}
            <nav className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg hover:shadow-yellow-500/10 transition-shadow duration-300">
              {['/', '/products', '/mepco-bill'].map((path) => {
                const label = path === '/' ? 'Home' : path === '/products' ? 'Products' : 'Bill Check';
                const isActive = location.pathname === path;
                return (
                  <Link 
                    key={path} 
                    to={path} 
                    onMouseEnter={(e) => animateButton(e, 1.05)}
                    onMouseLeave={resetButton}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all relative overflow-hidden ${isActive ? 'text-yellow-400 bg-white/10' : 'text-slate-300 hover:text-white'}`}
                  >
                     {label}
                     {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_#FACC15]"></span>}
                  </Link>
                );
              })}
            </nav>

            {/* --- ACTION ICONS --- */}
            <div className="flex items-center gap-2 md:gap-3 relative z-[60]">
              
              {/* Search Toggle */}
              <button 
                onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} 
                onMouseEnter={(e) => animateButton(e)} onMouseLeave={resetButton}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
              >
                {searchOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5" />}
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                onMouseEnter={(e) => animateButton(e)} onMouseLeave={resetButton}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Menu Toggle (Hamburger) */}
              <button 
                onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)} 
                onMouseEnter={(e) => animateButton(e)} onMouseLeave={resetButton}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white relative"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                   {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </div>
                {(itemCount > 0 || wishlistCount > 0) && !menuOpen && <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse border border-slate-900" />}
              </button>
            </div>
          </div>

          {/* --- SEARCH BAR DROPDOWN (Liquid Glass Style) --- */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 pt-4 px-4 container mx-auto z-40">
              <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
                <form onSubmit={handleSearchSubmit} className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-yellow-400 transition-colors" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search premium products..."
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-black/20 rounded-xl text-white placeholder:text-slate-500 border border-white/5 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 focus:outline-none transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </form>

                {/* Suggestions List */}
                {searchTerm.trim() && (
                  <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {suggestions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {suggestions.map((product) => (
                          <Link
                            key={product.id}
                            to={`/products/${product.slug || product.id}`}
                            onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 relative group-hover:scale-105 transition-transform">
                              {product.image ? (
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-slate-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate group-hover:text-yellow-400 transition-colors">{product.name}</h4>
                              <p className="text-sm text-slate-400 truncate">{product.category} • <span className="text-yellow-500/90 font-semibold">Rs. {product.price?.toLocaleString()}</span></p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                                <span className="text-yellow-400">→</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      !isSearching && (
                        <div className="p-8 text-center flex flex-col items-center gap-3 text-slate-400">
                          <AlertCircle className="w-10 h-10 opacity-20" />
                          <p>No matches found for "{searchTerm}"</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* --- MOBILE FULLSCREEN MENU (Liquid 3D) --- */}
      {menuOpen && (
        <>
          <div ref={menuBackdropRef} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" onClick={closeMenu} />
          
          <div ref={menuRef} className="fixed inset-y-0 right-0 w-full md:w-[400px] z-[90] bg-slate-900/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col">
            {/* Header of Menu */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
                <span className="text-xl font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">MENU</span>
                <button onClick={closeMenu} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link 
                    key={item.to} 
                    ref={el => menuItemsRef.current[index] = el} 
                    to={item.to} 
                    onClick={closeMenu}
                    className={`relative overflow-hidden group p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4
                      ${isActive 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border-yellow-500/30' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <span className={`text-lg font-medium transition-colors ${isActive ? 'text-yellow-400' : 'text-white group-hover:text-white/90'}`}>
                        {item.label}
                    </span>

                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto min-w-[24px] h-6 px-2 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            {item.badge}
                        </span>
                    )}
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                );
              })}
            </div>

            {/* Footer of Menu */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Need Support?</h4>
                        <p className="text-xs text-slate-400">We are here 24/7 for you.</p>
                    </div>
                </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;

