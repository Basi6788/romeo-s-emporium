import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import gsap from 'gsap';

type Theme = 'light' | 'dark';

// Context create kar rahe hain
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Ye wo component hai jo Main.tsx dhoond raha tha
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Animate theme transition (Tumhara GSAP Logic)
    gsap.to('html', {
      '--primary': theme === 'light' ? '#FF6B8B' : '#FF6B8B',
      '--background': theme === 'light' ? '#FFD1D1' : '#000000',
      '--card': theme === 'light' ? '#FFF0F0' : '#1A1A1A',
      '--foreground': theme === 'light' ? '#333333' : '#FFFFFF',
      duration: 1,
      ease: 'power2.inOut'
    });
  }, [theme]);

  const toggleTheme = useCallback(() => {
    // Animation for theme toggle
    const body = document.body;
    gsap.to(body, {
      opacity: 0.5,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
        gsap.to(body, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Ye hook ab components me use hoga theme change karne ke liye
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
