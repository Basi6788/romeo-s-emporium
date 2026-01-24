import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  const location = useLocation();
  const pathname = location.pathname;

  // Check karein ke hum Auth ya Profile page par hain ya nahi
  const isAuthPage = pathname.startsWith('/auth');
  const isProfilePage = pathname === '/profile';

  // In pages par Header ko HIDE karna hai
  const shouldHideHeader = isAuthPage || isProfilePage;

  // Auth pages par Footer hide karein
  const shouldHideFooter = isAuthPage; 

  return (
    // Parent Div: bg-background puri app ka main color set karega.
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden bg-background text-foreground font-sans">
      
      {/* Header: z-50 taake scroll karte waqt sabse upar rahe */}
      {!shouldHideHeader && (
        <div className="relative z-50">
          <Header />
        </div>
      )}

      {/* Main Content: flex-grow taake ye available space le le */}
      <main 
        className={`flex-grow w-full relative z-0 ${shouldHideHeader ? 'pt-0' : 'pt-16 md:pt-20'}`}
      >
        {children}
      </main>

      {/* Footer Container:
          - mt-auto: Ye footer ko hamesha bottom par push karega agar content kam ho.
          - bg-transparent: Yahan koi background nahi diya, taake Footer ke sections 'hawa mein' (float) lagein.
      */}
      {showFooter && !shouldHideFooter && (
        <div className="relative z-10 w-full mt-auto bg-transparent">
           <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;

