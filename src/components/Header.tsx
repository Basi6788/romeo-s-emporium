import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: Neon Glow, Performance Fixes, & Grift Font ---
const styles = `
  /* Performance Optimization for Animations */
  .gpu-accelerated {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* MIRAE Custom Font Style (Grift-like) */
  .brand-font {
    font-family: 'Orbitron', 'Michroma', sans-serif;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* 3D Gold Text Effect */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
  }

  /* NEON RAINBOW BORDER ANIMATION FOR WINDOW BORDER ONLY */
  @keyframes borderRotate {
    100% { background-position: 200% 0; }
  }

  /* Window Border Animation */
  .window-neon-border {
    position: relative;
    overflow: hidden;
    border-radius: 30px;
  }

  .window-neon-border::before {
    content: '';
    position: absolute;
    inset: -3px;
    z-index: -1;
    background: linear-gradient(90deg, 
      rgba(255, 0, 0, 0.7),    /* Dimmed Red */
      rgba(255, 115, 0, 0.7),  /* Dimmed Orange */
      rgba(255, 251, 0, 0.7),  /* Dimmed Yellow */
      rgba(72, 255, 0, 0.7),   /* Dimmed Green */
      rgba(0, 255, 213, 0.7),  /* Dimmed Cyan */
      rgba(0, 43, 255, 0.7),   /* Dimmed Blue */
      rgba(122, 0, 255, 0.7),  /* Dimmed Purple */
      rgba(255, 0, 200, 0.7),  /* Dimmed Pink */
      rgba(255, 0, 0, 0.7)     /* Dimmed Red */
    );
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.4s ease;
    border-radius: inherit;
    animation: borderRotate 3s linear infinite paused;
    filter: blur(4px);
  }

  .window-neon-border:hover::before {
    opacity: 1;
    animation-play-state: running;
  }

  /* Inner background to cover the center of the rainbow */
  .window-neon-border::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: inherit;
    border-radius: inherit;
    z-index: -1;
  }

  /* Card and Button Gradients (Dimmed) */
  .dim-gradient-light {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 140, 0, 0.15));
  }

  .dim-gradient-dark {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1));
  }

  /* Glass Styles */
  .nav-glass {
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }
  
  .nav-glass.light-mode {
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .nav-glass.dark-mode {
    background: rgba(0, 0, 0, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Fix for search and menu buttons in light mode */
  .light-mode-button {
    background: rgba(0, 0, 0, 0.1) !important;
    color: #000 !important;
    border: 1px solid rgba(0, 0, 0, 0.2) !important;
  }

  .light-mode-button:hover {
    background: rgba(0, 0, 0, 0.15) !important;
  }

  /* MIRAE Logo Animation */
  @keyframes spreadText {
    0% {
      letter-spacing: 0.15em;
    }
    50% {
      letter-spacing: 0.3em;
    }
    100% {
      letter-spacing: 0.15em;
    }
  }

  .logo-spread {
    animation: spreadText 2s ease-in-out;
  }

  /* Prevent keyboard opening on mobile */
  input[type="text"]:focus {
    outline: none;
  }
`;

