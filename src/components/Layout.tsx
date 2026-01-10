import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    // FIX: Wrapper par w-full aur relative lagaya, main scroll issue niche fix kiya hai
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden bg-background text-foreground">
      <Header />

      {/* MAIN SCROLL FIX:
        - Yahan se 'overflow-x-hidden' hata diya hai (yehi desktop scroll rok raha tha).
        - 'flex-grow' use kiya hai taake footer sahi se push ho.
      */}
      <main className="flex-grow w-full pt-16 md:pt-20">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

