import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: Updated as per requirements ---
const styles = `
  /* Performance Optimization */
  .gpu-accelerated {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* MIRAE Custom Font */
  .brand-font {
    font-family: 'Orbitron', 'Michroma', sans-serif;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* MIRAE Logo Hover Animation - Letters Spread */
  .logo-letters {
    display: inline-block;
    transition: all 0.3s ease;
  }

  .logo-hover .logo-letter {
    display: inline-block;
    transition: transform 0.3s ease;
  }

  .logo-hover:hover .logo-letter:nth-child(1) { transform: translateX(-5px); }
  .logo-hover:hover .logo-letter:nth-child(2) { transform: translateX(-3px); }
  .logo-hover:hover .logo-letter:nth-child(3) { transform: translateX(-1px); }
  .logo-hover:hover .logo-letter:nth-child(4) { transform: translateX(1px); }
  .logo-hover:hover .logo-letter:nth-child(5) { transform: translateX(3px); }

  /* 3D Gold Text Effect */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
  }

  /* RAINBOW BORDER ANIMATION (ONLY ON BORDERS) */
  @keyframes borderRainbow {
    0% { border-color: #ff0000; }
    14% { border-color: #ff7f00; }
    28% { border-color: #ffff00; }
    42% { border-color: #00ff00; }
    57% { border-color: #0000ff; }
    71% { border-color: #4b0082; }
    85% { border-color: #9400d3; }
    100% { border-color: #ff0000; }
  }

  .rainbow-border {
    position: relative;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }

  .rainbow-border:hover {
    animation: borderRainbow 1.5s linear infinite;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }

  /* Glass Effect with Break Animation */
  .glass-card {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .glass-card:hover {
    backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .glass-break {
    animation: glassBreak 0.5s ease forwards;
  }

  @keyframes glassBreak {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.95); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* 3D Search Bar */
  .search-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .search-3d input {
    transform: translateZ(20px);
    box-shadow: 
      0 5px 15px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* Theme-specific styles */
  .light-mode .glass-card {
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .dark-mode .glass-card {
    background: rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* Toggle and Icon Colors */
  .light-mode .icon-toggle {
    color: #333;
  }

  .dark-mode .icon-toggle {
    color: #fff;
  }
`;

