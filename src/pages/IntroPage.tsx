import React, { useState, useEffect } from 'react';
import { useSignIn, useUser, useClerk } from "@clerk/clerk-react";
import Orb from '../components/Orb';

const IntroPage = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isLoaded, isSignedIn } = useUser();
  const { client } = useClerk(); // Universal access ke liye

  useEffect(() => {
    // 1. Loading check
    if (!isLoaded) return;

    // 2. Agar user login hai tu foran hata do
    if (isSignedIn) {
        onComplete();
        return;
    }

    // 3. LocalStorage check
    const hasVisited = localStorage.getItem('mirae_visited');

    if (!hasVisited) {
      setIsVisible(true);
    } else {
      onComplete(); 
    }
  }, [isLoaded, isSignedIn, onComplete]);

  const handleSocialLogin = async (strategy) => {
    if (!isLoaded) return;
    try {
      // FIX: Hum 'signIn' hook use karne ki bajaye direct client use kar rahe hain
      // Ye naye aur purane dono users ke liye best method hai.
      await client.signIn.authenticateWithRedirect({
        strategy: strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error("Auth Error:", err);
      // Fallback: Agar upar wala fail ho tu sign up try kare (Rare case)
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
    setTimeout(() => {
        onComplete();
    }, 500);
  };

  if (!isLoaded || isSignedIn) return null;
  if (!isVisible) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000', 
      zIndex: 9999,
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      
      {/* 1. Background Orb (FIXED: pointerEvents: 'none' se particles band ho gaye) */}
      <div style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 0,
          pointerEvents: 'none' // <--- Ye line particles/interaction rok degi
      }}>
        <Orb
          hoverIntensity={5}
          rotateOnHover
          hue={0}
          forceHoverState={false}
          backgroundColor="#000000"
        />
      </div>

      {/* 2. Top Bar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20
      }}>
        <img 
          src="/logo-m.png" 
          alt="MIRAE Logo" 
          style={{ height: '40px', objectFit: 'contain' }} 
        />

        <button 
            onClick={finishIntro}
            style={{...liquidButtonStyle, width: 'auto', padding: '10px 20px', fontSize: '0.9rem'}}
        >
            Skip Intro
        </button>
      </div>

      {/* 3. Center Content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -60%)',
        textAlign: 'center',
        zIndex: 10,
        width: '90%',
        maxWidth: '500px',
        pointerEvents: 'none' // Text par bhi click disable kar diya safe side ke liye
      }}>
        <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '900', 
            letterSpacing: '-2px',
            margin: '0 0 10px 0',
            background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3))'
        }}>
            MIRAE
        </h1>
        
        <div style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '1.1rem', 
            lineHeight: '1.6',
            fontWeight: '400',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)' 
        }}>
          <p style={{ margin: 0 }}>Discover the Extraordinary.</p>
          <p style={{ margin: 0 }}>Shop with Absolute Confidence.</p>
          <p style={{ margin: 0, color: '#fff', fontWeight: '600', marginTop: '5px' }}>Welcome to the Future.</p>
        </div>
      </div>

      {/* 4. Bottom Buttons (Auth) */}
      <div style={{ 
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '400px',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        zIndex: 20
      }}>
        
        {/* Google */}
        <button onClick={() => handleSocialLogin('oauth_google')} style={liquidButtonStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Continue with Google
        </button>

        {/* Apple */}
        <button onClick={() => handleSocialLogin('oauth_apple')} style={liquidButtonStyle}>
          <svg style={iconStyle} viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 48.5-25.1 80.7 27.1 2.9 54.7-14.3 69-43.1z"/></svg>
          Continue with Apple
        </button>

        {/* Facebook */}
        <button onClick={() => handleSocialLogin('oauth_facebook')} style={liquidButtonStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Continue with Facebook
        </button>
        
      </div>
    </div>
  );
};

// --- Styles ---
const liquidButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '15px',
  width: '100%',
  padding: '14px 20px',
  borderRadius: '30px',
  background: 'rgba(255, 255, 255, 0.05)', 
  backdropFilter: 'blur(15px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)', 
  color: 'white',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, background 0.3s ease',
  position: 'relative', // Ensure clicks register on button
  zIndex: 30, // Button ko background se upar rakha
};

const iconStyle = {
  width: '20px',
  height: '20px'
};

export default IntroPage;

