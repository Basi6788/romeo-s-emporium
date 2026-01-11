import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; status?: string }>;
  loginWithSocial: (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; status?: string }>;
  verifyOtp: (code: string, isLoginFlow: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin Emails List (Hardcoded Super Admins)
const ADMIN_EMAILS = ['bbasitahmad1213@gmail.com', 'romeo786@gmail.com']; 

// --- Main Auth Provider Logic ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clerk Hooks
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut, setActive } = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  // Local State
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 1. Admin Check Logic (Supabase + Hardcoded)
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!clerkUser || !isSignedIn) {
        setIsAdmin(false);
        return;
      }
      
      const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
      
      // Check 1: Hardcoded Emails
      if (email && ADMIN_EMAILS.includes(email)) {
          setIsAdmin(true);
          return;
      }

      // Check 2: Clerk Metadata
      if (clerkUser.publicMetadata?.role === 'admin') {
          setIsAdmin(true);
          return;
      }

      // Check 3: Supabase DB Role
      try {
         if (supabase) {
             const { data } = await supabase.rpc('has_role', { _user_id: clerkUser.id, _role: 'admin' });
             if (data) setIsAdmin(true);
         }
      } catch (e) { 
        // Silent fail
      }
    };

    if (isLoaded) {
        checkAdminRole();
    }
  }, [clerkUser, isLoaded, isSignedIn]);


  // --- Actions ---

  // 1. Social Login
  const loginWithSocial = async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => {
    if (!signInLoaded) return;
    try {
        const redirectUrl = `${window.location.origin}/sso-callback`; 
        await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl,
            redirectUrlComplete: "/" 
        });
    } catch (err) {
        console.error("Social Login Error:", err);
    }
  };

  // 2. Login Logic
  const login = async (email: string, password: string) => {
    if (!signInLoaded) return { success: false, error: "Auth system not loaded" };
    
    try {
      const result = await signIn.create({ identifier: email, password });
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        return { success: true, status: 'complete' };
      } 
      else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        return { success: true, status: 'needs_code' };
      } 
      else {
        return { success: false, error: "Action required: " + result.status, status: result.status };
      }
    } catch (err: any) {
      const msg = err.errors ? err.errors[0].longMessage : err.message;
      return { success: false, error: msg };
    }
  };

  // 3. Register Logic
  const register = async (name: string, email: string, password: string) => {
    if (!signUpLoaded) return { success: false, error: "Auth system not loaded" };
    
    try {
        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ") || ""; 

        await signUp.create({
            emailAddress: email,
            password,
            firstName,
            lastName
        });

        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        return { success: true, status: 'needs_code' };

    } catch (err: any) {
        const msg = err.errors ? err.errors[0].longMessage : err.message;
        return { success: false, error: msg };
    }
  };

  // 4. Universal OTP Verify
  const verifyOtp = async (code: string, isLoginFlow: boolean) => {
    try {
        let result;
        
        if (isLoginFlow) {
            if (!signInLoaded) return { success: false, error: "Not loaded" };
            result = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code,
            });
        } 
        else {
            if (!signUpLoaded) return { success: false, error: "Not loaded" };
            result = await signUp.attemptEmailAddressVerification({
                code,
            });
        }

        if (result.status === "complete") {
            await setActive({ session: result.createdSessionId });
            return { success: true };
        } else {
            return { success: false, error: "Verification incomplete. Status: " + result.status };
        }
    } catch (err: any) {
        const msg = err.errors ? err.errors[0].longMessage : "Invalid verification code";
        return { success: false, error: msg };
    }
  };

  // 5. Logout
  const logout = async () => {
    await signOut();
    setIsAdmin(false);
  };

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
      isAuthenticated: !!isSignedIn,
      isAdmin,
      loading: !isLoaded, 
      login,
      loginWithSocial,
      register,
      verifyOtp, 
      logout
    }}>
      {/* Three.js Canvas hata diya hai. 
         Sirf lightweight CSS gradient rakha hai taake blank na lage.
      */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

