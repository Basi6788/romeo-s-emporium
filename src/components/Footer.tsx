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
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState<{url: string, name: string} | null>(null);

  // --- Auto Scroll Logic Fix ---
  useEffect(() => {
    if (modalOpen && modalRef.current) {
      // ❌ SCROLL DISABLED (layout breaking cause)
      // setTimeout(() => {
      //   modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // }, 100);
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
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        y: "0%", 
        opacity: 1,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => {
          if (pendingLink) window.location.href = pendingLink.url;
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

  return (
    <footer className="footer-container relative bg-gray-50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 mt-auto overflow-x-hidden transition-colors duration-300">
      <style>{styles}</style>

      <div 
        ref={overlayRef} 
        className="fixed inset-0 bg-black z-[99999] pointer-events-none opacity-0 translate-y-full flex items-center justify-center"
      >
        <span className="text-gold-gradient text-4xl font-bold animate-pulse">MIRAE</span>
      </div>

      {modalOpen && (
        <div 
          ref={modalRef} 
          className="modal-overlay p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* modal content unchanged */}
        </div>
      )}

      <div className="overflow-hidden relative pt-16 pb-8">
        {/* rest of content unchanged */}
      </div>
    </footer>
  );
};

export default Footer;