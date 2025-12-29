import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: 3D Borders, Glass Effect, & Shatter Animation ---
const styles = `
  /* Performance & Fonts */
  .gpu-accelerated {
    will-change: transform, opacity, letter-spacing;
    transform: translateZ(0);
  }

  .brand-font {
    font-family: 'Orbitron', 'Michroma', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block; /* Needed for GSAP spacing */
  }

  /* 3D Gold Text */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
  }

  /* --- 1. RAINBOW BORDER LOGIC (Sides Only) --- */
  @keyframes borderRotate {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .glass-card-container {
    position: relative;
    z-index: 1;
    overflow: hidden;
    border-radius: 1rem; /* Matches Tailwind rounded-2xl roughly */
    transition: transform 0.1s ease;
  }

  /* The Border Gradient (Hidden by default, visible on hover) */
  .glass-card-container::before {
    content: '';
    position: absolute;
    inset: -3px; /* Controls border thickness */
    z-index: -2;
    background: linear-gradient(90deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
    background-size: 300% 300%;
    opacity: 0; /* Hidden initially */
    transition: opacity 0.3s ease;
  }

  /* Show Border on Hover */
  .glass-card-container:hover::before {
    opacity: 1;
    animation: borderRotate 3s linear infinite;
  }

  /* The Inner Glass (Covers the middle so only border shows) */
  .glass-inner {
    position: absolute;
    inset: 1px; /* 1px less than container to show the border */
    border-radius: inherit;
    z-index: -1;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: background-color 0.3s ease;
  }

  .light-mode .glass-inner { background: rgba(255, 255, 255, 0.7); }
  .dark-mode .glass-inner { background: rgba(20, 20, 20, 0.7); }

  /* --- 2. SHATTER / CLICK EFFECT --- */
  .glass-card-container:active {
    transform: scale(0.95) skewX(-2deg); /* The "Break/Crunch" feel */
  }

  /* --- 3. SPECIAL SIGN IN BUTTON (Always Glowing, Full Fill) --- */
  .sign-in-special {
    position: relative;
    overflow: hidden;
    background: linear-gradient(90deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
    background-size: 300% 300%;
    animation: borderRotate 3s linear infinite;
    border: none;
    color: white;
    font-weight: bold;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }
  
  .sign-in-special:active {
    transform: scale(0.95);
  }

  /* Navigation Bar Background */
  .nav-glass {
    backdrop-filter: blur(15px);
  }
  .nav-glass.light-mode { background: rgba(255, 255, 255, 0.85); border-bottom: 1px solid rgba(0,0,0,0.1); }
  .nav-glass.dark-mode { background: rgba(0, 0, 0, 0.7); border-bottom: 1px solid rgba(255,255,255,0.1); }
`;

