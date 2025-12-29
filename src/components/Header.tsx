import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, Sparkles, X, Zap, AlertCircle, Menu } from 'lucide-react';
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
  
  // Refs
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

        if (error) throw error;
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

  // --- UI Effects ---
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setSuggestions([]); 
  }, [location.pathname]);

  // --- GSAP Animations ---
  
  // Menu Open Animation (Elastic Pop in Center)
  useEffect(() => {
    if (menuOpen && menuContainerRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline();
      
      // Backdrop Blur Fade In
      tl.fromTo(menuBackdropRef.current, 
        { opacity: 0, backdropFilter: "blur(0px)" }, 
        { opacity: 1, backdropFilter: "blur(10px)", duration: 0.4, ease: 'power2.out' }
      );

      // 3D Window Pop
      tl.fromTo(menuContainerRef.current,
        { scale: 0.8, opacity: 0, rotationX: 15, y: 50 },
        { scale: 1, opacity: 1, rotationX: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.75)', clearProps: "transform" },
        '-=0.3'
      );

      // Stagger Items
      tl.fromTo(menuItemsRef.current.filter(Boolean),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(1.5)' },
        '-=0.4'
      );
    }
  }, [menuOpen]);

  // Reactive Button Hover Effect Helper
  const handleButtonHover = (e: React.MouseEvent, scale: number) => {
    gsap.to(e.currentTarget, { scale: scale, duration: 0.2, ease: "power1.out" });
  };

  const closeMenu = useCallback(() => {
    if (menuContainerRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline({ onComplete: () => setMenuOpen(false) });
      tl.to(menuContainerRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.2, ease: 'power2.in' });
      tl.to(menuBackdropRef.current, { opacity: 0, backdropFilter: "blur(0px)", duration: 0.2 }, '-=0.1');
    } else {
      setMenuOpen(false);
    }
  }, []);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/mepco-bill', label: 'Bill Checker', icon: Zap },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  return (
    <>
      {/* --- Main Floating Header --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${
          scrolled 
            ? 'bg-background/60 backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-2' 
            : 'bg-transparent border-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            
            {/* Logo Section - Golden & Glowing */}
            <Link 
              to="/" 
              className="relative z-[60] group"
              onMouseEnter={(e) => handleButtonHover(e, 1.05)}
              onMouseLeave={(e) => handleButtonHover(e, 1)}
            >
              <div className="flex flex-col leading-none">
                <span className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] filter">
                  MIRAE.
                </span>
              </div>
            </Link>

            {/* Desktop Nav - Minimal Pills */}
            <nav className="hidden md:flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              {['/', '/products', '/mepco-bill'].map((path) => (
                <Link 
                  key={path} 
                  to={path}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                    location.pathname === path 
                      ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                  }`}
                >
                  {path === '/' ? 'Home' : path === '/products' ? 'Shop' : 'Bill'}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} 
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all active:scale-95 group"
              >
                {searchOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5 group-hover:text-primary transition-colors" />}
              </button>
              
              <button 
                onClick={() => setMenuOpen(true)} 
                className="relative p-3 rounded-full bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all active:scale-95 group"
              >
                <div className="flex flex-col gap-1.5 items-end w-5">
                  <span className="h-0.5 w-full bg-foreground rounded-full group-hover:bg-primary transition-colors" />
                  <span className="h-0.5 w-3/4 bg-foreground rounded-full group-hover:w-full group-hover:bg-primary transition-all duration-300" />
                  <span className="h-0.5 w-1/2 bg-foreground rounded-full group-hover:w-full group-hover:bg-primary transition-all duration-300" />
                </div>
                {(itemCount > 0 || wishlistCount > 0) && <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2 border-background animate-pulse" />}
              </button>
            </div>
          </div>

          {/* Search Bar Dropdown */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 px-4 container mx-auto z-50">
               <div className="bg-background/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-4 fade-in duration-300">
                  <form onSubmit={handleSearchSubmit} className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search MIRAE collection..."
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-xl text-base focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all border border-transparent focus:border-white/10 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </form>
                  {/* Suggestions List (Same logic as before) */}
                  {searchTerm.trim() && (
                    <div className="mt-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                      {isSearching ? (
                        <div className="p-4 text-center text-muted-foreground"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"/>Searching...</div>
                      ) : suggestions.length > 0 ? (
                        <div className="grid gap-2">
                           {suggestions.map((product) => (
                              <Link key={product.id} to={`/products/${product.slug || product.id}`} onClick={() => { setSearchOpen(false); setSearchTerm(''); }} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden border border-white/5">
                                  {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <Package className="w-6 h-6 m-auto mt-3 text-muted-foreground"/>}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">Rs. {product.price?.toLocaleString()}</p>
                                </div>
                              </Link>
                           ))}
                        </div>
                      ) : <div className="p-4 text-center text-muted-foreground">No matches found.</div>}
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </header>

      {/* --- CENTERED 3D GLASS MENU WINDOW --- */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 h-[100dvh]">
          
          {/* Dark Overlay with Blur */}
          <div 
            ref={menuBackdropRef} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={closeMenu} 
          />

          {/* The Glass Window */}
          <div 
            ref={menuContainerRef} 
            className="relative w-full max-w-md bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header inside Menu */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
               <span className="text-xl font-bold text-white/90 tracking-widest">MENU</span>
               <button onClick={closeMenu} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Menu Grid */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item, i) => {
                   const isActive = location.pathname === item.to;
                   return (
                     <Link 
                        key={item.to} 
                        ref={el => menuItemsRef.current[i] = el}
                        to={item.to} 
                        onClick={closeMenu}
                        className={`
                          relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all duration-300 group
                          ${isActive 
                            ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_20px_rgba(var(--primary),0.2)]' 
                            : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105'}
                        `}
                     >
                        <item.icon className={`w-8 h-8 ${isActive ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]' : 'text-white/50 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'} transition-all duration-300`} />
                        <span className="text-sm font-medium tracking-wide">{item.label}</span>
                        
                        {item.badge && item.badge > 0 && (
                          <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-bounce">
                            {item.badge}
                          </span>
                        )}
                     </Link>
                   )
                })}
              </div>

              {/* Theme Toggle at Bottom */}
              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">Appearance</span>
                <button 
                  onClick={toggleTheme} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 hover:bg-black/40 border border-white/5 transition-colors"
                >
                   {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                   <span className="text-xs text-white">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
