import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES ---
const styles = `
  /* Performance Optimization */
  .gpu-accelerated {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* MIRAE Custom Font Style */
  .brand-font {
    font-family: 'Orbitron', 'Eurostile', sans-serif;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* 3D Gold Text Effect for Romeo Signature */
  .romeo-signature {
    background: linear-gradient(to right, #FFD700, #FF8C00, #FF0080);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
    letter-spacing: 1px;
    font-size: 0.7rem;
    text-transform: uppercase;
    animation: shine 3s infinite linear;
  }

  @keyframes shine {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }

  /* NEON RAINBOW BORDER ANIMATION */
  @keyframes borderRotate {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* Universal Neon Border (Applied only when not transparent) */
  .neon-border-all {
    position: relative;
  }
  .neon-border-all:not(.transparent-button) {
    overflow: hidden;
  }

  .neon-border-all:not(.transparent-button)::before {
    content: '';
    position: absolute;
    inset: -2px;
    z-index: -1;
    background: linear-gradient(90deg, 
      #ff0000, #ff7300, #fffb00, #48ff00, 
      #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000
    );
    background-size: 300% 300%;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit;
    animation: borderRotate 4s linear infinite;
    filter: blur(5px);
  }

  .neon-border-all:not(.transparent-button):hover::before {
    opacity: 1;
  }

  .neon-active:not(.transparent-button)::before {
    opacity: 0.8;
    filter: blur(3px);
  }

  .neon-border-all:not(.transparent-button)::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: inherit;
    border-radius: inherit;
    z-index: -1;
  }

  /* POP & TILT ANIMATION */
  .pop-tilt {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
  }

  .pop-tilt:hover {
    transform: translateY(-4px) scale(1.02) rotate(1deg);
    z-index: 10;
  }

  .pop-tilt:active {
    transform: scale(0.95) rotate(0deg);
  }

  /* Glass Styles */
  .nav-glass {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  
  .nav-glass.light-mode {
    background: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-glass.dark-mode {
    background: rgba(0, 0, 0, 0.6);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Light/Dark Mode Colors */
  .text-dark-visible { color: #1a1a1a !important; }
  .text-light-visible { color: #ffffff !important; }
  
  .bg-light-visible {
    background: rgba(0, 0, 0, 0.08) !important;
    border: 1px solid rgba(0,0,0,0.1);
  }
  .bg-light-visible:hover {
    background: rgba(0, 0, 0, 0.15) !important;
  }

  .bg-dark-visible {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .bg-dark-visible:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }

  /* Menu Window Specifics */
  .menu-window { border-radius: 24px; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Reusable Neon Button (Pop & Tilt + Transparent Mode) ---
const NeonButton = ({ 
  children, 
  onClick, 
  className = "", 
  badge, 
  isLightMode, 
  active,
  isTransparent = false,
  onMouseEnter,
  onMouseLeave
}) => {
  
  let baseClasses = `group relative flex items-center justify-center transition-all duration-300`;
  let colorClasses = '';

  if (isTransparent) {
    // Transparent, animated icon button
    baseClasses += ` transparent-button p-2`;
    colorClasses = isLightMode ? 'text-dark-visible' : 'text-light-visible';
  } else {
    // Regular neon card/button
    baseClasses += ` rounded-full pop-tilt neon-border-all`;
    colorClasses = isLightMode 
      ? 'bg-light-visible text-dark-visible' 
      : 'bg-dark-visible text-light-visible';
  }

  const activeClass = active && !isTransparent ? 'neon-active border-yellow-500/50' : '';

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`${baseClasses} ${colorClasses} ${activeClass} ${className}`}
    >
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {children}
      </div>
      {badge > 0 && (
        // Fixed badge position to not be cut off
        <span className="absolute -top-1 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse border-2 border-white dark:border-black">
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
  const location = useLocation();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoAnimating, setLogoAnimating] = useState(false);
  
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const logoTextRef = useRef(null);
  const searchInputRef = useRef(null);

  // Refs for animated icons
  const searchIconRef = useRef(null);
  const menuIconRef = useRef(null);
  
  // GSAP Timelines for "GIF-like" animation
  const searchAnim = useRef(null);
  const menuAnim = useRef(null);

  // --- 1. Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 2. Initialize Icon Animations ---
  useEffect(() => {
    // Search Icon Animation (Bounce & Rotate)
    searchAnim.current = gsap.timeline({ paused: true })
      .to(searchIconRef.current, { scale: 1.2, rotation: 15, duration: 0.2, ease: "back.out(1.7)" })
      .to(searchIconRef.current, { rotation: -10, duration: 0.1 })
      .to(searchIconRef.current, { rotation: 0, scale: 1.1, duration: 0.1 });

    // Menu Icon Animation (Jiggle)
    menuAnim.current = gsap.timeline({ paused: true })
      .to(menuIconRef.current, { scale: 1.2, duration: 0.2, ease: "back.out(2)" })
      .to(menuIconRef.current, { rotate: 15, duration: 0.1 })
      .to(menuIconRef.current, { rotate: -15, duration: 0.1 })
      .to(menuIconRef.current, { rotate: 0, scale: 1.1, duration: 0.1 });

    return () => {
      searchAnim.current?.kill();
      menuAnim.current?.kill();
    };
  }, []);

  // Hover Handlers
  const handleSearchHover = () => searchAnim.current.restart();
  const handleSearchLeave = () => searchAnim.current.reverse();
  const handleMenuHover = () => menuAnim.current.restart();
  const handleMenuLeave = () => menuAnim.current.reverse();

  // --- 3. Menu Modal Animation ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(menuRef.current, 
        { y: -30, opacity: 0, scale: 0.9, rotationX: 10 },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 0.4, ease: "back.out(1.2)" }
      );
      gsap.fromTo(".menu-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1 }
      );
    } else if (!menuOpen && menuRef.current) {
      gsap.to(menuRef.current, { y: -20, opacity: 0, scale: 0.95, duration: 0.2 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [menuOpen]);

  // --- 4. Logo Animation ---
  useEffect(() => {
    if (logoAnimating && logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.35em", duration: 0.4, ease: "power2.out", yoyo: true, repeat: 1,
        onComplete: () => setLogoAnimating(false)
      });
    }
  }, [logoAnimating]);

  const isLight = theme === 'light';
  const headerClass = scrolled 
    ? (isLight ? 'light-mode shadow-sm' : 'dark-mode shadow-lg shadow-purple-500/10') 
    : 'bg-transparent';
  
  const logoGradient = (scrolled && isLight) 
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black' 
    : 'text-transparent bg-clip-text bg-gradient-to-b from-[#cfc09f] via-[#ffecb3] to-[#3a2c0f]';

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  return (
    <>
      <style>{styles}</style>

      {/* --- HEADER --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 w-full transition-all duration-300 nav-glass ${headerClass}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group z-[60]" onMouseEnter={() => setLogoAnimating(true)}>
             <div className="relative">
                <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
             </div>
             <span ref={logoTextRef} className={`text-2xl brand-font cursor-pointer ${logoGradient}`} style={!isLight || !scrolled ? { textShadow: '0px 2px 10px rgba(0,0,0,0.5)' } : {}}>MIRAE</span>
          </Link>

          {/* CONTROLS - Transparent & Animated */}
          <div className="flex items-center gap-1 z-[60]">
            
            {/* Search Toggle */}
            <NeonButton 
              onClick={() => setSearchOpen(!searchOpen)} 
              isLightMode={isLight}
              active={searchOpen}
              isTransparent={true}
              onMouseEnter={handleSearchHover}
              onMouseLeave={handleSearchLeave}
            >
              <div ref={searchIconRef}>
                {searchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
              </div>
            </NeonButton>

            {/* Menu Toggle */}
            <NeonButton 
              onClick={() => setMenuOpen(true)} 
              badge={itemCount > 0 ? itemCount : null}
              isLightMode={isLight}
              isTransparent={true}
              onMouseEnter={handleMenuHover}
              onMouseLeave={handleMenuLeave}
            >
              <div ref={menuIconRef}>
                <MenuIcon className="w-6 h-6" />
              </div>
            </NeonButton>

          </div>
        </div>

        {/* SEARCH BAR */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className={`p-4 backdrop-blur-xl border-b ${isLight ? 'bg-white/95 border-gray-200' : 'bg-black/90 border-white/10'}`}>
              <div className="container mx-auto max-w-2xl relative">
                 <input 
                   ref={searchInputRef}
                   type="text" 
                   placeholder="Search products..." 
                   className={`w-full bg-transparent border-b-2 py-3 px-2 text-lg focus:outline-none rounded-t-md
                     ${isLight ? 'border-gray-300 text-black placeholder-gray-500' : 'border-gray-700 text-white placeholder-gray-400'} 
                     focus:border-yellow-500 transition-colors`}
                   autoFocus={searchOpen}
                 />
                 <Search className={`absolute right-2 top-3 w-6 h-6 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
           </div>
        </div>
      </header>

      {/* --- 3D MENU WINDOW --- */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 pt-20 sm:p-6">
          <div ref={overlayRef} onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity" />
          <div ref={menuRef} className={`
              gpu-accelerated relative w-full max-w-sm menu-window neon-border-all opacity-0 flex flex-col
              ${isLight ? 'bg-white/80' : 'bg-[#121212]/80'} 
              backdrop-blur-2xl shadow-2xl border border-white/10
              max-h-[85vh] overflow-y-auto no-scrollbar
            `}>
            {/* Window Header - "V1.0" Removed */}
            <div className={`flex items-center justify-between p-6 pb-4 border-b ${isLight ? 'border-black/5' : 'border-white/10'}`}>
              <div className="flex flex-col">
                <span className={`text-2xl brand-font ${isLight ? 'text-black' : 'text-white'}`}>MENU</span>
                <span className="romeo-signature mt-1">Created By @ROMEO</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className={`p-2 rounded-full transition-transform hover:rotate-90 hover:bg-red-500 hover:text-white ${isLight ? 'text-black bg-black/5' : 'text-white bg-white/10'}`}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Grid */}
            <div className="p-5 grid grid-cols-2 gap-4">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.to;
                const cardColors = isActive
                  ? (isLight ? 'bg-yellow-50 border-yellow-500' : 'bg-yellow-500/20 border-yellow-500')
                  : (isLight ? 'bg-white/50 border-gray-100 hover:bg-white' : 'bg-white/5 border-white/5 hover:bg-white/10');
                const iconColor = isActive ? 'text-yellow-600' : (isLight ? 'text-gray-700' : 'text-gray-300');

                return (
                  <Link key={idx} to={item.to} onClick={() => setMenuOpen(false)}
                    className={`menu-card relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 border pop-tilt neon-border-all ${cardColors}`}>
                    <div className={`p-3 rounded-full mb-3 shadow-sm transition-transform duration-300 group-hover:scale-110 ${isActive ? 'bg-yellow-500 text-black' : (isLight ? 'bg-gray-100' : 'bg-black/40')} ${iconColor}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-bold tracking-wide ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{item.label}</span>
                    {isActive && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_#eab308]"></span>}
                    {item.badge > 0 && <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg border-2 border-white dark:border-black animate-bounce">{item.badge}</span>}
                  </Link>
                )
              })}
            </div>

            {/* Footer / Theme Toggle */}
            <div className="p-6 mt-auto">
               <button onClick={toggleTheme} className={`menu-card w-full flex items-center justify-between px-6 py-4 rounded-xl border pop-tilt neon-border-all ${isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-white/5 border-white/10 text-white'}`}>
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isLight ? 'bg-white shadow-sm' : 'bg-black/40'}`}>
                        {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <span className="font-bold text-sm">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
                 </div>
                 <div className={`w-10 h-5 rounded-full relative transition-colors ${isLight ? 'bg-gray-300' : 'bg-yellow-500/50'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all duration-300 ${isLight ? 'left-1' : 'left-6'}`}></div>
                 </div>
               </button>
            </div>
          </div>
        </div>, document.body
      )}
    </>
  );
});

export default Header;

