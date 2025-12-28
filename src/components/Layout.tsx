import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    // Changes:
    // 1. 'w-full': Horizontal layout ko fix karne ke liye.
    // 2. Background colors yahan add kiye taa ke agar content chota ho to white bars na dikhen.
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden relative bg-gray-50 dark:bg-[#050505]">
      
      <Header />
      
      {/* Fixed: 
         - Removed 'pb-20': Ye mobile pe footer ke neeche extra space de raha tha.
         - 'flex-1': Ye content ko stretch karega taa ke footer hamesha bottom pe rahe.
         - 'w-full': Layout break hone se bachane ke liye.
      */}
      <main className="flex-1 pt-16 md:pt-20 w-full relative z-0">
        {children}
      </main>

      {/* Footer Container */}
      {showFooter && (
        <div className="w-full z-10 mt-auto">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;
