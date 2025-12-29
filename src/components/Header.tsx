import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: RGB Borders, Glass Break, & 3D Search ---
const styles = `
  /* 1. RGB RUNNING BORDER (Only on Edges) */
  @property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .rgb-border-card {
    position: relative;
    background: rgba(255, 255, 255, 0.05); /* Inner Glass Default */
    backdrop-filter: blur(10px);
    border-radius: 16px;
    z-index: 1;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  /* The Moving Gradient Border */
  .rgb-border-card::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    padding: 2px; /* Thickness of the border */
    border-radius: 16px;
    background: conic-gradient(from var(--angle), #ff0000, #00ff00, #0000ff, #ff0000);
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0; /* Hidden by default */
    z-index: 2;
    transition: opacity 0.3s ease;
    animation: spin 3s linear infinite;
  }

  /* Show border on hover */
  .rgb-border-card:hover::before {
    opacity: 1;
  }
  
  /* Inner Glass Highlight on Hover */
  .rgb-border-card:hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05);
  }

  @keyframes spin {
    to { --angle: 360deg; }
  }

  /* 2. GLASS BREAK ANIMATION CLASS */
  .glass-shatter-anim {
    /* Controlled by GSAP in JS */
  }

  /* 3. SIGN IN BUTTON (Always Shining) */
  .sign-in-btn-special {
    background: linear-gradient(45deg, #FFD700, #FF8C00, #FF0080);
    background-size: 200% 200%;
    animation: gradientFlow 3s ease infinite;
    color: white;
    font-weight: bold;
    border: none;
  }
  
  @keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* 4. 3D SEARCH BAR */
  .search-3d-input {
    box-shadow: 
      inset 2px 2px 5px rgba(0,0,0,0.2),
      inset -2px -2px 5px rgba(255,255,255,0.1);
    transition: all 0.3s ease;
  }
  
  .search-3d-input:focus {
    transform: scale(1.02);
    box-shadow: 
      0 10px 20px rgba(0,0,0,0.2),
      inset 1px 1px 2px rgba(0,0,0,0.1);
  }

  /* Font & Gold Text */
  .brand-font { font-family: 'Orbitron', sans-serif; letter-spacing: 0.1em; }
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f, #c5a059, #eea849);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.5));
  }
`;

