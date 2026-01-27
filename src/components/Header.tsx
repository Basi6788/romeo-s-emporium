import React, { useState, useEffect, memo } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Sun,
  Moon,
  User,
  LogOut,
  LogIn,
  HelpCircle,
  Home,
  Package,
  Heart,
  UserPlus,
  LayoutDashboard,
  Truck
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext'; // Ensure path is correct
import { useUser } from '@clerk/clerk-react';

// --- STYLES ---
const styles = `
  /* Hide Scrollbar */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Smooth Floating Shadow */
  .floating-shadow {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  /* GPU Acceleration */
  .gpu-accelerated {
    will-change: transform, opacity, background-color;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* --- CART & HEART ANIMATION (Bouncy Effect) --- */
  @keyframes icon-bounce {
    0% { transform: scale(1); }
    40% { transform: scale(1.2) rotate(-5deg); }
    60% { transform: scale(1.2) rotate(5deg); }
    100% { transform: scale(1); rotate(0); }
  }
  .icon-animating {
    animation: icon-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* Glass Dropdown Animation */
  @keyframes dropdown-enter {
    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .dropdown-animate {
    animation: dropdown-enter 0.2s ease-out forwards;
  }

  /* --- LINEAR WIPE THEME TRANSITION --- */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }
  ::view-transition-new(root) {
    z-index: 9999;
  }
  ::view-transition-old(root) {
    z-index: 1;
  }

  .is-transitioning,
  .is-transitioning * {
    backdrop-filter: none !important;
    transition: none !important;
    pointer-events: none !important;
  }
`;

