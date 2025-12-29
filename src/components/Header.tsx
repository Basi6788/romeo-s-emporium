import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- CSS STYLES (Neon Borders, Glass, & Animations) ---
const styles = `
  /* GPU Acceleration for smoothness */
  .gpu-accelerated {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* MIRAE Font & Spacing Animation */
  .brand-font {
    font-family: 'Orbitron', sans-serif; /* Techy Font */
    font-weight: 900;
    letter-spacing: 2px;
    transition: letter-spacing 0.4s ease-out;
  }
  .brand-font:hover {
    letter-spacing: 6px; /* Letters spread on hover */
  }

  /* 3D Gold Text */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #ffecb3 40%, #3a2c0f 78%); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
  }

  /* --- NEON BORDER LOGIC (Borders Only, Glass Inside) --- */
  @keyframes borderRotate {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .neon-card {
    position: relative;
    z-index: 1;
    overflow: hidden;
    transition: transform 0.2s;
  }
  
  /* The Moving Rainbow Border */
  .neon-card::before {
    content: '';
    position: absolute;
    inset: -2px; /* Border thickness */
    z-index: -2;
    background: linear-gradient(90deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
    background-size: 300% 300%;
    animation: borderRotate 3s linear infinite;
    opacity: 0; /* Hidden by default */
    transition: opacity 0.3s ease;
  }

  /* Show border on hover */
  .neon-card:hover::before {
    opacity: 1;
    filter: blur(5px); /* Glow effect */
  }

  /* The Inner Glass Background (Covers the middle of the rainbow) */
  .neon-card::after {
    content: '';
    position: absolute;
    inset: 1px; /* Gap for border */
    z-index: -1;
    border-radius: inherit;
    backdrop-filter: blur(10px);
    transition: background-color 0.3s;
  }

  /* Theme-specific inner backgrounds */
  .light-mode .neon-card::after {
    background: rgba(255, 255, 255, 0.7);
  }
  .dark-mode .neon-card::after {
    background: rgba(20, 20, 20, 0.7);
  }

  /* Click "Break" Effect */
  .neon-card:active {
    transform: scale(0.95);
  }

  /* Main Nav Glass */
  .nav-glass {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
`;

