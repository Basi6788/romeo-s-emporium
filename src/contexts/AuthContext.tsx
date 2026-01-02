import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk, useSignIn } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

// --- Types ---
interface ExtendedUser {
  id: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  publicMetadata?: any;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['bbasitahmad1213@gmail.com', 'Romeo786@gmail.com']; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  
  // Local state sirf Admin role ke liye (kyun ke wo async check ho sakta hai)
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Admin Logic ---
  useEffect(() => {
    const checkAdmin = async () => {
      if (!clerkUser || !isSignedIn) {
        setIsAdmin(false);
        return;
      }

      const email = clerkUser.primaryEmailAddress?.emailAddress;

      // 1. Instant Check (Email or Metadata)
      if (email && ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        return;
      }
      if (clerkUser.publicMetadata?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // 2. Database Check (Supabase)
      try {
         const { data } = await supabase.rpc('has_role', { _user_id: clerkUser.id, _role: 'admin' });
         if (data) setIsAdmin(true);
      } catch (e) {
         // Ignore error
      }
    };

    if (isLoaded) {
      checkAdmin();
    }
  }, [clerkUser, isLoaded, isSignedIn]);


  // --- Actions ---
  const loginWithSocial = async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => {
    if (!signInLoaded) return;
    try {
        await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl: "/sso-callback", 
            redirectUrlComplete: "/"
        });
    } catch (err) {
        console.error("Social Login Error:", err);
    }
  };

  const login = async (email: string, password: string) => {
    if (!signInLoaded) return { success: false, error: "Clerk not loaded" };
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        return { success: true };
      } else {
        return { success: false, error: "Verification required" };
      }
    } catch (err: any) {
      return { success: false, error: err.errors?.[0]?.message || err.message };
    }
  };

  const register = async () => {
     return { success: false, error: "Please use Social Login" };
  };

  const logout = async () => {
    await signOut();
    setIsAdmin(false);
  };

  // --- DERIVED STATE (No useEffect delay) ---
  // Yeh line sab se important hai fix ke liye:
  const extendedUser: ExtendedUser | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || "User",
    email: clerkUser.primaryEmailAddress?.emailAddress,
    imageUrl: clerkUser.imageUrl,
    publicMetadata: clerkUser.publicMetadata
  } : null;

  return (
    <AuthContext.Provider value={{
      user: extendedUser,
      isAuthenticated: !!isSignedIn, // Direct Boolean (No Delay)
      isAdmin,
      loading: !isLoaded, 
      login,
      loginWithSocial,
      register,
      logout
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
