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
  // '/auth' check karega agar URL me kahin bhi auth ata hai (login/signup)
  const isAuthPage = pathname.startsWith('/auth');
  const isProfilePage = pathname === '/profile';

  // In pages par Header ko HIDE karna hai
  const shouldHideHeader = isAuthPage || isProfilePage;

  // Agar Auth ya Profile page hai tu Footer bhi hide kar sakte hain (Optional, maine logic daal di hai)
  const shouldHideFooter = isAuthPage; 

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden bg-background text-foreground">
      
      {/* Header sirf tab dikhao jab hum Auth ya Profile page par NA hon */}
      {!shouldHideHeader && <Header />}

      {/* Dynamic Padding Fix:
         - Agar header hidden hai, to 'pt-0' (top padding 0) karo taake gap na aye.
         - Agar header hai, to 'pt-16' rakho taake content header ke neeche na chupe.
      */}
      <main 
        className={`flex-grow w-full ${shouldHideHeader ? 'pt-0' : 'pt-16 md:pt-20'}`}
      >
        {children}
      </main>

      {/* Footer render logic */}
      {showFooter && !shouldHideFooter && <Footer />}
    </div>
  );
};

export default Layout;

