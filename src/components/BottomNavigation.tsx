import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, // Home ki jagah House (better filled look)
  LayoutGrid, // Modern Shop Icon
  Heart, 
  ShoppingBasket, // Modern Cart Icon
  User, 
  MapPin,
  Plane // Airplane icon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const isAdminPage = location.pathname.startsWith('/admin');

  // Updated Modern & Filled Icons
  const navItems = [
    { to: '/', label: 'Home', icon: House },
    { to: '/products', label: 'Shop', icon: LayoutGrid },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingBasket, badge: itemCount },
    { to: '/track-order', label: 'Track', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: 'Account', icon: User },
  ];

  // 1. Keyboard Logic
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.8) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // 2. Initial Pop-up Animation
  useEffect(() => {
    if (navRef.current && !isAdminPage) {
      gsap.fromTo(navRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.2 }
      );
    }
  }, [isAdminPage]);

  // 3. Active Index Sync
  useEffect(() => {
    const newIndex = navItems.findIndex(item => {
      if (item.to === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.to);
    });
    
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setPrevIndex(activeIndex); // Save previous index for direction
      setActiveIndex(newIndex);
    }
  }, [location.pathname]);

  // 4. AIRPLANE TO EARTH ANIMATION
  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && indicatorRef.current) {
      const activeItem = itemRefs.current[activeIndex];
      const navRect = navRef.current?.getBoundingClientRect();
      
      if (activeItem && navRect) {
        setIsMoving(true); // Start moving (Show Plane)

        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + (itemRect.width / 2);

        // Determine Direction for Plane rotation
        const direction = activeIndex > prevIndex ? 1 : -1; 
        const rotation = direction === 1 ? 45 : -45; // Tilt plane right or left

        // Animate the Indicator Container
        gsap.to(indicatorRef.current, {
          x: targetX,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            setIsMoving(false); // Stop moving (Show Earth)
          }
        });

        // Animate Icons
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const icon = item.querySelector('.nav-icon');

          if (index === activeIndex) {
            // ACTIVE: Bounce Up & Fill
            gsap.to(icon, {
              y: -14,
              scale: 1.2,
              duration: 0.5,
              ease: 'back.out(2)'
            });
          } else {
            // INACTIVE: Reset
            gsap.to(icon, {
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  }, [activeIndex]);

  // 5. Scroll Hide/Show
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;
          if (currentScrollY > 50 && scrollDiff > 20) {
            setIsVisible(false);
          } else if (scrollDiff < -10 || currentScrollY < 50) {
            setIsVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleItemClick = (e: React.MouseEvent, to: string, index: number) => {
    if (location.pathname === to || (to !== '/' && location.pathname.startsWith(to))) {
      e.preventDefault();
      window.location.reload();
    } else {
      setPrevIndex(activeIndex);
      setActiveIndex(index);
    }
  };

  if (isAdminPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden">
      <nav
        ref={navRef}
        className={`
          pointer-events-auto
          mb-4 mx-4 w-full max-w-[360px]
          bg-white/80 dark:bg-black/80 
          backdrop-blur-xl border border-white/20 dark:border-white/10
          rounded-full shadow-2xl
          will-change-transform
          transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${(isVisible && !isKeyboardOpen) ? 'translate-y-0' : 'translate-y-[180%]'}
        `}
        style={{ height: '70px' }}
      >
        {/* MOVING INDICATOR (Plane -> Earth) */}
        <div 
          ref={indicatorRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 -ml-6 pointer-events-none z-0"
        >
          {isMoving ? (
            /* AIRPLANE MODE */
            <div className="relative w-12 h-12 flex items-center justify-center">
               {/* Motion Trail */}
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
              <Plane 
                className={`w-8 h-8 text-blue-600 dark:text-blue-400 transition-transform duration-300`}
                fill="currentColor"
                style={{ 
                  transform: `rotate(${activeIndex > prevIndex ? '45deg' : '-135deg'})` 
                }} 
              />
            </div>
          ) : (
            /* EARTH MODE */
            <div className="relative w-12 h-12 flex items-center justify-center">
               {/* Earth Glow */}
               <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full" />
               {/* CSS 3D Earth */}
               <div 
                 className="w-9 h-9 rounded-full shadow-inner animate-[spin_4s_linear_infinite]"
                 style={{
                   background: 'linear-gradient(to right, #005c97, #363795)', // Ocean
                   backgroundImage: `
                     radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0) 20%),
                     repeating-linear-gradient(45deg, rgba(76, 175, 80, 0.6) 0px, rgba(76, 175, 80, 0.6) 10px, transparent 10px, transparent 20px)
                   `, // Fake Continents effect
                   boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.5), 0 0 10px rgba(59, 130, 246, 0.5)'
                 }}
               >
                 {/* Atmosphere Ring */}
                 <div className="absolute inset-0 rounded-full border border-blue-300/30" />
               </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <div className="relative flex items-center justify-between px-5 h-full z-10">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            
            return (
              <Link
                key={item.to}
                ref={el => itemRefs.current[index] = el}
                to={item.to}
                onClick={(e) => handleItemClick(e, item.to, index)}
                className="relative flex items-center justify-center h-full w-12 group"
              >
                <div className="nav-icon transition-colors duration-300">
                  {/* Icon Render */}
                  <item.icon 
                    size={26}
                    // FILLED LOGIC: Fill color same as text, Stroke width 0 or very thin
                    fill={isActive ? "currentColor" : "currentColor"} 
                    strokeWidth={isActive ? 0 : 1.5}
                    className={`
                      transition-all duration-300
                      ${isActive 
                        ? 'text-black dark:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' // Active: Solid White/Black
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300' // Inactive: Grey
                      }
                    `}
                  />
                  
                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-3 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center border border-white shadow-sm">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavigation;
