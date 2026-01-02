import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext'; // Sirf Context use karenge
import { toast } from 'sonner';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Context se data uthaya (Consistency ke liye yahi use karo)
  const { 
    login, 
    register, 
    loginWithSocial, 
    isAuthenticated, 
    isAdmin, 
    loading: authLoading 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 SAFE REDIRECT: useEffect ka use karein taa ke render conflicts na hon
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Agar user login hai, tu usay wapas bhej do
      // location.state se check karte hain agar wo kisi specific page se aya tha
      // @ts-ignore
      const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, isAdmin, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSocialLogin = async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => {
    try {
      setFormLoading(true);
      toast.info("Connecting to secure login...");
      await loginWithSocial(strategy);
    } catch (error: any) {
      console.error("Social login error", error);
      toast.error("Login failed. Please try again.");
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading) return;
    
    setFormLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Welcome back!');
          // Redirect useEffect sambhal lega
        } else {
          toast.error(result.error || 'Invalid credentials');
          setFormLoading(false);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setFormLoading(false);
          return;
        }

        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          toast.success('Account created! Logging in...');
        } else {
          toast.error(result.error || 'Registration failed');
          setFormLoading(false);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      setFormLoading(false);
    }
  };

  // Loading State (Jab tak pata na chale banda login hai ya nahi)
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Agar banda login hai tu form render mat karo (Flicker bachane ke liye)
  if (isAuthenticated) {
    return null; 
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-2xl">B</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to continue to BasitShop' : 'Join BasitShop and start shopping'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
            
            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleSocialLogin('oauth_google')}
                disabled={formLoading}
                className="flex items-center justify-center py-2.5 border border-border/50 rounded-xl hover:bg-muted transition-colors disabled:opacity-50 hover:scale-105 active:scale-95 duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin('oauth_apple')}
                disabled={formLoading}
                className="flex items-center justify-center py-2.5 border border-border/50 rounded-xl hover:bg-muted transition-colors disabled:opacity-50 hover:scale-105 active:scale-95 duration-200"
              >
                <svg className="w-5 h-5 fill-foreground" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.65-.95 1.87.11 3.48 1.1 4.5 2.5-4.14 2.2-3.47 7.72.67 9.42-.45 1.17-1 2.29-1.9 3.26zm-2.58-16c.3 1.5-1.35 2.94-2.82 2.76-.25-1.35 1.17-2.91 2.82-2.76z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('oauth_facebook')}
                disabled={formLoading}
                className="flex items-center justify-center py-2.5 border border-border/50 rounded-xl hover:bg-muted transition-colors disabled:opacity-50 hover:scale-105 active:scale-95 duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                </svg>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      minLength={6}
                      className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl mt-6 flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {formLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                className="text-primary hover:underline ml-2 font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
