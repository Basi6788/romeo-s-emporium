import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

// --- THREE.JS IMPORTS ---
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Environment, Sparkles, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D COMPONENT: GOLDEN LOGO ---
const GoldenLogo = ({ isLightMode, mouse }) => {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Mouse Reaction logic inside 3D world
    const x = (state.mouse.x * 0.5); 
    const y = (state.mouse.y * 0.5);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x, 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Center>
        <Text3D 
          ref={meshRef}
          font="/fonts/helvetiker_bold.typeface.json" // Make sure this file exists in public/fonts/
          size={0.6}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          MIRAE
          <meshStandardMaterial 
            color="#FFD700" // Gold
            metalness={1}
            roughness={0.1}
            emissive="#FFD700"
            emissiveIntensity={isLightMode ? 0.2 : 0} // Light mode mein thora extra shine
          />
        </Text3D>
      </Center>
    </Float>
  );
};

// --- 3D COMPONENT: MENU BACKGROUND VFX ---
const MenuVFX = () => {
  const groupRef = useRef(null);
  
  useFrame((state) => {
    if(groupRef.current) {
      groupRef.current.rotation.y -= 0.002; // Slow rotation
      groupRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={10} size={4} speed={0.4} opacity={0.5} color="#FFD700" />
      <ambientLight intensity={0.5} />
    </group>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // --- Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // --- GSAP REACTION FOR BUTTONS (DOM) ---
  const handleBtnHover = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, { 
      scale: 1.2, 
      rotation: 5,
      boxShadow: "0 0 15px rgba(255, 215, 0, 0.6)", 
      duration: 0.3, 
      ease: "back.out(1.7)" 
    });
  };

  const handleBtnLeave = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, { 
      scale: 1, 
      rotation: 0, 
      boxShadow: "none", 
      duration: 0.3 
    });
  };

  // --- MENU OPENING ANIMATION (GSAP + Three.js Canvas Fade) ---
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      // Menu Items Stagger
      gsap.fromTo(".menu-item",
        { y: 50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.05, ease: "elastic.out(1, 0.75)" }
      );
    }
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
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
  const isLight = theme === 'light';
  const iconColor = scrolled && isLight ? 'text-black' : 'text-white';
  const borderColor = scrolled && isLight ? 'border-black/20' : 'border-white/20';

  // --- MENU MODAL (With Three.js Background) ---
  const MenuModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* 1. Three.js VFX Background (The "Kamal" Animation) */}
      <div className="absolute inset-0 bg-black">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <MenuVFX />
        </Canvas>
      </div>

      {/* 2. Glass Overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={closeMenu}
      />

      {/* 3. Menu Content */}
      <div 
        ref={menuRef}
        className="relative z-10 w-full max-w-md bg-white/10 border border-white/20 rounded-[30px] p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/20">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            Navigation
          </span>
          <button onClick={closeMenu} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={idx}
                to={item.to}
                onMouseEnter={handleBtnHover}
                onMouseLeave={handleBtnLeave}
                onClick={closeMenu}
                className={`
                  menu-item group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all
                  ${isActive ? 'bg-white/10 border-yellow-500' : 'bg-transparent border-white/10'}
                `}
              >
                <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-white">{item.label}</span>
                {item.badge ? (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

         <div className="mt-8 flex justify-center">
          <button 
            onClick={toggleTheme} 
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl shadow-lg' : ''}`}
        style={{
            background: scrolled ? (isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)') : 'transparent',
            borderBottom: scrolled ? `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}` : 'none'
        }}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* --- 3D MIRAE LOGO (The Hero) --- */}
            <div className="relative w-40 h-16 cursor-pointer group">
              <Link to="/" className="block w-full h-full">
                {/* 3D Canvas specifically for Logo */}
                <Canvas camera={{ position: [0, 0, 3], fov: 45 }} className="pointer-events-none">
                    <ambientLight intensity={isLight ? 1 : 0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                    <Environment preset="city" />
                    <Suspense fallback={null}>
                        <GoldenLogo isLightMode={isLight} />
                    </Suspense>
                </Canvas>
              </Link>
            </div>

            {/* --- CONTROLS --- */}
            <div className="flex items-center gap-4">
              
              {/* Search Toggle */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                onMouseEnter={handleBtnHover}
                onMouseLeave={handleBtnLeave}
                className={`p-3 rounded-full border ${borderColor} ${iconColor} transition-all`}
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Menu Toggle */}
              <button 
                onClick={() => setMenuOpen(true)}
                onMouseEnter={handleBtnHover}
                onMouseLeave={handleBtnLeave}
                className={`p-3 rounded-full border ${borderColor} ${iconColor} transition-all relative`}
              >
                {/* Custom Hamburger Lines */}
                <div className="flex flex-col gap-1.5 items-end">
                    <span className={`w-6 h-0.5 rounded-full ${scrolled && isLight ? 'bg-black' : 'bg-white'}`} />
                    <span className={`w-4 h-0.5 rounded-full ${scrolled && isLight ? 'bg-black' : 'bg-white'}`} />
                    <span className={`w-6 h-0.5 rounded-full ${scrolled && isLight ? 'bg-black' : 'bg-white'}`} />
                 </div>
                 {itemCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH DRAWER */}
        <div className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ease-in-out ${searchOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
             {/* ... Search implementation same as before but uses theme variable ... */}
             <div className={`${isLight ? 'bg-white' : 'bg-black/90'} backdrop-blur-xl border-b border-white/10 pb-6 px-4`}>
                <div className="container mx-auto max-w-xl mt-4 relative">
                   <input
                      type="text"
                      placeholder="Search..."
                      className={`w-full p-4 rounded-xl border outline-none ${isLight ? 'bg-gray-100 text-black' : 'bg-white/10 text-white'}`}
                      autoFocus={searchOpen}
                   />
                </div>
             </div>
        </div>
      </header>

      {/* MENU PORTAL WITH VFX */}
      {menuOpen && createPortal(<MenuModal />, document.body)}
    </>
  );
});

export default Header;
