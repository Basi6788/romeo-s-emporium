import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

