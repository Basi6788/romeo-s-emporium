import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://romeo-backend.vercel.app';
const ADMIN_EMAIL = 'admin@app@Romeo.com';
const ADMIN_PASSWORD = 'uchiha.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('romeo-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check for admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = {
          id: 'admin-001',
          email: ADMIN_EMAIL,
          name: 'Admin',
          isAdmin: true
        };
        setUser(adminUser);
        localStorage.setItem('romeo-user', JSON.stringify(adminUser));
        return true;
      }

      // Regular user login
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          id: data.id || Date.now().toString(),
          email,
          name: data.name || email.split('@')[0],
          isAdmin: false
        };
        setUser(userData);
        localStorage.setItem('romeo-user', JSON.stringify(userData));
        return true;
      }
      
      // Fallback for demo
      const demoUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        isAdmin: false
      };
      setUser(demoUser);
      localStorage.setItem('romeo-user', JSON.stringify(demoUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Demo fallback
      const demoUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        isAdmin: false
      };
      setUser(demoUser);
      localStorage.setItem('romeo-user', JSON.stringify(demoUser));
      return true;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          id: data.id || Date.now().toString(),
          email,
          name,
          isAdmin: false
        };
        setUser(userData);
        localStorage.setItem('romeo-user', JSON.stringify(userData));
        return true;
      }

      // Fallback for demo
      const demoUser: User = {
        id: Date.now().toString(),
        email,
        name,
        isAdmin: false
      };
      setUser(demoUser);
      localStorage.setItem('romeo-user', JSON.stringify(demoUser));
      return true;
    } catch (error) {
      console.error('Register error:', error);
      // Demo fallback
      const demoUser: User = {
        id: Date.now().toString(),
        email,
        name,
        isAdmin: false
      };
      setUser(demoUser);
      localStorage.setItem('romeo-user', JSON.stringify(demoUser));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('romeo-user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
