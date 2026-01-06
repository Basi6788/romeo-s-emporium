import React from 'react';
import Header from './Header';
import Footer from './Footer';
// 1. Ye import add karo (path check karlena, agar components folder me hai to yehi hoga)
import { ThemeProvider } from "@/components/theme-provider"; 

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    // 2. Yahan ThemeProvider se sab kuch wrap karo
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <Header />

        {/* FIX:  
          - Removed bottom padding that was creating phantom scroll  
          - flex-1 already handles height correctly  
        */}  
        <main className="flex-1 pt-16 md:pt-20 overflow-x-hidden">  
          {children}  
        </main>  

        {showFooter && <Footer />}  
      </div>
    </ThemeProvider>
  );
};

export default Layout;
