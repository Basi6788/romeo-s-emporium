import React from 'react';
import { cn } from "@/lib/utils"; // Assuming you have a utils file for merging classes

interface RoundedContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const RoundedContentWrapper = ({ children, className }: RoundedContentWrapperProps) => {
  return (
    <div 
      className={cn(
        // Base Layout
        "relative w-full z-20",
        
        // --- THE MAGIC PART (Design) ---
        // 1. Background Color (Light: White, Dark: Dark Gray/Black)
        "bg-white dark:bg-zinc-950", 
        
        // 2. Rounded Corners (Sirf Oopar walay)
        "rounded-t-[40px] md:rounded-t-[60px]",
        
        // 3. Negative Margin (Hero ke oopar thora charhane ke liye taa ke gap na aye)
        "-mt-8 md:-mt-12",
        
        // 4. Padding inside (Taa ke content corner se chipak na jaye)
        "pt-10 pb-10",
        
        // 5. Shadow (Optional: Oopar thora shadow taa ke Hero se alag dikhe)
        "shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]",
        
        className
      )}
    >
      {children}
    </div>
  );
};

export default RoundedContentWrapper;
