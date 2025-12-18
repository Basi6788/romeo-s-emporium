import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingCart, User, Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Shop', icon: Search },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass-liquid shadow-lg shadow-primary/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet via-primary to-emerald flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/30">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-violet to-emerald rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                BASITSHOP
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground -mt-1">
                Future is here
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon, badge }) => {
              const isActive = location.pathname === to || (to === '/products' && location.pathname.startsWith('/products'));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'hover:bg-muted/80 text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose text-[10px] font-bold flex items-center justify-center text-primary-foreground animate-pulse">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-2xl glass-liquid flex items-center justify-center hover:bg-primary/10 transition-all duration-300 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber" />
              ) : (
                <Moon className="w-5 h-5 text-violet" />
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin' : '/profile'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-liquid hover:bg-primary/10 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald to-accent flex items-center justify-center">
                  <User className="w-4 h-4 text-accent-foreground" />
                </div>
                <span className="hidden sm:block font-medium text-sm">{user?.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link 
                to="/auth" 
                className="btn-primary text-sm px-5 py-2.5"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-11 h-11 rounded-2xl glass-liquid flex items-center justify-center md:hidden hover:bg-primary/10 transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="glass-liquid rounded-3xl p-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon, badge }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="ml-auto w-7 h-7 rounded-full bg-rose text-xs font-bold flex items-center justify-center text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;