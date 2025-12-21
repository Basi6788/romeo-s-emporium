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

  const extendUser = (u: User | null): ExtendedUser | null => {
    if (!u) return null;
    return { ...u, name: u.user_metadata?.full_name || u.email?.split('@')[0] };
  };

  const checkAdminRole = async (userId: string) => {
    // 3 second ka timeout taake login na phase
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
    
    try {
      const fetchRole = supabase
        .from('Romeo')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      const response: any = await Promise.race([fetchRole, timeout]);
      return response.data?.is_admin === true;
    } catch (err) {
      console.error('Admin check skipped due to error or timeout');
      return false; // Default to user if DB is slow
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSession(session);
        setUser(extendUser(session.user));
        const adminStatus = await checkAdminRole(session.user.id);
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(extendUser(currentSession?.user ?? null));
      if (currentSession?.user) {
        const adminStatus = await checkAdminRole(currentSession.user.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };

      if (data.user) {
        const adminStatus = await checkAdminRole(data.user.id);
        setIsAdmin(adminStatus);
        return { success: true, isAdmin: adminStatus };
      }
      return { success: true, isAdmin: false };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSession(null);
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
