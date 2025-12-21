import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false); // Local state for button
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Optimized Navigation: Sirf tabhi chale jab page load ho ya auth state change ho
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const target = isAdmin ? '/admin' : '/';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading) return; // Prevent double clicks
    
    setFormLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          toast.success('Welcome back!');
          // Navigation useEffect khud handle kar lega
        } else {
          toast.error(result.error || 'Invalid credentials');
          setFormLoading(false);
        }
      } else {
        // Registration Logic
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setFormLoading(false);
          return;
        }

        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          toast.success('Account created successfully!');
          // Email confirm band hai to user directly login ho chuka hoga
          // Isliye navigate automatically ho jayega AuthContext ki wajah se
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

  // Agar loading chal rahi hai to blank screen ki bajaye spinner dikhayen
  if (authLoading && !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
            <div className="space-y-4">
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
                      className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full pl-12 pr-12 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl mt-6 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
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

          {/* Toggle */}
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
    </Layout>
  );
};

export default AuthPage;
