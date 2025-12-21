import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

// ⚠️ APNA ADMIN EMAIL YAHAN LIKHEIN (Backup ke liye)
const ADMIN_EMAILS = ['bbasitahmad1213@gmail.com, '@Romeo786']; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const extendUser = (u: User | null): ExtendedUser | null => {
    if (!u) return null;
    return { ...u, name: u.user_metadata?.full_name || u.email?.split('@')[0] };
  };

  const checkAdminRole = useCallback(async (u: User | null) => {
    if (!u) return false;
    
    // Step 1: Backup check via Email (Hamesha kaam karega)
    if (u.email && ADMIN_EMAILS.includes(u.email)) {
      return true;
    }

    // Step 2: Database RPC check
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: u.id,
        _role: 'admin'
      });
      if (!error && data === true) return true;
      
      // Step 3: Metadata check (Agar metadata mein is_admin: true set kiya ho)
      if (u.user_metadata?.is_admin === true || u.user_metadata?.role === 'admin') {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (mounted) {
        if (initialSession) {
          setSession(initialSession);
          setUser(extendUser(initialSession.user));
          const adminStatus = await checkAdminRole(initialSession.user);
          setIsAdmin(adminStatus);
        }
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(extendUser(currentUser));
        
        if (currentUser) {
          const adminStatus = await checkAdminRole(currentUser);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const adminStatus = await checkAdminRole(data.user);
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
        email,
        password,
        options: {
          data: { full_name: name },
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user, session, isAuthenticated: !!user, isAdmin, login, register, logout, loading
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
