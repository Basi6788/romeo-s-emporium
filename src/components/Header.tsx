import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, Sparkles, X, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // --- GSAP Animations for Logo & Header ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Floating Header Effect on Scroll
      ScrollTrigger.create({
        start: 'top -10',
        onEnter: () => {
          setScrolled(true);
          gsap.to(headerRef.current, {
            y: 8,
            borderRadius: '24px',
            backgroundColor: theme === 'dark' ? 'rgba(20, 20, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)',
            width: 'calc(100% - 32px)',
            left: '16px',
            duration: 0.4,
            ease: 'power3.out'
          });
        },
        onLeaveBack: () => {
          setScrolled(false);
           gsap.to(headerRef.current, {
            y: 0,
            borderRadius: '0px',
            backgroundColor: 'transparent',
            backdropFilter: 'blur(0px)',
            boxShadow: 'none',
            width: '100%',
            left: '0px',
            duration: 0.3,
            ease: 'power2.inOut'
          });
        },
      });

      // 2. "MIRAE" Golden Glow & Spread Animation
      if (logoRef.current) {
        const logoText = logoRef.current.querySelector('.mirae-text');
        
        logoRef.current.addEventListener('mouseenter', () => {
          gsap.to(logoText, {
            letterSpacing: '0.15em',
            scale: 1.05,
            textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
          });
        });

        logoRef.current.addEventListener('mouseleave', () => {
          gsap.to(logoText, {
            letterSpacing: '0.05em',
            scale: 1,
            textShadow: 'none',
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      }

    }, headerRef);

    return () => ctx.revert();
  }, [theme]);


  // --- 1. Supabase Search Logic (REAL DATA) ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        // NOTE: Removed 'slug' as requested because it's not in DB structure. Using ID for links.
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image, category') 
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(8); // Limited to 8 for cleaner UI

        if (error) throw error;
        setSuggestions(data || []);
        
      } catch (error) {
        console.error('Search Error:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  // --- UI Effects & Menu Animation ---
  useEffect(() => {
    if (menuOpen) { document.body.style.overflow = 'hidden'; } 
    else { document.body.style.overflow = ''; }
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setSuggestions([]); 
  }, [location.pathname]);

  // Menu Open/Close Animation
  useEffect(() => {
    if (menuOpen && menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(menuBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      tl.fromTo(menuRef.current, { opacity: 0, y: -50, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.2');
      tl.fromTo(menuItemsRef.current.filter(Boolean), 
        { opacity: 0, y: 50, rotationX: -20 }, 
        { opacity: 1, y: 0, rotationX: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out' }, 
        '-=0.3'
      );
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    if (menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline({ onComplete: () => setMenuOpen(false) });
      tl.to(menuItemsRef.current.filter(Boolean).reverse(), { opacity: 0, y: 20, duration: 0.2, stagger: 0.02 });
      tl.to(menuRef.current, { opacity: 0, y: -30, scale: 0.95, duration: 0.3, ease: 'power2.in' });
      tl.to(menuBackdropRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');
    } else {
      setMenuOpen(false);
    }
  }, []);

  // Helper class for Reactive Buttons
  const reactiveBtnClass = `relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 
    hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95
    before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity`;

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
    <header 
      ref={headerRef}
      className="fixed top-0 z-50 w-full transition-all will-change-transform border-b border-transparent"
      // Initial styles are handled by GSAP ScrollTrigger above
    >
      <div className="container mx-auto px-2 md:px-4 h-16 flex items-center justify-between">
        
        {/* --- BRANDING: MIRAE. --- */}
        <Link ref={logoRef} to="/" className="flex items-center relative z-[60] group">
          <span className="mirae-text text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-sm transition-all">
            MIRAE.
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
          {['/', '/products', '/mepco-bill'].map((path) => {
            const isActive = location.pathname === path || (path === '/products' && location.pathname.startsWith('/products/'));
             const label = path === '/' ? 'Home' : path === '/products' ? 'Products' : 'Bill Checker';
            return (
              <Link key={path} to={path} className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95 ${isActive ? 'text-slate-900 bg-gradient-to-r from-amber-300 to-yellow-500 shadow-lg shadow-amber-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'}`}>
                {label}
                 {isActive && <div className="absolute inset-0 bg-white/20 mix-blend-overlay animate-pulse rounded-xl"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Icons Actions */}
        <div className="flex items-center gap-1 md:gap-2 relative z-[60]">
          <button 
            onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} 
            className={`${reactiveBtnClass} ${menuOpen ? 'text-white' : 'text-foreground'}`}
          >
            {searchOpen && !menuOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5" />}
          </button>

          <button 
            onClick={toggleTheme} 
            className={`${reactiveBtnClass} ${menuOpen ? 'text-white' : 'text-foreground'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* Cart Badge */}
          <Link to="/cart" className={`${reactiveBtnClass} md:hidden ${menuOpen ? 'text-white' : 'text-foreground'}`}>
             <ShoppingCart className="w-5 h-5" />
             {itemCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </Link>

          {/* Menu Toggle */}
          <button onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)} className={`${reactiveBtnClass} ${menuOpen ? 'text-white' : 'text-foreground'}`}>
            <div className="relative w-5 h-5 flex flex-col justify-center items-center gap-[5px]">
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0 scale-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </div>
            {(itemCount > 0 || wishlistCount > 0) && !menuOpen && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* --- SEARCH OVERLAY (Real Data) --- */}
      {searchOpen && !menuOpen && (
        <div className="px-4 pb-6 animate-in slide-in-from-top-4 duration-300 ease-out">
          <div className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative z-20 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
              <input
                id="search-input"
                type="text"
                placeholder="Search for anything..."
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl text-base focus:outline-none border border-white/10 focus:border-amber-500/50 shadow-xl text-foreground placeholder:text-muted-foreground transition-all"
              />
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            </form>

            {/* Suggestions Dropdown */}
            {searchTerm.trim() && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                {isSearching ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    <span>Searching cosmos...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto p-2">
                    {suggestions.map((product, idx) => (
                      <Link
                        key={product.id || idx}
                        // FIX: Using ID because slug was removed from query
                        to={`/products/${product.id}`}
                        onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/10 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                           {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <Package className="w-6 h-6 m-auto text-muted-foreground" />}
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate group-hover:text-amber-500 transition-colors">{product.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{product.category} • <span className="text-amber-500 font-medium">Rs. {product.price?.toLocaleString()}</span></p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center gap-3 text-muted-foreground">
                    <AlertCircle className="w-10 h-10 opacity-30 text-amber-500" />
                    <p className="font-medium text-foreground text-lg">Nothing found</p>
                    <p className="text-sm">We couldn't find anything for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- FULL SCREEN MENU --- */}
      {menuOpen && (
        <>
          <div ref={menuBackdropRef} className="fixed inset-0 z-40 bg-gradient-to-br from-slate-950 via-[#1a1440] to-slate-950 opacity-0" onClick={closeMenu} />
          
          {/* Particles Background */}
          <div ref={particlesRef} className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
            <Sparkles className="absolute top-[10%] right-[20%] w-12 h-12 text-amber-500/30 animate-pulse" style={{animationDuration: '3s'}} />
            <Sparkles className="absolute bottom-[20%] left-[10%] w-8 h-8 text-purple-500/30 animate-pulse" style={{animationDuration: '4s'}}/>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
          </div>

          <div ref={menuRef} className="fixed inset-x-0 top-20 bottom-0 z-50 overflow-hidden flex flex-col pointer-events-auto rounded-t-[3rem] bg-white/5 border-t border-white/20 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
            <div className="flex-1 h-full overflow-y-auto p-6 pb-24">
              <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
                {menuItems.map((item, index) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link 
                        key={item.to} 
                        ref={el => menuItemsRef.current[index] = el} 
                        to={item.to} 
                        onClick={closeMenu} 
                        className={`relative flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all duration-300 group overflow-hidden perspective-1000
                            ${isActive ? 'bg-gradient-to-br from-amber-500/20 to-purple-500/20 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:-translate-y-2'}`
                        }
                    >
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className="w-7 h-7 text-white relative z-10" />
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} blur-md opacity-70 -z-0 group-hover:blur-xl transition-all`} />
                      </div>
                      <span className={`font-bold text-base ${isActive ? 'text-amber-400' : 'text-white group-hover:text-amber-300'}`}>{item.label}</span>
                      
                      {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute top-4 right-4 min-w-[28px] h-7 px-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-lg scale-100 group-hover:scale-110 transition-transform">
                              {item.badge}
                          </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
