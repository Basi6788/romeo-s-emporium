import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- STYLES & ANIMATIONS ---
const styles = `
  /* Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

  .brand-font {
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    transition: letter-spacing 0.4s ease;
  }
  
  /* Logo Letter Spread Animation */
  .logo-container:hover .brand-font {
    letter-spacing: 0.2em; /* Letters spread out */
  }

  /* 3D Gold Text */
  .gold-text-3d {
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.5));
  }

  /* --- NEON BORDER LOGIC (Borders Only) --- */
  @keyframes rotateBorder {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Container for the border effect */
  .neon-wrapper {
    position: relative;
    z-index: 1;
    overflow: hidden;
    border-radius: inherit;
    padding: 2px; /* Thickness of the border */
    transition: transform 0.1s ease;
  }

  /* The Moving Rainbow Background (Hidden behind content) */
  .neon-wrapper::before {
    content: '';
    position: absolute;
    inset: -50%;
    z-index: -1;
    width: 200%;
    height: 200%;
    background: linear-gradient(60deg, 
      #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000
    );
    background-size: 300% 300%;
    animation: rotateBorder 4s linear infinite;
    opacity: 0.7; /* Thora dim kiya hai taake content nazar aye */
  }

  /* The Inner Glass Content (Covers the middle so only border shows) */
  .neon-content {
    background: rgba(20, 20, 20, 0.6); /* Dark Glass */
    backdrop-filter: blur(10px);
    border-radius: inherit;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  .light-mode .neon-content {
    background: rgba(255, 255, 255, 0.7); /* Light Glass */
    border: 1px solid rgba(0,0,0,0.05);
  }

  /* Hover Shine Effect on Borders */
  .neon-wrapper:hover::before {
    filter: brightness(1.5) blur(2px); /* Shine barh jayegi */
    opacity: 1;
  }

  /* CLICK 'BREAK' EFFECT */
  .click-break:active {
    transform: scale(0.95);
    filter: brightness(1.3);
  }

  /* SPECIAL SIGN IN BUTTON (Full Gradient) */
  .sign-in-special {
    background: linear-gradient(45deg, #ff0000, #002bff);
    background-size: 200% 200%;
    animation: rotateBorder 3s ease infinite;
    box-shadow: 0 0 15px rgba(0, 43, 255, 0.5);
    border: none;
    color: white !important;
  }

  /* Smooth GPU Animation Class */
  .gpu-anim {
    will-change: transform, opacity;
    transform: translateZ(0);
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
  const logoRef = useRef(null);

  const isLight = theme === 'light';

  // --- SCROLL HANDLER ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- MENU ANIMATION (Optimized) ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      gsap.fromTo(menuRef.current, 
        { scale: 0.8, opacity: 0, rotationX: 15 },
        { scale: 1, opacity: 1, rotationX: 0, duration: 0.4, ease: "back.out(1.2)" }
      );
      gsap.fromTo(".menu-item", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1 }
      );
    }
  }, [menuOpen]);

  // --- LOGO HOVER ANIMATION ---
  const handleLogoHover = () => {
    gsap.to(logoRef.current, { rotation: 360, duration: 0.6, ease: "power2.out" });
  };
  const handleLogoLeave = () => {
    gsap.to(logoRef.current, { rotation: 0, duration: 0.5 });
  };

  // --- DYNAMIC CLASSES ---
  // Fix: Icons disappear in light mode. Logic: If light mode, text black. If dark, text white.
  const iconClass = isLight ? "text-black" : "text-white";
  const headerBg = scrolled 
    ? (isLight ? "bg-white/90 shadow-sm" : "bg-black/90 shadow-white/5") 
    : "bg-transparent";

  // Menu Items (Track Order is BACK)
  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    // Sign In button is handled separately below for special styling
  ];

  return (
    <>
      <style>{styles}</style>

      {/* --- HEADER BAR --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 backdrop-blur-md ${headerClass} ${headerBg}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* 1. ANIMATED LOGO & TEXT */}
          <Link to="/" className="logo-container flex items-center gap-3 z-[60] group">
             <img 
               ref={logoRef}
               src="/logo-m.png" 
               alt="M" 
               className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
               onMouseEnter={handleLogoHover}
               onMouseLeave={handleLogoLeave}
             />
             <span className={`text-2xl brand-font gold-text-3d cursor-pointer tracking-wider ${scrolled && isLight ? '' : 'drop-shadow-lg'}`}>
               MIRAE
             </span>
          </Link>

          {/* 2. ICONS (SEARCH & MENU) - 3D & Reactive */}
          <div className="flex items-center gap-4 z-[60]">
            
            {/* Search Icon */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className={`relative group p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${iconClass}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-full blur-sm transition-opacity`}></div>
              {searchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6 drop-shadow-md" />}
            </button>

            {/* Menu Icon */}
            <button 
              onClick={() => setMenuOpen(true)} 
              className={`relative group p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${iconClass}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-full blur-sm transition-opacity`}></div>
              <MenuIcon className="w-6 h-6 drop-shadow-md" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SEARCH BAR DROPDOWN */}
        <div className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ${searchOpen ? 'h-16 opacity-100' : 'h-0 opacity-0'}`}>
           <div className={`h-full flex items-center px-4 backdrop-blur-xl border-b ${isLight ? 'bg-white/95 border-gray-200' : 'bg-black/90 border-white/10'}`}>
             <Search className={`w-5 h-5 mr-3 ${iconClass}`} />
             <input 
               type="text" 
               placeholder="Search for products..." 
               className={`w-full bg-transparent text-lg focus:outline-none ${isLight ? 'text-black placeholder-gray-500' : 'text-white placeholder-gray-400'}`}
             />
           </div>
        </div>
      </header>

      {/* --- MENU WINDOW (MODAL) --- */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4">
          
          {/* Overlay */}
          <div 
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px] animate-in fade-in duration-300"
          />

          {/* MAIN MENU CONTAINER - Rainbow Border Here */}
          <div 
            ref={menuRef}
            className="gpu-anim relative w-full max-w-sm mt-14 rounded-[30px] neon-wrapper shadow-2xl"
          >
            {/* The Inner Glass Content */}
            <div className={`neon-content flex-col items-start justify-start overflow-hidden !bg-opacity-90 ${isLight ? 'bg-[#f0f0f0]' : 'bg-[#0a0a0a]'}`}>
                
              {/* Menu Header */}
              <div className="w-full flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex flex-col">
                   <h2 className={`text-3xl font-black tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>MENU</h2>
                   {/* SIGNATURE */}
                   <span className="text-[10px] font-bold tracking-[0.2em] bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent mt-1 animate-pulse">
                     Created By @ROMEO
                   </span>
                </div>
                <button onClick={() => setMenuOpen(false)} className={`p-2 rounded-full hover:bg-white/10 ${iconClass}`}>
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Menu Grid Items */}
              <div className="w-full grid grid-cols-2 gap-4 p-5">
                {menuItems.map((item, idx) => (
                  <Link 
                    key={idx} 
                    to={item.to} 
                    onClick={() => setMenuOpen(false)}
                    className="menu-item neon-wrapper rounded-2xl h-32 group click-break"
                  >
                    <div className={`neon-content flex-col gap-3 transition-colors ${isLight ? 'hover:bg-white/50' : 'hover:bg-white/5'}`}>
                      {/* Icon */}
                      <item.icon className={`w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${isLight ? 'text-gray-800' : 'text-gray-200'}`} />
                      
                      {/* Label */}
                      <span className={`text-sm font-bold tracking-wide ${isLight ? 'text-black' : 'text-white'}`}>
                        {item.label}
                      </span>

                      {/* Badge */}
                      {item.badge > 0 && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/50">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                {/* SIGN IN BUTTON (Special Case - Always Full Gradient) */}
                <Link
                  to={isAuthenticated ? "/account" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="menu-item col-span-2 rounded-2xl h-16 click-break sign-in-special flex items-center justify-center gap-3 font-bold tracking-widest text-lg"
                >
                  <LogIn className="w-5 h-5" />
                  {isAuthenticated ? "MY ACCOUNT" : "SIGN IN"}
                </Link>
              </div>

              {/* Footer / Theme Toggle */}
              <div className="w-full p-5 pt-0">
                <button 
                  onClick={toggleTheme}
                  className="w-full neon-wrapper rounded-xl h-12 click-break"
                >
                   <div className="neon-content gap-3">
                     {isLight ? <Moon className="w-4 h-4 text-black" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                     <span className={`font-bold text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                       {isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                     </span>
                   </div>
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
