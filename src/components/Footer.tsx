import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
// HugeIcons imports
import {
  InstagramIcon, 
  YoutubeIcon, 
  NewTwitterIcon, // X logo
  Facebook02Icon,
  Mail01Icon, 
  Call02Icon, 
  Location01Icon, 
  WhatsappIcon,
  Home01Icon, 
  PackageIcon, 
  Tag01Icon, 
  SaleTag02Icon, 
  HelpCircleIcon, 
  DeliveryTruck01Icon, 
  Exchange01Icon // REPLACED: ArrowPathIcon exist nahi karta, Returns ke liye Exchange01 best hai
} from 'hugeicons-react';
import gsap from 'gsap';

// --- Styles (Updated to use CSS Variables) ---
const styles = `
/* Gradient Text Fix */
.mirae-gradient-text {
  background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% auto;
  animation: shine 4s linear infinite;
  display: inline-block;
}

/* Glass Updates - Now using Variables */
.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.3s ease;
  color: var(--text-secondary);
}

.glass-btn {
  background: var(--btn-bg);
  border: 1px solid var(--btn-border);
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  color: var(--text-muted);
}

/* Shine Animation */
.glass-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, var(--shine-color), transparent);
  transform: skewX(-25deg);
  transition: 0.5s;
}
.glass-btn:hover::before {
  left: 150%;
}

@keyframes shine {
  to { background-position: 200% center; }
}
`;

const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLHeadingElement>(null);

  // --- Animation Logic ---
  const handleLogoHover = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.4em",
        duration: 0.6,
        ease: "power3.out",
      });
    }
  };

  const handleLogoLeave = () => {
    if (logoTextRef.current) {
      gsap.to(logoTextRef.current, {
        letterSpacing: "0.1em",
        duration: 0.6,
        ease: "power3.inOut",
      });
    }
  };

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
      borderColor: color || 'var(--accent-color)',   
      boxShadow: color ? `0 0 20px ${color}40` : `0 0 15px rgba(0,0,0, 0.1)`, 
      color: color || 'var(--text-primary)', 
      ease: "power1.out"  
    });
  };

  const handleReset = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.5,
      rotateX: 0, rotateY: 0, scale: 1,
      borderColor: "var(--btn-border)", // Reset to variable
      boxShadow: "none",
      color: "var(--text-muted)", // Reset text color
      ease: "elastic.out(1, 0.5)"
    });
  };

  // Data Objects with HugeIcons
  const socialLinks = [
    { icon: InstagramIcon, href: "https://www.instagram.com/_mirae01", color: "#E1306C", name: "Instagram" },
    { icon: YoutubeIcon, href: "https://m.youtube.com/@mirae0001", color: "#FF0000", name: "YouTube" },
    { icon: NewTwitterIcon, href: "https://x.com/RomeoUchiha88", color: "#1DA1F2", name: "X (Twitter)" },
    { icon: Facebook02Icon, href: "https://www.facebook.com/share/1D2dZVpPBn/", color: "#1877F2", name: "Facebook" }
  ];

  const quickLinks = [
    { name: 'Home', icon: Home01Icon },
    { name: 'Products', icon: PackageIcon }, // Better than Box
    { name: 'Categories', icon: Tag01Icon },
    { name: 'Deals', icon: SaleTag02Icon }, // Specific for deals
  ];

  const supportLinks = [
    { name: 'FAQ', icon: HelpCircleIcon },
    { name: 'Shipping', icon: DeliveryTruck01Icon }, // Specific truck
    { name: 'Returns', icon: Exchange01Icon }, // FIXED: Using Exchange01Icon
    { name: 'Contact', icon: Call02Icon },
  ];

  return (
    // Main container now uses variables for bg and text
    <footer 
      className="footer-container relative mt-auto transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--text-primary)' }}
    >
      <style>{styles}</style>

      {/* Main Content Wrapper */}
      <div className="relative pt-16 pb-6">
        
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
                {/* IMAGE LOGO */}
                <div className="w-16 h-16 glass-btn rounded-xl p-0 flex items-center justify-center transform perspective-1000 group-hover:scale-110 transition-transform">
                  <img 
                      src="/logo-m.png" 
                      alt="M Logo" 
                      className="w-full h-full object-contain p-2 drop-shadow-xl" 
                  />
                </div>

                {/* Text Animation */}
                <h2 
                  ref={logoTextRef} 
                  className="text-4xl font-extrabold tracking-widest uppercase transition-all duration-300 mirae-gradient-text"
                  style={{ fontFamily: "'Orbitron', sans-serif" }} 
                >
                  MIRAE
                </h2>
              </Link>
                
              <p className="text-sm opacity-80 max-w-xs leading-relaxed glass-panel p-4 rounded-xl">
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
                    className="w-10 h-10 glass-btn rounded-full flex items-center justify-center cursor-pointer"
                    onMouseMove={(e) => handleTilt(e, item.color)}
                    onMouseLeave={handleReset}
                  >
                    <item.icon size={20} className="text-current" />
                  </a>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-lg mb-6" style={{ color: 'var(--accent-color)' }}>Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link to="#" className="flex items-center gap-3 group">
                      <div 
                        className="w-8 h-8 glass-btn rounded-lg flex items-center justify-center group-hover:text-yellow-500 transition-colors"
                        onMouseMove={(e) => handleTilt(e, '#FFD700')}
                        onMouseLeave={handleReset}
                      >
                        <link.icon size={16} />
                      </div>
                      <span className="text-sm hover:text-yellow-600 transition-colors opacity-80 hover:opacity-100">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SUPPORT */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-lg mb-6" style={{ color: 'var(--accent-color)' }}>Support</h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link to="#" className="flex items-center gap-3 group">
                      <div 
                        className="w-8 h-8 glass-btn rounded-lg flex items-center justify-center group-hover:text-yellow-500 transition-colors"
                        onMouseMove={(e) => handleTilt(e, '#FFD700')}
                        onMouseLeave={handleReset}
                      >
                        <link.icon size={16} />
                      </div>
                      <span className="text-sm hover:text-yellow-600 transition-colors opacity-80 hover:opacity-100">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTACT INFO */}
            <div className="lg:col-span-4">
              <h4 className="font-bold text-lg mb-6" style={{ color: 'var(--accent-color)' }}>Contact Us</h4>
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                  
                {/* Gmail */}
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-red-500">
                    <Mail01Icon size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs opacity-60">Email us</p>
                    <a href="mailto:MiraeSupport01@gmail.com" className="text-sm font-medium hover:text-yellow-500 transition-colors truncate block">
                      MiraeSupport01@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-green-500">
                    <WhatsappIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-60">WhatsApp / Call</p>
                    <a href="https://wa.me/923047299557" className="text-sm font-medium hover:text-yellow-500 transition-colors">
                      +92 304 729 9557
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-blue-500">
                    <Location01Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Location</p>
                    <span className="text-sm font-medium">Rohillanwali, Punjab, Pakistan</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="border-t pt-6 text-center" style={{ borderColor: 'var(--glass-border)' }}>
            <p className="text-xs opacity-60">
              &copy; 2025 <span className="font-bold" style={{ color: 'var(--accent-color)' }}>MIRAE</span>. Created by Romeo. 
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

