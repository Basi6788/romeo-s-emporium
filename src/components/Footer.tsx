import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook, Twitter, Instagram, Youtube,
  Mail, Phone, MapPin, MessageCircle,
  Home, Box, Tag, FileText, HelpCircle, Truck, RefreshCw, AlertCircle, Check
} from 'lucide-react';
import gsap from 'gsap';

/* ---------------- STYLES ---------------- */
const styles = `
  html, body {
    overflow-x: hidden;
  }

  .no-scroll {
    overflow: hidden !important;
    height: 100vh !important;
  }

  .mirae-gradient-text {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    background-size: 200% auto;
    animation: shine 4s linear infinite;
  }

  @keyframes shine {
    to { background-position: 200% center; }
  }

  .glass-panel {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

/* ---------------- COMPONENT ---------------- */
const Footer: React.FC = () => {
  const logoTextRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState<{ url: string; name: string } | null>(null);

  /* 🔒 HARD SCROLL LOCK FIX */
  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => document.body.classList.remove('no-scroll');
  }, [modalOpen]);

  /* LOGO ANIMATION */
  const handleLogoHover = () => {
    gsap.to(logoTextRef.current, { letterSpacing: '0.4em', duration: 0.5 });
  };

  const handleLogoLeave = () => {
    gsap.to(logoTextRef.current, { letterSpacing: '0.1em', duration: 0.5 });
  };

  /* REDIRECT LOGIC */
  const initiateRedirect = (e: React.MouseEvent, url: string, name: string) => {
    e.preventDefault();
    setPendingLink({ url, name });
    setModalOpen(true);
  };

  const confirmRedirect = () => {
    setModalOpen(false);

    gsap.to(overlayRef.current, {
      y: '0%',
      opacity: 1,
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: () => {
        if (pendingLink) window.location.href = pendingLink.url;
      },
    });
  };

  const cancelRedirect = () => {
    setModalOpen(false);
    setPendingLink(null);
  };

  return (
    <footer className="relative bg-gray-50 dark:bg-[#050505] overflow-hidden">
      <style>{styles}</style>

      {/* SCREEN WIPE */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black z-[999999] pointer-events-none opacity-0 translate-y-full flex items-center justify-center"
      >
        <span className="text-4xl font-bold text-yellow-500">MIRAE</span>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel bg-white dark:bg-black p-8 rounded-2xl max-w-sm w-full text-center">
            <AlertCircle className="mx-auto text-yellow-500 w-10 h-10 mb-3" />
            <h3 className="text-xl font-bold mb-2">Leaving MIRAE?</h3>
            <p className="text-sm mb-6">
              You are about to visit <b>{pendingLink?.name}</b>
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={cancelRedirect} className="px-5 py-2 rounded-lg border">
                Cancel
              </button>
              <button
                onClick={confirmRedirect}
                className="px-5 py-2 rounded-lg bg-yellow-600 text-white flex items-center gap-2"
              >
                Continue <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CONTENT */}
      <div className="container mx-auto px-4 pt-16 pb-6">
        <Link
          to="/"
          onMouseEnter={handleLogoHover}
          onMouseLeave={handleLogoLeave}
          className="flex items-center gap-4"
        >
          <img src="/logo-m.png" className="w-14 h-14" />
          <h2
            ref={logoTextRef}
            className="text-4xl font-bold tracking-widest mirae-gradient-text"
          >
            MIRAE
          </h2>
        </Link>

        <div className="mt-12 border-t pt-4 text-center text-xs opacity-60">
          © 2025 MIRAE. Created by Romeo.
        </div>
      </div>
    </footer>
  );
};

export default Footer;