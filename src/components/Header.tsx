import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, Sparkles, X, Zap, AlertCircle, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react'; // Make sure to install: npm install @gsap/react

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
  
  // Refs for Animations
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  
  // --- 1. Supabase Search Logic (Preserved) ---
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

  // --- Scroll & Route Effects ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setSuggestions([]); 
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [menuOpen]);

  // --- GSAP Animations ---

  // Logo Animation (Hover Glow & Spread)
  const handleLogoHover = (isHovering: boolean) => {
    if (!logoRef.current) return;
    if (isHovering) {
      gsap.to(logoRef.current, {
        letterSpacing: "0.1em",
        textShadow: "0 0 20px rgba(212, 175, 55, 0.8), 0 0 40px rgba(191, 149, 63, 0.4)",
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out"
      });
    } else {
      gsap.to(logoRef.current, {
        letterSpacing: "0",
        textShadow: "none",
        scale: 1,
        duration: 0.4,
        ease: "power2.inOut"
      });
    }
  };

  // Button Hover Animation (3D Rotate & Rainbow)
  const animateButton = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, enter: boolean) => {
    const target = e.currentTarget;
    const icon = target.querySelector('svg');
    
    if (enter) {
      // Button Background Gradient & Glow
      gsap.to(target, {
        background: "linear-gradient(135deg, rgba(255,0,150,0.2), rgba(0,204,255,0.2))",
        boxShadow: "0 0 15px rgba(255,255,255,0.3)",
        scale: 1.1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      // Icon 3D Rotation
      if (icon) {
        gsap.to(icon, {
          rotation: 360,
          scale: 1.2,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        });
      }
    } else {
      gsap.to(target, {
        background: "transparent",
        boxShadow: "none",
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      if (icon) {
        gsap.to(icon, {
          rotation: 0,
          scale: 1,
          duration: 0.3
        });
      }
    }
  };

  // Menu Animation
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(menuBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      tl.fromTo(menuRef.current, { x: '-100%' }, { x: '0%', duration: 0.5, ease: 'power3.out' }, '-=0.1');
      tl.fromTo(menuItemsRef.current.filter(Boolean), 
        { x: -50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.2)' }, '-=0.3'
      );
    }
  }, [menuOpen]);

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
      {/* Spacer div to prevent content from jumping because header is fixed */}
      <div className="h-24 md:h-28 w-full" />

      <header 
        ref={headerRef}
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${scrolled 
            ? 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]' 
            : 'bg-transparent border border-transparent'}
          rounded-2xl md:top-6 md:left-8 md:right-8 md:rounded-full`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            
            {/* Left Section: Menu Button & Logo */}
            <div className="flex items-center gap-4">
              {/* Menu Toggle Button (Left Side) */}
              <button 
                onClick={() => setMenuOpen(true)}
                onMouseEnter={(e) => animateButton(e, true)}
                onMouseLeave={(e) => animateButton(e, false)}
                className="p-2 rounded-full text-foreground hover:text-primary transition-colors relative group"
              >
                <Menu className="w-6 h-6" />
                {(itemCount > 0 || wishlistCount > 0) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </button>

              {/* LOGO: MIRAE. (Golden & Animated) */}
              <Link 
                to="/" 
                ref={logoRef}
                onMouseEnter={() => handleLogoHover(true)}
                onMouseLeave={() => handleLogoHover(false)}
                className="relative z-[60] select-none"
              >
                <span 
                  className="text-2xl md:text-3xl font-black tracking-tight"
                  style={{
                    background: 'linear-gradient(to bottom, #FBF5B7 0%, #BF953F 40%, #AA771C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))'
                  }}
                >
                  MIRAE.
                </span>
              </Link>
            </div>

            {/* Middle Section: Desktop Nav (Optional, kept minimal) */}
            <nav className="hidden lg:flex items-center gap-2">
               {['/', '/products'].map((path) => (
                  <Link 
                    key={path} 
                    to={path}
                    onMouseEnter={(e) => animateButton(e, true)}
                    onMouseLeave={(e) => animateButton(e, false)}
                    className="px-6 py-2 rounded-full text-sm font-semibold text-foreground/80 hover:text-white transition-all border border-transparent hover:border-white/10"
                  >
                    {path === '/' ? 'Home' : 'Collection'}
                  </Link>
               ))}
            </nav>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search Toggle */}
              <button 
                onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} 
                onMouseEnter={(e) => animateButton(e, true)}
                onMouseLeave={(e) => animateButton(e, false)}
                className="p-2.5 rounded-full text-foreground transition-all"
              >
                {searchOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5" />}
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                onMouseEnter={(e) => animateButton(e, true)}
                onMouseLeave={(e) => animateButton(e, false)}
                className="p-2.5 rounded-full text-foreground transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
               {/* Cart (Desktop) */}
               <Link 
                  to="/cart"
                  onMouseEnter={(e) => animateButton(e, true)}
                  onMouseLeave={(e) => animateButton(e, false)}
                  className="hidden md:flex p-2.5 rounded-full text-foreground relative"
               >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 text-[10px] bg-primary text-white rounded-full flex items-center justify-center border border-background">{itemCount}</span>}
               </Link>
            </div>
          </div>

          {/* Search Bar Dropdown (Floating) */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-4 px-2 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-background/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-4 overflow-hidden relative">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative z-10">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search for luxury items..."
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#BF953F]/50 text-foreground placeholder:text-muted-foreground border border-white/10 transition-all"
                  />
                  {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />}
                </form>

                {/* Suggestions List */}
                {searchTerm.trim() && (
                  <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.slug || product.id}`}
                          onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                          className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-all group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted relative">
                             {product.image ? (
                               <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             ) : (
                               <Package className="w-6 h-6 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                             )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground group-hover:text-[#BF953F] transition-colors">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Rs. {product.price?.toLocaleString()}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                       !isSearching && (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No results found for "{searchTerm}"</p>
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

      {/* Full Screen Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            ref={menuBackdropRef} 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setMenuOpen(false)} 
          />
          
          {/* Menu Sidebar */}
          <div ref={menuRef} className="relative w-[85%] max-w-sm h-full bg-background/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Menu Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <span 
                className="text-2xl font-black tracking-tight"
                style={{
                    background: 'linear-gradient(to bottom, #FBF5B7 0%, #BF953F 40%, #AA771C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
              >
                MIRAE.
              </span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link 
                    key={item.to}
                    to={item.to}
                    ref={el => menuItemsRef.current[index] = el}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-foreground'}`}
                  >
                     <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                     <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-6 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                     <span className="font-medium">{item.label}</span>
                     {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                     )}
                  </Link>
                );
              })}
            </div>

            {/* Menu Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBF5B7] to-[#AA771C] flex items-center justify-center text-black font-bold">
                    M
                 </div>
                 <div>
                    <p className="text-sm font-semibold">MIRAE. Official</p>
                    <p className="text-xs text-muted-foreground">Luxury Experience</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
