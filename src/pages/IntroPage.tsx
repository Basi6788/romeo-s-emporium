import React, { useState, useEffect } from 'react';
import { useSignIn, useUser, useClerk } from "@clerk/clerk-react";
import Orb from '../components/Orb';

const IntroPage = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const { isLoaded, isSignedIn } = useUser();
  const { client } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
        onComplete();
        return;
    }
    const hasVisited = localStorage.getItem('mirae_visited');
    if (!hasVisited) {
      setIsVisible(true);
    } else {
      onComplete(); 
    }
  }, [isLoaded, isSignedIn, onComplete]);

  // Mouse Parallax Logic
  useEffect(() => {
    if (!isVisible) return;
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible]);

  const handleSocialLogin = async (strategy) => {
    if (!isLoaded) return;
    try {
      await client.signIn.authenticateWithRedirect({
        strategy: strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error("Auth Error:", err);
      try {
         await client.signUp.authenticateWithRedirect({
            strategy: strategy,
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/",
         });
      } catch (signupErr) {
         console.error("Signup Error:", signupErr);
      }
    }
  };

  const finishIntro = () => {
    localStorage.setItem('mirae_visited', 'true');
    setIsVisible(false);
    setTimeout(() => { onComplete(); }, 500);
  };

  if (!isLoaded || isSignedIn) return null;
  if (!isVisible) return null;

  // Parallax Calculation
  const tiltX = mousePos.y * 5;
  const tiltY = mousePos.x * -5;

  return (
    <>
      {/* 1. BACKGROUND LAYER - BIGGER ORB */}
      <div style={{ 
          position: 'fixed', inset: 0, 
          zIndex: 0, 
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
      }}>
         <div style={{ width: '100%', height: '100%', transform: 'scale(1.6)' }}>
            <Orb 
                hoverIntensity={0.4}
                rotateOnHover={true}
                hue={260} 
                forceHoverState={false}
                backgroundColor="transparent" 
            />
             <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'radial-gradient(circle at center, transparent 30%, #000 80%)',
                pointerEvents: 'none'
            }}></div>
         </div>
      </div>

      {/* 2. CONTENT LAYER */}
      <div style={{ 
          position: 'fixed', inset: 0, 
          zIndex: 10, 
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', 
          perspective: '1000px'
        }}>
        
        <style>{`
          @keyframes slideUpFade {
            0% { opacity: 0; transform: translateY(100%); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          .glass-deck {
              background: rgba(20, 20, 20, 0.5);
              backdrop-filter: blur(30px);
              -webkit-backdrop-filter: blur(30px);
              border-top: 1px solid rgba(255, 255, 255, 0.15);
              padding: 30px 20px 50px 20px;
              border-radius: 40px 40px 0 0;
              box-shadow: 0 -20px 60px rgba(0,0,0,0.9);
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 14px;
              animation: slideUpFade 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
              opacity: 0;
              animation-delay: 0.2s;
          }

          .liquid-btn {
            position: relative;
            display: flex; alignItems: center; justifyContent: center; gap: 12px;
            width: 100%; max-width: 400px;
            padding: 16px; 
            border-radius: 16px;
            font-size: 1.05rem; font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.05);
          }

          .liquid-btn:active { transform: scale(0.97); }

          .btn-google {
            background: rgba(255, 255, 255, 0.95);
            color: #1f1f1f;
          }
          .btn-google:hover { background: #ffffff; box-shadow: 0 0 25px rgba(255,255,255,0.3); }

          .btn-apple {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
          }
          .btn-apple:hover { background: rgba(255, 255, 255, 0.25); }

          .btn-facebook {
            background: rgba(24, 119, 242, 0.85);
            color: white;
            border: 1px solid rgba(24, 119, 242, 0.6);
          }
          .btn-facebook:hover { 
            background: rgba(24, 119, 242, 1); 
            box-shadow: 0 0 30px rgba(24, 119, 242, 0.5);
          }

          /* --- UPDATED TYPOGRAPHY --- */
          .zuno-title {
              font-size: clamp(6rem, 20vw, 12rem); /* Increased size */
              font-weight: 900;
              margin: 0;
              line-height: 0.85;
              letter-spacing: -4px; /* Tighter spacing */
              background: linear-gradient(180deg, #fff 20%, #999 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              filter: drop-shadow(0 0 40px rgba(255,255,255,0.25));
              animation: fadeIn 1.2s ease-out forwards;
              transform: scaleY(1.15); /* Makes font look taller (lamba) */
              transform-origin: bottom center;
          }

          .zuno-tagline {
               color: rgba(255,255,255,0.9);
               margin-top: 25px; 
               font-size: 1.1rem;
               font-weight: 600; 
               letter-spacing: 2px; 
               text-transform: uppercase;
               text-shadow: 0 2px 10px rgba(0,0,0,0.8);
               animation: fadeIn 1.5s ease-out forwards;
               animation-delay: 0.3s;
               opacity: 0;
          }
          
          .zuno-orange {
              color: #FF5E00; /* Vibrant Orange */
              font-size: 1.2rem;
              font-weight: 800;
              letter-spacing: 1px;
              margin-top: 5px;
              animation: fadeIn 1.5s ease-out forwards;
              animation-delay: 0.5s;
              opacity: 0;
          }
        `}</style>

        {/* TOP: Skip */}
        <div style={{ 
            width: '100%', padding: '20px', 
            display: 'flex', justifyContent: 'flex-end', 
            zIndex: 20 
        }}>
          <button onClick={finishIntro} style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', padding: '10px 22px', borderRadius: '30px', fontWeight: '600',
              cursor: 'pointer', fontSize: '0.85rem', backdropFilter: 'blur(10px)'
          }}>
              Skip
          </button>
        </div>

        {/* MIDDLE: ZUNO Title */}
        <div style={{ 
            flex: 1, 
            display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transition: 'transform 0.2s ease-out',
            textAlign: 'center',
            padding: '0 20px',
            marginBottom: '20px', // Adjusted to move text lower
            marginTop: '40px'     // Pushes text down from center slightly
        }}>
           <h1 className="zuno-title">
               ZUNO
           </h1>
           <p className="zuno-tagline">
               The Future Of Shopping
           </p>
           {/* Added the orange zuno. text */}
           <p className="zuno-orange">
               zuno.
           </p>
        </div>

        {/* BOTTOM: Buttons */}
        <div className="glass-deck">
          
          <button onClick={() => handleSocialLogin('oauth_google')} className="liquid-btn btn-google">
            <svg style={iconStyle} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button onClick={() => handleSocialLogin('oauth_apple')} className="liquid-btn btn-apple">
            <svg style={iconStyle} viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 48.5-25.1 80.7 27.1 2.9 54.7-14.3 69-43.1z"/></svg>
            Continue with Apple
          </button>

          <button onClick={() => handleSocialLogin('oauth_facebook')} className="liquid-btn btn-facebook">
              <svg style={iconStyle} viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continue with Facebook
          </button>

        </div>
      </div>
    </>
  );
};

const iconStyle = { width: '22px', height: '22px' };

export default IntroPage;

