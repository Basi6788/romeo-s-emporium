import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, KeyRound, Timer, HelpCircle } from 'lucide-react';
import { useSignIn, useSignUp } from '@clerk/clerk-react'; 
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Custom CSS for animations (Shake + Blobs)
const customStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-shake { animation: shake 0.3s ease-in-out 3; }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  
  /* Glass Input Auto-fill fix */
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active{
      -webkit-background-clip: text;
      -webkit-text-fill-color: inherit;
      transition: background-color 5000s ease-in-out 0s;
      box-shadow: inset 0 0 20px 20px #23232329;
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
    styleSheet.innerText = customStyles;
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
        const timeout = setTimeout(() => {
             if (view === 'reset-password') {
                 // Manual submit for reset
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

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = formData.otp.split('');
    while (newOtp.length < 6) newOtp.push('');

    newOtp[index] = value.substring(value.length - 1);
    const finalOtpString = newOtp.join('').substring(0, 6);
    
    setFormData(prev => ({ ...prev, otp: finalOtpString }));
    setOtpStatus('neutral');

    if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    setFormData(prev => ({ ...prev, otp: pastedData }));
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };


  const switchMode = (mode: 'login' | 'signup') => {
    setFormData(prev => ({ ...prev, otp: '' }));
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
            setFormData(prev => ({...prev, otp: ''}));
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
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

  const triggerOtpVerify = async () => {
    if (loading) return;
    setLoading(true);
    isProcessingRef.current = true;

    const isLoginFlow = view === 'login' || (view === 'verify-otp' && !formData.name);
    const result = await verifyOtp(formData.otp, isLoginFlow);

    if (result.success) {
      setOtpStatus('success');
      toast.success("Verified successfully!");
      
      setTimeout(() => {
          if (isLoginFlow) {
              navigate('/welcome-back');
          } else {
              navigate('/onboarding');
          }
      }, 800);
      
    } else {
      setOtpStatus('error');
      toast.error(result.error || "Invalid Code");
      setLoading(false);
      isProcessingRef.current = false;
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
            w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none backdrop-blur-md
            ${otpStatus === 'error' ? 'animate-shake border-red-500/50 bg-red-500/10 text-red-500' : ''}
            ${otpStatus === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500 scale-110' : 'border-white/20 bg-white/5 focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10'}
          `}
        />
      ))}
    </div>
  );

  return (
    <Layout showFooter={false}>
      {/* Dynamic Background Container */}
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-background">
         
         {/* Animated Blobs */}
         <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
         </div>

        <div className="w-full max-w-md px-4 relative z-10">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              {view === 'login' && 'Welcome Back'}
              {view === 'signup' && 'Create Account'}
              {view === 'verify-otp' && 'Verify Email'}
              {view === 'forgot-password' && 'Reset Password'}
              {view === 'reset-password' && 'Set New Password'}
            </h1>
            <p className="text-muted-foreground/80 font-medium">
              {view === 'login' && 'Enter your details to sign in'}
              {view === 'signup' && 'Join us and start your journey'}
              {view === 'verify-otp' && 'Check your inbox for the code'}
              {view === 'forgot-password' && 'Don\'t worry, it happens to the best of us'}
            </p>
          </div>

          {/* Glassmorphism Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
            
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {(view === 'verify-otp' || view === 'forgot-password' || view === 'reset-password') && (
               <button 
                 onClick={() => switchMode('login')}
                 className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-white/10 rounded-full z-20"
                 title="Back to login"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
            )}

            {(view === 'login' || view === 'signup') && (
              <>
                {/* Social Grid - 4 Columns */}
                <div className="grid grid-cols-4 gap-3 mb-8 relative z-10">
                  {['oauth_google', 'oauth_apple', 'oauth_facebook', 'oauth_tiktok'].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => loginWithSocial(provider as any)}
                      disabled={loading}
                      className="group flex items-center justify-center h-14 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-black/5"
                    >
                      {provider === 'oauth_google' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                      )}
                      {provider === 'oauth_apple' && (
                         <svg className="w-5 h-5 fill-current text-foreground" viewBox="0 0 24 24"><path d="M17.5 12.6c0 2.5 2.1 3.3 2.2 3.4-.05.1-.3.9-.9 1.8-.6.9-1.2 1.8-2.2 1.8-1 0-1.3-.6-2.4-.6-1.1 0-1.4.6-2.5.6-1 0-1.7-1-2.4-1.9-1.3-1.8-2.3-4.6-1-7 1.3-2.3 3.6-2.4 3.9-2.4 1 0 1.9.7 2.5.7.6 0 1.6-.8 2.8-.8.4 0 1.7.1 2.5 1.2-.1.1-1.5.8-1.5 3.2zM15 5.5c.5-.6.9-1.5.8-2.4-.8 0-1.8.6-2.4 1.2-.5.6-1 1.5-.8 2.4.9.1 1.9-.5 2.4-1.2z"/></svg>
                      )}
                      {provider === 'oauth_facebook' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" /></svg>
                      )}
                      {/* Accurate TikTok SVG Path */}
                      {provider === 'oauth_tiktok' && (
                        <svg className="w-5 h-5 fill-current text-foreground" viewBox="0 0 24 24">
                           <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative mb-8 z-10">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="bg-transparent backdrop-blur-md px-4 text-muted-foreground font-medium rounded-full">Or continue with email</span></div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-5 relative z-10">
                  {view === 'signup' && (
                    <div className="space-y-2">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:bg-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-md text-foreground placeholder:text-muted-foreground/50" placeholder="Full Name" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:bg-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-md text-foreground placeholder:text-muted-foreground/50" placeholder="Email Address" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 focus:bg-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-md text-foreground placeholder:text-muted-foreground/50" placeholder="Password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 z-10">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {view === 'signup' && (
                    <div className="space-y-2">
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                        <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:bg-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-md text-foreground placeholder:text-muted-foreground/50" placeholder="Confirm Password" />
                      </div>
                    </div>
                  )}

                  {view === 'login' && (
                    <div className="flex justify-end">
                      {/* IMPROVED FORGOT PASSWORD BUTTON */}
                      <button 
                        type="button" 
                        onClick={() => setView('forgot-password')} 
                        className="text-sm font-medium text-foreground/80 hover:text-primary transition-all flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-primary/20 hover:bg-primary/10"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl mt-6 flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/25 font-semibold tracking-wide">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{view === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>

                <p className="text-center mt-8 text-muted-foreground relative z-10">
                  {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  <button onClick={() => switchMode(view === 'login' ? 'signup' : 'login')} className="text-primary hover:underline hover:text-primary/80 ml-2 font-bold transition-colors">
                    {view === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </>
            )}

            {view === 'verify-otp' && (
              <form onSubmit={handleVerifySubmit} className="space-y-8 relative z-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 backdrop-blur-sm">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Check your email</h3>
                  <p className="text-sm text-muted-foreground mt-2">We've sent a code to <br/><span className="font-medium text-foreground bg-white/10 px-2 py-0.5 rounded">{formData.email}</span></p>
                </div>

                <div>
                  {renderOtpInputs()}
                </div>

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
              <form onSubmit={handleForgotPasswordRequest} className="space-y-6 relative z-10">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-sm">
                        <KeyRound className="w-7 h-7 text-orange-500" />
                    </div>
                    <p className="text-muted-foreground text-sm">Enter your email address and we'll send you a code to reset your password.</p>
                </div>

                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:bg-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-md text-foreground placeholder:text-muted-foreground/50" placeholder="you@example.com" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all shadow-xl shadow-primary/25 font-semibold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Code <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            )}

             {view === 'reset-password' && (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-5 relative z-10">
                 <div>
                  <label className="block text-sm font-medium mb-4 text-center text-muted-foreground">Enter the 6-digit code</label>
                  {renderOtpInputs()}
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:bg-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-md text-foreground placeholder:text-muted-foreground/50" placeholder="New Password" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all shadow-xl shadow-primary/25 font-semibold">
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

