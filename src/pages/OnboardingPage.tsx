import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Check, Moon, Sun, User, Upload, 
  Loader2, Sparkles, ShieldCheck 
} from "lucide-react";
import gsap from "gsap"; 
import ParticleScene from "./ParticleScene"; 

const OnboardingPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();
  
  // URL se step read karo, default 1
  const stepParam = parseInt(searchParams.get("step") || "1");
  const [step, setStepState] = useState(stepParam);
  
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- GSAP ANIMATIONS ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-element", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, [step]);

  // --- SYNC STATE & URL ---
  const updateStep = (newStep: number) => {
    setStepState(newStep);
    setSearchParams({ step: newStep.toString() });
  };

  // --- ROUTE PROTECTION & AUTO-REDIRECT FIX ---
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check metadata
      const onboardingDone = user.unsafeMetadata?.onboardingCompleted;

      // FIX: Agar onboarding done hai, to UI mat dikhao, seedha dashboard phenko
      if (onboardingDone) {
        window.location.href = "/"; // Hard redirect to break the loop
        return;
      }

      // Agar data pehle se hai to pre-fill karo
      if (!firstName) setFirstName(user.firstName || "");
      if (!lastName) setLastName(user.lastName || "");
      if (!username) setUsername(user.username || "");
      if (!imagePreview) setImagePreview(user.imageUrl);
      
      if (user.unsafeMetadata?.gender && !gender) {
        setGender(user.unsafeMetadata.gender as "male" | "female");
      }
    }
  }, [isLoaded, isSignedIn, user]);

  // --- STEP VALIDATION ---
  useEffect(() => {
    if (stepParam === 2 && (!firstName || !lastName || !username)) {
      updateStep(1);
    }
    if (stepParam === 3 && !gender) {
      updateStep(2);
    }
    setStepState(stepParam);
  }, [stepParam, firstName, lastName, username, gender]);

  // Image Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- STEP 1 SAVE (Profile) ---
  const handleProfileSave = async () => {
    if (!user) return;
    if(!firstName || !lastName || !username) return;

    setIsLoading(true);
    try {
      await user.update({ 
        firstName, 
        lastName, 
        username 
      });

      if (imageFile) {
        await user.setProfileImage({ file: imageFile });
      }
      
      updateStep(2); 
    } catch (err) {
      console.error("Profile update error:", err);
      // alert("Error updating profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 3 FINISH (Metadata & Redirect) ---
  const handleFinish = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Update Metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingCompleted: true,
          gender: gender,
          themePreference: theme
        }
      });
      
      // 2. CRITICAL: Reload user to ensure Clerk has the latest metadata locally
      await user.reload();

      // 3. Show Success Animation
      updateStep(4); 

      // 4. Force Redirect after short delay
      setTimeout(() => {
        window.location.href = "/"; // Hard refresh ensures App.tsx sees new metadata
      }, 1500);
      
    } catch (err) {
      console.error("Finish error:", err);
      alert("Failed to finish onboarding.");
      setIsLoading(false);
    }
  };

  // --- STYLES ---
  const glassInputClass = "w-full px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-xl shadow-black/20";
  const primaryBtnClass = "w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transform active:scale-95 transition-all duration-200";

  // Loading State (Global)
  if (!isLoaded) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-orange-500 w-10 h-10"/>
    </div>
  );

  // --- VIEW: ONBOARDING FLOW ---
  return (
    <div className="min-h-screen flex bg-[#050505] text-white overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* LEFT SIDE - 3D/Particle Background */}
      <div className={`
        fixed inset-0 z-0 lg:static lg:w-1/2 lg:flex 
        bg-gradient-to-br from-black via-zinc-900 to-black
        ${step === 4 ? "w-full z-50" : ""} transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]
      `}>
        <div className="w-full h-full opacity-40 lg:opacity-100 relative">
          <ParticleScene currentGender={gender} /> 
          <div className="absolute inset-0 bg-black/60 lg:bg-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* RIGHT SIDE - Forms */}
      <div ref={containerRef} className="relative z-20 w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 min-h-screen overflow-y-auto">
        
        {/* Progress Bar */}
        {step < 4 && (
          <div className="w-full max-w-md mb-8 lg:mb-12 flex gap-3 gsap-element">
             {[1, 2, 3].map((s) => (
               <div key={s} className={`h-1.5 lg:h-2 rounded-full transition-all duration-500 ease-out ${s === step ? "w-12 lg:w-16 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]" : "w-4 bg-white/10"}`} />
             ))}
          </div>
        )}

        <div className="max-w-md w-full space-y-8">
          
          {/* Dynamic Headers */}
          {step < 4 && (
            <div className="text-center lg:text-left space-y-2 lg:space-y-3 gsap-element">
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                {step === 1 && "Who are you?"}
                {step === 2 && "Identity Setup"}
                {step === 3 && "Visual Style"}
              </h1>
              <p className="text-zinc-400 text-base lg:text-lg">
                {step === 1 && "Let's personalize your digital presence."}
                {step === 2 && "This shapes your avatar in the 3D world."}
                {step === 3 && "Choose the vibe that matches your energy."}
              </p>
            </div>
          )}

          {/* --- STEP 1: PROFILE FORM --- */}
          {step === 1 && (
            <div className="space-y-6 lg:space-y-8">
              
              {/* Image Upload */}
              <div className="flex justify-center lg:justify-start gsap-element">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-28 h-28 lg:w-32 lg:h-32 rounded-full cursor-pointer bg-white/5 backdrop-blur-md border border-white/10 hover:border-orange-500/50 transition-all duration-300 shadow-2xl"
                >
                  <img 
                    src={imagePreview || user?.imageUrl || "/placeholder-user.jpg"} 
                    alt="Preview" 
                    className="w-full h-full rounded-full object-cover p-1 opacity-80 group-hover:opacity-100 transition-opacity" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                    <Upload className="text-orange-400 w-8 h-8 drop-shadow-lg" />
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
                  <div className="absolute bottom-1 right-1 bg-orange-500 text-white p-2 rounded-full shadow-lg shadow-orange-500/40">
                    <Sparkles size={16} />
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4 lg:space-y-5 gsap-element">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-2">First Name</label>
                    <input 
                      value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      className={glassInputClass} placeholder="Jane" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-2">Last Name</label>
                    <input 
                      value={lastName} onChange={(e) => setLastName(e.target.value)}
                      className={glassInputClass} placeholder="Doe" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-2">Username</label>
                  <input 
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    className={glassInputClass} placeholder="@janedoe" 
                  />
                </div>
              </div>

              <div className="gsap-element pt-2 lg:pt-4">
                <button
                  onClick={handleProfileSave}
                  disabled={isLoading || !firstName || !lastName || !username}
                  className={`${primaryBtnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? <Loader2 className="animate-spin"/> : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 2: GENDER SELECTION --- */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 gsap-element">
                {[
                  { id: "male", label: "Male", icon: User },
                  { id: "female", label: "Female", icon: User }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGender(item.id as "male" | "female")}
                    className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-4 group backdrop-blur-xl
                      ${gender === item.id 
                        ? "bg-orange-500/10 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)] scale-[1.02]" 
                        : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                      }
                    `}
                  >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
                      ${gender === item.id 
                        ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg" 
                        : "bg-black/40 text-zinc-500 group-hover:text-white"
                      }
                    `}>
                      <item.icon size={40} />
                    </div>
                    <span className={`text-xl font-medium ${gender === item.id ? "text-orange-400" : "text-zinc-400"}`}>
                      {item.label}
                    </span>
                    {gender === item.id && (
                      <div className="absolute top-4 right-4 bg-orange-500 text-white p-1 rounded-full animate-in zoom-in">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4 lg:pt-8 gsap-element">
                <button onClick={() => updateStep(1)} className="px-8 py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold hover:bg-white/5 transition-colors hover:text-white">
                  Back
                </button>
                <button onClick={() => updateStep(3)} disabled={!gender} className={`${primaryBtnClass} flex-1 disabled:opacity-50 disabled:grayscale`}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 3: THEME SELECTION --- */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 gsap-element">
                {/* Light */}
                <button
                  onClick={() => setTheme("light")}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-4 group backdrop-blur-xl overflow-hidden
                    ${theme === "light" ? "border-orange-500 bg-white text-black scale-[1.02]" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"}
                  `}
                >
                  <div className={`p-5 rounded-full transition-all ${theme === 'light' ? 'bg-orange-500 text-white' : 'bg-black/30'}`}>
                     <Sun size={32} />
                  </div>
                  <span className="font-bold text-lg">Light Mode</span>
                  {theme === "light" && <div className="absolute top-4 right-4 bg-orange-500 text-white p-1 rounded-full"><Check size={14} /></div>}
                </button>

                {/* Dark */}
                <button
                  onClick={() => setTheme("dark")}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-4 group backdrop-blur-xl overflow-hidden
                    ${theme === "dark" ? "border-orange-500 bg-black/80 text-white shadow-[0_0_30px_rgba(249,115,22,0.15)] scale-[1.02]" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"}
                  `}
                >
                  <div className={`p-5 rounded-full transition-all ${theme === 'dark' ? 'bg-orange-500 text-white' : 'bg-black/30'}`}>
                     <Moon size={32} />
                  </div>
                  <span className="font-bold text-lg">Dark Mode</span>
                  {theme === "dark" && <div className="absolute top-4 right-4 bg-orange-500 text-white p-1 rounded-full"><Check size={14} /></div>}
                </button>
              </div>

              <div className="flex gap-4 pt-4 lg:pt-8 gsap-element">
                <button onClick={() => updateStep(2)} className="px-8 py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold hover:bg-white/5 transition-colors hover:text-white">
                  Back
                </button>
                <button onClick={handleFinish} disabled={isLoading} className={`${primaryBtnClass} flex-1`}>
                  {isLoading ? <Loader2 className="animate-spin"/> : "Finish Setup"}
                  {!isLoading && <Sparkles size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 4: SUCCESS ANIMATION --- */}
          {step === 4 && (
            <div className="text-center space-y-8 py-10 gsap-element">
              <div className="mx-auto w-32 h-32 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.3)] animate-bounce-slow">
                <ShieldCheck size={64} />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white animate-in slide-in-from-bottom-5 fade-in duration-700">You're All Set!</h1>
                <p className="text-zinc-400 animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-150">Launching your dashboard...</p>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-8 max-w-xs mx-auto">
                <div className="h-full bg-orange-500 animate-progress-indeterminate shadow-[0_0_20px_rgba(249,115,22,1)]"></div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

