import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import gsap from 'gsap';
import * as THREE from 'three';

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
  animateLogin: () => void;
  animateLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['bbasitahmad1213@gmail.com', 'Romeo786'];

// Three.js Particle System for Auth Animations
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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate.bind(this));
      this.particles.rotation.x += 0.001;
      this.particles.rotation.y += 0.002;
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  explode() {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    gsap.to(this.particles.rotation, {
      x: Math.PI * 2,
      y: Math.PI * 2,
      duration: 2,
      ease: 'power4.out',
    });

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
        [i]: 0,
        [i + 1]: 0,
        [i + 2]: 0,
        duration: 1,
        ease: 'power3.in',
        delay: Math.random() * 0.3,
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const particleSystemRef = React.useRef<ParticleSystem | null>(null);

  useEffect(() => {
    // Initialize particle system
    const container = document.getElementById('auth-particle-container');
    if (container) {
      particleSystemRef.current = new ParticleSystem(container);
    }

    return () => {
      if (particleSystemRef.current) {
        particleSystemRef.current.cleanup();
      }
    };
  }, []);

  const extendUser = (u: User | null): ExtendedUser | null => {
    if (!u) return null;
    return { ...u, name: u.user_metadata?.full_name || u.email?.split('@')[0] };
  };

  const checkAdminRole = useCallback(async (u: User | null) => {
    if (!u) return false;
    
    // 1. Priority Check: Metadata
    if (u.user_metadata?.is_admin === true || u.user_metadata?.role === 'admin') {
      return true;
    }

    // 2. Email Check
    if (u.email && ADMIN_EMAILS.includes(u.email)) {
      return true;
    }

    // 3. Database RPC Check
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: u.id,
        _role: 'admin'
      });
      if (!error && data === true) return true;
    } catch {
      return false;
    }
    return false;
  }, []);

  const animateLogin = () => {
    // GSAP Login Animation
    gsap.fromTo('.auth-success', 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );

    // Particle explosion
    if (particleSystemRef.current) {
      particleSystemRef.current.explode();
    }

    // Confetti effect
    const confetti = () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          top: -10px;
          left: ${Math.random() * 100}vw;
          border-radius: 50%;
          z-index: 9999;
        `;
        document.body.appendChild(confetti);
        
        gsap.to(confetti, {
          y: window.innerHeight + 10,
          x: Math.random() * 100 - 50,
          rotation: Math.random() * 360,
          duration: 1 + Math.random() * 2,
          ease: 'power2.out',
          onComplete: () => confetti.remove(),
        });
      }
    };
    confetti();
  };

  const animateLogout = () => {
    // GSAP Logout Animation
    gsap.to('.auth-container', {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: 'power2.in',
    });

    // Particle implosion
    if (particleSystemRef.current) {
      particleSystemRef.current.implode();
    }

    // Fade out animation
    const elements = document.querySelectorAll('.user-element');
    gsap.to(elements, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.in',
    });
  };

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
          
          // Animate user data appearance
          gsap.fromTo('.user-data', 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.2 }
          );
        }
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          animateLogout();
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN') {
          animateLogin();
        }

        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(extendUser(currentUser));
        
        if (currentUser) {
          const adminStatus = await checkAdminRole(currentUser);
          setIsAdmin(adminStatus);
          
          // Animate admin badge
          if (adminStatus) {
            gsap.fromTo('.admin-badge', 
              { scale: 0, rotation: 0 },
              { 
                scale: 1, 
                rotation: 360,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
              }
            );
          }
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
      // Animate login button
      gsap.to('.login-button', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const adminStatus = await checkAdminRole(data.user);
        setIsAdmin(adminStatus);
        return { success: true, isAdmin: adminStatus };
      }
      return { success: true, isAdmin: false };
    } catch (err: any) {
      // Error animation
      gsap.fromTo('.error-message', 
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: 'power1.inOut' }
      );
      return { success: false, error: err.message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Registration animation
      gsap.fromTo('.register-form', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }
      );

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
      
      // Success animation
      gsap.to('.success-message', {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      });
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    animateLogout();
    
    // Delay logout for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
    setSession(null);
    setLoading(false);
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
      loading,
      animateLogin,
      animateLogout
    }}>
      {/* Particle System Container */}
      <div 
        id="auth-particle-container" 
        className="fixed inset-0 pointer-events-none z-0"
      />
      
      {/* Animated Background */}
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