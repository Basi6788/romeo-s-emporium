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
  const menuContainerRef = useRef<HTMLDivElement>(null); // Main container for centering
  const menuContentRef = useRef<HTMLDivElement>(null); // The actual menu box
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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
        console.error('Search Error:', error);
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
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      
      // Floating Header Animation
      if (headerRef.current) {
        gsap.to(headerRef.current, {
          y: isScrolled ? 10 : 0,
          width: isScrolled ? '95%' : '100%',
          borderRadius: isScrolled ? '24px' : '0px',
          backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
          border: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setSuggestions([]); 
  }, [location.pathname]);

  // --- GSAP Menu Animation (Center Pop-up) ---
  useEffect(() => {
    if (menuOpen && menuContentRef.current && menuBackdropRef.current && menuContainerRef.current) {
      const tl = gsap.timeline();
      
      // 1. Backdrop Fade In
      tl.fromTo(menuBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      
      // 2. Menu Container Visible
      tl.set(menuContainerRef.current, { visibility: 'visible' }, 0);

      // 3. Menu Box Pop-up Animation (Center & Scale)
      tl.fromTo(menuContentRef.current, 
        { scale: 0.8, opacity: 0, y: 20 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }, 
        0.1
      );

      // 4. Items Stagger In
      tl.fromTo(menuItemsRef.current.filter(Boolean), 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 
        0.3
      );
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    if (menuContentRef.current && menuBackdropRef.current && menuContainerRef.current) {
      const tl = gsap.timeline({ onComplete: () => { setMenuOpen(false); gsap.set(menuContainerRef.current, { visibility: 'hidden' }); } });
      
      // 1. Items Fade Out
      tl.to(menuItemsRef.current.filter(Boolean).reverse(), { opacity: 0, y: 10, duration: 0.2, stagger: 0.03 });
      
      // 2. Menu Box Pop-down Animation
      tl.to(menuContentRef.current, { scale: 0.9, opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' }, 0.1);
      
      // 3. Backdrop Fade Out
      tl.to(menuBackdropRef.current, { opacity: 0, duration: 0.3 }, 0.2);
    } else {
      setMenuOpen(false);
    }
  }, []);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Collection', icon: Package },
    { to: '/mepco-bill', label: 'Bill Checker', icon: Zap },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  // Reactive Button Hover Effect
  const handleBtnHover = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
    gsap.to(e.currentTarget, { 
      scale: enter ? 1.1 : 1, 
      color: enter ? '#fbbf24' : 'currentColor', // Amber-400 on hover
      textShadow: enter ? '0 0 8px rgba(251, 191, 36, 0.5)' : 'none',
      duration: 0.3, 
      ease: 'elastic.out(1, 0.3)' 
    });
  };

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-full">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Name - Golden & Glowing */}
            <Link to="/" className="flex items-center gap-2 relative z-[60] group">
              <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                MIRAE.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
              {['/', '/products'].map((path) => (
                <Link key={path} to={path} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === path ? 'bg-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                  {path === '/' ? 'Home' : 'Shop'}
                </Link>
              ))}
               <Link to="/mepco-bill" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === '/mepco-bill' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                  Bills
                </Link>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-2 relative z-[60]">
              <button 
                onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} 
                onMouseEnter={(e) => handleBtnHover(e, true)} onMouseLeave={(e) => handleBtnHover(e, false)}
                className={`p-2.5 rounded-full transition-all ${menuOpen ? 'text-white' : 'text-foreground'}`}
              >
                {searchOpen && !menuOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5" />}
              </button>
              <button 
                onClick={toggleTheme} 
                onMouseEnter={(e) => handleBtnHover(e, true)} onMouseLeave={(e) => handleBtnHover(e, false)}
                className={`p-2.5 rounded-full transition-all ${menuOpen ? 'text-white' : 'text-foreground'}`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)} 
                onMouseEnter={(e) => handleBtnHover(e, true)} onMouseLeave={(e) => handleBtnHover(e, false)}
                className={`p-2.5 rounded-full transition-all relative ${menuOpen ? 'text-white' : 'text-foreground'}`}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                {(itemCount > 0 || wishlistCount > 0) && !menuOpen && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              </button>
            </div>
          </div>

          {/* Search Bar Dropdown */}
          {searchOpen && !menuOpen && (
            <div className="pb-4 animate-in slide-in-from-top-2 duration-200 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search MIRAE..."
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-xl rounded-2xl text-sm text-white placeholder:text-white/50 border border-white/10 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </form>

              {/* Search Results */}
              {searchTerm.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  {isSearching ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-2 text-white/60">
                      <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                      <span>Searching...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                      {suggestions.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.slug || product.id}`}
                          onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                          className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-colors group"
                        >
                          {product.image ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                               <img src={product.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                              <Package className="w-6 h-6 text-white/40 group-hover:text-amber-400 transition-colors" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">{product.name}</p>
                            <p className="text-xs text-white/60 truncate">{product.category || 'Product'} • <span className="text-amber-400">Rs. {product.price?.toLocaleString()}</span></p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center gap-3 text-white/60">
                      <AlertCircle className="w-10 h-10 opacity-30" />
                      <p className="font-medium text-white">No results found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* --- 3D CENTERED MENU MODAL --- */}
      <div 
        ref={menuContainerRef} 
        className="fixed inset-0 z-[100] flex items-center justify-center invisible" // Centering container
      >
        {/* 1. Backdrop Blur */}
        <div 
          ref={menuBackdropRef} 
          className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          onClick={closeMenu} 
        />
        
        {/* 2. The 3D Menu Box */}
        <div 
          ref={menuContentRef} 
          className="relative w-[90%] max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden p-6"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Menu Header: Brand & Close */}
          <div className="flex items-center justify-between mb-8 relative z-10">
             <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                MIRAE.
             </span>
             <button 
               onClick={closeMenu}
               className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all hover:rotate-90 duration-300"
             >
               <X size={20} />
             </button>
          </div>

          {/* Menu Grid Items */}
          <nav className="grid grid-cols-2 gap-4 relative z-10">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.to;
              return (
                <Link 
                  key={item.to} 
                  ref={el => menuItemsRef.current[index] = el} 
                  to={item.to} 
                  onClick={closeMenu} 
                  className={`group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-amber-500/20 border-amber-500/40 shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-lg'}`}
                >
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/70 group-hover:text-white group-hover:bg-white/10'} transition-all relative`}>
                    <item.icon className="w-6 h-6" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0a0a0a]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold text-sm ${isActive ? 'text-amber-400' : 'text-white/70 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
