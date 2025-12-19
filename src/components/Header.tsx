import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Home, Package, MapPin, LogIn, Settings, Sparkles, X, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/useApi'; // Products fetch karne ke liye
import gsap from 'gsap';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { data: products = [] } = useProducts(); // Search suggestions ke liye products layen
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Search States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const navigate = useNavigate();

  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Search Logic with Suggestions
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      // Filter products based on name or category
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Sirf top 5 suggestions dikhayein
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      setSuggestions([]);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    setSearchOpen(false);
    setSearchTerm('');
    setSuggestions([]);
    // Agar direct product par jana hai to: navigate(`/products/${productId}`)
    // Agar search result par jana hai to neechay wala use karein:
    navigate(`/products/${productId}`); 
  };

  // Body Scroll Lock Fix (Simplified)
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (!menuOpen) {
        setScrolled(window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Animate menu open/close
  useEffect(() => {
    if (menuOpen && menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(menuBackdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      
      tl.fromTo(menuRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' },
        '-=0.2'
      );
      
      tl.fromTo(menuItemsRef.current.filter(Boolean),
        { opacity: 0, x: 20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        },
        '-=0.2'
      );
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    if (menuRef.current && menuBackdropRef.current) {
      const tl = gsap.timeline({
        onComplete: () => setMenuOpen(false)
      });
      
      tl.to(menuItemsRef.current.filter(Boolean).reverse(), {
        opacity: 0,
        x: 20,
        duration: 0.2,
      });
      
      tl.to(menuRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in'
      }, '-=0.1');
      
      tl.to(menuBackdropRef.current, {
        opacity: 0,
        duration: 0.2
      }, '-=0.2');
    } else {
      setMenuOpen(false);
    }
  }, []);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home, color: 'text-blue-500' },
    { to: '/products', label: 'Products', icon: Package, color: 'text-violet-500' },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, color: 'text-pink-500' },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount, color: 'text-orange-500' },
    { to: '/track-order', label: 'Track Order', icon: MapPin, color: 'text-emerald-500' },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn, color: 'text-indigo-500' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled && !menuOpen
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 relative z-[60]">
            <span className="text-xl font-bold">
              <span className="text-foreground">BASIT</span>
              <span className="text-primary">SHOP</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {['/', '/products'].map((path) => {
              const label = path === '/' ? 'Home' : 'Products';
              const isActive = location.pathname === path || (path === '/products' && location.pathname.startsWith('/products/'));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 relative z-[60]">
            {/* Search Toggle */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) setTimeout(() => document.getElementById('search-input')?.focus(), 100);
              }}
              className="p-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2.5 rounded-lg text-foreground hover:bg-muted transition-colors relative"
            >
              <div className="flex flex-col gap-1.5 w-5">
                <span className="block w-full h-0.5 bg-current rounded-full" />
                <span className="block w-3/4 h-0.5 bg-current rounded-full ml-auto" />
                <span className="block w-full h-0.5 bg-current rounded-full" />
              </div>
              {(itemCount > 0 || wishlistCount > 0) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar & Suggestions Overlay */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground border border-border"
                />
              </form>

              {/* Suggestions List */}
              {suggestions.length > 0 && (
                <div className="mt-2 bg-card rounded-xl border border-border shadow-xl overflow-hidden">
                  <div className="p-2">
                    <p className="text-xs font-medium text-muted-foreground px-3 py-2">Suggestions</p>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {searchTerm && suggestions.length === 0 && (
                 <div className="mt-2 text-center py-4 text-sm text-muted-foreground">
                   No products found for "{searchTerm}"
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            ref={menuBackdropRef}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closeMenu}
          />
          
          {/* Menu Drawer (Right Side) */}
          <div 
            ref={menuRef}
            className="fixed inset-y-0 right-0 z-50 w-[80%] max-w-sm bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={closeMenu} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      ref={el => menuItemsRef.current[index] = el}
                      to={item.to}
                      onClick={closeMenu}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20' : 'bg-muted'} ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="mt-8 pt-8 border-t border-border">
                <Link 
                  to="/track-order"
                  onClick={closeMenu}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm text-foreground">Need Help?</p>
                      <p className="text-xs text-muted-foreground">Track your order</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
            
            {/* Menu Footer */}
            <div className="p-4 border-t border-border bg-muted/20">
              <p className="text-center text-xs text-muted-foreground">
                © 2025 Basit Shop. All rights reserved.
              </p>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
