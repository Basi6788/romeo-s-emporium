import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-[#050505]">
      <Header />
      
      {/* Yahan se pb-20 hata diya hai, ab content aur footer chipak jayen ge */}
      <main className="flex-1 w-full pt-16 md:pt-20">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
