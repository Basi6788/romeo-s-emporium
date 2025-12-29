import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: FIXED RGB BORDERS, GLASS BREAK, & 3D ---
const styles = `
  /* --- MIRAE LOGO SPREAD --- */
  .brand-logo-text {
    font-family: 'Orbitron', 'Michroma', sans-serif;
    font-weight: 900;
    transition: letter-spacing 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    letter-spacing: 0.1em;
  }
  
  .brand-logo-wrapper:hover .brand-logo-text {
    letter-spacing: 0.4em; /* SPREAD EFFECT */
  }

  /* 3D Gold Text */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 4px 3px rgba(0,0,0,0.4));
  }

  /* --- RGB BORDER ANIMATION (SPINNING) --- */
  @keyframes spinBorder {
    0% { --angle: 0deg; }
    100% { --angle: 360deg; }
  }

  /* Using CSS variables for the conic gradient angle if supported, else fallback */
  @property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  /* --- THE RGB BORDER WRAPPER --- */
  .rgb-border-wrapper {
    position: relative;
    border-radius: 1rem;
    z-index: 10;
    /* 3D Depth Shadow default */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.1s;
  }

  /* The pseudo-element is the RAINBOW BORDER */
  .rgb-border-wrapper::before {
    content: '';
    position: absolute;
    inset: -3px; /* Border thickness */
    border-radius: inherit;
    padding: 3px; 
    background: conic-gradient(from var(--angle), #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
    -webkit-mask: 
       linear-gradient(#fff 0 0) content-box, 
       linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0; /* Hidden by default */
    z-index: 20;
    transition: opacity 0.3s ease;
    animation: spinBorder 3s linear infinite;
  }

  /* Show Border on Hover */
  .rgb-border-wrapper:hover::before {
    opacity: 1;
  }

  /* --- GLASS INTERIOR (Background) --- */
  .glass-content {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    z-index: 15;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle default border */
  }

  .light-mode .glass-content {
    background: rgba(255, 255, 255, 0.6); /* White Glass */
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.8);
  }

  .dark-mode .glass-content {
    background: rgba(10, 10, 10, 0.6); /* Black Glass */
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
  }

  /* --- GLASS BREAK / CRACK EFFECT (Click) --- */
  .rgb-border-wrapper:active {
    transform: scale(0.95) skewX(-10deg) rotate(2deg); /* THE BREAK */
  }

  /* --- SIGN IN BUTTON SPECIAL (Always Filled) --- */
  .signin-special {
    position: relative;
    overflow: hidden;
    background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8);
    background-size: 300% 300%;
    animation: gradientShift 4s ease infinite;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    border: none;
    color: white;
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* --- SEARCH BAR 3D --- */
  .search-input-3d {
    transition: all 0.3s ease;
    box-shadow: inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.1);
  }
  .search-input-3d:focus {
    box-shadow: 0 0 0 2px #eab308, inset 2px 2px 5px rgba(0,0,0,0.2);
  }
`;

