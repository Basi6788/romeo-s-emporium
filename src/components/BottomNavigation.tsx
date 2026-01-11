import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home01Icon, 
  DashboardSquare01Icon, 
  FavouriteIcon, 
  ShoppingCart01Icon, 
  UserCircleIcon, 
  DeliveryTruck01Icon 
} from 'hugeicons-react';
import { useAuth } from '@/contexts/AuthContext'; // Ya Clerk ka useAuth agar direct use kar rahe hain
import { useUser } from '@clerk/clerk-react'; // Clerk User Hook
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import gsap from 'gsap';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isSignedIn, user } = useUser(); // Clerk hook for avatar
  const { itemCount } = useCart();
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

  // CONFIGURATION: HugeIcons & Colors
  const navItems = [
    { to: '/', label: 'Home', icon: Home01Icon, activeColor: '#3b82f6' }, // Blue
    { to: '/products', label: 'Shop', icon: DashboardSquare01Icon, activeColor: '#f59e0b' }, // Amber
    { to: '/wishlist', label: 'Wishlist', icon: FavouriteIcon, badge: wishlistCount, activeColor: '#ef4444' }, // Red
    { to: '/cart', label: 'Cart', icon: ShoppingCart01Icon, badge: itemCount, activeColor: '#10b981' }, // Green
    { to: '/track-order', label: 'Track', icon: DeliveryTruck01Icon, activeColor: '#06b6d4' }, // Cyan
    { to: isSignedIn ? '/profile' : '/auth', label: 'Account', icon: UserCircleIcon, activeColor: '#8b5cf6' }, // Purple
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
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // 2. Initial Entrance Animation
  useEffect(() => {
    if (navRef.current && !isAdminPage) {
      gsap.fromTo(navRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
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

  // 4. NEW ANIMATION LOGIC (Sliding Glow + Bounce)
  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && indicatorRef.current) {
      const activeItem = itemRefs.current[activeIndex];
      const navRect = navRef.current?.getBoundingClientRect();
      const currentConfig = navItems[activeIndex];
      
      if (activeItem && navRect) {
        const itemRect = activeItem.getBoundingClientRect();
        // Calculate center position for the indicator
        const targetX = itemRect.left - navRect.left + (itemRect.width / 2) - 24; // 24 is half of indicator width (48px)

        // Move the Indicator (The glowing background blob)
        gsap.to(indicatorRef.current, {
          x: targetX,
          backgroundColor: `${currentConfig.activeColor}20`, // Light tint of active color
          boxShadow: `0 0 20px ${currentConfig.activeColor}40`,
          duration: 0.6,
          ease: 'elastic.out(1, 0.75)' // Bouncy elastic feel
        });

        // Animate Icons
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const iconContainer = item.querySelector('.icon-container');
          const config = navItems[index];

          if (index === activeIndex) {
            // ACTIVE: Bounce Up + Color
            gsap.to(iconContainer, {
              y: -8,
              scale: 1.1,
              color: config.activeColor,
              duration: 0.5,
              ease: 'back.out(2.5)'
            });
          } else {
            // INACTIVE: Reset
            gsap.to(iconContainer, {
              y: 0,
              scale: 1,
              color: 'currentColor', // Back to theme text color
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  }, [activeIndex]);

  // 5. Scroll Handling (Hide/Show)
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;
          if (currentScrollY > 50 && scrollDiff > 10) {
            setIsVisible(false);
          } else if (scrollDiff < -5 || currentScrollY < 50) {
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

  if (isAdminPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden">
      <nav
        ref={navRef}
        className={`
          pointer-events-auto
          mb-4 mx-4 w-full max-w-[380px]
          bg-white/80 dark:bg-black/80 
          backdrop-blur-xl border border-white/20 dark:border-zinc-800
          rounded-2xl shadow-2xl shadow-black/10
          will-change-transform
          transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${(isVisible && !isKeyboardOpen) ? 'translate-y-0' : 'translate-y-[150%]'}
        `}
        style={{ height: '72px' }}
      >
        {/* ANIMATED INDICATOR (Background Blob) */}
        <div 
          ref={indicatorRef}
          className="absolute top-1/2 -mt-6 left-0 w-12 h-12 rounded-xl pointer-events-none z-0"
          style={{ transform: 'translateX(0px)' }} // Initial pos handled by GSAP
        />

        {/* Nav Items */}
        <div className="relative flex items-center justify-between px-2 h-full z-10 w-full">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            const isProfileItem = item.label === 'Account';
            
            return (
              <Link
                key={item.to}
                ref={el => itemRefs.current[index] = el}
                to={item.to}
                className="relative flex-1 flex items-center justify-center h-full group tap-highlight-transparent"
              >
                <div className="icon-container flex flex-col items-center justify-center transition-colors">
                  
                  {/* LOGIC: Agar Profile hai aur user Signed In hai, to Avatar dikhao, warna HugeIcon */}
                  {isProfileItem && isSignedIn && user?.imageUrl ? (
                    <div className={`
                      relative w-7 h-7 rounded-full overflow-hidden border-2 transition-all duration-300
                      ${isActive ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-transparent opacity-80'}
                    `}>
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <item.icon 
                      size={24}
                      variant={isActive ? "solid" : "stroke"} // HugeIcons support variants (agar available hon)
                      className={`transition-all duration-300 ${isActive ? 'drop-shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                  )}

                  {/* Notification Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-4 right-[25%] min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-black shadow-sm">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                
                {/* Active Dot (Optional: Icon ke neeche chota dot agar chahiye to) */}
                {isActive && !isProfileItem && (
                   <span className="absolute bottom-2 w-1 h-1 rounded-full bg-current opacity-60" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavigation;


