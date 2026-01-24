import { useEffect, useRef } from "react";
import gsap from "gsap";

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP Bounce Animation for Bubbles
      gsap.to(".oled-bubble", {
        y: -15,          // Kitna opar jump karega
        duration: 0.5,   // Speed
        repeat: -1,      // Infinite loop
        yoyo: true,      // Wapis neeche aana
        ease: "power1.inOut", // Smooth physics
        stagger: {
          each: 0.1,     // Har bubble ke beech ka delay
          from: "start",
        }
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 flex items-center justify-center bg-black pointer-events-none"
    >
      <div className="flex space-x-3">
        {/* 4 Bubbles for that Signature Look */}
        <div className="oled-bubble w-4 h-4 bg-white rounded-full"></div>
        <div className="oled-bubble w-4 h-4 bg-white rounded-full"></div>
        <div className="oled-bubble w-4 h-4 bg-white rounded-full"></div>
        <div className="oled-bubble w-4 h-4 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default ParticleBackground;