// --- Reusable Neon Button Component with Rainbow Border ---
const NeonButton = ({ children, onClick, className = "", badge, isActive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`
        rainbow-border glass-card group relative flex items-center justify-center rounded-full 
        transition-transform active:scale-95 ${isActive ? 'glass-break' : ''} ${className}
      `}
    >
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {children}
      </div>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg">
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
  const [clickedItem, setClickedItem] = useState(null);
  
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const searchRef = useRef(null);

  // --- 1. Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 2. Menu Animation ---
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

  // --- 3. Search Bar Animation ---
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      gsap.fromTo(searchRef.current,
        { y: -20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3 }
      );
    }
  }, [searchOpen]);

  // --- 4. Logo Animation ---
  const handleLogoHover = () => {
    // Letter spread animation
    const letters = document.querySelectorAll('.logo-letter');
    gsap.to(letters, {
      x: (i) => (i - 2) * 3,
      duration: 0.3,
      stagger: 0.05
    });
  };
  
  const handleLogoLeave = () => {
    const letters = document.querySelectorAll('.logo-letter');
    gsap.to(letters, {
      x: 0,
      duration: 0.3,
      stagger: 0.05
    });
  };

  // --- 5. Handle Click with Glass Break ---
  const handleItemClick = (index) => {
    setClickedItem(index);
    setTimeout(() => setClickedItem(null), 500);
  };

  // --- VISIBILITY LOGIC ---
  const isLight = theme === 'light';
  
  const headerClass = scrolled 
    ? (isLight ? 'light-mode text-black' : 'dark-mode text-white') 
    : 'bg-transparent text-white';

  const iconColorClass = scrolled 
    ? (isLight ? 'icon-toggle text-gray-800' : 'icon-toggle text-white') 
    : 'text-white';

  // Menu Items
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
      <header 
        className={`fixed top-0 left-0 right-0 z-50 h-16 w-full transition-all duration-300 ${theme === 'light' ? 'nav-glass light-mode' : 'nav-glass dark-mode'} ${headerClass}`}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* LOGO with Letter Spread Animation */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group z-[60] logo-hover"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
          >
             <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
             <span 
               ref={logoRef}
               className="text-2xl brand-font gold-text-3d cursor-pointer"
             >
               {'MIRAE'.split('').map((letter, index) => (
                 <span key={index} className="logo-letter">{letter}</span>
               ))}
             </span>
          </Link>

          {/* CONTROLS */}
          <div className="flex items-center gap-3 z-[60]">
            
            {/* Search Toggle */}
            <NeonButton 
              onClick={() => setSearchOpen(!searchOpen)} 
              className={`w-10 h-10 ${scrolled && isLight ? 'bg-black/5' : 'bg-white/10'}`}
              isActive={searchOpen}
            >
              {searchOpen ? <X className={`w-5 h-5 ${iconColorClass}`} /> : <Search className={`w-5 h-5 ${iconColorClass}`} />}
            </NeonButton>

            {/* Menu Toggle */}
            <NeonButton 
              onClick={() => setMenuOpen(true)} 
              className={`w-10 h-10 ${scrolled && isLight ? 'bg-black/5' : 'bg-white/10'}`}
              badge={itemCount > 0 ? itemCount : null}
            >
              <MenuIcon className={`w-5 h-5 ${iconColorClass}`} />
            </NeonButton>

          </div>
        </div>

        {/* 3D SEARCH BAR */}
        <div 
          ref={searchRef}
          className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ease-out search-3d ${searchOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
        >
           <div className={`p-4 ${isLight ? 'bg-white/95' : 'bg-black/95'} border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <div className="container mx-auto max-w-2xl">
                 <input 
                   type="text" 
                   placeholder="Search products..." 
                   className={`
                     w-full bg-transparent border-2 py-3 px-4 text-lg rounded-xl 
                     focus:outline-none focus:border-yellow-500 transition-colors
                     ${isLight 
                       ? 'border-gray-300 text-black placeholder-gray-500 bg-white' 
                       : 'border-gray-700 text-white placeholder-gray-400 bg-gray-900'}
                   `}
                   autoFocus
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
              gpu-accelerated relative w-full max-w-sm mt-16 rounded-[30px] opacity-0
              ${isLight ? 'bg-white/90 shadow-xl' : 'bg-[#0f0f0f]/95 shadow-2xl shadow-black/50'}
              backdrop-blur-xl overflow-hidden rainbow-border
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
              
              <NeonButton 
                onClick={() => setMenuOpen(false)}
                className="p-2"
              >
                <X className={`w-6 h-6 ${isLight ? 'text-black' : 'text-white'}`} />
              </NeonButton>
            </div>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent my-2"></div>

            {/* Menu Grid with Glass Cards */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.to;
                
                return (
                  <Link 
                    key={index} 
                    to={item.to}
                    onClick={() => {
                      setMenuOpen(false);
                      handleItemClick(index);
                    }}
                    className={`
                      menu-item-anim glass-card group flex flex-col items-center justify-center p-5 rounded-2xl 
                      border transition-all duration-300 hover:scale-105
                      ${clickedItem === index ? 'glass-break' : ''}
                      ${isActive 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-yellow-500/30' 
                        : (isLight ? 'border-gray-200' : 'border-white/10')
                      }
                    `}
                  >
                    <div className={`
                      p-3 rounded-full mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
                      ${isActive 
                        ? 'bg-yellow-500 text-black' 
                        : (isLight ? 'bg-white shadow-sm text-gray-800' : 'bg-black/40 text-white')
                      }
                    `}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                      {item.label}
                    </span>
                    
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
               <NeonButton 
                 onClick={toggleTheme}
                 className="w-full flex items-center justify-center gap-3 py-3 rounded-xl"
               >
                 {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                 <span className="font-bold text-sm">
                   {isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                 </span>
               </NeonButton>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default Header;