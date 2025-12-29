import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES: Neon Glow, Performance Fixes, & Grift Font ---
const styles = `
  /* Performance Optimization */
  .gpu-accelerated {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* MIRAE Custom Font Style */
  .brand-font {
    font-family: 'Orbitron', 'Michroma', sans-serif;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    display: inline-block; /* Required for transform animations */
  }

  /* 3D Gold Text Effect */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
  }

  /* NEON RAINBOW BORDER ANIMATION (Dimmed as requested) */
  @keyframes borderRotate {
    100% { background-position: 200% 0; }
  }

  .neon-border-window {
    position: relative;
    z-index: 1;
    overflow: visible; /* Changed to visible for glow spread */
  }

  /* The Rainbow Border for Window/Modal */
  .neon-border-window::before {
    content: '';
    position: absolute;
    inset: -2px;
    z-index: -1;
    background: linear-gradient(90deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
    background-size: 200% 100%;
    border-radius: inherit;
    animation: borderRotate 3s linear infinite;
    opacity: 0.6; /* Dimmed as requested */
    filter: blur(8px); /* Soft neon glow */
  }

  .neon-border-window::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: inherit;
    border-radius: inherit;
    z-index: -1;
  }

  /* Card/Button Shine Effect (Subtle) */
  .card-shine {
    position: relative;
    overflow: hidden;
  }
  
  .card-shine::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
    pointer-events: none;
  }

  .card-shine:hover::before {
    left: 100%;
  }

  /* Glass Styles */
  .nav-glass {
    backdrop-filter: blur(12px); /* Reduced slightly for performance */
    -webkit-backdrop-filter: blur(12px);
  }
  
  .nav-glass.light-mode {
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .nav-glass.dark-mode {
    background: rgba(0, 0, 0, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Signature Gradient */
  .romeo-sig {
    background: linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
  }
`;

// --- Reusable Neon/Shine Button ---
const NeonButton = ({ children, onClick, className = "", badge }) => {
  return (
    <button
      onClick={onClick}
      className={`card-shine group relative flex items-center justify-center rounded-full transition-transform active:scale-95 border border-transparent hover:border-white/20 ${className}`}
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
  
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const logoTextRef = useRef(null);

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
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } }); // Changed to power2 for smoother feel
        
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
        
        tl.fromTo(menuRef.current, 
          { y: -30, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, force3D: true }
        );

        gsap.fromTo(".menu-item-anim",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.04, duration: 0.3, delay: 0.1 }
        );
      });
    } else if (!menuOpen && menuRef.current) {
      gsap.to(menuRef.current, { y: -20, opacity: 0, scale: 0.95, duration: 0.2 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [menuOpen]);

  // --- 3. Logo Animation (Spread) ---
  const handleLogoHover = () => {
    gsap.to(logoTextRef.current, { letterSpacing: "0.3em", duration: 0.4, ease: "power2.out" });
  };
  const handleLogoLeave = () => {
    gsap.to(logoTextRef.current, { letterSpacing: "0.15em", duration: 0.4, ease: "power2.out" });
  };

  // --- 4. Navigation Handler (Fixes Keyboard Issue) ---
  const handleNavClick = () => {
    setMenuOpen(false);
    // Remove focus from any active element (like inputs) to prevent keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // --- VISIBILITY LOGIC (Fixing Invisible Icons) ---
  const isLight = theme === 'light';
  
  // Logic: Scrolled & Light = Black Text. Scrolled & Dark = White Text. Top = White Text.
  const headerClass = scrolled 
    ? (isLight ? 'light-mode text-black' : 'dark-mode text-white') 
    : 'bg-transparent text-white';

  const iconColorClass = scrolled 
    ? (isLight ? 'text-gray-900' : 'text-white') 
    : 'text-white';

  // Menu Items (Track Order Restored)
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
        className={`fixed top-0 left-0 right-0 z-50 h-16 w-full transition-all duration-300 nav-glass ${headerClass}`}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 group z-[60]">
             <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
             <span 
               ref={logoTextRef}
               onMouseEnter={handleLogoHover}
               onMouseLeave={handleLogoLeave}
               className="text-2xl brand-font gold-text-3d cursor-pointer"
             >
               MIRAE
             </span>
          </Link>

          {/* CONTROLS */}
          <div className="flex items-center gap-3 z-[60]">
            
            {/* Search Toggle */}
            <NeonButton 
              onClick={() => setSearchOpen(!searchOpen)} 
              className={`w-10 h-10 ${scrolled && isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {searchOpen ? <X className={`w-5 h-5 ${iconColorClass}`} /> : <Search className={`w-5 h-5 ${iconColorClass}`} />}
            </NeonButton>

            {/* Menu Toggle */}
            <NeonButton 
              onClick={() => setMenuOpen(true)} 
              className={`w-10 h-10 ${scrolled && isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20'}`}
              badge={itemCount > 0 ? itemCount : null}
            >
              <MenuIcon className={`w-5 h-5 ${iconColorClass}`} />
            </NeonButton>

          </div>
        </div>

        {/* SEARCH BAR (Fixed: No autoFocus to prevent keyboard glitch on nav) */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ease-out ${searchOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className={`p-4 backdrop-blur-xl border-b ${isLight ? 'bg-white/95 border-gray-200' : 'bg-black/95 border-white/10'}`}>
              <div className="container mx-auto max-w-2xl">
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className={`w-full bg-transparent border-b-2 py-2 text-lg focus:outline-none ${isLight ? 'border-gray-300 text-black placeholder-gray-500' : 'border-gray-700 text-white placeholder-gray-400'} focus:border-yellow-500 transition-colors`}
                   // autoFocus removed to prevent keyboard popping up unexpectedly
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

          {/* Menu Window with RGB Rainbow Border (.neon-border-window) */}
          <div 
            ref={menuRef}
            className={`
              neon-border-window gpu-accelerated relative w-full max-w-sm mt-16 rounded-[30px] border opacity-0
              ${isLight ? 'bg-white/95 border-white shadow-xl' : 'bg-[#0f0f0f]/95 border-white/10 shadow-2xl shadow-black/50'}
              backdrop-blur-xl
            `}
          >
            {/* Menu Header with @ROMEO Signature */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className={`text-2xl font-black tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>MENU</span>
                </div>
                {/* SIGNATURE */}
                <span className="romeo-sig text-[10px] tracking-widest mt-1 animate-pulse">
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
                // Background logic for menu items
                const itemBg = isActive 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-yellow-500/30'
                    : (isLight ? 'bg-gray-100 border-gray-200 hover:bg-white' : 'bg-white/5 border-white/5 hover:bg-white/10');
                
                const itemText = isLight ? 'text-gray-800' : 'text-gray-200';

                return (
                  <Link 
                    key={idx} 
                    to={item.to}
                    onClick={handleNavClick}
                    className={`
                      menu-item-anim card-shine relative group flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300
                      ${itemBg} hover:border-yellow-500/30
                    `}
                  >
                    <div className={`
                      p-3 rounded-full mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg
                      ${isActive ? 'bg-yellow-500 text-black' : (isLight ? 'bg-white text-black' : 'bg-black/40 text-white')}
                    `}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold ${itemText}`}>{item.label}</span>
                    
                    {item.badge && (
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
                 className={`card-shine w-full flex items-center justify-center gap-3 py-3 rounded-xl border transition-all active:scale-95
                   ${isLight 
                     ? 'bg-gray-50 border-gray-200 text-black' 
                     : 'bg-white/5 border-white/10 text-white'}
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
