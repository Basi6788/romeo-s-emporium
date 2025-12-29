import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User, MapPin } from 'lucide-react';
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
  const lampRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Refs for scroll handling to avoid re-renders
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const isAdminPage = location.pathname.startsWith('/admin');

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Shop', icon: ShoppingBag },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: 'Account', icon: User },
  ];

  // 1. Keyboard Detection
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.8) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // 2. Initial Animation
  useEffect(() => {
    if (navRef.current && !isAdminPage) {
      gsap.fromTo(navRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.75)', delay: 0.2 }
      );
    }
  }, [isAdminPage]);

  // 3. Active Index Tracker
  useEffect(() => {
    const newIndex = navItems.findIndex(item => {
      if (item.to === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.to);
    });
    if (newIndex !== -1) setActiveIndex(newIndex);
  }, [location.pathname]);

  // 4. Main Animation Logic (Lamp + Icons)
  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && lampRef.current) {
      const activeItem = itemRefs.current[activeIndex];
      const navRect = navRef.current?.getBoundingClientRect();
      
      if (activeItem && navRect) {
        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + (itemRect.width / 2);

        // Move the Blob (Lamp)
        gsap.to(lampRef.current, {
          x: targetX,
          duration: 0.5,
          ease: 'back.out(1.7)'
        });

        // Animate All Icons
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const icon = item.querySelector('.nav-icon');

          if (index === activeIndex) {
            gsap.to(icon, {
              y: -12,
              scale: 1.3,
              color: '#ffffff',
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
              duration: 0.4,
              ease: 'back.out(2)'
            });
          } else {
            gsap.to(icon, {
              y: 0,
              scale: 1,
              color: 'currentColor',
              filter: 'none',
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  }, [activeIndex]);

  // 5. Optimized Scroll Handling (No Jitter)
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;

          // Logic: Sirf tab hide karo jab user significant neeche scroll kare (>20px)
          // Aur wapas tab lao jab user upar scroll kare
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

  // Hover Effects
  const handleMouseEnter = (index: number) => {
    if (index === activeIndex) return;
    const item = itemRefs.current[index];
    const icon = item?.querySelector('.nav-icon');
    if (icon) {
      gsap.to(icon, { scale: 1.2, y: -5, duration: 0.3, ease: 'elastic.out(1, 0.3)' });
    }
  };

  const handleMouseLeave = (index: number) => {
    if (index === activeIndex) return;
    const item = itemRefs.current[index];
    const icon = item?.querySelector('.nav-icon');
    if (icon) {
      gsap.to(icon, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }
  };

  // Handle Click (Refresh if same page)
  const handleItemClick = (e: React.MouseEvent, to: string, index: number) => {
    // Agar user usi page par hai jo click kia, to refresh karo
    if (location.pathname === to || (to !== '/' && location.pathname.startsWith(to))) {
      e.preventDefault();
      window.location.reload();
    } else {
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
          mb-4 mx-4 w-full max-w-[350px]
          glass-liquid rounded-full
          will-change-transform
          transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${(isVisible && !isKeyboardOpen) ? 'translate-y-0' : 'translate-y-[180%]'}
        `}
        style={{
          boxShadow: '0 15px 35px -5px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.25)',
          height: '65px',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* The Liquid Lamp */}
        <div 
          ref={lampRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 w-14 h-14 -ml-7 pointer-events-none"
        >
          <div className="w-full h-full bg-primary rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-tr from-primary to-purple-500 rounded-full opacity-70" />
        </div>

        {/* Nav Items */}
        <div className="relative flex items-center justify-between px-4 h-full">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            
            return (
              <Link
                key={item.to}
                ref={el => itemRefs.current[index] = el}
                to={item.to}
                onClick={(e) => handleItemClick(e, item.to, index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className={`
                  relative flex items-center justify-center
                  h-10 w-10 rounded-full transition-colors duration-300
                  ${isActive ? 'text-white' : 'text-muted-foreground/80 hover:text-foreground'}
                `}
              >
                {/* Icon Container */}
                <div className="nav-icon relative z-10">
                  <item.icon 
                    className={`w-6 h-6 transition-all duration-300 stroke-[1.5px]`} 
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-white/20 shadow-sm animate-bounce">
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
