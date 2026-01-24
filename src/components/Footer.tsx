import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Twitter, Facebook,
  Phone, Home, ShoppingBag, Tag, FileText, HelpCircle,
  RefreshCw, ChevronRight, Store
} from 'lucide-react';
import gsap from 'gsap';

// --- Import Aurora Text ---
import { AuroraText } from "./magicui/aurora-text";

// --- Custom Icons (SVGs) ---
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <defs>
      <linearGradient id="instaGradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" fill="url(#instaGradient)" />
    <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="url(#instaGradient)" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
  </svg>
);

// --- Styles (Ultra Liquid Glass) ---
const styles = `
/* Ultra Liquid Glass Effect */
.liquid-glass-btn {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  color: var(--foreground);
}
.dark .liquid-glass-btn {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 10px 40px rgba(0, 0, 0, 0.4);
}
.liquid-glass-btn:hover {
  transform: translateY(-2px) scale(1.02);
  background: rgba(255, 255, 255, 0.35);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.8), 0 15px 30px rgba(0, 0, 0, 0.1);
}
.dark .liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}
.active-rgb {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.3), 0 0 25px rgba(0, 255, 0, 0.2), 0 0 35px rgba(0, 0, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.5);
}
.dark .active-rgb {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), 0 0 25px rgba(255, 0, 255, 0.2);
}
.static-dock {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 24px;
}
.icon-circle {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.dark .icon-circle {
  background: rgba(255, 255, 255, 0.05);
}
`;

