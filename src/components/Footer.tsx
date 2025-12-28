import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, Twitter, Instagram, Youtube, 
  Mail, Phone, MapPin, MessageCircle, 
  Home, Box, Tag, FileText, HelpCircle, Truck, RefreshCw, AlertCircle, Check
} from 'lucide-react';
import gsap from 'gsap';

const styles = `
  .mirae-gradient-text {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    background-size: 200% auto;
    animation: shine 4s linear infinite;
    display: inline-block;
  }
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
  
  /* Strict Modal Positioning */
  .modal-wrapper {
    position: absolute;
    bottom: 2rem; /* Thora opar footer se */
    left: 0; 
    right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 50;
    pointer-events: none; /* Click through empty space */
  }
  .modal-content {
    pointer-events: auto; /* Clickable modal */
  }
`;

const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState<{url: string, name: string} | null>(null);

  // --- Auto Focus Logic ---
  useEffect(() => {
    if (modalOpen && modalRef.current) {
      // Smoothly scroll to the modal when it opens
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [modalOpen]);

  const handleLogoHover = () => {
    if (logoTextRef.current) gsap.to(logoTextRef.current, { letterSpacing: "0.4em", duration: 0.6, ease: "power3.out" });
  };
  const handleLogoLeave = () => {
    if (logoTextRef.current) gsap.to(logoTextRef.current, { letterSpacing: "0.1em", duration: 0.6, ease: "power3.inOut" });
  };

  const initiateRedirect = (e: React.MouseEvent, url: string, name: string) => {
    e.preventDefault();
    setPendingLink({ url, name });
    setModalOpen(true);
  };

  const confirmRedirect = () => {
    setModalOpen(false);
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        y: "0%", opacity: 1, duration: 0.8, ease: "power4.inOut",
        onComplete: () => {
            if (pendingLink) window.location.href = pendingLink.url; 
            setTimeout(() => { gsap.set(overlayRef.current, { y: "100%", opacity: 0 }); }, 2000);
        }
      });
    }
  };

  const cancelRedirect = () => {
    setModalOpen(false);
    setPendingLink(null);
  };

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/_mirae01", color: "#E1306C", name: "Instagram" },
    { icon: Youtube, href: "https://m.youtube.com/@mirae0001", color: "#FF0000", name: "YouTube" },
    { icon: Twitter, href: "https://x.com/RomeoUchiha88", color: "#1DA1F2", name: "X (Twitter)" },
    { icon: Facebook, href: "https://www.facebook.com/share/1D2dZVpPBn/", color: "#1877F2", name: "Facebook" }
  ];

  return (
    // 'w-full overflow-hidden' ensures NO SIDE SCROLL and cuts off extra lights
    <footer className="relative bg-gray-50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 pt-16 pb-24 md:pb-8 w-full overflow-hidden">
      <style>{styles}</style>

      {/* Outro Overlay */}
      <div ref={overlayRef} className="fixed inset-0 bg-black z-[99999] pointer-events-none opacity-0 translate-y-full flex items-center justify-center">
        <span className="text-gold-gradient text-4xl font-bold animate-pulse">MIRAE</span>
      </div>

      {/* Inline Modal Area */}
      {modalOpen && (
        <div className="modal-wrapper">
          <div ref={modalRef} className="modal-content glass-panel p-6 rounded-2xl max-w-sm w-[90%] mx-auto text-center shadow-2xl border border-yellow-500/20 mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Opening <span className="font-bold text-yellow-600">{pendingLink?.name}</span>?
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={cancelRedirect} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 text-xs font-medium">Cancel</button>
              <button onClick={confirmRedirect} className="px-4 py-2 rounded-lg bg-yellow-600 text-white shadow-lg text-xs font-medium flex items-center gap-2">Yes <Check className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Background Glows (Clipped by overflow-hidden) */}
      <div className="absolute top-0 left-[-20%] w-80 h-80 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-20%] w-80 h-80 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-8">
          
          {/* LOGO & SOCIAL */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="group inline-flex items-center gap-3 select-none" onMouseEnter={handleLogoHover} onMouseLeave={handleLogoLeave}>
              <div className="w-12 h-12 glass-btn rounded-xl flex items-center justify-center"><img src="/logo-m.png" alt="M" className="w-full h-full object-contain p-2" /></div>
              <h2 ref={logoTextRef} className="text-2xl font-bold tracking-widest uppercase mirae-gradient-text" style={{ fontFamily: "'Orbitron', sans-serif" }}>MIRAE</h2>
            </Link>
            <p className="text-xs opacity-70 max-w-xs glass-panel p-3 rounded-lg">Luxury meets Technology. Elevating your lifestyle.</p>
            
            {/* Social Icons - Redirect Logic */}
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a key={i} href={item.href} onClick={(e) => initiateRedirect(e, item.href, item.name)} className="w-9 h-9 glass-btn rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* LINKS (Simplified for Mobile) */}
          <div className="lg:col-span-2 col-span-1">
            <h4 className="font-bold text-sm mb-4 text-yellow-600">Links</h4>
            <ul className="space-y-2 text-xs opacity-80">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/deals">Deals</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-2 col-span-1">
            <h4 className="font-bold text-sm mb-4 text-yellow-600">Support</h4>
            <ul className="space-y-2 text-xs opacity-80">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* CONTACT CARD */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-sm mb-4 text-yellow-600">Contact Us</h4>
            <div className="glass-panel rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 glass-btn rounded-full flex items-center justify-center text-red-500"><Mail className="w-4 h-4" /></div>
                <div><p className="text-[10px] opacity-60">Email</p><a href="mailto:MiraeSupport01@gmail.com" className="text-xs font-medium truncate block">MiraeSupport01@gmail.com</a></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 glass-btn rounded-full flex items-center justify-center text-green-500"><MessageCircle className="w-4 h-4" /></div>
                <div><p className="text-[10px] opacity-60">WhatsApp</p><a href="https://wa.me/923047299447" className="text-xs font-medium">+92 304 729 9447</a></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 glass-btn rounded-full flex items-center justify-center text-blue-500"><MapPin className="w-4 h-4" /></div>
                <div><p className="text-[10px] opacity-60">Location</p><span className="text-xs font-medium">Rohillanwali, Punjab, Pakistan</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-300 dark:border-white/10 pt-4 text-center pb-8 md:pb-0">
          <p className="text-[10px] text-gray-500">
            &copy; 2025 <span className="text-yellow-600 font-bold">MIRAE</span>. Created by Romeo. 
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
