import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <>
      {/* Global Style to KILL Horizontal Scroll & Bottom Gap */}
      <style>{`
        html, body {
          overflow-x: hidden;
          width: 100%;
          margin: 0;
          padding: 0;
          position: relative;
        }
        /* Mobile Scroll Bar Hide (Optional) */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>

      <div className="flex flex-col min-h-screen w-full relative bg-gray-50 dark:bg-[#050505] overflow-x-hidden">
        <Header />
        
        {/* Main Content: pb-0 kar diya hai taa ke gap na aye */}
        <main className="flex-1 w-full pt-16 md:pt-20 pb-0 relative z-0">
          {children}
        </main>

        {showFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout;
