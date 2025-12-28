import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preventExtraScroll = (e: WheelEvent) => {
      if (!mainContentRef.current) return;
      
      const mainContent = mainContentRef.current;
      const isAtBottom = 
        mainContent.scrollHeight - mainContent.scrollTop <= mainContent.clientHeight + 1;
      
      // If at bottom and trying to scroll down further, prevent it
      if (isAtBottom && e.deltaY > 0) {
        e.preventDefault();
      }
      
      // If at top and trying to scroll up further, prevent it
      if (mainContent.scrollTop === 0 && e.deltaY < 0) {
        e.preventDefault();
      }
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('wheel', preventExtraScroll, { passive: false });
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener('wheel', preventExtraScroll);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        /* Global Reset */
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden; /* Body se scroll band */
        }

        .layout-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        .main-content-wrapper {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Hide Scrollbar */
        .main-content-wrapper::-webkit-scrollbar {
          display: none;
        }
        
        .main-content-wrapper {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="layout-wrapper bg-gray-50 dark:bg-[#050505]">
        <Header />
        
        {/* Scrollable content area */}
        <div ref={mainContentRef} className="main-content-wrapper pt-16 md:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </div>
        </div>

        {showFooter && (
          <div className="footer-container">
            <Footer />
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;