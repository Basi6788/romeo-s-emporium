//Ye lo footer
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, Twitter, Instagram, Youtube, 
  Mail, Phone, MapPin, MessageCircle, 
  Home, Box, Tag, FileText, HelpCircle, Truck, RefreshCw, AlertCircle, X, Check
} from 'lucide-react';
import gsap from 'gsap';

// --- Styles (Updated) ---
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

  /* Glass Updates */
  .glass-panel {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: all 0.3s ease;
  }
  .dark .glass-panel {
    background: rgba(20, 20, 20, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }
  .light .glass-panel, .glass-panel { 
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .glass-btn {
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }
  .dark .glass-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .light .glass-btn, .glass-btn {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  /* Shine Animation */
  .glass-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    transform: skewX(-25deg);
    transition: 0.5s;
  }
  .glass-btn:hover::before {
    left: 150%;
  }

  @keyframes shine {
    to { background-position: 200% center; }
  }
  
  /* Modal Overlay - Fixed Positioning Fix */
  .modal-overlay {
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 10000; /* Highest Z-Index to stay on top */
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null); // Ref for scrolling
  
  // State for Redirect Logic
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState<{url: string, name: string} | null>(null);

  // --- Auto Scroll Logic Fix ---
  useEffect(() => {
    if (modalOpen && modalRef.current) {
      // Jab modal open ho, thora sa wait kar ke scroll karo ta ke wo view me aa jaye
      setTimeout(() => {
        modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [modalOpen]);

  // --- 1. Animation Logic ---
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
      borderColor: color || '#d1d5db', 
      boxShadow: color ? `0 0 20px ${color}40` : `0 0 15px rgba(0,0,0, 0.1)`,
      ease: "power1.out"
    });
  };

  const handleReset = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.5,
      rotateX: 0, rotateY: 0, scale: 1,
      borderColor: "inherit",
      boxShadow: "none",
      ease: "elastic.out(1, 0.5)"
    });
  };

  // --- 2. Redirect & Modal Logic ---
  const initiateRedirect = (e: React.MouseEvent, url: string, name: string) => {
    e.preventDefault();
    setPendingLink({ url, name });
    setModalOpen(true);
  };

  const confirmRedirect = () => {
    setModalOpen(false);
    
    // Outro Animation (Screen Wipe)
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        y: "0%", 
        opacity: 1,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => {
            if (pendingLink) {
                window.location.href = pendingLink.url; 
            }
            setTimeout(() => {
                gsap.set(overlayRef.current, { y: "100%", opacity: 0 });
            }, 2000);
        }
      });
    }
  };

  const cancelRedirect = () => {
    setModalOpen(false);
    setPendingLink(null);
  };

  // Data Objects
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/_mirae01", color: "#E1306C", name: "Instagram" },
    { icon: Youtube, href: "https://m.youtube.com/@mirae0001", color: "#FF0000", name: "YouTube" },
    { icon: Twitter, href: "https://x.com/RomeoUchiha88", color: "#1DA1F2", name: "X (Twitter)" },
    { icon: Facebook, href: "https://www.facebook.com/share/1D2dZVpPBn/", color: "#1877F2", name: "Facebook" }
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
    // Updated: Removed 'overflow-hidden' from main footer to allow Modal to be Fixed correctly
    // Added 'relative' to keep structure
    <footer className="footer-container relative bg-gray-50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 mt-auto transition-colors duration-300">
      <style>{styles}</style>

      {/* --- OUTRO ANIMATION OVERLAY --- */}
      <div 
        ref={overlayRef} 
        className="fixed inset-0 bg-black z-[99999] pointer-events-none opacity-0 translate-y-full flex items-center justify-center"
      >
        <span className="text-gold-gradient text-4xl font-bold animate-pulse">MIRAE</span>
      </div>

      {/* --- REDIRECT MODAL (Placed outside overflow-hidden wrapper) --- */}
      {modalOpen && (
        <div ref={modalRef} className="modal-overlay p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center transform transition-all scale-100 animate-in fade-in zoom-in duration-300 shadow-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Leaving MIRAE?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              You are about to visit <span className="font-bold text-yellow-600">{pendingLink?.name}</span>. Do you want to continue?
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={cancelRedirect}
                className="px-6 py-2 rounded-xl border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRedirect}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-white shadow-lg hover:shadow-yellow-500/30 transition-all text-sm font-medium flex items-center gap-2"
              >
                Yes, Go <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Content Wrapper (Overflow Hidden applied here) --- */}
      {/* Ye wrapper extra scroll issue solve karega */}
      <div className="overflow-hidden relative pt-16 pb-8">
        
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
                    onClick={(e) => initiateRedirect(e, item.href, item.name)}
                    className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"
                    onMouseMove={(e) => handleTilt(e, item.color)}
                    onMouseLeave={handleReset}
                  >
                    <item.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-lg mb-6 text-yellow-600 dark:text-yellow-500">Quick Links</h4>
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
                      <span className="text-sm hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SUPPORT */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-lg mb-6 text-yellow-600 dark:text-yellow-500">Support</h4>
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
                      <span className="text-sm hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTACT INFO */}
            <div className="lg:col-span-4">
              <h4 className="font-bold text-lg mb-6 text-yellow-600 dark:text-yellow-500">Contact Us</h4>
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                
                {/* Gmail */}
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 glass-btn rounded-full flex items-center justify-center text-red-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email us</p>
                    <a href="mailto:MiraeSupport01@gmail.com" className="text-sm font-medium hover:text-yellow-500 transition-colors truncate block">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp / Call</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <span className="text-sm font-medium">Rohillanwali, Punjab, Pakistan</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-gray-300 dark:border-white/10 pt-6 text-center">
            <p className="text-xs text-gray-500">
              &copy; 2025 <span className="text-yellow-600 dark:text-yellow-500 font-bold">MIRAE</span>. Created by Romeo. 
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;