const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const handleLogoHover = () => logoTextRef.current && gsap.to(logoTextRef.current, { scale: 1.05, duration: 0.5 });
  const handleLogoLeave = () => logoTextRef.current && gsap.to(logoTextRef.current, { scale: 1, duration: 0.5 });

  const handleTilt = (e: React.MouseEvent<HTMLElement>) => {
    if (e.currentTarget.classList.contains('active-rgb')) return;
    gsap.to(e.currentTarget, { duration: 0.3, scale: 1.02, ease: "power2.out" });
  };

  const handleReset = (e: React.MouseEvent<HTMLElement>) => {
    if (e.currentTarget.classList.contains('active-rgb')) return;
    gsap.to(e.currentTarget, { duration: 0.5, scale: 1, ease: "elastic.out(1, 0.6)" });
  };

  const quickLinks = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Products', icon: ShoppingBag, path: '/products' },
    { name: 'Categories', icon: Tag, path: '/categories' },
    { name: 'Deals', icon: FileText, path: '/deals' },
  ];

  const supportLinks = [
    { name: 'Help Center', icon: HelpCircle, path: '/help' },
    { name: 'Returns', icon: RefreshCw, path: '/returns' },
    { name: 'Contact', icon: Phone, path: '/contact' },
  ];

  const socialIcons = [
    { component: InstagramIcon, href: "https://www.instagram.com/_mirae01", name: "Instagram" },
    { component: YouTubeIcon, href: "https://m.youtube.com/@mirae0001", name: "YouTube" },
    { icon: Twitter, href: "https://x.com/RomeoUchiha88", color: "#1DA1F2", name: "X (Twitter)" },
    { icon: Facebook, href: "https://www.facebook.com/share/1D2dZVpPBn/", color: "#1877F2", name: "Facebook" }
  ];

  return (
    <footer className="relative bg-background text-foreground overflow-hidden font-sans transition-colors duration-300 py-16 border-t border-border">
      <style>{styles}</style>

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8">
            <Link
              to="/"
              className="group inline-flex items-center gap-5 select-none"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
            >
              {/* --- CORRECTED ZUNO CART LOGO --- */}
              <svg width="85" height="85" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 drop-shadow-lg">
                <defs>
                  {/* Image matching Gradient: Orange -> Pink -> Purple -> Cyan */}
                  <linearGradient id="zuno-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF9900" /> {/* Orange */}
                    <stop offset="30%" stopColor="#FF0080" /> {/* Pink */}
                    <stop offset="70%" stopColor="#9D00FF" /> {/* Purple */}
                    <stop offset="100%" stopColor="#00DDFF" /> {/* Cyan */}
                  </linearGradient>
                </defs>
                
                {/* 1. The Handle (Curving from left) */}
                <path d="M20 70 L50 70 C60 70 65 75 65 85 L65 100 L40 100 L25 75 Z" fill="url(#zuno-gradient)" />
                
                {/* 2. The Three Triangles (Items in cart) */}
                {/* Left Triangle */}
                <path d="M60 75 L80 35 L100 75 Z" fill="url(#zuno-gradient)" />
                {/* Middle Triangle */}
                <path d="M90 75 L110 30 L130 75 Z" fill="url(#zuno-gradient)" />
                {/* Right Triangle */}
                <path d="M120 75 L140 40 L160 75 Z" fill="url(#zuno-gradient)" />

                {/* 3. The Main Basket Body with White Cutout lines */}
                {/* We draw the shape using a mask approach or simple overlay. Here we use path subtraction logic visually */}
                <path fillRule="evenodd" clipRule="evenodd" 
                  d="M65 85 L180 85 L160 145 L75 145 L65 85 Z M85 105 L155 105 L150 115 L85 115 L85 105 Z M85 125 L145 125 L140 135 L80 135 L85 125 Z" 
                  fill="url(#zuno-gradient)" />

                {/* 4. The Wheels */}
                <circle cx="90" cy="165" r="12" stroke="url(#zuno-gradient)" strokeWidth="6" fill="none" />
                <circle cx="145" cy="165" r="12" stroke="url(#zuno-gradient)" strokeWidth="6" fill="none" />
              </svg>

              {/* ZUNO Text - Font Updated to match image better (Bold Sans) */}
              <div ref={logoTextRef} className="flex items-center justify-start">
                <h2 className="text-5xl font-black tracking-tighter" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}>
                  <AuroraText>ZUNO</AuroraText>
                </h2>
              </div>
            </Link>

            <div className="p-8 rounded-3xl liquid-glass-btn">
              <p className="text-base font-medium opacity-80 leading-relaxed">
                ZUNO brings you the future of shopping. Curated luxury, delivered with speed. Join the revolution.
              </p>
            </div>

            <a href="https://seller-s-haven.vercel.app" target="_blank" rel="noopener noreferrer"
              className="group liquid-glass-btn w-full flex items-center justify-between px-6 py-5 rounded-2xl cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center shadow-lg">
                  <Store size={24} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">Want to be a Seller?</span>
                  <span className="text-sm opacity-70">Join Seller's Haven</span>
                </div>
              </div>
              <ChevronRight size={24} className="opacity-60 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-3 lg:pl-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 opacity-90">Explore</h3>
            <div className="space-y-4">
              {quickLinks.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={idx} to={item.path}
                    className={`group liquid-glass-btn rounded-2xl p-4 flex items-center gap-4 ${isActive ? 'active-rgb' : ''}`}
                    onMouseMove={handleTilt} onMouseLeave={handleReset}>
                    <div className={`w-10 h-10 rounded-full icon-circle flex items-center justify-center`}>
                      <item.icon size={24} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 0 : 2.5} className={isActive ? "text-primary" : "opacity-70"} />
                    </div>
                    <span className={`text-base font-semibold transition-colors ${isActive ? 'font-bold' : 'opacity-80'}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Support Section */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 opacity-90">Support</h3>
            <div className="space-y-4 mb-8">
              {supportLinks.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={idx} to={item.path}
                    className={`group liquid-glass-btn rounded-2xl p-4 flex items-center gap-4 ${isActive ? 'active-rgb' : ''}`}
                    onMouseMove={handleTilt} onMouseLeave={handleReset}>
                    <div className={`w-10 h-10 rounded-full icon-circle flex items-center justify-center`}>
                      <item.icon size={24} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 0 : 2.5} className={isActive ? "text-primary" : "opacity-70"} />
                    </div>
                    <span className={`text-base font-semibold flex-1 transition-colors ${isActive ? 'font-bold' : 'opacity-80'}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Social Dock */}
            <div className="mt-auto pt-4 border-t border-border/50">
              <p className="text-xs font-bold opacity-60 mb-4 uppercase tracking-wider">Connect with us</p>
              <div className="static-dock p-3 flex items-center justify-between">
                {socialIcons.map((item, idx) => (
                  <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer"
                    className="w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-background/80 transition-all duration-300 hover:scale-110 shadow-sm"
                    style={{ color: item.color }}>
                    {item.component ? <div className="w-8 h-8"><item.component /></div> : <item.icon size={28} fill="currentColor" strokeWidth={0} />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center border-t border-border/50 pt-8">
          <p className="text-sm opacity-60 font-medium">&copy; 2026 ZUNO Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

