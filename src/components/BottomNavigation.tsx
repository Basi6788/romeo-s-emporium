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
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/track-order', label: 'Track', icon: MapPin },
    { to: isAuthenticated ? '/profile' : '/auth', label: 'Account', icon: User },
  ];

  // Initial animation
  useEffect(() => {
    if (navRef.current && !isAdminPage) {
      gsap.fromTo(navRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, [isAdminPage]);

  // Find and animate active index
  useEffect(() => {
    const newIndex = navItems.findIndex(item => {
      if (item.to === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.to);
    });
    
    if (newIndex !== -1 && newIndex !== activeIndex) {
      const newItem = itemRefs.current[newIndex];
      
      if (newItem) {
        gsap.fromTo(newItem.querySelector('.nav-icon'),
          { scale: 0.8, y: 3 },
          { scale: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }
        );
      }
      
      setActiveIndex(newIndex);
    }
  }, [location.pathname]);

  // Active indicator animation
  useEffect(() => {
    if (activeIndex !== -1 && indicatorRef.current && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex];
      if (activeItem) {
        const rect = activeItem.getBoundingClientRect();
        const navRect = navRef.current?.getBoundingClientRect();
        if (navRect) {
          const left = rect.left - navRect.left + rect.width / 2 - 24;
          gsap.to(indicatorRef.current, {
            x: left,
            duration: 0.4,
            ease: 'power3.out'
          });
        }
      }
    }
  }, [activeIndex]);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
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
    <nav
      ref={navRef}
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
      
      {/* Active indicator */}
      <div
        ref={indicatorRef}
        className="absolute top-0 w-12 h-[2px] bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
        style={{ transform: 'translateX(0)' }}
      />

      {/* Nav items */}
      <div className="relative flex items-center justify-around px-1 py-2 safe-area-pb">
        {navItems.map((item, index) => {
          const isActive = item.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.to);
          
          return (
            <Link
              key={item.to}
              ref={el => itemRefs.current[index] = el}
              to={item.to}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 transition-colors duration-200 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {/* Icon */}
              <div className="nav-icon relative">
                <item.icon className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                }`} />
                
                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'opacity-100' : 'opacity-70'
              }`}>
                {item.label}
              </span>
              
              {/* Active dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;