// --- Reusable Neon Button Component ---
const NeonButton = ({ children, onClick, className = "", badge, isLightMode, isScrolled }) => {
  const buttonClass = isScrolled && isLightMode 
    ? `light-mode-button group relative flex items-center justify-center rounded-full transition-transform active:scale-95 ${className}`
    : `neon-border-container group relative flex items-center justify-center rounded-full transition-transform active:scale-95 ${className}`;

  return (
    <button
      onClick={onClick}
      className={buttonClass}
    >
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {children}
      </div>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
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
  const logoRef = useRef(null);
  const logoTextRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- 1. Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 2. Optimized Menu Animation ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      requestAnimationFrame(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
        
        tl.fromTo(menuRef.current, 
          { 
            y: -20, 
            rotationX: 20, 
            opacity: 0, 
            scale: 0.9,
            transformPerspective: 1000 
          },
          { 
            y: 0, 
            rotationX: 0, 
            opacity: 1, 
            scale: 1, 
            duration: 0.5,
            force3D: true
          }
        );

        gsap.fromTo(".menu-item-anim",
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1 }
        );
      });

    } else if (!menuOpen && menuRef.current) {
      gsap.to(menuRef.current, { 
        y: -20, 
        opacity: 0, 
        scale: 0.95, 
        duration: 0.25,
        force3D: true
      });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.25 });
    }
  }, [menuOpen]);

  // --- 3. Logo Animation ---
  useEffect(() => {
    if (logoAnimating && logoTextRef.current) {
      const animation = gsap.to(logoTextRef.current, {
        letterSpacing: "0.3em",
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(logoTextRef.current, {
            letterSpacing: "0.15em",
            duration: 0.5,
            delay: 0.5,
            ease: "power2.in",
            onComplete: () => {
              setLogoAnimating(false);
            }
          });
        }
      });

      return () => {
        animation.kill();
      };
    }
  }, [logoAnimating]);

  const handleLogoHover = () => {
    setLogoAnimating(true);
    gsap.to(logoRef.current, { scale: 1.05, duration: 0.3 });
  };

  const handleLogoLeave = () => {
    gsap.to(logoRef.current, { scale: 1, duration: 0.3 });
  };

  // --- VISIBILITY LOGIC ---
  const isLight = theme === 'light';
  
  const headerClass = scrolled 
    ? (isLight ? 'light-mode text-black' : 'dark-mode text-white') 
    : 'bg-transparent text-white';

  const iconColorClass = scrolled 
    ? (isLight ? 'text-black' : 'text-white') 
    : 'text-white';

  // Fix: Button color in light mode when scrolled
  const buttonBgClass = scrolled && isLight 
    ? 'light-mode-button'
    : 'bg-white/10 hover:bg-white/20';

  // Menu Items
  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  // Handle search input focus to prevent keyboard on mobile
  const handleSearchFocus = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* --- HEADER --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 h-16 w-full transition-all duration-300 nav-glass ${headerClass}`}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* LOGO */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group z-[60]"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
          >
             <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
             <span 
               ref={logoRef}
               className="text-2xl brand-font gold-text-3d cursor-pointer relative"
             >
               <span 
                 ref={logoTextRef}
                 className={logoAnimating ? 'logo-spread' : ''}
               >
                 MIRAE
               </span>
             </span>
          </Link>

          {/* CONTROLS */}
          <div className="flex items-center gap-3 z-[60]">
            
            {/* Search Toggle - Fixed visibility in light mode */}
            <NeonButton 
              onClick={() => setSearchOpen(!searchOpen)} 
              className={`w-10 h-10 transition-all ${buttonBgClass}`}
              isLightMode={isLight}
              isScrolled={scrolled}
            >
              {searchOpen ? (
                <X className={`w-5 h-5 ${iconColorClass}`} />
              ) : (
                <Search className={`w-5 h-5 ${iconColorClass}`} />
              )}
            </NeonButton>

            {/* Menu Toggle - Fixed visibility in light mode */}
            <NeonButton 
              onClick={() => setMenuOpen(true)} 
              className={`w-10 h-10 transition-all ${buttonBgClass}`}
              badge={itemCount > 0 ? itemCount : null}
              isLightMode={isLight}
              isScrolled={scrolled}
            >
              <MenuIcon className={`w-5 h-5 ${iconColorClass}`} />
            </NeonButton>

          </div>
        </div>

        {/* SEARCH BAR - Fixed with proper visibility */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ease-out ${searchOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className={`p-4 backdrop-blur-xl border-b ${isLight ? 'bg-white/95 border-gray-200' : 'bg-black/95 border-white/10'}`}>
              <div className="container mx-auto max-w-2xl">
                 <input 
                   ref={searchInputRef}
                   type="text" 
                   placeholder="Search..." 
                   className={`w-full bg-transparent border-b-2 py-2 text-lg focus:outline-none ${isLight ? 'border-gray-300 text-black placeholder-gray-500' : 'border-gray-700 text-white placeholder-gray-400'} focus:border-yellow-500 transition-colors`}
                   autoFocus
                   onFocus={handleSearchFocus}
                 />
              </div>
           </div>
        </div>
      </header>

      {/* --- 3D MENU MODAL --- */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 sm:p-6">
          
          <div 
            ref={overlayRef}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity"
          />

          <div 
            ref={menuRef}
            className={`
              gpu-accelerated relative w-full max-w-sm mt-16 window-neon-border opacity-0
              ${isLight ? 'bg-white/90 shadow-xl' : 'bg-[#0f0f0f]/95 shadow-2xl shadow-black/50'}
              backdrop-blur-xl overflow-hidden
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

            {/* Menu Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.to;
                const itemBg = isActive 
                    ? (isLight ? 'dim-gradient-light border-yellow-500/30' : 'dim-gradient-dark border-yellow-500/30')
                    : (isLight ? 'bg-gray-100 hover:bg-white' : 'bg-white/5 hover:bg-white/10');
                
                const itemText = isLight ? 'text-gray-800' : 'text-gray-200';

                return (
                  <Link 
                    key={idx} 
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      menu-item-anim flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300
                      ${itemBg}
                    `}
                  >
                    <div className={`
                      p-3 rounded-full mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6
                      ${isActive ? 'bg-yellow-500 text-black' : (isLight ? 'bg-white shadow-sm text-black' : 'bg-black/40 text-white')}
                    `}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold ${itemText}`}>{item.label}</span>
                    
                    {item.badge && item.badge > 0 && (
                       <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md">
                         {item.badge}
                       </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Footer / Theme Toggle */}
            <div className="p-6 pt-2">
               <button 
                 onClick={toggleTheme}
                 className={`
                   w-full flex items-center justify-center gap-3 py-3 rounded-xl border transition-all active:scale-95
                   ${isLight 
                     ? 'light-mode-button text-black' 
                     : 'neon-border-container bg-white/5 border-white/10 text-white'}
                 `}
               >
                 {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                 <span className="font-bold text-sm">{isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
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