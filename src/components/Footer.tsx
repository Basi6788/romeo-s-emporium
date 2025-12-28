import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, Twitter, Instagram, Youtube, 
  Mail, Phone, MapPin, MessageCircle, // WhatsApp ke liye MessageCircle use hota hai
  Home, Box, Tag, HelpCircle, Truck, RefreshCw, FileText 
} from 'lucide-react';
import gsap from 'gsap';

// --- Custom CSS for Gold Gradient & Glass (Injected) ---
const styles = `
  /* Theme Transitions */
  .footer-container {
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Glass Effect for Dark Mode */
  .dark .glass-panel {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }
  
  /* Glass Effect for Light Mode (Darker glass) */
  .light .glass-panel {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }

  /* Shared Glass Button Styles */
  .glass-btn {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }
  
  .dark .glass-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .light .glass-btn {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  /* Shine Animation */
  .glass-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transform: skewX(-25deg);
    transition: 0.5s;
  }
  .glass-btn:hover::before {
    left: 150%;
  }

  /* Gold Gradient Text Class */
  .text-gold-gradient {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    background-size: 200% auto;
    animation: shine 3s linear infinite;
  }

  @keyframes shine {
    to {
      background-position: 200% center;
    }
  }
`;

// --- Custom "M" Logo Component (SVG) ---
const GoldLogoIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    {/* Sharp M Shape based on your image */}
    <path 
      d="M10 20 L50 65 L90 20 L90 80 L75 80 L75 45 L50 75 L25 45 L25 80 L10 80 Z" 
      fill="url(#goldGrad)" 
      stroke="rgba(255,255,255,0.2)" 
      strokeWidth="1"
    />
  </svg>
);

const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLHeadingElement>(null);

  // --- Animation: Text Spread & Gradient Color ---
  const handleLogoHover = () => {
    if (logoTextRef.current) {
      // 1. Spread Text
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.4em",
        duration: 0.6,
        ease: "power3.out",
      });
      // 2. Add Gradient Class manually (GSAP color animation to gradient is tricky, class toggle is smoother)
      logoTextRef.current.classList.add('text-gold-gradient');
      logoTextRef.current.classList.remove('text-primary-foreground');
    }
  };

  const handleLogoLeave = () => {
    if (logoTextRef.current) {
      // 1. Contract Text
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.1em",
        duration: 0.6,
        ease: "power3.inOut",
      });
      // 2. Remove Gradient Class
      logoTextRef.current.classList.remove('text-gold-gradient');
      logoTextRef.current.classList.add('text-primary-foreground');
    }
  };

  // --- 3D Tilt for ALL buttons (Social + Links) ---
  const handleTilt = (e: React.MouseEvent<HTMLElement>, color: string | null) => {
    const btn = e.currentTarget;
    const box = btn.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const xMove = (x - box.width / 2) / 3; 
    const yMove = (y - box.height / 2) / 3;

    gsap.to(btn, {
      duration: 0.3,
      rotateX: -yMove,
      rotateY: xMove,
      scale: 1.1,
      // Agar color diya hai (social icons) to color glow, warna simple glow
      borderColor: color || 'rgba(255,215,0, 0.5)', 
      boxShadow: color ? `0 0 20px ${color}40` : `0 0 15px rgba(255,215,0, 0.2)`,
      ease: "power1.out"
    });
  };

  const handleReset = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.5,
      rotateX: 0, rotateY: 0, scale: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "none",
      ease: "elastic.out(1, 0.5)"
    });
  };

  // Data Objects
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/_mirae01", color: "#E1306C" },
    { icon: Youtube, href: "https://m.youtube.com/@mirae0001", color: "#FF0000" },
    { icon: Twitter, href: "https://x.com/RomeoUchiha88", color: "#1DA1F2" },
    { icon: Facebook, href: "https://www.facebook.com/share/1D2dZVpPBn/", color: "#1877F2" }
  ];

  const quickLinks = [
    { name: 'Home', icon: Home },
    { name: 'Products', icon: Box },
    { name: 'Categories', icon: Tag },
    { name: 'Deals', icon: FileText },
  ];

  const supportLinks = [
    { name: 'FAQ', icon: HelpCircle },
    { name: 'Shipping', icon: Truck },
    { name: 'Returns', icon: RefreshCw },
    { name: 'Contact', icon: Phone },
  ];

  return (
    // 'dark' class yahan hardcode hai testing ke liye. 
    // Real app me ye <html className="dark"> se control hoga.
    // Aap is <footer className="dark ..."> se "dark" hata den agar parent control karega.
    <footer className="footer-container dark relative bg-gray-100 dark:bg-[#050505] text-gray-800 dark:text-gray-200 overflow-hidden mt-auto pt-16 pb-8">
      <style>{styles}</style>

      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* BRAND LOGO SECTION */}
          <div className="lg:col-span-4 space-y-6">
            <Link 
              to="/" 
              className="group inline-flex items-center gap-4 select-none"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
            >
              {/* Custom SVG M Logo */}
              <div className="w-16 h-16 glass-btn rounded-xl p-2 flex items-center justify-center transform perspective-1000 group-hover:scale-110 transition-transform">
                <GoldLogoIcon />
              </div>

              {/* Text Animation */}
              <h2 
                ref={logoTextRef} 
                className="text-4xl font-extrabold tracking-widest uppercase transition-all duration-300 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Orbitron', sans-serif" }} 
              >
                MIRAE
              </h2>
            </Link>
            
            <p className="text-sm opacity-70 max-w-xs leading-relaxed glass-panel p-4 rounded-xl">
              Luxury meets Technology. Elevating your lifestyle with premium gear and seamless delivery.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"
                  onMouseMove={(e) => handleTilt(e, item.color)}
                  onMouseLeave={handleReset}
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS (With Icons) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-gold-500">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to="#" className="flex items-center gap-3 group">
                    <div 
                      className="w-8 h-8 glass-btn rounded-lg flex items-center justify-center text-gray-500 group-hover:text-yellow-500 transition-colors"
                      onMouseMove={(e) => handleTilt(e, '#FFD700')}
                      onMouseLeave={handleReset}
                    >
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm hover:text-yellow-500 transition-colors">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT (With Icons) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-gold-500">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                   <Link to="#" className="flex items-center gap-3 group">
                    <div 
                      className="w-8 h-8 glass-btn rounded-lg flex items-center justify-center text-gray-500 group-hover:text-yellow-500 transition-colors"
                      onMouseMove={(e) => handleTilt(e, '#FFD700')}
                      onMouseLeave={handleReset}
                    >
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm hover:text-yellow-500 transition-colors">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT INFO (Updated) */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-lg mb-6 text-gold-500">Contact Us</h4>
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              
              {/* Gmail */}
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-red-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email us</p>
                  <a href="mailto:MiraeSupport01@gmail.com" className="text-sm font-medium hover:text-yellow-500 transition-colors">
                    MiraeSupport01@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-green-500">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">WhatsApp / Call</p>
                  <a href="https://wa.me/923047299447" className="text-sm font-medium hover:text-yellow-500 transition-colors">
                    +92 304 729 9447
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-blue-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <span className="text-sm font-medium">Rohillanwali, Punjab, Pakistan</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-200 dark:border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; 2025 <span className="text-yellow-500 font-bold">MIRAE</span>. Created by Romeo. 
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
