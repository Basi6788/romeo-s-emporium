import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser, useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import gsap from 'gsap';
import * as THREE from 'three';

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
  // Login returns status to handle OTP flow
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; status?: string }>;
  loginWithSocial: (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => Promise<void>;
  // Register returns status for OTP
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; status?: string }>;
  // Universal Verify Function
  verifyOtp: (code: string, isLoginFlow: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin Emails List (Hardcoded Super Admins) - Lowercase me rakhen
const ADMIN_EMAILS = ['bbasitahmad1213@gmail.com', 'romeo786@gmail.com']; 

// --- Three.js Particle System (Background Effects) ---
class ParticleSystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private count = 2000;
  private frameId: number | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      colors[i] = Math.random();
      colors[i + 1] = Math.random();
      colors[i + 2] = Math.random();
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
    this.camera.position.z = 5;
    
    // Resize Handler
    window.addEventListener('resize', this.handleResize);
    this.animate();
  }

  handleResize = () => {
      if(!this.container) return;
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    if(this.particles) {
      this.particles.rotation.x += 0.001;
      this.particles.rotation.y += 0.002;
    }
    this.renderer.render(this.scene, this.camera);
  };

  explode() {
    const positions = this.geometry.attributes.position.array as Float32Array;
    gsap.to(this.particles.rotation, { x: Math.PI * 2, y: Math.PI * 2, duration: 2, ease: 'power4.out' });
    // Sirf thore particles move karo performance ke liye
    for (let i = 0; i < positions.length; i += 9) { 
      gsap.to(positions, {
        [i]: positions[i] * 2,
        [i + 1]: positions[i + 1] * 2,
        [i + 2]: positions[i + 2] * 2,
        duration: 1.5,
        ease: 'power3.out',
        delay: Math.random() * 0.5,
      });
    }
  }

  implode() {
    const positions = this.geometry.attributes.position.array as Float32Array;
    gsap.to(this.scene.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 0.8, ease: 'power2.in' });
  }

  cleanup() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
    this.geometry.dispose();
    this.material.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

// --- Main Auth Provider Logic ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clerk Hooks
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut, setActive } = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  // Local State
  const [isAdmin, setIsAdmin] = useState(false);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  
  // 1. Initialize Particles (Background)
  useEffect(() => {
    // Only run on client side
    const container = document.getElementById('auth-particle-container');
    if (container && !particleSystemRef.current) {
        particleSystemRef.current = new ParticleSystem(container);
    }
    return () => {
        if (particleSystemRef.current) {
            particleSystemRef.current.cleanup();
            particleSystemRef.current = null;
        }
    };
  }, []);

  // 2. Admin Check Logic (Supabase + Hardcoded)
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!clerkUser || !isSignedIn) {
        setIsAdmin(false);
        return;
      }
      
      const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
      
      // Check 1: Hardcoded Emails (Case Insensitive)
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
         // Agar Supabase configured nahi hai tu crash na ho
         if (supabase) {
             const { data } = await supabase.rpc('has_role', { _user_id: clerkUser.id, _role: 'admin' });
             if (data) setIsAdmin(true);
         }
      } catch (e) { 
        // Silent fail if DB check fails
      }
    };

    if (isLoaded) {
        checkAdminRole();
        if (isSignedIn) {
            // Animation Trigger on Success
            particleSystemRef.current?.explode();
        }
    }
  }, [clerkUser, isLoaded, isSignedIn]);


  // --- Actions ---

  // 1. Social Login
  const loginWithSocial = async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => {
    if (!signInLoaded) return;
    try {
        // App.tsx handle karega redirect ko, bas authenticate karo
        // SSO Callback zaroori hai loop prevent karne ke liye
        const redirectUrl = `${window.location.origin}/sso-callback`; 
        await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl,
            redirectUrlComplete: "/" // App.tsx will override this based on bridge settings
        });
    } catch (err) {
        console.error("Social Login Error:", err);
    }
  };

  // 2. Login Logic (Updated for OTP)
  const login = async (email: string, password: string) => {
    if (!signInLoaded) return { success: false, error: "Auth system not loaded" };
    
    try {
      // Step 1: Initialize Login
      const result = await signIn.create({ identifier: email, password });
      
      // Step 2: Analyze Status
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        return { success: true, status: 'complete' };
      } 
      // Agar 2FA ya Email Code ki zaroorat hai
      else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        return { success: true, status: 'needs_code' };
      } 
      else {
        return { success: false, error: "Action required: " + result.status, status: result.status };
      }
    } catch (err: any) {
      // Error Formatting
      const msg = err.errors ? err.errors[0].longMessage : err.message;
      return { success: false, error: msg };
    }
  };

  // 3. Register Logic
  const register = async (name: string, email: string, password: string) => {
    if (!signUpLoaded) return { success: false, error: "Auth system not loaded" };
    
    try {
        // Step 1: Create Sign Up Object
        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ") || ""; // Handle single names

        await signUp.create({
            emailAddress: email,
            password,
            firstName,
            lastName
        });

        // Step 2: Trigger Verification Email
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

        // Step 3: Tell UI to show OTP
        return { success: true, status: 'needs_code' };

    } catch (err: any) {
        const msg = err.errors ? err.errors[0].longMessage : err.message;
        return { success: false, error: msg };
    }
  };

  // 4. 🔥 Universal OTP Verify
  const verifyOtp = async (code: string, isLoginFlow: boolean) => {
    try {
        let result;
        
        // --- LOGIN FLOW ---
        if (isLoginFlow) {
            if (!signInLoaded) return { success: false, error: "Not loaded" };
            
            // Login ke liye 'attemptFirstFactor' use hota hai
            result = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code,
            });
        } 
        // --- SIGNUP FLOW ---
        else {
            if (!signUpLoaded) return { success: false, error: "Not loaded" };
            
            // Signup ke liye 'attemptEmailAddressVerification' use hota hai
            result = await signUp.attemptEmailAddressVerification({
                code,
            });
        }

        // --- CHECK RESULT ---
        if (result.status === "complete") {
            // Session Active karo
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
    // Animation Effect
    particleSystemRef.current?.implode();
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));
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
      {/* Background Layer */}
      <div id="auth-particle-container" className="fixed inset-0 pointer-events-none z-0" />
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

