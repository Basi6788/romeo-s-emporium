import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Loader2, ArrowRight } from "lucide-react";

const WelcomeBackPage = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  const handleContinue = () => {
    setRedirecting(true);
    // Thora sa delay taki animation feel aye, phir home par bhej do
    setTimeout(() => {
        navigate("/", { replace: true });
    }, 500);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-md w-full text-center space-y-6 animate-in slide-in-from-bottom-8 duration-700">
        <div className="relative inline-block">
            <img 
                src={user?.imageUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-background shadow-xl mx-auto"
            />
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back!
          </h1>
          <p className="text-xl text-primary font-medium">
            {user?.firstName || user?.username}
          </p>
        </div>

        <p className="text-muted-foreground">
            We missed you. Your dashboard is ready.
        </p>

        <div className="pt-6">
          <button
            onClick={handleContinue}
            disabled={redirecting}
            className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
          >
            {redirecting ? (
                <Loader2 className="animate-spin" />
            ) : (
                <>Continue to Dashboard <ArrowRight /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackPage;

