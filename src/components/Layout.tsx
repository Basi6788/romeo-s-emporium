import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Home, ShoppingBag, Heart, ShoppingCart, HelpCircle, ArrowLeft } from 'lucide-react'; // ArrowLeft import kiya hai
import Header from './Header';
import Footer from './Footer';
// GSAP Imports
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// GSAP Plugin Registration
gsap.registerPlugin(useGSAP);

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  
  // Logic to check if we are on Home Page
  const isHomePage = pathname === '/';

  // State for Menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs for GSAP Animation
  const containerRef = useRef<HTMLDivElement>(null); 
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------
  // HEADER & FOOTER LOGIC
  // ---------------------------------------------------------
  const showHeader = isHomePage; 
  const showFooterSection = (isHomePage || pathname.startsWith('/products')) && showFooter;

  // Navigation Helper
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false); 
    setTimeout(() => navigate(path), 300); 
  };

  // ---------------------------------------------------------
  // GSAP ANIMATION LOGIC (Wapis Left side ke hisab se adjust kiya)
  // ---------------------------------------------------------
  useGSAP(() => {
    if (!menuRef.current || isHomePage) return;

    if (isMenuOpen) {
      // --- OPEN ANIMATION ---
      
      // 1. Button Rotate 
      gsap.to(buttonRef.current, { 
        rotation: 90, // Arrow ghoom kar X banega
        duration: 0.5, 
        ease: 'back.out(2)' 
      });

      // 2. Menu Pop-in (Left side se ayega wapis)
      gsap.fromTo(menuRef.current, 
        { autoAlpha: 0, scale: 0.8, x: -20, y: -20 }, // x: -20 wapis kar diya
        { 
          autoAlpha: 1, 
          scale: 1, 
          x: 0, 
          y: 0, 
          duration: 0.4, 
          ease: 'back.out(1.5)' 
        }
      );

      // 3. Stagger menu items
      gsap.fromTo('.menu-item-btn',
        { opacity: 0, x: -15 }, // x: -15 wapis
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, delay: 0.1, ease: 'power2.out' }
      );

    } else {
      // --- CLOSE ANIMATION ---

      gsap.to(buttonRef.current, { 
        rotation: 0, 
        duration: 0.3, 
        ease: 'power2.inOut' 
      });

      gsap.to(menuRef.current, { 
        autoAlpha: 0, 
        scale: 0.9,
        x: -10, // Left taraf jayega band hote waqt
        duration: 0.3, 
        ease: 'power2.in'
      });
    }

  }, { dependencies: [isMenuOpen, isHomePage], scope: containerRef });


  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden bg-background text-foreground font-sans">
      
      {/* --------------------------------------------------------- 
        ANIMATED GLASSY MENU BUTTON (Top-Left & No Home)
        --------------------------------------------------------- 
      */}
      {!isHomePage && (
        // WAPIS LEFT-5 KAR DIYA YAHAN
        <div ref={containerRef} className="fixed top-5 left-5 z-[100]">
          
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            // Premium Glassy Look Classes (Already added, just confirming)
            className="relative z-20 p-3 rounded-full bg-background/30 backdrop-blur-xl border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:bg-background/50 hover:shadow-[0_4px_25px_rgba(255,255,255,0.2)] transition-colors duration-300 text-foreground group"
          >
            {/* Icon Logic: Open hai to X, nahi to ArrowLeft */}
            {isMenuOpen ? <X size={22} /> : <ArrowLeft size={22} />}
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          </button>

          {/* Glassy Menu Dropdown - Aligned to Left (left-0) */}
          <div 
            ref={menuRef}
            // WAPIS LEFT-0 KAR DIYA YAHAN
            className="absolute top-16 left-0 w-52 p-3 rounded-2xl bg-background/70 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] opacity-0 invisible z-10"
          >
            <div className="flex flex-col gap-1">
              
              <button onClick={() => handleNavigation('/')} className="menu-item-btn flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium">
                <Home size={18} className="text-primary" /> Home
              </button>

              <button onClick={() => handleNavigation('/products')} className="menu-item-btn flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium">
                <ShoppingBag size={18} className="text-primary" /> Products
              </button>

              <button onClick={() => handleNavigation('/wishlist')} className="menu-item-btn flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium">
                <Heart size={18} className="text-primary" /> Wishlist
              </button>

              <button onClick={() => handleNavigation('/cart')} className="menu-item-btn flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium">
                <ShoppingCart size={18} className="text-primary" /> Cart
              </button>

              <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent my-2" />

              <button onClick={() => handleNavigation('/help')} className="menu-item-btn flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground">
                <HelpCircle size={18} /> Help Center
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Main Content Structure */}
      
      {/* Home Page Header */}
      {showHeader && <div className="relative z-50"><Header /></div>}

      {/* Dynamic Padding Logic:
         - Home Nahi hai to 'pt-24' padding lagegi content ko neechay karne ke liye.
      */}
      <main className={`flex-grow w-full relative z-0 ${showHeader ? 'pt-16 md:pt-20' : 'pt-24'}`}>
        {children}
      </main>

      {showFooterSection && <div className="relative z-10 w-full mt-auto bg-transparent"><Footer /></div>}
    </div>
  );
};

export default Layout;

