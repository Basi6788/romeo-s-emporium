import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, KeyRound, CheckCircle2, Timer } from 'lucide-react';
import { useSignIn, useSignUp } from '@clerk/clerk-react'; 
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Custom CSS for animations (Shake)
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.3s ease-in-out 3;
  }
`;

type AuthView = 'login' | 'signup' | 'verify-otp' | 'forgot-password' | 'reset-password';
type OtpStatus = 'neutral' | 'success' | 'error';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn } = useSignIn(); 
  const { signUp } = useSignUp(); 

  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // OTP Specific States
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('neutral');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isProcessingRef = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const { 
    login, 
    register, 
    verifyOtp,
    loginWithSocial, 
    isAuthenticated,
    loading: authLoading 
  } = useAuth();

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = shakeKeyframes;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // 1. Sync View with URL
  useEffect(() => {
    if (location.pathname.includes('sign-up')) {
      setView('signup');
    } else if (location.pathname.includes('sign-in')) {
      if (view !== 'forgot-password' && view !== 'reset-password' && view !== 'verify-otp') {
        setView('login');
      }
    }
  }, [location.pathname]);

  // 2. Protection Logic
  useEffect(() => {
    if (isAuthenticated && !isProcessingRef.current && !loading) {
        navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, loading]);

  // 3. Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 4. Auto Submit OTP Logic
  useEffect(() => {
    if ((view === 'verify-otp' || view === 'reset-password') && formData.otp.length === 6) {
        // Thora sa delay taki user last digit dekh sake
        const timeout = setTimeout(() => {
             if (view === 'reset-password') {
                 // Reset password mein user ko button dabana parega kyunki password bhi dalna hai
                 // Lakin agar sirf verify view hai tu auto submit
             } else {
                 triggerOtpVerify();
             }
        }, 300);
        return () => clearTimeout(timeout);
    }
  }, [formData.otp, view]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- New OTP Handlers ---
  const handleOtpChange = (index: number, value: string) => {
    // Sirf numbers allow karo
    if (isNaN(Number(value))) return;

    const newOtp = formData.otp.split('');
    // Ensure array is 6 length padded
    while (newOtp.length < 6) newOtp.push('');

    newOtp[index] = value.substring(value.length - 1);
    const finalOtpString = newOtp.join('').substring(0, 6);
    
    setFormData(prev => ({ ...prev, otp: finalOtpString }));
    setOtpStatus('neutral'); // Reset status on type

    // Move focus next
    if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
        // Move back if empty
        otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Only numbers

    setFormData(prev => ({ ...prev, otp: pastedData }));
    
    // Focus last box filled
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };


  const switchMode = (mode: 'login' | 'signup') => {
    setFormData(prev => ({ ...prev, otp: '' })); // Clear OTP
    setOtpStatus('neutral');
    if (mode === 'login') navigate('/auth/sign-in');
    else navigate('/auth/sign-up');
  };

  // --- Handlers ---

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    isProcessingRef.current = true;

    try {
      if (view === 'login') {
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          if (result.status === 'needs_code') {
            setView('verify-otp');
            setFormData(prev => ({...prev, otp: ''})); // Clear old OTP
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100); // Auto focus first box
            toast.info("Please enter the verification code sent to your email.");
          } else {
            toast.success('Welcome back!');
            navigate('/welcome-back'); 
          }
        } else {
          toast.error(result.error || 'Invalid credentials');
          isProcessingRef.current = false;
        }

      } else if (view === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          isProcessingRef.current = false;
          return;
        }

        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
           setView('verify-otp');
           setFormData(prev => ({...prev, otp: ''}));
           setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
           toast.success('Verification code sent to your email!');
        } else {
          toast.error(result.error || 'Registration failed');
          isProcessingRef.current = false;
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      isProcessingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Alag function banaya taake auto-trigger ho sake
  const triggerOtpVerify = async () => {
    if (loading) return;
    setLoading(true);
    isProcessingRef.current = true;

    const isLoginFlow = view === 'login' || (view === 'verify-otp' && !formData.name);
    const result = await verifyOtp(formData.otp, isLoginFlow);

    if (result.success) {
      setOtpStatus('success'); // Green animation trigger
      toast.success("Verified successfully!");
      
      // Thora delay taake user green boxes dekh sake
      setTimeout(() => {
          if (isLoginFlow) {
              navigate('/welcome-back');
          } else {
              navigate('/onboarding');
          }
      }, 800);
      
    } else {
      setOtpStatus('error'); // Shake trigger
      toast.error(result.error || "Invalid Code");
      setLoading(false);
      isProcessingRef.current = false;
      
      // Error ke baad OTP clear karna hai ya nahi? Usually UX acha rehta hai agar clear na ho magar focus wapis aa jaye
      // otpInputRefs.current[0]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerOtpVerify();
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setOtpStatus('neutral');
    setFormData(prev => ({...prev, otp: ''}));
    otpInputRefs.current[0]?.focus();
    
    try {
        const isLoginFlow = view === 'login' || (view === 'verify-otp' && !formData.name);

        if (isLoginFlow) {
            if (!signIn) return;
            await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: signIn.firstFactorVerification.emailAddressId });
        } else {
            if (!signUp) return;
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        }

        toast.success("Code resent successfully!");
        setResendCooldown(30);
    } catch (error: any) {
        toast.error(error.errors?.[0]?.message || "Failed to resend code");
    } finally {
        setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!signIn) return;
    setLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: formData.email,
      });
      toast.success("Reset code sent to your email");
      setView('reset-password');
      setFormData(prev => ({ ...prev, otp: '', password: '' }));
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Failed to send code. Account may not exist.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!signIn) return;
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: formData.otp,
        password: formData.password,
      });

      if (result.status === "complete") {
        setOtpStatus('success');
        toast.success("Password reset successful! Logging you in...");
        setTimeout(() => navigate('/welcome-back'), 800);
      } else {
        setOtpStatus('error');
        toast.error("Failed to reset password. Try again.");
      }
    } catch (err: any) {
      setOtpStatus('error');
      toast.error(err.errors?.[0]?.message || "Invalid code or password weak");
    } finally {
      setLoading(false);
    }
  };


  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to render OTP inputs
  const renderOtpInputs = () => (
    <div className="flex justify-center gap-2 sm:gap-3 mb-6">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => (otpInputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={formData.otp[index] || ''}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          onPaste={handleOtpPaste}
          disabled={loading || otpStatus === 'success'}
          className={`
            w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
            ${otpStatus === 'error' ? 'animate-shake border-red-500 bg-red-50 text-red-600' : ''}
            ${otpStatus === 'success' ? 'border-green-500 bg-green-50 text-green-600 scale-110' : 'border-border/50 bg-muted focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10'}
            /* Staggered transition for success effect */
            ${otpStatus === 'success' ? `delay-[${index * 100}ms]` : ''}
          `}
        />
      ))}
    </div>
  );

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
             <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/20">
                  {/* Abstract Logo */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
              </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              {view === 'login' && 'Welcome Back'}
              {view === 'signup' && 'Create Account'}
              {view === 'verify-otp' && 'Verify Email'}
              {view === 'forgot-password' && 'Reset Password'}
              {view === 'reset-password' && 'Set New Password'}
            </h1>
            <p className="text-muted-foreground">
              {view === 'login' && 'Sign in to continue to BasitShop'}
              {view === 'signup' && 'Join BasitShop and start shopping'}
              {view === 'verify-otp' && 'Enter the 6-digit code sent to your email'}
              {view === 'forgot-password' && 'Enter your email to receive a reset code'}
              {view === 'reset-password' && 'Enter code and your new password'}
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
            
            {(view === 'verify-otp' || view === 'forgot-password' || view === 'reset-password') && (
               <button 
                 onClick={() => switchMode('login')}
                 className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
                 title="Back to login"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
            )}

            {(view === 'login' || view === 'signup') && (
              <>
                {/* GLASS STYLE SOCIAL BUTTONS */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {['oauth_google', 'oauth_apple', 'oauth_facebook'].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => loginWithSocial(provider as any)}
                      disabled={loading}
                      className="group flex items-center justify-center h-14 border border-border/40 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    >
                      {provider === 'oauth_google' && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                      )}
                      {/* Fixed Apple Logo - Cleaner Path */}
                      {provider === 'oauth_apple' && (
                        <svg className="w-6 h-6 fill-foreground" viewBox="0 0 384 512">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
                        </svg>
                      )}
                      {provider === 'oauth_facebook' && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" /></svg>
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="bg-card px-4 text-muted-foreground font-medium">Or continue with email</span></div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  {view === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-transparent focus:bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="John Doe" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-transparent focus:bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="you@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full pl-12 pr-12 py-3.5 bg-muted/50 border border-transparent focus:bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {view === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 ml-1">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-transparent focus:bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="••••••••" />
                      </div>
                    </div>
                  )}

                  {view === 'login' && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setView('forgot-password')} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl mt-6 flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg shadow-primary/25">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{view === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>

                <p className="text-center mt-8 text-muted-foreground">
                  {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  <button onClick={() => switchMode(view === 'login' ? 'signup' : 'login')} className="text-primary hover:underline ml-2 font-semibold">
                    {view === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </>
            )}

            {view === 'verify-otp' && (
              <form onSubmit={handleVerifySubmit} className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Check your email</h3>
                  <p className="text-sm text-muted-foreground mt-1">We've sent a code to <span className="font-medium text-foreground">{formData.email}</span></p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4 text-center">Verification Code</label>
                  {/* NEW 6 BOX INPUTS */}
                  {renderOtpInputs()}
                </div>

                {/* Confirm button removed as requested, only showing loading state if needed manually */}
                {loading && (
                    <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}

                <div className="text-center">
                    <button 
                        type="button" 
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || loading}
                        className="text-sm text-primary font-medium hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full transition-colors"
                    >
                        {resendCooldown > 0 ? (
                            <>
                              <Timer className="w-4 h-4" /> Resend code in {resendCooldown}s
                            </>
                        ) : (
                            "Didn't receive code? Resend"
                        )}
                    </button>
                </div>
              </form>
            )}

            {view === 'forgot-password' && (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
                <div>
                   <label className="block text-sm font-medium mb-2 ml-1">Email Address</label>
                   <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-transparent focus:bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="you@example.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] transition-all shadow-lg shadow-primary/25">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Code <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            )}

             {view === 'reset-password' && (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-5">
                 <div>
                  <label className="block text-sm font-medium mb-4 text-center">Enter Reset Code</label>
                  {renderOtpInputs()}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-transparent focus:bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="New Password" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] transition-all shadow-lg shadow-primary/25">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <KeyRound className="w-5 h-5" /></>}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;

