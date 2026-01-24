import { useEffect, useState } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { ShieldCheck } from "lucide-react";

const SSOCallback = () => {
  const [dots, setDots] = useState("");

  // Text loading effect (Authenticating. .. ...)
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden font-sans">
      
      {/* 1. Main Content Wrapper */}
      <div className="flex flex-col items-center gap-8 z-10">
        
        {/* 2. The OLED Bubbles Loader (Consistent with App) */}
        <div className="flex space-x-3 mb-4">
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></div>
        </div>

        {/* 3. Text Info (Minimal & Technical) */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium tracking-wide">
            Authenticating{dots}
          </h2>
          <p className="text-zinc-500 text-sm">
            Establishing secure handshake with provider.
          </p>
        </div>

        {/* 4. Security Badge (Monochrome & Professional) */}
        <div className="flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 text-white" />
            <span>End-to-End Encrypted</span>
        </div>

      </div>

      {/* 5. Clerk Logic - Invisible Worker */}
      <div className="hidden">
         <AuthenticateWithRedirectCallback 
           signInForceRedirectUrl="/" 
           signUpForceRedirectUrl="/" 
           continueSignUpUrl="/auth/sign-up"
         />
      </div>

    </div>
  );
};

export default SSOCallback;

