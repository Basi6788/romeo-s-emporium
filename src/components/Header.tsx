import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Zap, Menu, Sparkles, ChevronRight } from 'lucide-react';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [isSearching, setIsSearching] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for Animations
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuModalRef = useRef<HTMLDivElement>(null);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  
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
          .limit(6); // Limit reduced for cleaner UI

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

  // Logo Animation
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

  // Button Interaction
  const animateButton = (buttonId: string) => {
    setActiveButton(buttonId);
    const target = document.getElementById(buttonId);
    const icon = target?.querySelector('svg');

    if (target && icon) {
      gsap.to(target, {
        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        boxShadow: "0 0 15px rgba(255,255,255,0.2)",
        scale: 0.95,
        duration: 0.2,
        ease: "power2.out"
      });
      gsap.to(icon, {
        rotate: 15,
        scale: 1.1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  };

  const revertButtonAnimation = (buttonId: string) => {
    if (activeButton === buttonId) {
        const target = document.getElementById(buttonId);
        const icon = target?.querySelector('svg');

        if (target && icon) {
          gsap.to(target, {
            background: "transparent",
            boxShadow: "none",
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          });
          gsap.to(icon, {
            rotate: 0,
            scale: 1,
            duration: 0.2
          });
        }
        setActiveButton(null);
    }
  };


  // NEW MENU ANIMATION (Center Window Pop-up)
  useEffect(() => {
    if (menuOpen && menuModalRef.current && menuBackdropRef.current) {
      // 1. Backdrop Fade In
      gsap.fromTo(menuBackdropRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );

      // 2. Modal Pop Up (3D Scale Effect)
      gsap.fromTo(menuModalRef.current,
        { 
          opacity: 0, 
          scale: 0.8, 
          y: 20,
          rotationX: 10,
          perspective: 1000 
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          rotationX: 0,
          duration: 0.5, 
          ease: "elastic.out(1, 0.75)",
          delay: 0.1
        }
      );

      // 3. Stagger Items
      gsap.fromTo(menuItemsRef.current.filter(Boolean),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.2, ease: "back.out(1.2)" }
      );
    }
  }, [menuOpen]);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home, desc: 'Start here' },
    { to: '/products', label: 'Collection', icon: Package, desc: 'Browse all items' },
    { to: '/mepco-bill', label: 'Bill Checker', icon: Zap, desc: 'Utility tools' },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, desc: 'Your favorites' },
    { to: '/cart', label: 'My Cart', icon: ShoppingCart, badge: itemCount, desc: 'View bag' },
    { to: '/track-order', label: 'Track Order', icon: MapPin, desc: 'Shipment status' },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn, desc: 'Manage profile' },
  ];

  return (
    <>
      {/* NOTE: Spacer div REMOVED intentionally. 
        Now the header floats directly OVER the hero image.
      */}

      <header 
        ref={headerRef}
        className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 ${scrolled ? 'top-2' : 'top-6'}`}
      >
        <div className={`
          relative w-full max-w-[95%] md:max-w-5xl h-16 md:h-20 rounded-full
          flex items-center justify-between px-2 md:px-6
          transition-all duration-500
          ${scrolled 
            ? 'bg-black/30 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]' 
            : 'bg-white/5 backdrop-blur-[2px] border border-white/5 shadow-none'}
        `}>
          
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-2 md:gap-4 pl-2">
            <button 
              id="menu-btn"
              onClick={() => setMenuOpen(true)}
              onMouseDown={() => animateButton("menu-btn")}
              onMouseUp={() => revertButtonAnimation("menu-btn")}
              onTouchStart={() => animateButton("menu-btn")}
              onTouchEnd={() => revertButtonAnimation("menu-btn")}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Link 
              to="/" 
              ref={logoRef}
              onMouseEnter={() => handleLogoHover(true)}
              onMouseLeave={() => handleLogoHover(false)}
              className="select-none"
            >
              <span 
                className="text-2xl md:text-3xl font-black tracking-tighter"
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

          {/* Right: Actions */}
          <div className="flex items-center gap-2 pr-2">
            {/* Search */}
            <button 
              id="search-btn"
              onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} 
              onMouseDown={() => animateButton("search-btn")}
              onMouseUp={() => revertButtonAnimation("search-btn")}
              onTouchStart={() => animateButton("search-btn")}
              onTouchEnd={() => revertButtonAnimation("search-btn")}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-all"
            >
              {searchOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <Link 
              to="/cart"
              id="cart-btn"
              onMouseDown={() => animateButton("cart-btn")}
              onMouseUp={() => revertButtonAnimation("cart-btn")}
              onTouchStart={() => animateButton("cart-btn")}
              onTouchEnd={() => revertButtonAnimation("cart-btn")}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-all relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#BF953F] rounded-full border border-black shadow-[0_0_8px_#BF953F]" />
              )}
            </Link>
          </div>

          {/* Search Dropdown (Integrated Glass Style) */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-4 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl overflow-hidden">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    id="search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search luxury..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#BF953F]/50 transition-all"
                  />
                </form>
                
                {suggestions.length > 0 && (
                  <div className="mt-4 grid gap-2">
                    {suggestions.map((p) => (
                      <Link key={p.id} to={`/products/${p.slug || p.id}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden">
                          {p.image && <img src={p.image} className="w-full h-full object-cover" alt=""/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{p.name}</p>
                          <p className="text-xs text-[#BF953F]">Rs. {p.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* -------------------------------------------
        NEW CENTERED 3D GLASS MENU MODAL
        -------------------------------------------
      */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* 1. Dark Blur Backdrop */}
          <div 
            ref={menuBackdropRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setMenuOpen(false)}
          />

          {/* 2. Glass Window (Centered) */}
          <div 
            ref={menuModalRef}
            className="relative w-full max-w-md bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }}
          >
            {/* Window Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
               <span className="text-lg font-medium text-white/40 tracking-widest uppercase">Menu</span>
               <button 
                 onClick={() => setMenuOpen(false)}
                 className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all border border-white/5"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Grid Links */}
            <div className="p-4 grid gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {menuItems.map((item, i) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    ref={el => menuItemsRef.current[i] = el}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      group flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300
                      ${isActive 
                        ? 'bg-[#BF953F]/20 border-[#BF953F]/30' 
                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-[#BF953F] text-black shadow-[0_0_15px_#BF953F]' : 'bg-white/5 text-white group-hover:scale-110'}
                    `}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${isActive ? 'text-[#BF953F]' : 'text-white'}`}>
                          {item.label}
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 font-medium">{item.desc}</p>
                    </div>

                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-[#BF953F] translate-x-1' : 'text-white/20 group-hover:text-white group-hover:translate-x-1'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Window Footer (Theme Toggle) */}
            <div className="p-6 bg-black/20 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBF5B7] to-[#AA771C] flex items-center justify-center text-black font-bold">M</div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-white">MIRAE.</span>
                   <span className="text-[10px] text-white/50">Version 2.0</span>
                 </div>
              </div>
              
              <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-medium text-white transition-all">
                {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
