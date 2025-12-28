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
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastScrollY = useRef(0);

  const isAdminPage = location.pathname.startsWith('/admin');

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Shop', icon: ShoppingBag },
    { to: '/wishlist', label: 'Saved', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: 'Account', icon: User },
  ];

  // Set Active Index
  useEffect(() => {
    const newIndex = navItems.findIndex(item => {
      if (item.to === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.to);
    });
    if (newIndex !== -1) setActiveIndex(newIndex);
  }, [location.pathname]);

  // Sliding Indicator Animation (Simple & Smooth)
  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && indicatorRef.current) {
      const activeItem = itemRefs.current[activeIndex];
      const navRect = navRef.current?.getBoundingClientRect();
      
      if (activeItem && navRect) {
        const itemRect = activeItem.getBoundingClientRect();
        // Calculate center position
        const left = itemRect.left - navRect.left + (itemRect.width / 2) - 16; // 16 is half of indicator width (32px)

        gsap.to(indicatorRef.current, {
          x: left,
          duration: 0.4,
          ease: 'power3.out'
        });
      }
    }
  }, [activeIndex]);

  // Scroll Hide/Show Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/Hide threshold
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminPage) return null;

  return (
    <>
      {/* Spacer div to prevent content from hiding behind nav */}
      <div className="h-16 md:hidden" />

      <nav
        ref={navRef}
        className={`
          fixed bottom-0 left-0 right-0 z-50 
          bg-background/90 backdrop-blur-lg border-t border-border/50
          transition-transform duration-300 ease-in-out md:hidden
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} // iPhone Home Bar fix
      >
        {/* Sliding Indicator (Top Line) */}
        <div 
          ref={indicatorRef}
          className="absolute top-0 left-0 w-8 h-[3px] bg-primary rounded-full shadow-[0_2px_10px_rgba(var(--primary),0.5)]"
          style={{ transform: 'translateX(0)' }} 
        />

        <div className="flex items-center justify-around h-14"> {/* Reduced Height here */}
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            
            return (
              <Link
                key={item.to}
                ref={el => itemRefs.current[index] = el}
                to={item.to}
                className={`
                  relative flex flex-col items-center justify-center w-full h-full
                  active:scale-95 transition-transform duration-100
                `}
                onClick={() => setActiveIndex(index)}
              >
                <div className="relative">
                  <item.icon 
                    className={`
                      w-[22px] h-[22px] transition-all duration-300
                      ${isActive ? 'text-primary stroke-[2.5px] -translate-y-1' : 'text-muted-foreground stroke-[1.5px]'}
                    `} 
                  />
                  
                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-[3px] rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center ring-2 ring-background">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                <span className={`
                  text-[10px] font-medium mt-0.5 transition-all duration-300
                  ${isActive ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 scale-75 hidden'}
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
