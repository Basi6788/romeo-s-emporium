import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

// --- GOOGLE FONT (Add this to your index.css or HTML head if not working) ---
// @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

// --- THREE.JS COMPONENT: PARTICLE FIELD (For Menu VFX) ---
function StarField(props) {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));
  
  useFrame((state, delta) => {
    if(ref.current) {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#FFD700" size={0.005} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
}

// --- COMPONENT: MAGNETIC BUTTON (GSAP REACTIVE) ---
const MagneticButton = ({ children, onClick, className }) => {
    const btnRef = useRef(null);

    useEffect(() => {
        const el = btnRef.current;
        if(!el) return;

        const mouseMove = (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = el.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);

            gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
        };

        const mouseLeave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        };

        el.addEventListener("mousemove", mouseMove);
        el.addEventListener("mouseleave", mouseLeave);

        return () => {
            el.removeEventListener("mousemove", mouseMove);
            el.removeEventListener("mouseleave", mouseLeave);
        };
    }, []);

    return (
        <button ref={btnRef} onClick={onClick} className={className}>
            {children}
        </button>
    );
};

// --- STYLES: GOLD & GLASS ---
const styles = `
  /* Advanced Glass - Better Visibility */
  .ultra-glass {
    background: rgba(20, 20, 20, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }

  .light .ultra-glass {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* GOLD 3D TEXT EFFECT */
  .gold-text-3d {
    font-family: 'Orbitron', sans-serif;
    background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #fff;
    text-transform: uppercase;
    position: relative;
    font-weight: 900;
    filter: drop-shadow(0 2px 0 rgb(180, 130, 0));
  }
`;

const Header = React.memo(() => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const location = useLocation();
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const overlayRef = useRef(null);

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close Menu on Route Change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // MENU ANIMATION (GSAP + 3D Transform)
  useEffect(() => {
    if (menuOpen && menuRef.current) {
        // Opening Sequence
        gsap.set(menuRef.current, { rotationX: 20, rotationY: -20, scale: 0.8, opacity: 0, perspective: 1000 });
        gsap.to(menuRef.current, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.6)"
        });
        
        // Background Overlay
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
        
        // Stagger Items
        gsap.fromTo(".menu-item-stagger", 
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, delay: 0.2 }
        );
    }
  }, [menuOpen]);

  const closeMenu = () => {
    gsap.to(menuRef.current, { scale: 0.9, opacity: 0, rotationX: 10, duration: 0.3 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => setMenuOpen(false) });
  };

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track Order', icon: MapPin },
    { to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/auth', label: isAuthenticated ? 'Account' : 'Sign In', icon: isAuthenticated ? Settings : LogIn },
  ];

  // Dynamic Colors
  const headerBg = scrolled 
    ? (theme === 'light' ? 'bg-white/80 border-gray-200 shadow-sm' : 'bg-black/70 border-white/5 shadow-md') 
    : 'bg-transparent border-transparent';
    
  const textColor = scrolled 
    ? (theme === 'light' ? 'text-black' : 'text-white') 
    : 'text-white';

  const iconColor = scrolled 
    ? (theme === 'light' ? 'text-gray-900' : 'text-white') 
    : 'text-white';

  const MenuModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end md:justify-center">
        {/* Full Screen Overlay with Three.js Canvas */}
        <div ref={overlayRef} className="absolute inset-0 bg-black/90 opacity-0 transition-opacity" onClick={closeMenu}>
            <div className="absolute inset-0 z-0 opacity-40">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <Suspense fallback={null}>
                        <StarField />
                    </Suspense>
                </Canvas>
            </div>
        </div>

        {/* 3D Glass Menu */}
        <div 
            ref={menuRef}
            className={`
                relative z-10 w-full h-full md:h-auto md:w-[450px] md:rounded-3xl 
                flex flex-col p-8 overflow-hidden
                ${theme === 'dark' ? 'bg-black/40 border border-white/10' : 'bg-white/60 border border-white/40'}
                backdrop-blur-2xl shadow-2xl
            `}
        >
            <div className="flex justify-between items-center mb-10">
                <span className={`text-2xl font-bold gold-text-3d`}>MENU</span>
                <MagneticButton onClick={closeMenu} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <X className={`w-8 h-8 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                </MagneticButton>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {menuItems.map((item, idx) => (
                    <Link
                        key={idx}
                        to={item.to}
                        onClick={closeMenu}
                        className="menu-item-stagger group flex items-center gap-6 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-yellow-500/30"
                    >
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${idx % 2 === 0 ? 'from-yellow-400 to-orange-500' : 'from-purple-500 to-blue-500'} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xl font-medium tracking-wide ${theme === 'light' ? 'text-black' : 'text-white'} group-hover:text-yellow-400 transition-colors`}>
                            {item.label}
                        </span>
                        {item.badge ? (
                            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">{item.badge}</span>
                        ) : <ChevronRight className="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400" />}
                    </Link>
                ))}
            </div>

            <div className="mt-auto pt-8 flex justify-center">
                 <MagneticButton onClick={toggleTheme} className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-white backdrop-blur-md">
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-300" />}
                    <span className="font-semibold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </MagneticButton>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      
      {/* HEADER */}
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-500 ease-in-out backdrop-blur-[8px] ${headerBg}`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            
            {/* BRAND */}
            <Link to="/" className="relative z-50 group flex items-center gap-3">
                <div className="relative w-10 h-10 perspective-1000">
                     <img src="/logo-m.png" alt="M" className="w-full h-full object-contain group-hover:rotate-y-180 transition-transform duration-700" style={{ transformStyle: 'preserve-3d' }} />
                </div>
                <span className="gold-text-3d text-2xl tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500">
                    MIRAE
                </span>
            </Link>

            {/* ACTIONS */}
            <div className="flex items-center gap-4 z-50">
                <MagneticButton 
                    onClick={() => setSearchOpen(!searchOpen)} 
                    className={`p-3 rounded-full hover:bg-white/10 transition-all ${iconColor}`}
                >
                    {searchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                </MagneticButton>

                <MagneticButton 
                    onClick={() => setMenuOpen(true)}
                    className={`p-3 rounded-full hover:bg-white/10 transition-all flex items-center justify-center ${iconColor}`}
                >
                    <div className="flex flex-col items-end gap-[5px] group-hover:gap-[7px] transition-all">
                        <span className={`w-6 h-0.5 rounded-full ${scrolled && theme === 'light' ? 'bg-black' : 'bg-white'} group-hover:w-8 transition-all`}></span>
                        <span className={`w-4 h-0.5 rounded-full ${scrolled && theme === 'light' ? 'bg-black' : 'bg-white'} group-hover:w-8 transition-all`}></span>
                        <span className={`w-6 h-0.5 rounded-full ${scrolled && theme === 'light' ? 'bg-black' : 'bg-white'} group-hover:w-8 transition-all`}></span>
                    </div>
                    {itemCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
                </MagneticButton>
            </div>
        </div>

        {/* SEARCH BAR (Dropdown) */}
        <div className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-500 ${searchOpen ? 'h-20 opacity-100' : 'h-0 opacity-0'}`}>
             <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-white/10 h-full flex items-center px-4">
                 <input 
                    type="text" 
                    placeholder="Search for something awesome..." 
                    className="w-full bg-transparent text-xl outline-none text-center font-orbitron placeholder:text-gray-400 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                 />
             </div>
        </div>
      </header>

      {/* PORTAL FOR MENU */}
      {menuOpen && createPortal(<MenuModal />, document.body)}
    </>
  );
});

// Helper for Menu Items (Optional Icon imports needed if copied strictly)
const ChevronRight = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export default Header;
