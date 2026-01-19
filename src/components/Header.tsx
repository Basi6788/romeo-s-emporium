import React, { useState, useEffect, useRef, memo } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  Sun, 
  Moon,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useUser } from '@clerk/clerk-react';
import gsap from 'gsap';

// --- STYLES ---
const styles = `
  /* Hide Scrollbar */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Smooth Floating Shadow */
  .floating-shadow {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  /* GPU Acceleration Class */
  .gpu-accelerated {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* --- ULTRA OPTIMIZED VIEW TRANSITION --- */
  
  /* 1. Purani screen ko foran chupa do (Saves 50% GPU) */
  ::view-transition-old(root) {
    display: none;
  }

  /* 2. Sirf Nayi screen ko dikhao */
  ::view-transition-new(root) {
    mix-blend-mode: normal;
    animation: none;
    z-index: 9999;
  }

  /* 3. Heavy Effects Disable karo Transition ke waqt */
  .is-transitioning,
  .is-transitioning * {
    backdrop-filter: none !important;
    filter: none !important;
    box-shadow: none !important;
    transition: none !important; /* Stop other CSS transitions */
  }
`;

// --- ISOLATED TYPEWRITER (Lag Prevention) ---
const TypewriterInput = memo(({ isHeaderDark }) => {
  const words = [
    "Milk", "Nike Shoes", "iPhone 15 Pro", "Gaming Laptop", 
    "Rolex Watch", "Fresh Eggs", "Men's Hoodie", "Gucci Perfume"
  ];
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer;
    const i = loopNum % words.length;
    const fullText = words[i];
    const handleTyping = () => {
      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
      setTypingSpeed(isDeleting ? 80 : 150);
      if (!isDeleting && text === fullText) setTimeout(() => setIsDeleting(true), 1500);
      else if (isDeleting && text === '') { setIsDeleting(false); setLoopNum(loopNum + 1); }
    };
    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <input 
      type="text" 
      placeholder={text} 
      className={`w-full bg-transparent border-none outline-none ml-3 text-sm font-medium tracking-wide transition-all ${isHeaderDark ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'}`}
    />
  );
});

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  // Refs
  const menuIconRef = useRef(null);
  const closeIconRef = useRef(null);
  const themeBtnRef = useRef(null); 

  // --- INVERTED THEME LOGIC ---
  const isAppLight = theme === 'light'; 
  const isHeaderDark = isAppLight; 

  const headerBgClass = isHeaderDark ? 'bg-black/95 text-white' : 'bg-white/95 text-black';
  const dropdownBgClass = isHeaderDark ? 'bg-[#0a0a0a]/95 text-white border-white/10' : 'bg-white/95 text-black border-gray-200';
  const hoverClass = isHeaderDark ? 'hover:bg-white/10' : 'hover:bg-black/5';

  // --- BUTTER SMOOTH THEME TOGGLE ---
  const handleThemeToggle = async (e) => {
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    const button = themeBtnRef.current || e.currentTarget;
    // Get exact icon position for center-origin
    const icon = button.querySelector('svg') || button; 
    const rect = icon.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Disable heavy CSS momentarily
    document.documentElement.classList.add('is-transitioning');

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    });

    await transition.ready;
    
    // Animate ONLY the new view (Old view is hidden via CSS)
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 600, // Thoda slow for visible smooth effect
        easing: "cubic-bezier(0.645, 0.045, 0.355, 1.000)", // Premium "Apple-like" easing
        pseudoElement: "::view-transition-new(root)",
      }
    );

    transition.finished.then(() => {
      document.documentElement.classList.remove('is-transitioning');
    });
  };

  // --- MENU ANIMATIONS ---
  useEffect(() => {
    if (menuOpen) {
      gsap.killTweensOf('.nav-pill');
      gsap.fromTo('.nav-pill', 
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [menuOpen]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { duration: 0.4, ease: "power2.inOut" } });
    if (menuOpen) {
      tl.to(menuIconRef.current, { rotation: 90, opacity: 0, scale: 0 }, 0)
        .to(closeIconRef.current, { rotation: 0, opacity: 1, scale: 1 }, 0);
    } else {
      tl.to(closeIconRef.current, { rotation: -90, opacity: 0, scale: 0 }, 0)
        .to(menuIconRef.current, { rotation: 0, opacity: 1, scale: 1 }, 0);
    }
  }, [menuOpen]);

  const handleLinkClick = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Wishlist', path: '/wishlist', badge: wishlistCount },
    { label: 'Cart', path: '/cart', badge: itemCount },
    { label: 'Track Order', path: '/track-order' },
    { label: isAuthenticated ? 'Profile' : 'Sign In', path: isAuthenticated ? '/profile' : '/auth' },
  ];

  const bubbleClass = `
    relative flex items-center justify-center gpu-accelerated
    backdrop-blur-xl floating-shadow border transition-all duration-300 active:scale-95
    ${isHeaderDark ? 'border-white/10' : 'border-black/10'}
    ${headerBgClass}
  `;

  return (
    <>
      <style>{styles}</style>
      
      {/* --- FLOATING HEADER --- */}
      <header className="fixed top-2 left-0 right-0 z-[100] px-3 w-full pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          {/* LEFT: AVATAR */}
          <div className="pointer-events-auto relative">
            <button 
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className={`${bubbleClass} w-12 h-12 rounded-full p-1 overflow-hidden hover:scale-105`}
            >
              <img 
                src={user?.imageUrl || "https://img.clerk.com/preview.png"} 
                alt="User" 
                className="w-full h-full object-cover rounded-full" 
              />
            </button>
            {avatarMenuOpen && (
               <div className={`absolute top-14 left-0 w-52 rounded-2xl p-2 shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 ${dropdownBgClass}`}>
                 {isAuthenticated ? (
                   <>
                     <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${hoverClass}`}>
                       <User size={18} /> Profile
                     </Link>
                     <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-500/10 font-medium">
                       <LogOut size={18} /> Logout
                     </button>
                   </>
                 ) : (
                   <Link to="/auth" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${hoverClass}`}>
                     <LogIn size={18} /> Sign In
                   </Link>
                 )}
               </div>
            )}
          </div>

          {/* CENTER: SEARCH BAR (Solid Border) */}
          <div className="pointer-events-auto flex-1 max-w-md mx-3 relative group hover:scale-[1.02] transition-transform duration-300">
             <div className="absolute inset-0 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 opacity-80 shadow-sm"></div>
             <div className={`relative h-12 rounded-full px-5 flex items-center justify-start ${headerBgClass} z-10 w-full`}>
                <Search size={20} className={`flex-shrink-0 ${isHeaderDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <TypewriterInput isHeaderDark={isHeaderDark} />
             </div>
          </div>

          {/* RIGHT: CART & MENU */}
          <div className="pointer-events-auto flex items-center gap-3">
             <Link to="/cart" className={`${bubbleClass} w-12 h-12 rounded-full hover:scale-105`}>
                <ShoppingBag size={22} />
                {itemCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white dark:border-black shadow-sm">{itemCount}</span>}
             </Link>
             <button 
               onClick={() => setMenuOpen(!menuOpen)}
               className={`${bubbleClass} w-12 h-12 rounded-full relative overflow-hidden hover:scale-105`}
             >
                <div ref={menuIconRef} className="absolute inset-0 flex items-center justify-center"><Menu size={24} strokeWidth={2.5} /></div>
                <div ref={closeIconRef} className="absolute inset-0 flex items-center justify-center opacity-0"><X size={24} strokeWidth={2.5} /></div>
             </button>
          </div>

        </div>
      </header>

      {/* --- MENU OVERLAY --- */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-transparent" onClick={() => setMenuOpen(false)} style={{ pointerEvents: 'auto' }} />
          <div className="relative z-[100] w-full max-w-sm px-6 flex flex-col gap-3 pointer-events-auto">
             {menuItems.map((item, idx) => (
               <button 
                 key={idx} 
                 onClick={() => handleLinkClick(item.path)}
                 className={`nav-pill w-full py-4 rounded-full text-lg font-bold tracking-wide border shadow-2xl gpu-accelerated flex items-center justify-center gap-3 relative backdrop-blur-3xl ${headerBgClass} ${hoverClass} ${isHeaderDark ? 'border-white/10' : 'border-black/10'}`}
               >
                 {item.label}
                 {item.badge > 0 && <span className="absolute right-5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">{item.badge}</span>}
               </button>
             ))}
             
             {/* THEME TOGGLE BUTTON */}
             <button 
               ref={themeBtnRef}
               onClick={handleThemeToggle} 
               className={`nav-pill mt-4 w-full py-3.5 rounded-full flex items-center justify-center gap-3 border shadow-xl backdrop-blur-3xl gpu-accelerated ${headerBgClass} ${hoverClass} ${isHeaderDark ? 'border-white/10' : 'border-black/10'}`}
             >
                {isAppLight ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400"/>}
                <span className="font-bold text-sm">{isAppLight ? 'Switch to Dark' : 'Switch to Light'}</span>
             </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Header;

