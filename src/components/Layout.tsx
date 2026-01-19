import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    // FIX 1: 'relative' hata diya aur 'overflow-x-hidden' ko safe tareeqe se lagaya
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      
      {/* Header ko sabse upar rakhna zaroori hai layout flow mein */}
      <Header />

      {/* FIX 2: Main Content Area 
         - 'flex-1' ensure karega ke ye bachi hui space le.
         - 'relative' yahan lagaya hai taake internal absolute elements yahan restrict rahein, 
           lekin Fixed Header azad rahe.
      */}
      <main className="flex-1 w-full pt-16 md:pt-20 relative">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

