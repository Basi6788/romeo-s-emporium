import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, Zap, MapPin, LogIn, Settings, Sparkles, X, Menu, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// Helper for Reactive Buttons (Liquid Feel)
const ReactiveBtn = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    gsap.to(btnRef.current, { scale: 1.1, duration: 0.3, ease: "elastic.out(1, 0.3)" });
    gsap.to(btnRef.current, { textShadow: "0 0 10px rgba(255,255,255,0.8)", boxShadow: "0 0 15px rgba(255,215,0,0.2)", duration: 0.2 });
  };

  const handleLeave = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { textShadow: "none", boxShadow: "none", duration: 0.2 });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  
  // UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // --- Scroll Effect for Floating Header ---
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      
      // Header Morphing Animation
      if (headerRef.current) {
        if (isScrolled) {
          gsap.to(headerRef.current, {
            width: "90%",
            top: "1rem",
            borderRadius: "50px",
            backgroundColor: "rgba(10, 10, 10, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
            duration: 0.5,
            ease: "power3.out"
          });
        } else {
          gsap.to(headerRef.current, {
            width: "100%",
            top: "0",
            borderRadius: "0px",
            backgroundColor: "transparent",
            backdropFilter: "blur(0px)",
            border: "1px solid transparent",
            boxShadow: "none",
            duration: 0.5,
            ease: "power3.out"
          });
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Search Logic ---
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
          .limit(6);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (error) {
        console.error('Search Error:', error);
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
      setSuggestions([]);
    }
  };

  // --- Menu Animation (Center Pop-up) ---
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      // Animate In
      const tl = gsap.timeline();
      tl.to(menuContainerRef.current, { opacity: 1, pointerEvents: "all", duration: 0.3 });
      tl.fromTo(menuContentRef.current, 
        { scale: 0.8, opacity: 0, rotationX: 15 }, 
        { scale: 1, opacity: 1, rotationX: 0, duration: 0.6, ease: "elastic.out(1, 0.75)" }
      );
      // Animate Items staggered
      tl.fromTo(".menu-item-anim", 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "back.out(1.7)" }, 
        "-=0.4"
      );
    } else {
      document.body.style.overflow = '';
      // Animate Out
      const tl = gsap.timeline();
      tl.to(menuContentRef.current, { scale: 0.9, opacity: 0, duration: 0.3, ease: "power2.in" });
      tl.to(menuContainerRef.current, { opacity: 0, pointerEvents: "none", duration: 0.2 }, "-=0.1");
    }
  }, [menuOpen]);

  // Menu Config
  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Collection', icon: Package },
    { to: '/cart', label: 'My Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/mepco-bill', label: 'Bill Checker', icon: Zap },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Profile' : 'Sign In', icon: isAuthenticated ? User : LogIn },
  ];

  return (
    <>
      {/* --- Main Header Structure --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div 
          ref={headerRef} 
          className="pointer-events-auto transition-all relative z-50 flex items-center justify-between px-6 py-4"
        >
          
          {/* LOGO - Liquid Gold */}
          <Link to="/" className="relative group z-50">
            <span className="text-2xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)] transition-all duration-300 group-hover:tracking-[0.25em]">
              MIRAE.
            </span>
          </Link>

          {/* Desktop Nav - Minimal Glass Pill */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-lg border border-white/5 rounded-full px-2 py-1 absolute left-1/2 -translate-x-1/2">
            {['/', '/products'].map((path) => (
              <Link 
                key={path} 
                to={path} 
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === path ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                {path === '/' ? 'Home' : 'Shop'}
              </Link>
            ))}
          </nav>

          {/* Actions - Reactive Buttons */}
          <div className="flex items-center gap-3">
            
            {/* Search Trigger */}
            <ReactiveBtn onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} className="p-2 text-white/80 hover:text-amber-400">
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </ReactiveBtn>

            {/* Theme Toggle */}
            <ReactiveBtn onClick={toggleTheme} className="p-2 text-white/80 hover:text-amber-400">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </ReactiveBtn>

            {/* Menu Trigger */}
            <ReactiveBtn onClick={() => setMenuOpen(true)} className="p-2 text-white/80 hover:text-amber-400">
               <div className="flex flex-col gap-1.5 items-end">
                  <span className="w-6 h-0.5 bg-current rounded-full"></span>
                  <span className="w-4 h-0.5 bg-current rounded-full"></span>
               </div>
            </ReactiveBtn>
          </div>
        </div>
      </div>

      {/* --- Full Screen Search Overlay --- */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col items-center pt-32 px-4">
            <div className="w-full max-w-2xl relative">
              <form onSubmit={handleSearchSubmit} className="relative group">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search MIRAE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-2xl py-4 pl-6 pr-14 text-lg focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all shadow-2xl"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400">
                  <Search size={24} />
                </button>
              </form>

              {/* Search Results */}
              {searchTerm && (
                <div className="mt-4 bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-200">
                  {isSearching ? (
                    <div className="p-6 flex justify-center text-amber-400"><Loader2 className="animate-spin" /></div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((product) => (
                      <Link 
                        key={product.id} 
                        to={`/products/${product.slug || product.id}`}
                        onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                      >
                         <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden">
                           {product.image && <img src={product.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                         </div>
                         <div>
                           <h4 className="text-white font-medium group-hover:text-amber-400 transition-colors">{product.name}</h4>
                           <p className="text-white/40 text-sm">Rs. {product.price}</p>
                         </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-white/40">No matches found</div>
                  )}
                </div>
              )}
            </div>
        </div>
      )}

      {/* --- Centered 3D Glass Menu --- */}
      <div 
        ref={menuContainerRef} 
        className="fixed inset-0 z-[60] flex items-center justify-center opacity-0 pointer-events-none"
      >
        {/* Dark Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMenuOpen(false)} />
        
        {/* 3D Menu Window */}
        <div 
          ref={menuContentRef}
          className="relative w-full max-w-lg mx-4 bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Decorative Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/10 blur-[60px] pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
             <span className="text-xl font-bold text-white tracking-widest">MENU</span>
             <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
               <X size={24} />
             </button>
          </div>

          <nav className="grid grid-cols-2 gap-3 relative z-10">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.to;
              return (
                <Link 
                  key={idx} 
                  to={item.to} 
                  onClick={() => setMenuOpen(false)}
                  className={`menu-item-anim group flex flex-col gap-2 p-5 rounded-3xl transition-all duration-300 border ${isActive ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start">
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-amber-400' : 'text-white/70 group-hover:text-white'} transition-colors`} />
                    {item.badge ? (
                      <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400"><Sparkles size={12}/></span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
            <div className="text-xs text-white/30">
              <p>© 2024 MIRAE.</p>
              <p>Liquid Glass UI</p>
            </div>
            {!isAuthenticated && (
               <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-transform">
                 Join Us
               </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
