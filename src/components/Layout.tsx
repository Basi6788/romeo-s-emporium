
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

{/*   
    FIX:  
    - Removed bottom padding that was creating phantom scroll  
    - flex-1 already handles height correctly  
  */}  
  <main className="flex-1 pt-16 md:pt-20 overflow-x-hidden">  
    {children}  
  </main>  

  {showFooter && <Footer />}  
</div>

);
};

export default Layout;