import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner'; // Ya jo bhi toast library aap use kar rahe hain

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
  const [userScore, setUserScore] = useState(100); // Trust Score
  const [sessionData, setSessionData] = useState({
    viewedCategories: [],
    viewedProducts: [],
    suspiciousActions: 0
  });

  // --- OpenAI / AI Analysis Mock Function ---
  // Note: Real implementation me ye data apke Backend API route (/api/analyze-user) par jayega 
  // jahan OpenAI Key secure hogi. Frontend pe key lagana danger hai.
  const analyzeBehavior = async (actionType, data) => {
    console.log(`Analyzing: ${actionType}`, data);

    // Simulation of AI Logic:
    if (actionType === 'RAPID_CLICKS' || actionType === 'INJECTION_ATTEMPT') {
      const newScore = userScore - 20;
      setUserScore(newScore);

      if (newScore < 50 && newScore > 30) {
        toast.warning("⚠️ Warning: Suspicious activity detected. Your account is being monitored.");
      } else if (newScore <= 30) {
        toast.error("🚫 Account Restricted: Security violation detected.");
        // Yahan ban logic lagayein (e.g., logoutUser(), blockIP())
      }
    }
  };

  const trackView = (productId, category) => {
    setSessionData(prev => ({
      ...prev,
      viewedProducts: [...new Set([...prev.viewedProducts, productId])],
      viewedCategories: category ? [...new Set([...prev.viewedCategories, category])] : prev.viewedCategories
    }));
    // AI ko signal bhejo ke user ka interest kahan hai
    analyzeBehavior('INTEREST_UPDATE', { category });
  };

  return (
    <TrackingContext.Provider value={{ trackView, analyzeBehavior, userScore, sessionData }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
