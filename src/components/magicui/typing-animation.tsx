"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export function TypingAnimation({ 
  texts = ["Search anything...", "Vegetables...", "Latest Gadgets..."],
  typingSpeed = 1.2, 
  delayBetween = 2 
}) {
  const [textIndex, setTextIndex] = useState(0);
  const count = useMotionValue(0);
  
  // Isse text smooth slice hota hai
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => 
    texts[textIndex].slice(0, latest)
  );

  useEffect(() => {
    // 1. Typing Phase
    const controls = animate(count, texts[textIndex].length, {
      type: "tween",
      duration: typingSpeed,
      ease: "easeIn", // Thora slow start aur smooth finish
      onComplete: () => {
        // 2. Pause before deleting
        setTimeout(() => {
          // 3. Deleting Phase (Tez aur smooth)
          animate(count, 0, {
            type: "tween",
            duration: typingSpeed / 2,
            ease: "circOut", 
            onComplete: () => {
              // Switch to next text
              setTextIndex((prev) => (prev + 1) % texts.length);
            }
          });
        }, delayBetween * 1000);
      }
    });

    return () => controls.stop();
  }, [textIndex, texts, count, typingSpeed, delayBetween]);

  return (
    <span className="inline-flex items-baseline font-medium text-gray-800 dark:text-gray-100">
      <motion.span>{displayText}</motion.span>
      
      {/* Dynamic Animated Cursor */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [1, 1, 0, 0], // Stay visible longer before blinking
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="inline-block w-[3px] h-[1.2em] bg-blue-500 translate-y-1 ml-0.5"
      />
    </span>
  );
}

