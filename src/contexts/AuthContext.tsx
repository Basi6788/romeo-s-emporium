import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ExtendedUser extends User {
  name?: string;
  avatar_url?: string; // Avatar bhi handle kar sakte ho
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

// Admin Emails (Case insensitive check ke liye lower case prefer karo)
const ADMIN_EMAILS = ['bbasitahmad1213@gmail.com', 'romeo786']; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to extend user object
  const extendUser = (u: User | null): ExtendedUser | null => {
    if (!u) return null;
    return { 
      ...u, 
      name: u.user_metadata?.full_name || u.email?.split('@')[0],
      avatar_url: u.user_metadata?.avatar_url
    };
  };

  // Optimized Admin Check
  const checkAdminRole = useCallback(async (u: User | null) => {
    if (!u || !u.email) return false;
    
    // 1. Instant Check: Metadata & Email List
    const emailLower = u.email.toLowerCase();
    const isMetadataAdmin = u.user_metadata?.is_admin === true || u.user_metadata?.role === 'admin';
    const isHardcodedAdmin = ADMIN_EMAILS.includes(emailLower) || ADMIN_EMAILS.includes(u.email); // Handle 'Romeo786' case

    if (isMetadataAdmin || isHardcodedAdmin) {
      return true;
    }

    // 2. Database Check (Only if strictly needed, avoid if possible for speed)
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: u.id,
        _role: 'admin'
      });
      if (!error && data === true) return true;
    } catch (err) {
      console.warn('Role check failed:', err);
      return false;
    }
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (initialSession) {
            setSession(initialSession);
            const currentUser = extendUser(initialSession.user);
            setUser(currentUser);
            // Parallel execution for speed
            const adminStatus = await checkAdminRole(initialSession.user);
            if (mounted) setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        const currentUser = extendUser(currentSession?.user ?? null);
        setUser(currentUser);
        
        if (currentUser) {
          const adminStatus = await checkAdminRole(currentSession?.user ?? null);
          if (mounted) setIsAdmin(adminStatus);
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

      // Note: onAuthStateChange will handle state updates, but we return status here
      let adminStatus = false;
      if (data.user) {
        adminStatus = await checkAdminRole(data.user);
      }
      return { success: true, isAdmin: adminStatus };
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
    // Optimistic UI update for speed
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
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