// --- Reusable Neon Wrapper ---
// Ye component button/card ke ird-gird rainbow border lagata hai
const NeonWrapper = ({ children, onClick, className = "", isActive = false, badge }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={onClick}
      className={`
        neon-card group relative flex items-center justify-center rounded-xl transition-all duration-300
        ${className}
        ${isLight ? 'light-mode' : 'dark-mode'}
        ${isActive ? 'ring-2 ring-yellow-500' : ''} 
      `}
    >
      <div className="relative z-10 flex items-center justify-center w-full h-full p-3">
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
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const menuRef = useRef(null);
  const overlayRef = useRef(null);

  const isLight = theme === 'light';

  // --- Scroll Detection ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Optimized Menu Animation ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      document.body.style.overflow = 'hidden'; // Stop background scroll
      
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(menuRef.current, 
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
      
      // Items animation
      gsap.fromTo(".menu-item-stagger",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.2 }
      );

    } else {
      document.body.style.overflow = '';
      if (menuRef.current) {
         gsap.to(menuRef.current, { x: '100%', duration: 0.3 });
         gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
      }
    }
  }, [menuOpen]);

  // Dynamic Header Colors based on Scroll & Theme
  // Scrolled: Light=White/Black, Dark=Black/White
  // Top: Transparent/White
  const headerBgClass = scrolled 
    ? (isLight ? 'bg-white/80 text-black shadow-sm' : 'bg-black/80 text-white border-b border-white/10') 
    : 'bg-transparent text-white';

  const iconClass = scrolled && isLight ? 'text-gray-900' : 'text-white';

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/track-order', label: 'Track Order', icon: MapPin }, // <--- WAPAS AA GAYA
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: isAuthenticated ? '/profile' : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  return (
    <>
      <style>{styles}</style>

      {/* --- HEADER --- */}
      <header className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 nav-glass ${headerBgClass}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group z-[60]">
             <img src="/logo-m.png" alt="M" className="w-8 h-8 object-contain drop-shadow-lg" />
             <span className="text-2xl brand-font gold-text-3d cursor-pointer">
               MIRAE
             </span>
          </Link>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 z-[60]">
            
            {/* Search Toggle */}
            <NeonWrapper onClick={() => setSearchOpen(!searchOpen)} className="w-10 h-10 rounded-full">
               {searchOpen ? <X className={`w-5 h-5 ${iconClass}`} /> : <Search className={`w-5 h-5 ${iconClass}`} />}
            </NeonWrapper>

            {/* Menu Toggle */}
            <NeonWrapper onClick={() => setMenuOpen(true)} className="w-10 h-10 rounded-full" badge={itemCount}>
               <MenuIcon className={`w-5 h-5 ${iconClass}`} />
            </NeonWrapper>

          </div>
        </div>

        {/* SEARCH BAR DROPDOWN */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`p-4 border-b ${isLight ? 'bg-white/95' : 'bg-[#0a0a0a]/95'} backdrop-blur-xl`}>
             <input 
               type="text" 
               placeholder="Search for products..." 
               className={`w-full bg-transparent border-b-2 py-2 text-lg outline-none ${isLight ? 'border-gray-300 text-black' : 'border-gray-700 text-white'} focus:border-yellow-500`}
             />
          </div>
        </div>
      </header>

      {/* --- SIDE MENU MODAL --- */}
      {createPortal(
        <div className={`fixed inset-0 z-[100] ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          
          {/* Overlay */}
          <div 
            ref={overlayRef}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity"
          />

          {/* Menu Drawer */}
          <div 
            ref={menuRef}
            className={`
              absolute right-0 top-0 bottom-0 w-[85%] max-w-sm h-full shadow-2xl gpu-accelerated
              ${isLight ? 'bg-white/90' : 'bg-[#0f0f0f]/95'}
              backdrop-blur-xl border-l border-white/10
            `}
          >
            <div className="flex flex-col h-full p-6">
              
              {/* Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-3xl font-black italic tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>MENU</h2>
                  {/* SIGNATURE */}
                  <div className="text-[10px] font-bold tracking-[0.2em] bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent mt-1 animate-pulse">
                    CREATED BY @ROMEO
                  </div>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className={`p-2 rounded-full hover:bg-gray-500/20 ${isLight ? 'text-black' : 'text-white'}`}
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                {menuItems.map((item, idx) => {
                  const isActive = location.pathname === item.to;
                  const textColor = isLight ? 'text-gray-800' : 'text-gray-200';
                  
                  return (
                    <Link 
                      key={idx} 
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="menu-item-stagger block"
                    >
                      <NeonWrapper 
                        isActive={isActive} 
                        badge={item.badge}
                        className="h-28 w-full flex-col gap-2 rounded-2xl"
                      >
                         <div className={`p-3 rounded-full transition-transform group-hover:scale-110 ${isActive ? 'bg-yellow-500 text-black' : 'bg-gray-500/10'}`}>
                           <item.icon className={`w-6 h-6 ${isLight && !isActive ? 'text-black' : 'text-white'}`} />
                         </div>
                         <span className={`font-bold text-sm ${textColor}`}>{item.label}</span>
                      </NeonWrapper>
                    </Link>
                  )
                })}
              </div>

              {/* Footer Actions */}
              <div className="mt-auto space-y-4">
                 <button 
                   onClick={toggleTheme}
                   className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 border transition-all active:scale-95
                     ${isLight ? 'bg-gray-100 border-gray-200 text-black' : 'bg-white/5 border-white/10 text-white'}
                   `}
                 >
                   {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                   <span className="font-bold">Switch Theme</span>
                 </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default Header;
