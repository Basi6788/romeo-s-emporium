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
  const lampRef = useRef<HTMLDivElement>(null); // The liquid light blob
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

  // 1. Initial Entry Animation (Elastic Bounce)
  useEffect(() => {
    if (navRef.current && !isAdminPage) {
      gsap.fromTo(navRef.current,
        { y: 150, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.7)', delay: 0.2 }
      );
    }
  }, [isAdminPage]);

  // 2. Active Index Logic
  useEffect(() => {
    const newIndex = navItems.findIndex(item => {
      if (item.to === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.to);
    });
    
    if (newIndex !== -1) setActiveIndex(newIndex);
  }, [location.pathname]);

  // 3. The 3D Animation & Liquid Lamp Movement
  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && lampRef.current) {
      const activeItem = itemRefs.current[activeIndex];
      const navRect = navRef.current?.getBoundingClientRect();
      
      if (activeItem && navRect) {
        const itemRect = activeItem.getBoundingClientRect();
        // Calculate center position relative to nav
        const targetX = itemRect.left - navRect.left + (itemRect.width / 2);

        // Animate the Liquid Lamp (The glowing background blob)
        gsap.to(lampRef.current, {
          x: targetX,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });

        // Animate Icons (3D Pop Effect)
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const icon = item.querySelector('.nav-icon');
          const label = item.querySelector('.nav-label');

          if (index === activeIndex) {
            // ACTIVE STATE: Float Up & Glow
            gsap.to(icon, {
              y: -8, // Float up
              scale: 1.2,
              color: '#ffffff', // Force white for contrast
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))',
              duration: 0.4,
              ease: 'back.out(2)'
            });
            gsap.to(label, { opacity: 1, y: 0, scale: 1, duration: 0.3 });
          } else {
            // INACTIVE STATE: Reset
            gsap.to(icon, {
              y: 0,
              scale: 1,
              color: 'currentColor',
              filter: 'none',
              duration: 0.4,
              ease: 'power2.out'
            });
            gsap.to(label, { opacity: 0.6, y: 0, scale: 0.9, duration: 0.3 });
          }
        });
      }
    }
  }, [activeIndex]);

  // 4. Smart Scroll Hide/Show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;

      // Hide if scrolling down > 10px, Show if scrolling up
      if (currentScrollY > 50 && scrollDiff > 10) {
        setIsVisible(false);
      } else if (scrollDiff < -5 || currentScrollY < 50) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
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
          mb-6 mx-4 w-full max-w-sm
          glass-liquid rounded-[2rem]
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}
        `}
        style={{
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)'
        }}
      >
        {/* The Liquid Lamp (Glowing Blob behind active item) */}
        <div 
          ref={lampRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-12 -ml-6 pointer-events-none"
        >
          <div className="w-full h-full bg-primary rounded-full blur-xl opacity-60 animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-tr from-primary to-violet-400 rounded-full opacity-80" />
        </div>

        {/* Nav Items Container */}
        <div className="relative flex items-center justify-between px-2 py-3">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            
            return (
              <Link
                key={item.to}
                ref={el => itemRefs.current[index] = el}
                to={item.to}
                className={`
                  relative flex-1 flex flex-col items-center justify-center
                  h-12 w-12 rounded-full transition-colors duration-300
                  ${isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'}
                `}
                onClick={() => setActiveIndex(index)}
              >
                {/* 3D Icon Container */}
                <div className="nav-icon relative z-10 transform-style-3d will-change-transform">
                  <item.icon 
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} 
                  />
                  
                  {/* Notification Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background shadow-sm animate-scale-in">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label (Only visible/active logic handled by GSAP) */}
                <span className="nav-label absolute -bottom-3 text-[9px] font-semibold tracking-wide whitespace-nowrap opacity-0">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavigation;