// --- Reusable 3D RGB Glass Button ---
const RGBGlassButton = ({ children, onClick, className = "", badge, isLight }) => {
  return (
    <button
      onClick={onClick}
      className={`rgb-border-wrapper group ${className}`}
    >
      <div className="glass-content flex items-center justify-center w-full h-full p-2">
        {children}
      </div>
      
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 z-30 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse border border-white">
          {badge}
        </span>
      )}
    </button>
  );
};

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
  
  const isLight = theme === 'light';
  const location = useLocation();

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menu Animation
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      requestAnimationFrame(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
        tl.fromTo(menuRef.current, 
          { y: -30, rotationX: 15, opacity: 0, scale: 0.9 },
          { y: 0, rotationX: 0, opacity: 1, scale: 1, duration: 0.4 }
        );
        gsap.fromTo(".menu-anim-item",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1 }
        );
      });
    } else if (!menuOpen && menuRef.current) {
      gsap.to(menuRef.current, { y: -20, opacity: 0, scale: 0.95, duration: 0.2 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [menuOpen]);

  // Colors based on Scroll & Theme
  const headerBgClass = scrolled 
    ? (isLight ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-black/80 backdrop-blur-md shadow-md border-b border-white/10') 
    : 'bg-transparent';
  
  const textColorClass = scrolled 
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

      <header className={`fixed top-0 left-0 right-0 z-50 h-16 w-full transition-all duration-300 ${headerBgClass}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* --- LOGO (SPREAD EFFECT) --- */}
          <Link to="/" className="flex items-center gap-2 group brand-logo-wrapper z-[60]">
             <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
             {/* Text Spreads on Hover */}
             <span className={`text-2xl brand-logo-text gold-text-3d cursor-pointer ${textColorClass}`}>
               MIRAE
             </span>
          </Link>

          {/* --- RIGHT SIDE CONTROLS --- */}
          <div className="flex items-center gap-4 z-[60]">
            
            {/* SEARCH TOGGLE (3D Glass Icon) */}
            <RGBGlassButton 
              onClick={() => setSearchOpen(!searchOpen)} 
              isLight={isLight}
              className="w-10 h-10 rounded-full"
            >
              {searchOpen 
                ? <X className={`w-5 h-5 ${textColorClass}`} /> 
                : <Search className={`w-5 h-5 ${textColorClass}`} />
              }
            </RGBGlassButton>

            {/* MENU TOGGLE (3D Glass Icon) */}
            <RGBGlassButton 
              onClick={() => setMenuOpen(true)} 
              isLight={isLight}
              className="w-10 h-10 rounded-full"
              badge={itemCount > 0 ? itemCount : null}
            >
              <MenuIcon className={`w-5 h-5 ${textColorClass}`} />
            </RGBGlassButton>

          </div>
        </div>

        {/* --- SEARCH BAR (3D & Responsive) --- */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className={`p-4 backdrop-blur-xl ${isLight ? 'bg-white/95' : 'bg-black/95'}`}>
              <div className="container mx-auto max-w-2xl relative">
                 <input 
                   type="text" 
                   placeholder="Search products..." 
                   className={`w-full py-3 px-5 rounded-xl search-input-3d text-lg outline-none
                     ${isLight 
                       ? 'bg-gray-100 text-black placeholder-gray-500 border border-gray-200' 
                       : 'bg-[#1a1a1a] text-white placeholder-gray-400 border border-gray-800'}
                   `}
                   autoFocus
                 />
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
           </div>
        </div>
      </header>

      {/* --- MENU MODAL --- */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 sm:p-6 font-sans">
          
          {/* Overlay */}
          <div 
            ref={overlayRef}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity"
          />

          {/* MENU CONTAINER */}
          <div 
            ref={menuRef}
            className={`
               relative w-full max-w-sm mt-16 rounded-[2rem] border-2 opacity-0 overflow-hidden
              ${isLight ? 'bg-white/90 border-white' : 'bg-[#0a0a0a]/90 border-gray-800'}
              backdrop-blur-xl shadow-2xl
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h2 className={`text-2xl font-black italic tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>MENU</h2>
                <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                  DESIGNED BY @ROMEO
                </p>
              </div>
              <button onClick={() => setMenuOpen(false)} className={`p-2 rounded-full ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}>
                <X className={`w-6 h-6 ${isLight ? 'text-black' : 'text-white'}`} />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent mb-4"></div>

            {/* GRID OF ITEMS */}
            <div className="p-4 grid grid-cols-2 gap-4">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.to;
                const activeText = isActive ? 'text-yellow-600' : (isLight ? 'text-gray-800' : 'text-gray-200');

                return (
                  <Link key={idx} to={item.to} onClick={() => setMenuOpen(false)} className="menu-anim-item block h-full">
                    {/* RGB Glass Card for Menu Items */}
                    <RGBGlassButton 
                      isLight={isLight}
                      className="w-full h-28 rounded-2xl"
                      badge={item.badge}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <item.icon className={`w-7 h-7 ${activeText} transition-transform group-hover:scale-110`} />
                        <span className={`text-sm font-bold uppercase tracking-wide ${activeText}`}>
                          {item.label}
                        </span>
                      </div>
                    </RGBGlassButton>
                  </Link>
                )
              })}

              {/* --- SIGN IN BUTTON (SPECIAL EXCEPTION) --- */}
              {/* Needs to be FILLED with gradient always, as requested */}
              <Link to={isAuthenticated ? '/profile' : '/auth'} onClick={() => setMenuOpen(false)} className="menu-anim-item block h-full">
                <button className="signin-special w-full h-28 rounded-2xl flex flex-col items-center justify-center gap-2 group active:scale-95 transition-transform">
                   {isAuthenticated ? <Settings className="w-7 h-7 text-white" /> : <LogIn className="w-7 h-7 text-white" />}
                   <span className="text-sm font-black text-white uppercase tracking-wider drop-shadow-md">
                     {isAuthenticated ? 'Account' : 'Sign In'}
                   </span>
                </button>
              </Link>
            </div>

            {/* THEME TOGGLE (Use Glass Style) */}
            <div className="p-6 pt-2">
               <RGBGlassButton 
                 onClick={toggleTheme}
                 isLight={isLight}
                 className="w-full h-14 rounded-xl"
               >
                 <div className="flex items-center justify-center gap-3">
                   {isLight ? <Moon className="w-5 h-5 text-black" /> : <Sun className="w-5 h-5 text-white" />}
                   <span className={`font-bold text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                     {isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                   </span>
                 </div>
               </RGBGlassButton>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default Header;


