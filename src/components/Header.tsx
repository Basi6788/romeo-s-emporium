import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, Zap, MapPin, LogIn, Settings, Sparkles, X, Menu as MenuIcon, Loader2, ArrowRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- Reactive Button Component (Touch & Mouse) ---
const ReactiveBtn = ({ children, onClick, className }) => {
  const btnRef = useRef(null);

  const handleEnter = () => {
    gsap.to(btnRef.current, { 
      scale: 1.15, 
      duration: 0.4, 
      ease: "elastic.out(1, 0.3)" 
    });
    gsap.to(btnRef.current, { 
      textShadow: "0 0 12px rgba(255,255,255,0.6)", 
      filter: "brightness(1.2)",
      duration: 0.2 
    });
  };

  const handleLeave = () => {
    gsap.to(btnRef.current, { 
      scale: 1, 
      duration: 0.3, 
      ease: "power2.out" 
    });
    gsap.to(btnRef.current, { 
      textShadow: "none", 
      filter: "brightness(1)",
      duration: 0.2 
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
      className={`relative flex items-center justify-center transition-colors active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
};

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  
  // UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs
  const headerWrapperRef = useRef(null);
  const headerContentRef = useRef(null);
  const menuContainerRef = useRef(null);
  const menuWindowRef = useRef(null);
  const searchContainerRef = useRef(null);

  // --- Scroll & Floating Effect ---
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      
      if (headerContentRef.current) {
        if (isScrolled) {
          // Floating Glass Pill Mode
          gsap.to(headerContentRef.current, {
            width: "92%",
            marginTop: "1rem",
            borderRadius: "24px",
            backgroundColor: "rgba(15, 15, 15, 0.65)", // Darker glass base
            backdropFilter: "blur(24px) saturate(180%)", // Heavy blur for liquid feel
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 15px 40px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            duration: 0.6,
            ease: "power4.out"
          });
        } else {
          // Full Width Transparent Mode
          gsap.to(headerContentRef.current, {
            width: "100%",
            marginTop: "0",
            borderRadius: "0px",
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(0px)",
            border: "1px solid rgba(255, 255, 255, 0)",
            boxShadow: "none",
            duration: 0.6,
            ease: "power4.out"
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
          .select('id, name, price, image, category, slug') 
          .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(5);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSuggestions([]);
    }
  };

  // --- 3D Window Menu Animation ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (menuOpen) {
        // Lock Body Scroll
        document.body.style.overflow = 'hidden';
        
        // 1. Fade in backdrop
        gsap.to(menuContainerRef.current, { 
          autoAlpha: 1, 
          duration: 0.4 
        });

        // 2. Open Window (Scale + RotateX + Blur clearance)
        gsap.fromTo(menuWindowRef.current, 
          { 
            scale: 0.85, 
            opacity: 0, 
            rotationX: 10,
            y: 40
          },
          { 
            scale: 1, 
            opacity: 1, 
            rotationX: 0, 
            y: 0,
            duration: 0.8, 
            ease: "elastic.out(1, 0.75)" 
          }
        );

        // 3. Stagger items
        gsap.fromTo(".menu-item", 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
        );

      } else {
        // Unlock Body Scroll
        document.body.style.overflow = '';

        // Close Animation
        gsap.to(menuWindowRef.current, { 
          scale: 0.9, 
          opacity: 0, 
          y: 20,
          duration: 0.3, 
          ease: "power2.in" 
        });

        gsap.to(menuContainerRef.current, { 
          autoAlpha: 0, 
          duration: 0.3, 
          delay: 0.1 
        });
      }
    });
    return () => ctx.revert();
  }, [menuOpen]);

  // Menu Items Config
  const menuItems = [
    { to: '/', label: 'Home', icon: Home, desc: 'Start here' },
    { to: '/products', label: 'Collections', icon: Package, desc: 'Explore all items' },
    { to: '/cart', label: 'My Cart', icon: ShoppingCart, badge: itemCount, desc: 'View your bag' },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, desc: 'Saved items' },
    { to: '/track-order', label: 'Track Order', icon: MapPin, desc: 'Shipping status' },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Profile' : 'Sign In', icon: isAuthenticated ? User : LogIn, desc: 'Account settings' },
  ];

  return (
    <>
      {/* --- Main Header Wrapper --- */}
      {/* Fixed positioning to float over content without layout shift */}
      <div ref={headerWrapperRef} className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none h-24">
        
        {/* --- Floating Content --- */}
        <div 
          ref={headerContentRef} 
          className="pointer-events-auto flex items-center justify-between px-6 py-4 w-full h-[70px] transition-all will-change-transform"
          style={{
             // Initial transparent state handled by GSAP
             backgroundColor: 'transparent',
          }}
        >
          
          {/* Logo: Golden Gradient */}
          <Link to="/" className="relative group z-50">
            <span className="text-2xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] drop-shadow-[0_2px_12px_rgba(255,215,0,0.3)] filter hover:brightness-125 transition-all duration-300">
              MIRAE.
            </span>
          </Link>

          {/* Center Nav (Desktop Only) - Glass Capsule */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1.5 absolute left-1/2 -translate-x-1/2 shadow-lg">
            {['/', '/products', '/about'].map((path) => (
              <Link 
                key={path} 
                to={path} 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden ${location.pathname === path ? 'text-black shadow-lg font-bold' : 'text-white/60 hover:text-white'}`}
              >
                {/* Active Indicator Background */}
                {location.pathname === path && (
                   <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-500 rounded-full opacity-100 z-[-1]" />
                )}
                {path === '/' ? 'Home' : path === '/products' ? 'Shop' : 'About'}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <ReactiveBtn onClick={() => { setSearchOpen(!searchOpen); }} className="p-2.5 rounded-full hover:bg-white/10 text-white/90">
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </ReactiveBtn>

            <ReactiveBtn onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-white/10 text-white/90 hidden sm:flex">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </ReactiveBtn>

            {/* Menu Trigger Hamburger */}
            <ReactiveBtn onClick={() => setMenuOpen(true)} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white group">
               <div className="flex flex-col gap-1.5 items-end w-6">
                  <span className="w-full h-0.5 bg-gradient-to-r from-amber-200 to-amber-500 rounded-full group-hover:w-4 transition-all duration-300"></span>
                  <span className="w-2/3 h-0.5 bg-white rounded-full group-hover:w-full transition-all duration-300"></span>
               </div>
            </ReactiveBtn>
          </div>
        </div>
      </div>

      {/* --- Search Overlay (Minimal) --- */}
      {searchOpen && (
        <div ref={searchContainerRef} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 flex flex-col items-center pt-32 px-4">
            <button onClick={() => setSearchOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} strokeWidth={1} />
            </button>
            
            <div className="w-full max-w-2xl relative">
              <form onSubmit={handleSearchSubmit} className="relative group transform transition-all hover:scale-[1.01]">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for perfection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-2xl py-6 pl-8 pr-16 text-2xl font-light tracking-wide focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                />
                <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-400 opacity-60 hover:opacity-100 transition-opacity">
                  <ArrowRight size={28} />
                </button>
              </form>

              {/* Suggestions Panel */}
              {searchTerm && (
                <div className="mt-6 w-full bg-[#0F0F0F]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
                  {isSearching ? (
                    <div className="p-8 flex justify-center text-amber-400"><Loader2 className="animate-spin w-8 h-8" /></div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item, i) => (
                      <Link 
                        key={item.id} 
                        to={`/products/${item.slug || item.id}`}
                        onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-all group"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                         <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden border border-white/5">
                           {item.image ? (
                             <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={20}/></div>
                           )}
                         </div>
                         <div className="flex-1">
                           <h4 className="text-lg text-white font-medium group-hover:text-amber-400 transition-colors">{item.name}</h4>
                           <p className="text-white/40 text-sm">{item.category}</p>
                         </div>
                         <span className="text-amber-200 font-mono pr-4">Rs. {item.price}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center text-white/30 italic">No treasures found matching that description.</div>
                  )}
                </div>
              )}
            </div>
        </div>
      )}

      {/* --- Central Menu Window (The Glass Window) --- */}
      <div 
        ref={menuContainerRef}
        className="fixed inset-0 z-[100] flex items-center justify-center invisible opacity-0"
      >
        {/* Darkened Backdrop */}
        <div 
          className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm transition-colors" 
          onClick={() => setMenuOpen(false)} 
        />
        
        {/* The Window Itself */}
        <div 
          ref={menuWindowRef}
          className="relative w-[90%] max-w-[500px] bg-[#121212]/80 backdrop-filter backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Glass Glossy Effect (Top Gradient) */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          {/* Header of Window */}
          <div className="relative flex justify-between items-center px-8 pt-8 pb-4 border-b border-white/5 z-10">
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Menu</h2>
               <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Navigation</p>
             </div>
             <ReactiveBtn onClick={() => setMenuOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5">
               <X size={20} />
             </ReactiveBtn>
          </div>

          {/* Menu Grid */}
          <div className="p-4 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto relative z-10 custom-scrollbar">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.to;
              return (
                <Link 
                  key={idx} 
                  to={item.to} 
                  onClick={() => setMenuOpen(false)}
                  className={`menu-item group relative flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500/20' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}`}
                >
                  <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(255,191,0,0.4)]' : 'bg-white/5 text-white/50 group-hover:text-white group-hover:bg-white/10'}`}>
                    <item.icon size={22} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-semibold ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{item.label}</span>
                      {item.badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">{item.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">{item.desc}</p>
                  </div>

                  <ArrowRight size={16} className={`text-white/20 transform transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </Link>
              );
            })}
          </div>

          {/* Footer of Window */}
          <div className="p-6 bg-black/20 border-t border-white/5 flex justify-between items-center relative z-10">
            <div className="flex gap-4">
              <a href="#" className="text-white/20 hover:text-amber-400 transition-colors"><span className="sr-only">Insta</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            </div>
            {!isAuthenticated && (
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="text-sm font-bold text-amber-400 hover:text-amber-300 tracking-wider uppercase">
                Join MIRAE
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

