import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void; // <-- Ye line add ki hai Onboarding page ke liye
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check karein localStorage mein kya hai, varna default dark
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('romeo-theme');
      return (saved as Theme) || 'dark';
    }
    return 'dark';
  });

  // useLayoutEffect zyada behtar hai taake screen render hone se pehle class lag jaye
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    
    // Purani classes saaf karein
    root.classList.remove('light', 'dark');
    
    // Nayi class add karein
    root.classList.add(theme);
    
    // Local storage update karein
    localStorage.setItem('romeo-theme', theme);
    
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    // Ab yahan hum 'setTheme' bhi pass kar rahe hain
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

