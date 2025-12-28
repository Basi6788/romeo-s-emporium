import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import gsap from 'gsap';

// --- Custom CSS for Glass & Animations (Paste this in your global CSS or styles object) ---
const styles = `
  .glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }
  
  .glass-btn {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .glass-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: skewX(-25deg);
    transition: 0.5s;
  }

  .glass-btn:hover::before {
    left: 150%;
    transition: 0.5s;
  }
`;

// --- Social Data with Colors ---
const socialLinks = [
  { 
    icon: Instagram, 
    href: "https://www.instagram.com/_mirae01", 
    color: "#E1306C", 
    label: "Instagram" 
  },
  { 
    icon: Youtube, 
    href: "https://m.youtube.com/@mirae0001", 
    color: "#FF0000", 
    label: "Youtube" 
  },
  { 
    icon: Twitter, // Lucide uses 'Twitter' for X icon usually, or import 'X' if available in your version
    href: "https://x.com/RomeoUchiha88", 
    color: "#ffffff", // X is black/white
    label: "X" 
  },
  { 
    icon: Facebook, 
    href: "https://www.facebook.com/share/1D2dZVpPBn/", 
    color: "#1877F2", 
    label: "Facebook" 
  }
];

const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLHeadingElement>(null);
  
  // --- Animation for MIRAE Text (Spread Effect) ---
  const handleLogoHover = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.5em",
        duration: 0.5,
        ease: "power3.out",
        textShadow: "0 0 20px rgba(255,255,255,0.5)"
      });
    }
  };

  const handleLogoLeave = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.1em", // Back to normal
        duration: 0.5,
        ease: "power3.inOut",
        textShadow: "none"
      });
    }
  };

  // --- 3D Tilt Effect for Social Buttons ---
  const handleButtonMove = (e: React.MouseEvent<HTMLAnchorElement>, color: string) => {
    const btn = e.currentTarget;
    const box = btn.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    // Calculate tilt
    const xMove = (x - box.width / 2) / 5; // Strength of tilt
    const yMove = (y - box.height / 2) / 5;

    gsap.to(btn, {
      duration: 0.3,
      rotateX: -yMove,
      rotateY: xMove,
      scale: 1.1,
      backgroundColor: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.2)`,
      borderColor: color,
      boxShadow: `0 0 20px ${color}40`, // Colored glow
      ease: "power1.out"
    });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.5,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.05)",
      ease: "elastic.out(1, 0.5)"
    });
  };

  return (
    <footer className="relative bg-black text-white overflow-hidden mt-auto pt-20 pb-10">
      {/* Inject Styles */}
      <style>{styles}</style>

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* BRAND SECTION (Left - Large) */}
          <div className="lg:col-span-5 space-y-6">
            <Link 
              to="/" 
              className="inline-block"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
              onTouchStart={handleLogoHover}
              onTouchEnd={handleLogoLeave}
            >
              <div className="flex items-center gap-3">
                {/* Liquid Logo Icon */}
                <div className="w-14 h-14 glass-btn rounded-2xl flex items-center justify-center transform perspective-1000">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">M</span>
                </div>
                {/* Animated Text */}
                <h2 
                  ref={logoTextRef} 
                  className="text-4xl font-bold tracking-widest text-white uppercase transition-all"
                  style={{ fontFamily: "'Orbitron', sans-serif" }} // Use a futuristic font if available
                >
                  MIRAE
                </h2>
              </div>
            </Link>
            
            <p className="text-gray-400 max-w-sm leading-relaxed text-sm glass-panel p-4 rounded-xl">
              Next-generation lifestyle. Experience the future of shopping with premium quality and seamless delivery right to your doorstep.
            </p>

            {/* LIQUID SOCIAL ICONS */}
            <div className="flex gap-4 pt-4">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 glass-btn rounded-full flex items-center justify-center text-gray-300"
                  onMouseMove={(e) => handleButtonMove(e, social.color)}
                  onMouseLeave={handleButtonLeave}
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                >
                  <social.icon className="w-5 h-5 pointer-events-none" />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-white/90">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Products', 'Categories', 'Deals', 'About Us'].map(link => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 text-sm block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-white/90">Support</h4>
            <ul className="space-y-3">
              {['FAQ', 'Shipping', 'Returns', 'Track Order'].map(link => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 text-sm block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-lg mb-6 text-white/90">Contact Us</h4>
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-purple-400" />
                <span className="text-sm">support@mirae.pk</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-sm">+92 300 1234567</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                <MapPin className="w-5 h-5 text-pink-400 mt-1" />
                <span className="text-sm">Main City Hub, Punjab, Pakistan</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="border-t border-white/10 pt-8 pb-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2025 <span className="text-white font-bold">MIRAE</span>. All rights reserved. 
            <span className="hidden sm:inline"> | Designed for the Future.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
