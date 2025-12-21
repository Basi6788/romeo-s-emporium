import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ExtendedUser extends User {
  name?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Romeo')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();
      return data?.is_admin === true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession?.user) {
        setSession(initialSession);
        setUser({ ...initialSession.user, name: initialSession.user.user_metadata?.full_name });
        const adminStatus = await checkAdminRole(initialSession.user.id);
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser({ ...currentSession.user, name: currentSession.user.user_metadata?.full_name });
        const adminStatus = await checkAdminRole(currentSession.user.id);
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    
    const adminStatus = await checkAdminRole(data.user?.id || '');
    setIsAdmin(adminStatus);
    return { success: true, isAdmin: adminStatus };
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } }
    });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!user, isAdmin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
