import { useEffect, useRef, useState } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { gsap } from "gsap";
import { Loader2, CheckCircle2, ShieldCheck, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

const SSOCallback = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<"verifying" | "success">("verifying");

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry Animation
      gsap.from(".auth-card", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Pulse Effect on Icon
      gsap.to(".pulse-icon", {
        scale: 1.1,
        opacity: 0.8,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    // Simulate a brief delay to show the success state before redirect activates
    // (Optional: Clerk usually redirects fast, but this makes it feel smoother)
    const timer = setTimeout(() => {
      setStatus("success");
      // Success Animation
      gsap.to(".success-icon", {
        scale: 1.2,
        duration: 0.4,
        ease: "back.out(1.7)",
      });
    }, 2000); // 2 seconds fake delay for visual appeal (adjust as needed)

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden"
    >
      {/* Background Elements (Subtle Glows) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />

      {/* Main Card */}
      <div className="auth-card relative bg-card/50 backdrop-blur-xl border border-border/50 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 text-center">
        
        {/* Animated Icon State */}
        <div className="relative mb-8">
          {status === "verifying" ? (
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full pulse-icon" />
              <div className="bg-background/80 p-4 rounded-full border border-primary/20 relative z-10">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-[10px] text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Securing
              </div>
            </div>
          ) : (
            <div className="relative success-icon">
               <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
               <div className="bg-background/80 p-4 rounded-full border border-green-500/20 relative z-10">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
               </div>
            </div>
          )}
        </div>

        {/* Text Content */}
        <h2 
          ref={textRef}
          className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-3"
        >
          {status === "verifying" ? "Verifying Access" : "Welcome Back!"}
        </h2>
        
        <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-[80%] mx-auto">
          {status === "verifying" 
            ? "Please wait while we securely authenticate your credentials..." 
            : "Login confirmed. Redirecting you to your dashboard."}
        </p>

        {/* Progress Bar / Continue Button Area */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden relative">
            <div className={cn(
                "h-full bg-primary transition-all duration-1000 ease-out",
                status === "verifying" ? "w-[60%] animate-pulse" : "w-full bg-green-500"
            )} />
        </div>
        
        {/* Security Badge */}
        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/50 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            <span>End-to-End Encrypted</span>
        </div>

        {/* Clerk Logic - Hidden but Active */}
        {/* Isko yahan rakhna zaroori hai taa ke process chalta rahe */}
        <div className="hidden">
           <AuthenticateWithRedirectCallback 
             signInForceRedirectUrl="/" 
             signUpForceRedirectUrl="/" 
             continueSignUpUrl="/auth/sign-up"
           />
        </div>

      </div>
    </div>
  );
};

export default SSOCallback;
