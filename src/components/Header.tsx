import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';
// Importing Three.js ecosystem as requested
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';

// --- STYLES: 3D Gold, Rainbow Orb, & Glass fix ---
const styles = `
  /* 3D Gold Text Effect - No heavy font file needed */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 
      0px 0px 0px rgba(255, 255, 255, 0.4),
      1px 1px 0px rgba(99, 79, 44, 0.8),
      2px 2px 0px rgba(99, 79, 44, 0.6),
      3px 3px 0px rgba(99, 79, 44, 0.4);
    filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));
    font-family: 'Orbitron', sans-serif; /* Ensure this font is imported in your index.css */
    letter-spacing: 0.1em;
  }

  /* Rainbow Orb Hover Effect */
  .rainbow-orb-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }
  
  .rainbow-orb-btn::before {
    content: '';
    position: absolute;
    top: var(--y, 50%);
    left: var(--x, 50%);
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,0,128,0.3) 50%, transparent 70%);
    border-radius: 50%;
    transition: width 0.4s, height 0.4s;
    z-index: -1;
  }

  .rainbow-orb-btn:hover::before {
    width: 200px;
    height: 200px;
  }

  .rainbow-orb-btn:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 10px 20px -10px rgba(255, 215, 0, 0.3);
  }

  /* Fixed Glassmorphism */
  .nav-glass {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .nav-glass.light-mode {
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-glass.dark-mode {
    background: rgba(5, 5, 5, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

// --- REUSABLE RAINBOW BUTTON COMPONENT ---
const RainbowButton = ({ children, onClick, className = "", badge }) => {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btnRef.current.style.setProperty('--x', `${x}px`);
    btnRef.current.style.setProperty('--y', `${y}px`);
  };

  const handleMouseEnter = () => {
    gsap.to(btnRef.current, { scale: 1.05, duration: 0.3, ease: "back.out(1.7)" });
  };

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`rainbow-orb-btn relative flex items-center justify-center rounded-full ${className}`}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
};

const Header = React.memo(() => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);

  // --- 1. Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 2. Menu Animation (GSAP 3D Flip) ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      // Opening
      const tl = gsap.timeline();
      
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4 });
      
      tl.fromTo(menuRef.current, 
        { 
          y: -50, 
          rotationX: 45, 
          opacity: 0, 
          scale: 0.9,
          transformPerspective: 1000 
        },
        { 
          y: 0, 
          rotationX: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          ease: "elastic.out(1, 0.75)" 
        }
      );

      gsap.fromTo(".menu-item-stagger",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, delay: 0.1 }
      );

    } else if (!menuOpen && menuRef.current) {
      // Closing (Faster)
      gsap.to(menuRef.current, { 
        y: -20, 
        opacity: 0, 
        scale: 0.95, 
        duration: 0.3, 
        ease: "power3.in" 
      });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
    }
  }, [menuOpen]);

  // --- 3. Logo Animation ---
  const handleLogoHover = () => {
    gsap.to(logoRef.current, { 
      scale: 1.1, 
      textShadow: "0px 0px 20px rgba(255, 215, 0, 0.8)", 
      duration: 0.3 
    });
  };
  
  const handleLogoLeave = () => {
    gsap.to(logoRef.current, { 
      scale: 1, 
      textShadow: "0px 0px 0px rgba(255,255,255,0.4)", 
      duration: 0.3 
    });
  };

  // --- Dynamic Colors (Crucial for Light Mode) ---
  // If Scrolled: Use Theme colors. If Top (Hero): Always White text for contrast.
  const isLight = theme === 'light';
  const textColor = scrolled ? (isLight ? 'text-black' : 'text-white') : 'text-white';
  const glassClass = scrolled ? (isLight ? 'light-mode' : 'dark-mode') : 'bg-transparent border-transparent';
  
  // Icon colors specifically
  const iconClass = scrolled ? (isLight ? 'text-gray-800' : 'text-gray-100') : 'text-white';

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Profile' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  return (
    <>
      <style>{styles}</style>

      {/* --- HEADER --- */}
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 h-16 w-full transition-all duration-300 nav-glass ${glassClass}`}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* 1. LOGO SECTION (With 3D Gold Effect) */}
          <Link to="/" className="flex items-center gap-3 group z-[60]">
             {/* Small React Three Fiber Canvas for a subtle floating particle or element if desired, keeping it clean for now */}
             <div className="relative">
                <img src="/logo-m.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500" />
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
             </div>
             
             <span 
               ref={logoRef}
               onMouseEnter={handleLogoHover}
               onMouseLeave={handleLogoLeave}
               className="text-2xl font-black tracking-widest gold-text-3d cursor-pointer transform-gpu"
             >
               MIRAE
             </span>
          </Link>

          {/* 2. RIGHT CONTROLS (Rainbow Buttons) */}
          <div className="flex items-center gap-3 z-[60]">
            
            {/* Search Toggle */}
            <RainbowButton 
              onClick={() => setSearchOpen(!searchOpen)} 
              className={`w-10 h-10 border ${scrolled && isLight ? 'border-gray-200' : 'border-white/20'}`}
            >
              {searchOpen ? <X className={`w-5 h-5 ${iconClass}`} /> : <Search className={`w-5 h-5 ${iconClass}`} />}
            </RainbowButton>

            {/* Menu Toggle */}
            <RainbowButton 
              onClick={() => setMenuOpen(true)} 
              className={`w-10 h-10 border ${scrolled && isLight ? 'border-gray-200' : 'border-white/20'}`}
              badge={itemCount > 0 ? itemCount : null}
            >
              <MenuIcon className={`w-5 h-5 ${iconClass}`} />
            </RainbowButton>

          </div>
        </div>

        {/* --- SEARCH BAR EXPAND --- */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ease-out ${searchOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className={`p-4 backdrop-blur-xl border-b ${isLight ? 'bg-white/95 border-gray-200' : 'bg-black/90 border-white/10'}`}>
              <div className="container mx-auto max-w-2xl">
                 <input 
                   type="text" 
                   placeholder="Search for luxury..." 
                   className={`w-full bg-transparent border-b-2 py-3 text-lg focus:outline-none ${isLight ? 'border-gray-300 text-black placeholder-gray-500' : 'border-gray-700 text-white placeholder-gray-500'} focus:border-yellow-500 transition-colors`}
                   autoFocus
                 />
              </div>
           </div>
        </div>
      </header>

      {/* --- 3D MENU MODAL --- */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 sm:p-6">
          
          {/* Overlay */}
          <div 
            ref={overlayRef}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity"
          />

          {/* Menu Card */}
          <div 
            ref={menuRef}
            className={`
              relative w-full max-w-sm mt-16 rounded-3xl border opacity-0 transform-gpu
              ${isLight ? 'bg-white/80 border-white shadow-2xl' : 'bg-[#0a0a0a]/90 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]'}
              backdrop-blur-2xl
            `}
          >
            {/* Header of Menu */}
            <div className="flex items-center justify-between p-6 border-b border-gray-500/10">
              <span className={`text-xl font-bold tracking-wider ${isLight ? 'text-black' : 'text-white'}`}>MENU</span>
              <button 
                onClick={() => setMenuOpen(false)}
                className={`p-2 rounded-full hover:bg-gray-500/20 transition-colors ${isLight ? 'text-black' : 'text-white'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Grid Items */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link 
                    key={idx} 
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      menu-item-stagger group relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                        : (isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white/5 hover:bg-white/10')
                      }
                    `}
                  >
                    <div className={`
                      p-3 rounded-full mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6
                      ${isActive ? 'bg-yellow-500 text-black' : (isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-white')}
                    `}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className={`font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{item.label}</span>
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                )
              })}
            </div>

            {/* Theme Toggle Footer */}
            <div className="p-6 border-t border-gray-500/10">
               <button 
                 onClick={toggleTheme}
                 className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border transition-all active:scale-95
                   ${isLight 
                     ? 'bg-gray-100 border-gray-200 text-black hover:bg-gray-200' 
                     : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}
                 `}
               >
                 {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                 <span className="font-semibold">{isLight ? 'Switch to Dark' : 'Switch to Light'}</span>
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
