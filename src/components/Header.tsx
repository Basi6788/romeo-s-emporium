import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Zap, Menu, AlertCircle } from 'lucide-react';
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
  
  // States
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
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuBoxRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // --- Search Logic ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) { setSuggestions([]); return; }
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, price, image, category, description') 
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(6);
        setSuggestions(data || []);
      } catch (error) { console.error(error); } 
      finally { setIsSearching(false); }
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
    }
  };

  // --- SCROLL LOGIC (FORCE FULL WIDTH FIX) ---
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
      if (headerRef.current) {
        // Force header to span full width but contain content
        gsap.to(headerRef.current, {
          backgroundColor: isScrolled ? 'rgba(0,0,0,0.8)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
          borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
          height: isScrolled ? '60px' : '70px',
          duration: 0.3
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- MENU ANIMATION (FORCE CENTER FIX) ---
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      
      const tl = gsap.timeline();
      // 1. Overlay opacity
      tl.to(menuOverlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
      
      // 2. Box Scale Up from Center
      tl.fromTo(menuBoxRef.current, 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' },
        '-=0.1'
      );

      // 3. Items Slide Up
      tl.fromTo(menuItemsRef.current.filter(Boolean),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.3 },
        '-=0.2'
      );
    } else {
      document.body.style.overflow = '';
      const tl = gsap.timeline();
      tl.to(menuBoxRef.current, { scale: 0.9, opacity: 0, duration: 0.2 });
      tl.to(menuOverlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.2 }, '-=0.1');
    }
  }, [menuOpen]);

  // Reset on route change
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location.pathname]);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Collection', icon: Package },
    { to: '/mepco-bill', label: 'Bill Checker', icon: Zap },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Profile' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  return (
    <>
      {/* HEADER - Removed centering transforms, using direct placement */}
      <header 
        ref={headerRef} 
        className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 flex items-center justify-center border-b border-transparent"
      >
        <div className="container mx-auto px-4 w-full flex items-center justify-between h-full">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-md z-[60]">
            MIRAE.
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
            {['/', '/products', '/mepco-bill'].map((path) => (
              <Link key={path} to={path} className={`text-sm font-medium transition-colors ${location.pathname === path ? 'text-amber-400' : 'text-white/70 hover:text-white'}`}>
                {path === '/' ? 'Home' : path === '/products' ? 'Shop' : 'Bills'}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 z-[60]">
             <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-white hover:text-amber-400 transition-colors">
               {searchOpen ? <X size={20}/> : <Search size={20} />}
             </button>
             <button onClick={toggleTheme} className="p-2 text-white hover:text-amber-400 transition-colors hidden sm:block">
               {theme === 'dark' ? <Sun size={20}/> : <Moon size={20} />}
             </button>
             <button onClick={() => setMenuOpen(true)} className="p-2 text-white hover:text-amber-400 transition-colors relative">
               <Menu size={24} />
               {(itemCount > 0 || wishlistCount > 0) && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />}
             </button>
          </div>
        </div>

        {/* Search Overlay (Absolute to Header) */}
        {searchOpen && (
           <div className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 animate-in slide-in-from-top-2">
             <div className="container mx-auto max-w-2xl">
               <form onSubmit={handleSearchSubmit} className="relative">
                 <Search className="absolute left-4 top-3.5 text-white/50" size={18} />
                 <input 
                    autoFocus
                    type="text" 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500"
                 />
               </form>
               {suggestions.length > 0 && (
                 <div className="mt-2 bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                   {suggestions.map(p => (
                     <Link key={p.id} to={`/products/${p.id}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                       <img src={p.image || ''} alt="" className="w-10 h-10 rounded bg-white/10 object-cover" />
                       <div className="text-sm">
                         <p className="text-white font-medium">{p.name}</p>
                         <p className="text-amber-400 text-xs">Rs. {p.price}</p>
                       </div>
                     </Link>
                   ))}
                 </div>
               )}
             </div>
           </div>
        )}
      </header>

      {/* --- NEW MENU SYSTEM (Completely Separate from Header) --- */}
      <div 
        ref={menuOverlayRef}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-lg flex items-center justify-center opacity-0 pointer-events-none"
        style={{ margin: 0, padding: 0 }} // Hard reset
      >
         <div className="absolute inset-0" onClick={() => setMenuOpen(false)} /> {/* Click outside to close */}

         <div 
           ref={menuBoxRef}
           className="relative bg-[#0f0f0f] w-[90%] max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl transform scale-90 opacity-0"
         >
            {/* Header inside Menu */}
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <span className="text-xl font-bold text-white tracking-widest">MIRAE.</span>
              <button onClick={() => setMenuOpen(false)} className="bg-white/10 p-2 rounded-full text-white hover:bg-red-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-2 gap-3">
              {menuItems.map((item, i) => {
                 const isActive = location.pathname === item.to;
                 return (
                   <Link 
                     key={item.to}
                     ref={el => menuItemsRef.current[i] = el}
                     to={item.to}
                     onClick={() => setMenuOpen(false)}
                     className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${isActive ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:scale-105'}`}
                   >
                     <item.icon size={24} />
                     <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                     {item.badge ? <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" /> : null}
                   </Link>
                 )
              })}
            </div>
         </div>
      </div>
    </>
  );
};

export default Header;
