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
    try {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('Romeo')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle(); 

      if (error) return false;
      return data?.is_admin === true; 
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial Session Check
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(extendUser(session?.user ?? null));
          if (session?.user) {
            const adminStatus = await checkAdminRole(session.user.id);
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(extendUser(session?.user ?? null));
        
        if (session?.user) {
          const adminStatus = await checkAdminRole(session.user.id);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Agar email confirm nahi hai to user ko batayein
        if (error.message.includes("Email not confirmed")) {
          return { success: false, error: "Please verify your email or create a new account (Email confirmation is now disabled)." };
        }
        return { success: false, error: error.message };
      }

      let adminStatus = false;
      if (data.user) {
        try {
          adminStatus = await checkAdminRole(data.user.id);
        } catch (e) {
          console.warn("Admin check failed, logging in as user");
        }
        setIsAdmin(adminStatus);
        return { success: true, isAdmin: adminStatus };
      }

      return { success: true, isAdmin: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Redirect URL hata diya hai taake simple registration ho
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // AGAR "Confirm Email" setting OFF hai, to session foran mil jayega
      // Aur user auto-login ho jayega
      if (data.session) {
        setSession(data.session);
        setUser(extendUser(data.user));
        // Admin role check karne ki zarurat nahi kyunki naya user hamesha user hota hai
        setIsAdmin(false);
        return { success: true };
      }

      // Agar session nahi mila, iska matlab email confirmation abhi bhi ON hai
      return { success: true, error: "Please check Supabase settings to disable email confirmation for instant login." };

    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isAdmin,
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
