import React, { useState, useEffect } from 'react';
import Orb from '@/components/Orb'; // Tumhara Orb component yahan import ho raha hai

const IntroPage = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check karte hain ke user pehle aa chuka hai ya nahi
    const hasVisited = localStorage.getItem('mirae_visited');
    
    if (!hasVisited) {
      setIsVisible(true);
    } else {
      // Agar pehle aa chuka hai to foran main content dikhao
      onComplete(); 
    }
  }, [onComplete]);

  const handleContinue = (provider) => {
    console.log(`Continuing with ${provider}... (Clerk Logic Here)`);
    // Clerk logic yahan ayegi baad mein.
    // Filhal hum isay close kar ke 'visited' mark kar rahe hain testing ke liye:
    finishIntro();
  };

  const finishIntro = () => {
    // Browser me save kar lo ke user aa chuka hai
    localStorage.setItem('mirae_visited', 'true');
    setIsVisible(false);
    setTimeout(() => {
        onComplete();
    }, 500); // Thora sa fade out time agar transition lagani ho
  };

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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      
      {/* Background Orb */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Orb
          hoverIntensity={5}
          rotateOnHover
          hue={0}
          forceHoverState={false}
          backgroundColor="#000000"
        />
      </div>

      {/* Main Content Overlay */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        textAlign: 'center', 
        fontFamily: "'Inter', sans-serif", // Make sure to use a nice font
        color: 'white',
        padding: '20px',
        maxWidth: '400px',
        width: '100%'
      }}>
        
        {/* Title */}
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800', 
          marginBottom: '40px',
          letterSpacing: '-1px',
          textShadow: '0 4px 20px rgba(255,255,255,0.3)'
        }}>
          Welcome TO <span style={{ background: 'linear-gradient(to right, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>MIRAE</span>
        </h1>

        {/* Buttons Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Google Button */}
          <button onClick={() => handleContinue('Google')} style={buttonStyle}>
            <svg style={iconStyle} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Apple Button */}
          <button onClick={() => handleContinue('Apple')} style={buttonStyle}>
            <svg style={iconStyle} viewBox="0 0 384 512" fill="white">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 48.5-25.1 80.7 27.1 2.9 54.7-14.3 69-43.1z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Facebook Button */}
          <button onClick={() => handleContinue('Facebook')} style={buttonStyle}>
            <svg style={iconStyle} viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
          
        </div>

        {/* Skip Button */}
        <button 
          onClick={finishIntro}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            marginTop: '30px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Skip All and continue
        </button>

      </div>
    </div>
  );
};

// --- Styles Object ---
const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  width: '100%',
  padding: '14px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass effect
  backdropFilter: 'blur(10px)',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const iconStyle = {
  width: '20px',
  height: '20px'
};

export default IntroPage;