// --- Reusable Glass Card Component (For Menu Items & Toggles) ---
const GlassCard = ({ children, onClick, className = "", badge, isActive, isLight }) => {
  return (
    <button
      onClick={onClick}
      className={`glass-card-container group relative flex items-center justify-center ${className}`}
    >
      {/* The Inner Glass Layer */}
      <div className={`glass-inner ${isActive ? (isLight ? '!bg-yellow-100/80' : '!bg-yellow-900/40') : ''}`}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        {children}
      </div>

      {/* Badge */}
      {badge > 0 && (
        <span className="absolute top-2 right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
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
  const logoTextRef = useRef(null); // Ref for MIRAE text

  const isLight = theme === 'light';
  const location = useLocation();

  // --- 1. Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 2. Menu Animation (GSAP) ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      requestAnimationFrame(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
        tl.fromTo(menuRef.current, 
          { y: -20, rotationX: 20, opacity: 0, scale: 0.9, transformPerspective: 1000 },
          { y: 0, rotationX: 0, opacity: 1, scale: 1, duration: 0.5, force3D: true }
        );
        gsap.fromTo(".menu-item-anim",
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1 }
        );
      });
    } else if (!menuOpen && menuRef.current) {
      gsap.to(menuRef.current, { y: -20, opacity: 0, scale: 0.95, duration: 0.25 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.25 });
    }
  }, [menuOpen]);

  // --- 3. MIRAE Logo Spreading Animation ---
  const handleLogoEnter = () => {
    // Spreads the letters out (Letter Spacing)
    gsap.to(logoTextRef.current, { letterSpacing: "0.3em", duration: 0.4, ease: "power2.out" });
  };
  const handleLogoLeave = () => {
    // Returns to normal
    gsap.to(logoTextRef.current, { letterSpacing: "0.15em", duration: 0.4, ease: "power2.out" });
  };

  // --- Styles for Header based on state ---
  const headerClass = scrolled 
    ? (isLight ? 'light-mode text-black' : 'dark-mode text-white') 
    : 'bg-transparent text-white';

  const iconColorClass = scrolled 
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

      {/* --- HEADER BAR --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 w-full transition-all duration-300 nav-glass ${headerClass}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* LOGO AREA */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group z-[60]"
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
          >
             <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
             <span 
               ref={logoTextRef}
               className="text-2xl brand-font gold-text-3d cursor-pointer gpu-accelerated"
               style={{ letterSpacing: '0.15em' }} // Initial spacing
             >
               MIRAE
             </span>
          </Link>

          {/* CONTROLS (Right Side) */}
          <div className="flex items-center gap-3 z-[60]">
            
            {/* Search Toggle (Glass Button) */}
            <GlassCard 
              onClick={() => setSearchOpen(!searchOpen)} 
              isLight={isLight}
              className="w-10 h-10 rounded-full !p-0"
            >
              {searchOpen 
                ? <X className={`w-5 h-5 ${iconColorClass}`} /> 
                : <Search className={`w-5 h-5 ${iconColorClass}`} />
              }
            </GlassCard>

            {/* Menu Toggle (Glass Button) */}
            <GlassCard 
              onClick={() => setMenuOpen(true)} 
              isLight={isLight}
              className="w-10 h-10 rounded-full !p-0"
              badge={itemCount > 0 ? itemCount : null}
            >
              <MenuIcon className={`w-5 h-5 ${iconColorClass}`} />
            </GlassCard>

          </div>
        </div>

        {/* SEARCH BAR DROPDOWN */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ease-out ${searchOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className={`p-4 backdrop-blur-xl border-b ${isLight ? 'bg-white/95 border-gray-200' : 'bg-black/95 border-white/10'}`}>
              <div className="container mx-auto max-w-2xl">
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className={`w-full bg-transparent border-b-2 py-2 text-lg focus:outline-none ${isLight ? 'border-gray-300 text-black placeholder-gray-500' : 'border-gray-700 text-white placeholder-gray-400'} focus:border-yellow-500 transition-colors`}
                   autoFocus
                 />
              </div>
           </div>
        </div>
      </header>

      {/* --- 3D MENU MODAL --- */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 sm:p-6">
          
          {/* Dark Overlay */}
          <div 
            ref={overlayRef}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity"
          />

          {/* The Menu Card Itself */}
          <div 
            ref={menuRef}
            className={`
              gpu-accelerated relative w-full max-w-sm mt-16 rounded-[2rem] border opacity-0 overflow-hidden
              ${isLight ? 'bg-white/80 border-white shadow-xl' : 'bg-[#0f0f0f]/80 border-white/10 shadow-2xl shadow-black/50'}
              backdrop-blur-xl
            `}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="flex flex-col">
                <span className={`text-2xl font-black tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>MENU</span>
                <span className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                  Created By @ROMEO
                </span>
              </div>
              
              <button 
                onClick={() => setMenuOpen(false)}
                className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent my-2"></div>

            {/* Menu Grid Items */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.to;
                const iconColor = isActive ? 'text-yellow-600' : (isLight ? 'text-gray-800' : 'text-gray-200');

                return (
                  <Link key={idx} to={item.to} onClick={() => setMenuOpen(false)} className="menu-item-anim">
                    <GlassCard 
                      className="p-5 w-full h-full flex-col gap-2 rounded-2xl"
                      isActive={isActive}
                      isLight={isLight}
                      badge={item.badge}
                    >
                      <item.icon className={`w-6 h-6 mb-1 ${iconColor}`} />
                      <span className={`text-sm font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                        {item.label}
                      </span>
                    </GlassCard>
                  </Link>
                )
              })}

              {/* SPECIAL SIGN IN / ACCOUNT BUTTON */}
              {/* Note: This one has the FULL Gradient background as requested */}
              <Link to={isAuthenticated ? '/profile' : '/auth'} onClick={() => setMenuOpen(false)} className="menu-item-anim">
                <button className="sign-in-special w-full h-full rounded-2xl flex flex-col items-center justify-center p-5 gap-2 group">
                   {isAuthenticated ? <Settings className="w-6 h-6 text-white" /> : <LogIn className="w-6 h-6 text-white" />}
                   <span className="text-sm font-bold text-white uppercase tracking-wider">
                     {isAuthenticated ? 'Account' : 'Sign In'}
                   </span>
                </button>
              </Link>
            </div>

            {/* Theme Toggle Footer */}
            <div className="p-6 pt-2">
               <GlassCard 
                 onClick={toggleTheme}
                 isLight={isLight}
                 className="w-full py-4 rounded-xl flex-row gap-3"
               >
                 {isLight ? <Moon className="w-4 h-4 text-black" /> : <Sun className="w-4 h-4 text-white" />}
                 <span className={`font-bold text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                   {isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                 </span>
               </GlassCard>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default Header;

