import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ThreeBackground from '@/three/ThreeBackground';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* THREE.JS BACKGROUND */}
      <ThreeBackground />

      {/* UI LAYER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/*
          FIXED:
          - No phantom scroll
          - No extra padding
          - Hero scroll + Three.js both work
        */}
        <main className="flex-1 pt-16 md:pt-20 overflow-x-hidden">
          {children}
        </main>

        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Layout;