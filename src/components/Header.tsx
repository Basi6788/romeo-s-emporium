import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Zap, Menu, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- REUSABLE MAGNETIC BUTTON COMPONENT ---
// Ye component har button ko "Liquid/Magnetic" feel dega
const MagneticButton = ({ children, className, onClick, id }: any) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });

    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = btn.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Move button slightly towards mouse (Magnetic Effect)
      xTo(x * 0.3); 
      yTo(y * 0.3);
    };

    const mouseLeave = () => {
      xTo(0);
      yTo(0);
      // Rebound effect when mouse leaves
      gsap.to(btn, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };

    const mouseDown = () => {
        gsap.to(btn, { scale: 0.90, duration: 0.1 });
    };

    const mouseUp = () => {
        gsap.to(btn, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };

    btn.addEventListener("mousemove", mouseMove);
    btn.addEventListener("mouseleave", mouseLeave);
    btn.addEventListener("mousedown", mouseDown);
    btn.addEventListener("mouseup", mouseUp);
    btn.addEventListener("touchstart", mouseDown); // For Mobile
    btn.addEventListener("touchend", mouseUp);     // For Mobile

    return () => {
      btn.removeEventListener("mousemove", mouseMove);
      btn.removeEventListener("mouseleave", mouseLeave);
      btn.removeEventListener("mousedown", mouseDown);
      btn.removeEventListener("mouseup", mouseUp);
      btn.removeEventListener("touchstart", mouseDown);
      btn.removeEventListener("touchend", mouseUp);
    };
  }, []);

  return (
    <button ref={btnRef} className={className} onClick={onClick} id={id}>
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
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  
  // --- Search Logic ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) { setSuggestions([]); return; }
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image, category') 
        .or(`name.ilike.%${searchTerm}%`)
        .limit(5);
      setSuggestions(data || []);
    };
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Reset on Route Change ---
  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  // --- Menu Animation (Open/Close) ---
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'; // Stop background scroll
      
      const tl = gsap.timeline();
      
      // 1. Fade in Backdrop
      tl.to(".menu-backdrop", { opacity: 1, duration: 0.3, display: "block" });
      
      // 2. Slide/Fade in Menu Container
      tl.fromTo(menuContainerRef.current, 
        { y: '100%', opacity: 0, rotateX: -10 },
        { y: '0%', opacity: 1, rotateX: 0, duration: 0.6, ease: "power4.out" } // Elegant slide up
      );

      // 3. Stagger Items
      tl.fromTo(".menu-item", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.2)" },
        "-=0.4"
      );

    } else {
      document.body.style.overflow = '';
      gsap.to(".menu-backdrop", { opacity: 0, duration: 0.3, display: "none" });
      gsap.to(menuContainerRef.current, { y: '100%', opacity: 0, duration: 0.4, ease: "power2.in" });
    }
  }, [menuOpen]);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home, desc: 'Start here' },
    { to: '/products', label: 'Collection', icon: Package, desc: 'Browse all' },
    { to: '/mepco-bill', label: 'Bill Checker', icon: Zap, desc: 'Tools' },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, desc: 'Saved' },
    { to: '/cart', label: 'My Cart', icon: ShoppingCart, badge: itemCount, desc: 'Bag' },
    { to: '/track-order', label: 'Track Order', icon: MapPin, desc: 'Status' },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn, desc: 'Profile' },
  ];

  return (
    <>
      {/* --- HEADER BAR --- */}
      <header 
        ref={headerRef}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-out
          ${scrolled ? 'top-2 px-4' : 'top-0 px-0'}
        `}
      >
        <div className={`
          relative mx-auto flex items-center justify-between transition-all duration-500
          ${scrolled 
            ? 'h-16 max-w-5xl rounded-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50' 
            : 'h-20 max-w-full bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[0px] border-b border-white/0 px-6'}
        `}>
          
          {/* LEFT: Menu & Logo */}
          <div className="flex items-center gap-4 pl-2">
            <MagneticButton 
              onClick={() => setMenuOpen(true)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${scrolled ? 'hover:bg-white/10 text-white' : 'hover:bg-black/20 text-white'}`}
            >
              <Menu className="w-6 h-6" />
              {(itemCount > 0 || wishlistCount > 0) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
            </MagneticButton>

            <Link to="/" className="group relative z-50">
               <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md group-hover:tracking-widest transition-all duration-500">
                 MIRAE<span className="text-[#BF953F]">.</span>
               </span>
            </Link>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 pr-2">
            
            {/* Search */}
            <MagneticButton 
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
            >
               {searchOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5"/>}
            </MagneticButton>

            {/* Cart */}
            <Link to="/cart">
              <MagneticButton className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#BF953F] rounded-full shadow-lg" />}
              </MagneticButton>
            </Link>

            {/* Theme Toggle (Optional - kept small) */}
             <MagneticButton onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </MagneticButton>
          </div>

          {/* SEARCH OVERLAY (Integrated) */}
          {searchOpen && (
             <div className="absolute top-full left-0 right-0 mt-2 px-4 animate-in slide-in-from-top-2">
                <div className="bg-[#1a1a1a]/95 backdrop-blur-2xl border border-[#333] rounded-3xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                   <form onSubmit={handleSearchSubmit} className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        autoFocus
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search luxury..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-[#BF953F] transition-all"
                      />
                   </form>
                   {suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {suggestions.map(p => (
                           <Link key={p.id} to={`/products/${p.id}`} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group">
                              <img src={p.image} className="w-10 h-10 rounded bg-gray-800 object-cover" alt=""/>
                              <div className="flex-1">
                                 <p className="text-sm font-medium text-gray-200 group-hover:text-[#BF953F] transition-colors">{p.name}</p>
                                 <p className="text-xs text-gray-500">Rs. {p.price}</p>
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


      {/* --- FULLSCREEN MENU OVERLAY (Z-INDEX FIX) --- */}
      {/* Backdrop */}
      <div 
        className="menu-backdrop fixed inset-0 bg-black/80 backdrop-blur-md z-[9000] hidden opacity-0"
        onClick={() => setMenuOpen(false)}
      />

      {/* Menu Container */}
      <div 
        ref={menuContainerRef}
        className="fixed inset-x-0 bottom-0 top-[15%] md:top-[20%] z-[9001] bg-[#111] rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden opacity-0 translate-y-full"
      >
         {/* Handle Bar (Visual cue for swipe) */}
         <div className="w-full flex justify-center pt-4 pb-2" onClick={() => setMenuOpen(false)}>
            <div className="w-16 h-1.5 bg-white/20 rounded-full hover:bg-white/40 cursor-pointer transition-colors" />
         </div>

         {/* Header inside Menu */}
         <div className="px-8 py-4 flex items-center justify-between border-b border-white/5">
            <span className="text-sm uppercase tracking-widest text-gray-500">Navigation</span>
            <MagneticButton onClick={() => setMenuOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
               <X className="w-6 h-6" />
            </MagneticButton>
         </div>

         {/* Menu Items Grid */}
         <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3 pb-24">
            {menuItems.map((item, idx) => {
               const isActive = location.pathname === item.to;
               return (
                  <Link 
                    key={idx} 
                    to={item.to} 
                    className={`menu-item relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#BF953F]/20 to-transparent border-[#BF953F]/30' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}
                    `}
                  >
                     <div className={`p-3 rounded-xl transition-all ${isActive ? 'bg-[#BF953F] text-black' : 'bg-black/40 text-gray-300 group-hover:scale-110'}`}>
                        <item.icon className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <h3 className={`text-lg font-bold ${isActive ? 'text-[#BF953F]' : 'text-white'}`}>{item.label}</h3>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                     </div>
                     <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${isActive ? 'text-[#BF953F]' : 'group-hover:translate-x-1'}`}/>
                  </Link>
               )
            })}
         </div>

         {/* Footer Info */}
         <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
             <div>
                <p className="text-[#BF953F] text-xs font-bold tracking-widest">MIRAE. LUXURY</p>
                <p className="text-gray-600 text-[10px] mt-1">© 2025 All Rights Reserved</p>
             </div>
             <MagneticButton onClick={toggleTheme} className="px-4 py-2 bg-white/5 rounded-full text-xs text-white border border-white/10">
                Switch Appearance
             </MagneticButton>
         </div>
      </div>
    </>
  );
};

export default Header;
