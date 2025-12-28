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
      <style>{`
        /* Global Reset */
        html, body {
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          overscroll-behavior: none; /* Footer ke neeche bounce/gap band */
        }

        /* Hide Scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
          width: 0px;
          background: transparent;
        }

        /* Hide Scrollbar for Firefox */
        html {
          scrollbar-width: none;
        }

        /* Hide Scrollbar for IE, Edge */
        body {
          -ms-overflow-style: none;
        }
      `}</style>

      {/* Main Wrapper - Fixed height, no overflow */}
      <div className="flex flex-col h-screen w-full relative bg-gray-50 dark:bg-[#050505] overflow-hidden">
        <Header />
        
        {/* Main Content - Will scroll internally if needed */}
        <main className="flex-1 w-full pt-16 md:pt-20 overflow-y-auto">
          {children}
        </main>

        {showFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout;