const Header = React.memo(() => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const logoTextRef = useRef(null);

  // --- Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Logo Spread Animation (Restored) ---
  const handleLogoHover = () => {
    gsap.to(logoTextRef.current, { 
      letterSpacing: "0.3em", 
      duration: 0.5, 
      ease: "power2.out" 
    });
  };
  const handleLogoLeave = () => {
    gsap.to(logoTextRef.current, { 
      letterSpacing: "0.1em", 
      duration: 0.5, 
      ease: "power2.out" 
    });
  };

  // --- Glass Break / Shatter Effect ---
  const handleGlassBreak = (e) => {
    const target = e.currentTarget;
    // Shake and Flash
    gsap.fromTo(target, 
      { x: -2, rotation: -2, scale: 0.95 },
      { 
        x: 2, rotation: 2, scale: 1, 
        duration: 0.05, 
        repeat: 5, 
        yoyo: true, 
        ease: "rough",
        onComplete: () => {
          gsap.to(target, { x: 0, rotation: 0, scale: 1, duration: 0.2 });
        }
      }
    );
  };

  // --- Menu Animation ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(menuRef.current, 
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: "power3.out" } // Slide in smooth
      );
    } else if (!menuOpen && menuRef.current) {
      gsap.to(menuRef.current, { x: '100%', duration: 0.4, ease: "power3.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
    }
  }, [menuOpen]);

  // --- Visibility Logic ---
  const isLight = theme === 'light';
  const headerClass = scrolled 
    ? (isLight ? 'bg-white/90 text-black border-gray-200' : 'bg-black/80 text-white border-white/10') 
    : 'bg-transparent text-white border-transparent';
  
  const iconColor = scrolled 
    ? (isLight ? 'text-black' : 'text-white') 
    : 'text-white';

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
  ];

  return (
    <>
      <style>{styles}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 h-16 w-full backdrop-blur-md border-b transition-all duration-300 ${headerClass}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* LOGO - Spread Animation Back */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group z-[60]"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
          >
             <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-md" />
             <span 
               ref={logoTextRef}
               className="text-2xl font-bold gold-text-3d brand-font"
             >
               MIRAE
             </span>
          </Link>

          {/* ICONS & TOGGLES (RGB Border Only + Glass Inner) */}
          <div className="flex items-center gap-3 z-[60]">
            
            {/* Search Toggle */}
            <button 
              onClick={(e) => { handleGlassBreak(e); setSearchOpen(!searchOpen); }}
              className={`rgb-border-card flex items-center justify-center w-10 h-10 rounded-full ${isLight && scrolled ? 'bg-black/5' : 'bg-white/10'}`}
            >
              {searchOpen ? <X className={`w-5 h-5 ${iconColor}`} /> : <Search className={`w-5 h-5 ${iconColor}`} />}
            </button>

            {/* Menu Toggle */}
            <button 
              onClick={(e) => { handleGlassBreak(e); setMenuOpen(true); }}
              className={`rgb-border-card flex items-center justify-center w-10 h-10 rounded-full ${isLight && scrolled ? 'bg-black/5' : 'bg-white/10'}`}
            >
               <MenuIcon className={`w-5 h-5 ${iconColor}`} />
               {itemCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* 3D REACTIVE SEARCH BAR */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`p-4 ${isLight ? 'bg-white/95' : 'bg-black/90'} backdrop-blur-xl border-b border-gray-500/10`}>
             <div className="container mx-auto max-w-xl">
               <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="Search products..."
                   className={`
                     search-3d-input w-full rounded-xl py-3 pl-12 pr-4 text-base font-medium outline-none
                     ${isLight ? 'bg-gray-100 text-black placeholder-gray-500' : 'bg-[#1a1a1a] text-white placeholder-gray-400'}
                   `} 
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* MENU PORTAL */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}
          <div 
            ref={overlayRef}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0"
          />

          {/* Sidebar Menu */}
          <div 
            ref={menuRef}
            className={`
              relative w-80 h-full shadow-2xl translate-x-full
              ${isLight ? 'bg-white' : 'bg-[#0a0a0a]'}
            `}
          >
            {/* Menu Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-500/10">
              <div>
                <h2 className={`text-2xl font-black tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>MENU</h2>
                <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                  Created By @ROMEO
                </p>
              </div>
              <button 
                onClick={(e) => { handleGlassBreak(e); setMenuOpen(false); }}
                className={`rgb-border-card p-2 rounded-full ${isLight ? 'bg-black/5' : 'bg-white/10'}`}
              >
                <X className={`w-6 h-6 ${isLight ? 'text-black' : 'text-white'}`} />
              </button>
            </div>

            {/* Menu Links (Glass + RGB Border Only) */}
            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-180px)]">
              {menuItems.map((item, idx) => (
                <Link 
                  key={idx}
                  to={item.to}
                  onClick={(e) => { handleGlassBreak(e); setMenuOpen(false); }}
                  className={`
                    rgb-border-card group flex items-center gap-4 p-4 rounded-xl transition-all
                    ${isLight ? 'bg-gray-50 text-black' : 'bg-white/5 text-white'}
                  `}
                >
                  <item.icon className={`w-5 h-5 transition-colors group-hover:text-yellow-500`} />
                  <span className="font-bold text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              {/* Special Sign In Button (Full Gradient) */}
              <Link
                to={isAuthenticated ? '/profile' : '/auth'}
                onClick={() => setMenuOpen(false)}
                className="sign-in-btn-special flex items-center justify-center gap-2 p-4 rounded-xl w-full mt-4 shadow-lg active:scale-95 transition-transform"
              >
                 {isAuthenticated ? <Settings className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                 <span>{isAuthenticated ? 'My Profile' : 'Sign In Now'}</span>
              </Link>
            </div>

            {/* Footer / Theme Toggle */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-500/10 bg-inherit">
               <button 
                 onClick={(e) => { handleGlassBreak(e); toggleTheme(); }}
                 className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold border transition-all active:scale-95
                   ${isLight 
                     ? 'bg-gray-100 border-gray-200 text-black' 
                     : 'bg-white/5 border-white/10 text-white'}
                 `}
               >
                 {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                 <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default Header;
