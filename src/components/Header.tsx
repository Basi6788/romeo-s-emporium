import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X, Sun, Moon, Home, Package, MapPin, LogIn, Settings } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Animate menu open/close
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      gsap.fromTo(menuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(menuItemsRef.current.filter(Boolean),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'back.out(1.7)', delay: 0.1 }
      );
    }
  }, [menuOpen]);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Shop', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-foreground">BASIT</span>
              <span className="text-primary">SHOP</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {['/', '/products'].map((path) => {
              const label = path === '/' ? 'Home' : 'Shop';
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
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors relative"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {(itemCount > 0 || wishlistCount > 0) && !menuOpen && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Full Menu Overlay */}
      {menuOpen && (
        <div 
          ref={menuRef}
          className="fixed inset-x-0 top-16 bottom-0 bg-background/95 backdrop-blur-xl z-40 overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-8">
            {/* Menu Grid */}
            <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    ref={el => menuItemsRef.current[index] = el}
                    to={item.to}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 group ${
                      isActive 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
                        : 'bg-card border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-muted group-hover:bg-primary/10'
                    }`}>
                      <item.icon className={`w-6 h-6 ${isActive ? '' : 'text-foreground group-hover:text-primary'}`} />
                    </div>
                    <span className={`font-medium text-sm ${isActive ? '' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`absolute top-3 right-3 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                        isActive ? 'bg-white text-primary' : 'bg-primary text-primary-foreground'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mt-1">Contact our 24/7 support</p>
                  </div>
                  <Link 
                    to="/track-order" 
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
