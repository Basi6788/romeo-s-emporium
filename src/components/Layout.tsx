import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  useEffect(() => {
    const handleScroll = () => {
      // Calculate maximum scroll position
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = documentHeight - windowHeight;
      
      // If trying to scroll beyond footer, prevent it
      if (window.scrollY > maxScroll) {
        window.scrollTo(0, maxScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        /* Global Reset */
        html, body {
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          overscroll-behavior: none;
          position: relative;
        }

        /* Main container */
        .main-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
          position: relative;
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
      <div className="main-container bg-gray-50 dark:bg-[#050505]">
        <Header />
        
        {/* Main Content - This will grow and push footer to bottom */}
        <main className="flex-grow w-full pt-16 md:pt-20 relative z-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {children}
          </div>
        </main>

        {showFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout;