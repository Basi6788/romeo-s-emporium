
import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, Sparkles, X, Zap, AlertCircle } from 'lucide-react';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // --- 1. Supabase Search Logic (FIXED) ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        // console.log("Searching for:", searchTerm);

        // FIXED: 'slug' remove kar diya hai kyun ke wo DB me nahi hai
        // Sirf wo columns select kiye hain jo screenshot me hain
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image, category, description') 
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) {
          console.error("Supabase Error:", error.message);
          throw error;
        }
        
        // console.log("Results found:", data);
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
    if (menuOpen) { document.body.style.overflow = 'hidden'; } 
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => { if (!menuOpen) setScrolled(window.scrollY > 10); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setSuggestions([]); 
  }, [location.pathname]);

  // Animation
  useEffect(() => {
    if (menuOpen && menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(menuBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      tl.fromTo(menuRef.current, { opacity: 0, y: -30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }, '-=0.2');
      tl.fromTo(menuItemsRef.current.filter(Boolean), { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.7)' }, '-=0.2');
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    if (menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline({ onComplete: () => setMenuOpen(false) });
      tl.to(menuItemsRef.current.filter(Boolean).reverse(), { opacity: 0, y: -20, duration: 0.2, stagger: 0.03 });
      tl.to(menuRef.current, { opacity: 0, y: -20, scale: 0.95, duration: 0.3 }, '-=0.1');
      tl.to(menuBackdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.2');
    } else {
      setMenuOpen(false);
    }
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled && !menuOpen ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 relative z-[60]">
            <span className="text-xl font-bold">
              <span className={menuOpen ? 'text-white' : 'text-foreground'}>BASIT</span>
              <span className="text-primary">SHOP</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {['/', '/products'].map((path) => {
              const isActive = location.pathname === path || (path === '/products' && location.pathname.startsWith('/products/'));
              return (
                <Link key={path} to={path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  {path === '/' ? 'Home' : 'Products'}
                </Link>
              );
            })}
             <Link to="/mepco-bill" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/mepco-bill' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                Bill Checker
              </Link>
          </nav>

          <div className="flex items-center gap-2 relative z-[60]">
            <button onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100); }} className={`p-2.5 rounded-lg transition-colors ${menuOpen ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'}`}>
              {searchOpen && !menuOpen ? <X className="w-5 h-5"/> : <Search className="w-5 h-5" />}
            </button>
            <button onClick={toggleTheme} className={`p-2.5 rounded-lg transition-colors cursor-pointer relative z-[60] ${menuOpen ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'}`}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)} className={`p-2.5 rounded-lg transition-all relative z-[60] ${menuOpen ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'}`}>
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-1'}`} />
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} />
                <span className={`absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-1'}`} />
              </div>
              {(itemCount > 0 || wishlistCount > 0) && !menuOpen && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />}
            </button>
          </div>
        </div>

        {searchOpen && !menuOpen && (
          <div className="pb-4 animate-in slide-in-from-top-2 duration-200 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="search-input"
                type="text"
                placeholder="Search products..."
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted/80 backdrop-blur-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground border border-border/50"
              />
            </form>

            {searchTerm.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                {isSearching ? (
                  <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Finding best matches...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        // Fallback to ID if slug is missing
                        to={`/products/${product.slug || product.id}`}
                        onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                      >
                        {product.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                             <img src={product.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{product.category || 'Product'} • Rs. {product.price?.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p className="font-medium text-foreground">No products found</p>
                    <p className="text-xs">Try searching for "{searchTerm}" in a different way</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {menuOpen && (
        <>
          <div ref={menuBackdropRef} className="fixed inset-0 z-40 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900" onClick={closeMenu} />
          
          <div ref={particlesRef} className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-gradient-to-r from-primary/30 to-violet-500/30 blur-sm" style={{ width: `${Math.random() * 100 + 50}px`, height: `${Math.random() * 100 + 50}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
            ))}
            <Sparkles className="absolute top-20 right-10 w-8 h-8 text-primary/40" />
            <Sparkles className="absolute bottom-40 left-10 w-6 h-6 text-violet-400/40" />
          </div>

          <div ref={menuRef} className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-hidden flex flex-col pointer-events-auto">
            <div ref={menuContentRef} className="flex-1 h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="container mx-auto px-4 py-8 pb-24">
                <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link key={item.to} ref={el => menuItemsRef.current[index] = el} to={item.to} onClick={closeMenu} className={`relative flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all duration-300 group overflow-hidden ${isActive ? 'bg-white/10 border-white/20 shadow-2xl shadow-primary/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:-translate-y-1'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}>
                          <item.icon className="w-6 h-6 text-white" />
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} blur-xl opacity-50 -z-10`} />
                        </div>
                        <span className="font-semibold text-white text-sm">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && <span className="absolute top-3 right-3 min-w-[24px] h-6 px-2 rounded-full bg-white text-slate-900 text-xs font-bold flex items-center justify-center shadow-lg">{item.badge}</span>}
                        {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full" />}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-8 max-w-2xl mx-auto">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Need Help?</h3>
                        <p className="text-sm text-white/60 mt-1">Contact our 24/7 support</p>
                      </div>
                      <Link to="/track-order" onClick={closeMenu} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105">Track Order</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;