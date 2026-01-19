import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, 
  LayoutGrid, // "Products" ke liye best (Grid view)
  Heart, 
  ShoppingCart, // Classic Cart
  User, 
  Truck, // Tracking ke liye Truck (Modern)
  Plane 
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

  // CONFIGURATION: Har icon ka apna "Asal Colour" (True Color)
  const navItems = [
    { to: '/', label: 'Home', icon: House, activeColor: '#3b82f6' }, // Blue
    { to: '/products', label: 'Shop', icon: LayoutGrid, activeColor: '#f59e0b' }, // Amber/Orange
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, activeColor: '#ef4444' }, // RED
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount, activeColor: '#10b981' }, // Green
    { to: '/track-order', label: 'Track', icon: Truck, activeColor: '#06b6d4' }, // Cyan
    { to: isAuthenticated ? '/profile' : '/auth', label: 'Account', icon: User, activeColor: '#8b5cf6' }, // Purple
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
      setPrevIndex(activeIndex);
      setActiveIndex(newIndex);
    }
  }, [location.pathname]);

  // 4. ANIMATION LOGIC (Plane -> Blob + Color Transition)
  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && indicatorRef.current) {
      const activeItem = itemRefs.current[activeIndex];
      const navRect = navRef.current?.getBoundingClientRect();
      const currentConfig = navItems[activeIndex];
      
      if (activeItem && navRect) {
        setIsMoving(true); // Start Flight

        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + (itemRect.width / 2);

        // Move the Indicator
        gsap.to(indicatorRef.current, {
          x: targetX,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setIsMoving(false); // Flight Over
          }
        });

        // Animate Icons (Color & Position)
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const icon = item.querySelector('.nav-icon');
          const config = navItems[index];

          if (index === activeIndex) {
            // ACTIVE: Float Up + Change to "True Color"
            gsap.to(icon, {
              y: -12,
              scale: 1.25,
              color: config.activeColor, // Turning RED/BLUE/GREEN
              filter: `drop-shadow(0 0 12px ${config.activeColor}80)`, // Colored Glow
              duration: 0.5,
              ease: 'back.out(2)'
            });
          } else {
            // INACTIVE: Reset to Black/White Filled
            gsap.to(icon, {
              y: 0,
              scale: 1,
              color: 'currentColor', // Wapas Text Color (Black/White) par
              filter: 'none',
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  }, [activeIndex]);

  // 5. Scroll Handling
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
          bg-white/90 dark:bg-black/90 
          backdrop-blur-xl border border-white/20 dark:border-white/10
          rounded-full shadow-2xl
          will-change-transform
          transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${(isVisible && !isKeyboardOpen) ? 'translate-y-0' : 'translate-y-[180%]'}
        `}
        style={{ height: '70px' }}
      >
        {/* MOVING INDICATOR (Plane / Blob) */}
        <div 
          ref={indicatorRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 -ml-7 pointer-events-none z-0"
        >
          {isMoving ? (
            /* ✈️ AIRPLANE MODE */
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Plane 
                className="w-8 h-8 text-primary transition-transform duration-300"
                fill="currentColor"
                style={{ 
                  transform: `rotate(${activeIndex > prevIndex ? '45deg' : '-135deg'})` 
                }} 
              />
            </div>
          ) : (
            /* 💡 PURPLE BLOB MODE */
            <div className="relative w-14 h-14 flex items-center justify-center animate-in fade-in zoom-in duration-300">
              <div className="w-full h-full bg-primary rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="absolute inset-2 bg-gradient-to-tr from-primary to-violet-500 rounded-full opacity-60" />
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
                  <item.icon 
                    size={26}
                    // FILLED LOGIC: 
                    // - isActive: Fill will be handled by GSAP 'color' (Red/Blue etc).
                    // - !isActive: Fill is 'currentColor' (Black/White).
                    fill="currentColor"
                    strokeWidth={0} // Always solid filled
                    className={`
                      transition-all duration-300
                      ${isActive 
                        ? '' // Active color handled by GSAP
                        : 'text-foreground/80 dark:text-foreground/90' // Inactive: Solid Black/White
                      }
                    `}
                  />
                  
                  {/* Notification Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-3 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center border border-white dark:border-black shadow-sm">
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
