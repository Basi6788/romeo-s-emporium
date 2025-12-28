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
          overflow-x: hidden; /* Side scrolling band */
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

      {/* Main Wrapper */}
      <div className="flex flex-col min-h-screen w-full relative bg-gray-50 dark:bg-[#050505]">
        <Header />
        
        {/* Main Content */}
        <main className="flex-grow w-full pt-16 md:pt-20 relative z-0">
          {children}
        </main>

        {showFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout;
