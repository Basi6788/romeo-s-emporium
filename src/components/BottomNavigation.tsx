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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastScrollY = useRef(0);

  // Hide admin pages from bottom nav
  const isAdminPage = location.pathname.startsWith('/admin');

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: ShoppingBag },
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
        { y: 0, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
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
      // Animate the icon switch
      const oldItem = itemRefs.current[activeIndex];
      const newItem = itemRefs.current[newIndex];
      
      if (oldItem && newItem) {
        // Scale down old item
        gsap.to(oldItem, {
          scale: 0.9,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            gsap.to(oldItem, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
          }
        });
        
        // Pop new item
        gsap.fromTo(newItem,
          { scale: 0.8, y: 5 },
          { scale: 1.1, y: -5, duration: 0.3, ease: 'back.out(2)', 
            onComplete: () => {
              gsap.to(newItem, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out' });
            }
          }
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
          const left = rect.left - navRect.left + rect.width / 2 - 20;
          gsap.to(indicatorRef.current, {
            x: left,
            duration: 0.5,
            ease: 'elastic.out(1, 0.6)'
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

  // Animated liquid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      time += 0.01;
      
      // Draw flowing liquid waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.offsetHeight / 2);
        
        for (let x = 0; x <= canvas.offsetWidth; x += 5) {
          const y = Math.sin(x * 0.02 + time + i) * 3 + 
                    Math.sin(x * 0.01 + time * 1.5 + i) * 2 + 
                    canvas.offsetHeight / 2 - 5 + i * 4;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight);
        ctx.lineTo(0, canvas.offsetHeight);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, 0);
        gradient.addColorStop(0, `hsla(270, 95%, 60%, ${0.05 - i * 0.01})`);
        gradient.addColorStop(0.5, `hsla(250, 95%, 65%, ${0.08 - i * 0.02})`);
        gradient.addColorStop(1, `hsla(280, 95%, 60%, ${0.05 - i * 0.01})`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Draw floating particles
      for (let i = 0; i < 10; i++) {
        const x = ((time * 20 + i * 50) % canvas.offsetWidth);
        const y = Math.sin(time * 2 + i) * 5 + canvas.offsetHeight / 2;
        const size = Math.sin(time + i) * 1 + 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(260, 95%, 70%, ${0.3 + Math.sin(time + i) * 0.2})`;
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (isAdminPage) return null;

  return (
    <nav
      ref={navRef}
      className={`fixed bottom-4 left-4 right-4 z-50 md:hidden transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'
      }`}
    >
      {/* Glass liquid background with rounded corners */}
      <div className="absolute inset-0 rounded-[28px] bg-background/60 dark:bg-background/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        
        {/* Animated liquid canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Shine effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      
      {/* Active indicator - glowing pill */}
      <div
        ref={indicatorRef}
        className="absolute top-1 w-10 h-1.5 rounded-full bg-gradient-to-r from-primary via-violet-500 to-primary shadow-[0_0_12px_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.5)]"
        style={{ transform: 'translateX(0)' }}
      />

      {/* Nav items */}
      <div className="relative flex items-center justify-around px-2 py-3 safe-area-pb">
        {navItems.map((item, index) => {
          const isActive = item.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.to);
          
          return (
            <Link
              key={item.to}
              ref={el => itemRefs.current[index] = el}
              to={item.to}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {/* Icon container with glow effect */}
              <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary/15 shadow-[0_0_16px_hsl(var(--primary)/0.4)]' : 'hover:bg-muted/50'
              }`}>
                <item.icon className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'stroke-[2.5px]' : 'stroke-2'
                }`} />
                
                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-primary to-violet-500 text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                
                {/* Active glow ring */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-violet-500/20 blur-md -z-10" />
                  </>
                )}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-semibold transition-all duration-300 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;