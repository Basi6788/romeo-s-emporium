import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, Zap, MapPin, LogIn, Sparkles, X, Loader2, Grid } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- 1. Reactive Button (Jelly/Glow Effect) ---
const ReactiveBtn = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    // Mouse enter: Scale up + Glow
    gsap.to(btnRef.current, { scale: 1.15, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    gsap.to(btnRef.current, { textShadow: "0 0 15px rgba(255,215,0,0.6)", color: "#FFD700", duration: 0.2 });
  };

  const handleLeave = () => {
    // Mouse leave: Back to normal
    gsap.to(btnRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { textShadow: "none", color: "currentColor", duration: 0.2 });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative transition-colors outline-none select-none ${className}`}
    >
      {children}
    </button>
  );
};

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  
  // UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for GSAP
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInnerRef = useRef<HTMLDivElement>(null); // For the glass container
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuWindowRef = useRef<HTMLDivElement>(null);

  // --- 2. Liquid Glass Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;

      if (headerInnerRef.current) {
        if (isScrolled) {
          // Scrolled State: Floating Glass Capsule
          gsap.to(headerInnerRef.current, {
            width: "85%", // Shrinks width
            marginTop: "1.5rem",
            borderRadius: "50px",
            backgroundColor: "rgba(10, 10, 10, 0.4)", // Darker glass
            backdropFilter: "blur(25px)", // Heavy Blur
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
            padding: "0.75rem 2rem", // Compact padding
            duration: 0.6,
            ease: "power4.out"
          });
        } else {
          // Top State: Full Transparent (Fixes layout issue)
          gsap.to(headerInnerRef.current, {
            width: "100%", // Full width
            marginTop: "0rem",
            borderRadius: "0px",
            backgroundColor: "rgba(0, 0, 0, 0)", // Transparent
            backdropFilter: "blur(0px)", // No Blur initially
            border: "1px solid rgba(255, 255, 255, 0)",
            boxShadow: "none",
            padding: "1.5rem 2.5rem", // Spacious padding
            duration: 0.6,
            ease: "power4.out"
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 3. Search Logic (Same as before) ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) { setSuggestions([]); return; }
      setIsSearching(true);
      try {
        const { data } = await supabase.from('products')
          .select('id, name, price, image, slug')
          .ilike('name', `%${searchTerm}%`)
          .limit(5);
        setSuggestions(data || []);
      } catch (error) { console.error(error); } 
      finally { setIsSearching(false); }
    };
    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // --- 4. 3D Menu Animation Logic ---
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      
      const tl = gsap.timeline();
      
      // Background Fade In
      tl.to(menuContainerRef.current, { opacity: 1, pointerEvents: "all", duration: 0.3 });
      
      // 3D Window Pop (Rotation + Scale)
      tl.fromTo(menuWindowRef.current, 
        { scale: 0.6, opacity: 0, rotationX: 45, y: 50 }, 
        { scale: 1, opacity: 1, rotationX: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.6)" }
      );
      
      // Items Stagger
      tl.fromTo(".menu-glass-item", 
        { y: 20, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.4, ease: "back.out(1.7)" }, 
        "-=0.6"
      );

    } else {
      document.body.style.overflow = '';
      
      const tl = gsap.timeline();
      // Animate Out
      tl.to(menuWindowRef.current, { scale: 0.8, opacity: 0, rotationX: -20, duration: 0.3, ease: "power2.in" });
      tl.to(menuContainerRef.current, { opacity: 0, pointerEvents: "none", duration: 0.2 }, "-=0.1");
    }
  }, [menuOpen]);

  // Menu Options
  const menuItems = [
    { to: '/', label: 'Home', icon: Home, desc: 'Start here' },
    { to: '/products', label: 'Collection', icon: Package, desc: 'Browse all' },
    { to: '/cart', label: 'My Cart', icon: ShoppingCart, badge: itemCount, desc: 'View items' },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, desc: 'Saved' },
    { to: '/mepco-bill', label: 'Bill Check', icon: Zap, desc: 'Utilities' },
    { to: '/track-order', label: 'Track Order', icon: MapPin, desc: 'Status' },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Profile' : 'Sign In', icon: isAuthenticated ? User : LogIn, desc: 'Account' },
  ];

  return (
    <>
      {/* ================= HEADER ================= */}
      <header 
        ref={headerRef} 
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
        {/* Inner Glass Container (This animates) */}
        <div 
          ref={headerInnerRef}
          className="pointer-events-auto flex items-center justify-between transition-all will-change-transform bg-transparent w-full px-10 py-6"
        >
          {/* LOGO: Golden MIRAE. */}
          <Link to="/" className="group relative z-10">
            <span className="text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-yellow-400 to-amber-700 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all duration-300 group-hover:scale-105 inline-block">
              MIRAE.
            </span>
          </Link>

          {/* Center Nav (Only Visible on Desktop) */}
          <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             {['/', '/products'].map((path) => (
                <Link key={path} to={path} className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${location.pathname === path ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                  {path === '/' ? 'Home' : 'Shop'}
                </Link>
             ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 text-white z-10">
            <ReactiveBtn onClick={() => {setSearchOpen(true); setTimeout(() => document.getElementById('search')?.focus(), 100)}} className="hover:text-amber-400">
               <Search size={22} strokeWidth={2.5} />
            </ReactiveBtn>

            <ReactiveBtn onClick={toggleTheme} className="hover:text-amber-400 hidden sm:block">
               {theme === 'dark' ? <Sun size={22} strokeWidth={2.5} /> : <Moon size={22} strokeWidth={2.5} />}
            </ReactiveBtn>

            {/* Hamburger (Custom Animated Icon) */}
            <ReactiveBtn onClick={() => setMenuOpen(true)} className="group pl-2">
               <div className="flex flex-col items-end gap-[5px]">
                  <span className="w-8 h-[3px] bg-white rounded-full group-hover:bg-amber-400 transition-colors shadow-lg"></span>
                  <span className="w-5 h-[3px] bg-white rounded-full group-hover:w-8 group-hover:bg-amber-400 transition-all shadow-lg"></span>
               </div>
            </ReactiveBtn>
          </div>
        </div>
      </header>

      {/* ================= SEARCH OVERLAY ================= */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
           <button onClick={() => setSearchOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32}/></button>
           <div className="flex flex-col items-center pt-32 px-4 w-full max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input 
                  id="search"
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="w-full bg-transparent border-b-2 border-white/20 py-4 text-3xl text-white placeholder:text-white/20 focus:border-amber-400 focus:outline-none transition-all font-light"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-0 top-4 text-amber-400"><Search size={30}/></button>
              </form>
              
              {/* Results Grid */}
              <div className="w-full mt-8 grid gap-2">
                 {isSearching ? <div className="text-white text-center py-10"><Loader2 className="animate-spin mx-auto"/></div> : 
                  suggestions.map(p => (
                    <Link key={p.id} to={`/products/${p.slug}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                       <img src={p.image} className="w-16 h-16 object-cover rounded-md opacity-70 group-hover:opacity-100" />
                       <div>
                          <h3 className="text-white font-medium text-lg group-hover:text-amber-400">{p.name}</h3>
                          <p className="text-white/50">Rs. {p.price}</p>
                       </div>
                    </Link>
                  ))
                 }
              </div>
           </div>
        </div>
      )}

      {/* ================= 3D GLASS MENU WINDOW ================= */}
      <div 
        ref={menuContainerRef}
        className="fixed inset-0 z-[70] flex items-center justify-center opacity-0 pointer-events-none perspective-[1000px]"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />

        {/* The Window */}
        <div 
          ref={menuWindowRef}
          className="relative w-[90%] max-w-[500px] bg-gradient-to-b from-[#1a1a1a]/90 to-black/95 border border-white/10 rounded-[2rem] p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
           {/* Glossy Reflection Effect */}
           <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
           
           {/* Header inside Menu */}
           <div className="flex justify-between items-center mb-6 pl-2 relative z-10">
              <div className="flex items-center gap-2 text-white/50 text-sm tracking-widest uppercase">
                 <Grid size={14}/> 
                 <span>Navigation</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors text-white">
                 <X size={20} />
              </button>
           </div>

           {/* Grid Links */}
           <div className="grid grid-cols-2 gap-3 relative z-10">
              {menuItems.map((item, idx) => {
                 const isActive = location.pathname === item.to;
                 return (
                    <Link 
                      key={idx}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={`menu-glass-item group relative flex flex-col p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isActive 
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(255,191,0,0.3)]' 
                        : 'bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <item.icon size={24} className={`mb-2 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                          {item.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 rounded-full shadow-lg">{item.badge}</span>}
                       </div>
                       <span className="font-bold text-lg leading-tight">{item.label}</span>
                       <span className={`text-xs mt-1 ${isActive ? 'text-black/70' : 'text-white/40'}`}>{item.desc}</span>
                       
                       {/* Hover Glint */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </Link>
                 )
              })}
           </div>
           
           <div className="mt-6 pt-4 border-t border-white/5 flex justify-center text-white/20 text-xs">
              <p>MIRAE. &copy; 2025</p>
           </div>
        </div>
      </div>
    </>
  );
};

export default Header;
