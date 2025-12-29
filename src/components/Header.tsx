import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: Apple Liquid Glass & Rainbow ---
const styles = `
  /* Apple Vision Pro Style Glass */
  .apple-glass {
    background: rgba(255, 255, 255, 0.05); /* Very subtle base */
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  }

  /* Light Mode Specific Glass */
  .light .apple-glass {
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
  }

  /* Dark Mode Specific Glass */
  .dark .apple-glass {
    background: rgba(10, 10, 10, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  }

  /* Rainbow Glow Keyframes */
  @keyframes rainbow-border {
    0% { border-color: #ff0000; box-shadow: 0 0 10px rgba(255,0,0,0.4); }
    20% { border-color: #ff8800; box-shadow: 0 0 10px rgba(255,136,0,0.4); }
    40% { border-color: #ffff00; box-shadow: 0 0 10px rgba(255,255,0,0.4); }
    60% { border-color: #00ff00; box-shadow: 0 0 10px rgba(0,255,0,0.4); }
    80% { border-color: #0088ff; box-shadow: 0 0 10px rgba(0,136,255,0.4); }
    100% { border-color: #ff00ff; box-shadow: 0 0 10px rgba(255,0,255,0.4); }
  }

  .rainbow-hover:hover {
    animation: rainbow-border 3s linear infinite;
    transform: translateY(-2px);
  }
`;

const Header = React.memo(() => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLSpanElement>(null);

  // --- Scroll Detection ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Reset ---
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // --- Header 3D Mouse Reaction Logic ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!scrolled && headerRef.current) {
      const { clientX, clientY, currentTarget } = e;
      const { width, height } = currentTarget.getBoundingClientRect();
      const xPos = (clientX / width) - 0.5;
      const yPos = (clientY / height) - 0.5;

      gsap.to(headerRef.current, {
        rotationY: xPos * 10, // Tilt Horizontal
        rotationX: -yPos * 10, // Tilt Vertical
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.5
      });
    }
  };

  const handleMouseLeave = () => {
    if (headerRef.current) {
      gsap.to(headerRef.current, {
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.5)",
        duration: 1
      });
    }
  };

  // --- Menu Animation ---
  useEffect(() => {
    if (menuOpen && modalRef.current && overlayRef.current) {
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      tl.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0, rotationX: 15 },
        { scale: 1, opacity: 1, rotationX: 0, duration: 0.6, ease: "elastic.out(1, 0.75)" }
      );
      gsap.fromTo(".menu-item-anim", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, delay: 0.1 }
      );
    }
  }, [menuOpen]);

  // --- Logo Animation (Spread) ---
  const handleLogoHover = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.4em", // Spread text
        color: "#FFD700", // Gold color
        duration: 0.5,
        ease: "power3.out"
      });
    }
  };

  const handleLogoLeave = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.1em", // Normal spacing
        color: theme === 'light' ? "#000000" : "#ffffff", // Dynamic Theme Reset
        duration: 0.5,
        ease: "power3.out"
      });
    }
  };

  const closeMenu = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, { scale: 0.9, opacity: 0, duration: 0.2 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => setMenuOpen(false) });
    } else {
      setMenuOpen(false);
    }
  };

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  // --- Dynamic Classes ---
  // Is logic se light mode ka issue fix hoga
  const headerBgClass = scrolled 
    ? (theme === 'light' ? 'bg-white/80 border-gray-200 text-black' : 'bg-black/60 border-white/10 text-white')
    : 'bg-transparent border-transparent text-white'; // Hero section par hamesha white text (agar hero dark hai)
  
  // Agar page scroll nahi hua, to text hero image ke upar hai, isliye white.
  // Agar scroll ho gya, to theme ke hisaab se color.
  const textColor = scrolled ? (theme === 'light' ? 'text-black' : 'text-white') : 'text-white';
  const iconColor = scrolled ? (theme === 'light' ? 'text-gray-900' : 'text-white') : 'text-white';

  const MenuModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 transition-opacity"
        onClick={closeMenu}
      />
      {/* Apple Style Modal */}
      <div 
        ref={modalRef}
        className={`relative w-full max-w-sm apple-glass rounded-[32px] p-6 opacity-0 transform-gpu ${theme === 'dark' ? 'dark' : 'light'}`}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <span className={`text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Menu
          </span>
          <button onClick={closeMenu} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={idx}
                to={item.to}
                onClick={closeMenu}
                className={`
                  menu-item-anim group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 rainbow-hover
                  ${isActive 
                    ? (theme === 'light' ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20') 
                    : (theme === 'light' ? 'bg-white/40 border-transparent' : 'bg-white/5 border-transparent')}
                `}
              >
                <div className={`p-2.5 rounded-full transition-colors ${isActive ? 'bg-yellow-500 text-black' : (theme === 'light' ? 'bg-black/10 text-black' : 'bg-white/10 text-white')}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{item.label}</span>
                {item.badge ? (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <button 
            onClick={toggleTheme} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm transition-all
              ${theme === 'light' 
                ? 'bg-white/50 border-gray-200 text-black hover:bg-white' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}
            `}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>

      {/* HEADER CONTAINER */}
      <header 
        ref={headerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${headerBgClass}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16"> {/* Fixed Height h-16 (64px) */}
            
            {/* LOGO & MIRAE TEXT */}
            <Link 
              to="/" 
              className="flex items-center gap-2 z-[60] group pl-1"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
            >
               <img 
                 src="/logo-m.png" 
                 alt="M" 
                 className="w-9 h-9 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110" 
               />
               <span 
                 ref={logoTextRef}
                 className={`text-lg font-bold tracking-widest transition-colors duration-300 ${textColor}`} 
                 style={{ fontFamily: "'Orbitron', sans-serif" }}
               >
                 MIRAE
               </span>
            </Link>

            {/* RIGHT CONTROLS */}
            <div className="flex items-center gap-3 z-[60]">
              
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-full transition-all duration-300 border border-transparent hover:scale-110 ${iconColor}`}
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setMenuOpen(true)}
                className={`group relative p-2.5 flex flex-col items-end gap-1.5 rounded-full border border-transparent hover:scale-110 ${iconColor}`}
              >
                  {/* Hamburger Lines */}
                  <span className={`w-5 h-0.5 rounded-full transition-all duration-300 group-hover:w-6 ${scrolled && theme === 'light' ? 'bg-black' : 'bg-white'}`} />
                  <span className={`w-3.5 h-0.5 rounded-full transition-all duration-300 group-hover:w-6 ${scrolled && theme === 'light' ? 'bg-black' : 'bg-white'}`} />
                  <span className={`w-5 h-0.5 rounded-full transition-all duration-300 group-hover:w-6 ${scrolled && theme === 'light' ? 'bg-black' : 'bg-white'}`} />
                
                {itemCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ease-in-out ${searchOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`backdrop-blur-xl border-b pb-6 px-4 ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'}`}>
            <div className="container mx-auto max-w-xl">
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 transition-all ${
                    theme === 'light' 
                      ? 'bg-gray-100 border-gray-300 text-black focus:border-black' 
                      : 'bg-white/5 border-white/10 text-white focus:border-yellow-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && createPortal(<MenuModal />, document.body)}
    </>
  );
});

export default Header;