// --- ISOLATED TYPEWRITER ---
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
      className={`w-full bg-transparent border-none outline-none ml-3 text-sm font-medium tracking-wide transition-colors ${isHeaderDark ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'}`}
    />
  );
});

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  
  // --- CONTEXT CONSUMPTION ---
  // Cart ka itemCount
  const { itemCount: cartCount } = useCart();
  
  // Wishlist ka itemCount (Renamed to avoid conflict)
  // Tumhare context me 'itemCount' hai, usko hum 'wishlistCount' variable me store kar rahe hain
  const { itemCount: wishlistCount } = useWishlist();

  const location = useLocation();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);

  // Theme Logic
  const isAppLight = theme === 'light';
  const isHeaderDark = isAppLight;

  // Trigger Cart Animation
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Trigger Wishlist Animation
  useEffect(() => {
    if (wishlistCount > 0) {
        setAnimateHeart(true);
        const timer = setTimeout(() => setAnimateHeart(false), 500);
        return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  // --- COLORS & GLASS STYLES ---
  const headerBgClass = isHeaderDark
    ? 'bg-black/90 text-white hover:bg-black/95 active:bg-black active:backdrop-blur-none'
    : 'bg-white/90 text-black hover:bg-white/95 active:bg-white active:backdrop-blur-none';

  const dropdownBgClass = isHeaderDark
    ? 'bg-black/70 text-white border-white/20 shadow-black/50 backdrop-blur-xl'
    : 'bg-white/70 text-black border-white/40 shadow-xl backdrop-blur-xl';

  const hoverClass = isHeaderDark ? 'hover:bg-white/10' : 'hover:bg-black/5';

  const navLinkClass = `
    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
    ${isHeaderDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/5'}
  `;

  const activeNavLinkClass = isHeaderDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black';

  const handleThemeToggle = async () => {
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }
    document.documentElement.classList.add('is-transitioning');
    const transition = document.startViewTransition(() => {
      flushSync(() => toggleTheme());
    });
    await transition.ready;
    document.documentElement.animate(
      { clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] },
      { duration: 800, easing: "cubic-bezier(0.87, 0, 0.13, 1)", pseudoElement: "::view-transition-new(root)" }
    );
    transition.finished.then(() => document.documentElement.classList.remove('is-transitioning'));
  };

  const bubbleClass = `
    relative flex items-center justify-center gpu-accelerated
    backdrop-blur-md floating-shadow border transition-all duration-300 active:scale-90
    ${isHeaderDark ? 'border-white/10' : 'border-black/10'}
    ${headerBgClass}
  `;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Products', path: '/products', icon: Package },
  ];

  const DropdownLink = ({ to, icon: Icon, label, onClick, className = "" }) => (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${hoverClass} ${className}`}
    >
      <Icon size={18} className="group-hover:scale-110 transition-transform duration-200" /> 
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      <style>{styles}</style>

      {/* --- FLOATING HEADER --- */}
      <header className="sticky top-2 left-0 right-0 z-[100] px-3 w-full pointer-events-none mb-[-60px]">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-4">

          {/* LEFT: AVATAR & DROPDOWN */}
          <div className="pointer-events-auto relative flex-shrink-0">
            <button
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="w-11 h-11 rounded-full overflow-hidden hover:scale-110 active:scale-95 transition-all duration-200 shadow-md border border-transparent focus:outline-none ring-2 ring-transparent hover:ring-orange-500/50"
            >
              <img
                src={user?.imageUrl || "https://img.clerk.com/preview.png"}
                alt="User"
                className="w-full h-full object-cover"
              />
            </button>

            {/* --- GLASS PROFILE DROPDOWN --- */}
            {avatarMenuOpen && (
               <div className={`absolute top-14 left-0 w-64 rounded-2xl p-2 border dropdown-animate z-50 ${dropdownBgClass}`}>
                 
                 {isAuthenticated ? (
                   // LOGGED IN STATE
                   <>
                     <div className="px-4 py-2 opacity-70 text-xs font-bold uppercase tracking-wider">Account</div>
                     <DropdownLink to="/profile" icon={User} label="Profile" onClick={() => setAvatarMenuOpen(false)} />
                     
                     {/* Updated: Cart Button */}
                     <DropdownLink to="/cart" icon={ShoppingBag} label="My Cart" onClick={() => setAvatarMenuOpen(false)} />
                     
                     {/* Updated: Track Order */}
                     <DropdownLink to="/track-order" icon={Truck} label="Track Order" onClick={() => setAvatarMenuOpen(false)} />
                     
                     <div className={`my-1 border-t ${isHeaderDark ? 'border-white/10' : 'border-gray-200/50'}`}></div>
                     
                     <DropdownLink to="/help" icon={HelpCircle} label="Help Center" onClick={() => setAvatarMenuOpen(false)} />

                     <button
                        onClick={handleThemeToggle}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${hoverClass}`}
                     >
                        {isAppLight ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400"/>}
                        <span>{isAppLight ? 'Dark Mode' : 'Light Mode'}</span>
                     </button>

                     <div className={`my-1 border-t ${isHeaderDark ? 'border-white/10' : 'border-gray-200/50'}`}></div>

                     <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-500/10 font-medium group">
                       <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Logout
                     </button>
                   </>
                 ) : (
                   // LOGGED OUT STATE
                   <>
                     <div className="px-4 py-2 opacity-70 text-xs font-bold uppercase tracking-wider">Navigation</div>
                     <DropdownLink to="/" icon={Home} label="Home" onClick={() => setAvatarMenuOpen(false)} />
                     <DropdownLink to="/products" icon={LayoutDashboard} label="Products" onClick={() => setAvatarMenuOpen(false)} />
                     <DropdownLink to="/wishlist" icon={Heart} label="Wishlist" onClick={() => setAvatarMenuOpen(false)} />
                     <DropdownLink to="/cart" icon={ShoppingBag} label="Cart" onClick={() => setAvatarMenuOpen(false)} />

                     <div className={`my-1 border-t ${isHeaderDark ? 'border-white/10' : 'border-gray-200/50'}`}></div>

                     <div className="grid grid-cols-2 gap-2 p-1">
                        <Link to="/login" onClick={() => setAvatarMenuOpen(false)} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-center text-xs font-bold transition-colors ${isHeaderDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
                           <LogIn size={20} className="mb-1" />
                           Login
                        </Link>
                        <Link to="/signup" onClick={() => setAvatarMenuOpen(false)} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-center text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg shadow-orange-500/20">
                           <UserPlus size={20} className="mb-1" />
                           Sign Up
                        </Link>
                     </div>
                   </>
                 )}
               </div>
            )}
          </div>

          {/* MIDDLE LEFT: DESKTOP NAV LINKS */}
          <nav className={`pointer-events-auto hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full backdrop-blur-md border ${isHeaderDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/5'} floating-shadow transition-all duration-300`}>
             {navItems.map((item) => {
               const Icon = item.icon;
               const isActive = location.pathname === item.path;
               return (
                 <Link
                   key={item.path}
                   to={item.path}
                   className={`${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
                 >
                   <Icon size={16} strokeWidth={2.5} />
                   <span>{item.label}</span>
                 </Link>
               );
             })}
          </nav>

          {/* SEARCH BAR */}
          <div className="pointer-events-auto flex-1 max-w-sm lg:max-w-md relative group hover:scale-[1.02] transition-transform duration-300">
             <div className="absolute inset-0 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 opacity-80 shadow-sm animate-pulse"></div>
             <div className={`relative h-11 rounded-full px-4 flex items-center justify-start z-10 w-full transition-colors duration-200 ${headerBgClass}`}>
                <Search size={18} className={`flex-shrink-0 ${isHeaderDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <TypewriterInput isHeaderDark={isHeaderDark} />
             </div>
          </div>

          {/* RIGHT: ACTION ICONS */}
          <div className="pointer-events-auto flex items-center gap-3">
             
             {/* Wishlist Link (With Real Count from Context) */}
             <Link
               to="/wishlist"
               className={`${bubbleClass} w-11 h-11 rounded-full hover:scale-110 group`}
             >
                <Heart
                  size={20}
                  className={`transition-all duration-300 ${animateHeart ? 'icon-animating fill-red-500 text-red-500' : 'group-hover:text-red-500'}`}
                />
                
                {wishlistCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 shadow-sm transition-transform duration-300 ${isHeaderDark ? 'border-black' : 'border-white'} ${animateHeart ? 'scale-110' : 'scale-100'}`}>
                    {wishlistCount}
                  </span>
                )}
             </Link>

             {/* Cart Button */}
             <Link
               to="/cart"
               className={`${bubbleClass} w-11 h-11 rounded-full hover:scale-110 group`}
             >
                <ShoppingBag
                  size={20}
                  className={`transition-all duration-300 ${animateCart ? 'icon-animating text-orange-500' : ''}`}
                />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 shadow-sm transition-transform duration-300 ${isHeaderDark ? 'border-black' : 'border-white'} ${animateCart ? 'scale-110' : 'scale-100'}`}>
                    {cartCount}
                  </span>
                )}
             </Link>
          </div>

        </div>
      </header>
    </>
  );
};

export default Header;

