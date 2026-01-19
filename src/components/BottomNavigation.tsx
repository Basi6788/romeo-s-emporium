import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, 
  LayoutGrid, 
  Heart, 
  User 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();
  
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const isAdminPage = location.pathname.startsWith('/admin');

  // --- CONFIGURATION: Cart aur Truck remove kar diye ---
  const navItems = [
    { to: '/', label: 'Home', icon: House, activeColor: '#3b82f6' }, // Blue
    { to: '/products', label: 'Shop', icon: LayoutGrid, activeColor: '#f59e0b' }, // Amber
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, activeColor: '#ef4444' }, // Red
    { to: isAuthenticated ? '/profile' : '/auth', label: 'Account', icon: User, activeColor: '#8b5cf6' }, // Purple
  ];

  // 1. KEYBOARD DETECTION (Typing fix)
  useEffect(() => {
    const handleResize = () => {
      // Agar viewport ki height original se 20% kam ho jaye, matlab keyboard khula hai
      if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.8) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // 2. Initial Animation
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
      setActiveIndex(newIndex);
    }
  }, [location.pathname]);

  // 4. SMOOTH ANIMATION LOGIC (No Plane, just Smooth Slide)
  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && indicatorRef.current) {
      const activeItem = itemRefs.current[activeIndex];
      const navRect = navRef.current?.getBoundingClientRect();
      const currentConfig = navItems[activeIndex];
      
      if (activeItem && navRect) {
        const itemRect = activeItem.getBoundingClientRect();
        // Calculate Center Position
        const targetX = itemRect.left - navRect.left + (itemRect.width / 2);

        // A. Move Indicator (Elastic Effect)
        gsap.to(indicatorRef.current, {
          x: targetX,
          duration: 0.6,
          ease: 'elastic.out(1, 0.7)', // Bouncy slide
        });

        // B. Animate Icons
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const icon = item.querySelector('.nav-icon');
          
          if (index === activeIndex) {
            // ACTIVE ICON: Float Up + Color
            gsap.to(icon, {
              y: -10,
              scale: 1.2,
              color: currentConfig.activeColor,
              filter: `drop-shadow(0 0 15px ${currentConfig.activeColor}60)`, // Soft Glow
              duration: 0.4,
              ease: 'back.out(1.7)'
            });
          } else {
            // INACTIVE ICON: Reset
            gsap.to(icon, {
              y: 0,
              scale: 1,
              color: 'currentColor', // Reset to Theme Color
              filter: 'none',
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  }, [activeIndex]);

  // 5. Scroll Handling (Hide on Scroll Down)
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;

          // Scroll Logic
          if (currentScrollY > 50 && scrollDiff > 10) {
            setIsVisible(false); // Scroll Down -> Hide
          } else if (scrollDiff < -5 || currentScrollY < 50) {
            setIsVisible(true); // Scroll Up -> Show
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

  if (isAdminPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden">
      <nav
        ref={navRef}
        className={`
          pointer-events-auto
          mb-5 mx-6 w-full max-w-[320px] 
          bg-white/80 dark:bg-zinc-900/80 
          backdrop-blur-xl border border-white/20 dark:border-white/5
          rounded-2xl shadow-2xl
          will-change-transform
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${(isVisible && !isKeyboardOpen) 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-[150%] opacity-0 scale-95' // Keyboard open hone par neeche chhup jayega
          }
        `}
        style={{ height: '64px' }}
      >
        {/* MOVING INDICATOR (Soft Blob) */}
        <div 
          ref={indicatorRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 -ml-6 pointer-events-none z-0"
        >
           {/* Simple Glowing Dot/Blob instead of Plane */}
           <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 blur-md" />
           <div className="absolute inset-3 rounded-full bg-primary/10 blur-sm" />
        </div>

        {/* Nav Items */}
        <div className="relative flex items-center justify-between px-6 h-full z-10 w-full">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            
            return (
              <Link
                key={item.to}
                ref={el => itemRefs.current[index] = el}
                to={item.to}
                onClick={(e) => {
                    if (location.pathname === item.to) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
                className="relative flex items-center justify-center h-full w-10 group"
              >
                <div className="nav-icon text-foreground/60">
                  <item.icon 
                    size={24}
                    fill="currentColor"
                    strokeWidth={0} 
                  />
                  
                  {/* Badge Logic */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm animate-in zoom-in">
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

