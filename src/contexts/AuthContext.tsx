import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useClerk, useSignIn } from '@clerk/clerk-react';
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['bbasitahmad1213@gmail.com', 'Romeo786@gmail.com']; 

// --- Three.js Particle System (No changes here, keeping it same) ---
class ParticleSystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private count = 2000;

  constructor(container: HTMLElement) {
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

    const animate = () => {
      requestAnimationFrame(animate.bind(this));
      if(this.particles) {
        this.particles.rotation.x += 0.001;
        this.particles.rotation.y += 0.002;
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  explode() {
    const positions = this.geometry.attributes.position.array as Float32Array;
    gsap.to(this.particles.rotation, { x: Math.PI * 2, y: Math.PI * 2, duration: 2, ease: 'power4.out' });
    for (let i = 0; i < positions.length; i += 3) {
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
    for (let i = 0; i < positions.length; i += 3) {
      gsap.to(positions, {
        [i]: 0, [i + 1]: 0, [i + 2]: 0, duration: 1, ease: 'power3.in', delay: Math.random() * 0.3,
      });
    }
  }

  cleanup() {
    this.renderer.dispose();
    this.geometry.dispose();
    this.material.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

// --- Main Auth Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clerk Hooks
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  // Local State
  const [isAdmin, setIsAdmin] = useState(false);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  
  // Initialize Particles
  useEffect(() => {
    const container = document.getElementById('auth-particle-container');
    if (container && !particleSystemRef.current) {
        particleSystemRef.current = new ParticleSystem(container);
    }
    return () => {
        // Strict Mode me double render se bachne ke liye cleanup dhyan se karein
        if (particleSystemRef.current) {
            particleSystemRef.current.cleanup();
            particleSystemRef.current = null;
        }
    };
  }, []);

  // Admin Check Logic
  const checkAdminRole = useCallback(async () => {
    if (!clerkUser) return false;
    
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    
    // 1. Email Check
    if (email && ADMIN_EMAILS.includes(email)) return true;

    // 2. Metadata Check
    if (clerkUser.publicMetadata?.role === 'admin') return true;

    // 3. Supabase RPC fallback
    try {
       const { data } = await supabase.rpc('has_role', { _user_id: clerkUser.id, _role: 'admin' });
       if (data) return true;
    } catch (e) { 
        // Silent fail is fine here
    }

    return false;
  }, [clerkUser]);

  // Handle Auth State Changes & Animations
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        checkAdminRole().then(setIsAdmin);
        // Sirf tab animate kare jab pehli baar load ho ya login ho
        animateLoginEffect(); 
      } else {
        setIsAdmin(false);
      }
    }
  }, [isLoaded, isSignedIn, checkAdminRole]);

  // --- Animation Functions ---
  const animateLoginEffect = () => {
    // Check if elements exist before animating to avoid errors
    if(document.querySelector('.auth-success')) {
        gsap.fromTo('.auth-success', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' });
    }
    
    particleSystemRef.current?.explode();
  };

  const animateLogoutEffect = () => {
    if(document.querySelector('.auth-container')) {
        gsap.to('.auth-container', { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' });
    }
    particleSystemRef.current?.implode();
  };

  // --- Actions ---

  // 1. Social Login (FIXED)
  const loginWithSocial = async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => {
    if (!signInLoaded) return;
    try {
        await signIn.authenticateWithRedirect({
            strategy,
            // IMPORTANT: Agar '/auth/callback' route nahi hai, tu seedha '/' use karo
            redirectUrl: "/", 
            redirectUrlComplete: "/"
        });
    } catch (err) {
        console.error("Social Login Error:", err);
    }
  };

  // 2. Email/Pass Login
  const login = async (email: string, password: string) => {
    if (!signInLoaded) return { success: false, error: "Clerk not loaded" };
    try {
      if(document.querySelector('.login-button')) {
          gsap.to('.login-button', { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
      }
      
      const result = await signIn.create({ identifier: email, password });
      
      if (result.status === "complete") {
        return { success: true };
      } else {
        return { success: false, error: "Verification required" };
      }
    } catch (err: any) {
      if(document.querySelector('.error-message')) {
         gsap.fromTo('.error-message', { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
      }
      return { success: false, error: err.errors?.[0]?.message || err.message };
    }
  };

  // 3. Register
  const register = async (name: string, email: string, password: string) => {
     return { success: false, error: "Please use Social Login" };
  };

  const logout = async () => {
    animateLogoutEffect();
    await new Promise(resolve => setTimeout(resolve, 500));
    await signOut();
    setIsAdmin(false);
  };

  // Formatting User
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
      isAuthenticated: !!isSignedIn, // Ensure strictly boolean
      isAdmin,
      loading: !isLoaded, // Yeh sab se eham hai
      login,
      loginWithSocial,
      register,
      logout
    }}>
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
