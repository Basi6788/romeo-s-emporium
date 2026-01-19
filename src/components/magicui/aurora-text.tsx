import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface AuroraTextProps extends HTMLMotionProps<"span"> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

export function AuroraText({
  className,
  children,
  as: Component = "span",
  ...props
}: AuroraTextProps) {
  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={cn("relative inline-block overflow-hidden", className)}
      {...props}
    >
      {/* Animated Gradient Text */}
      <span className="relative z-10 bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:200%_auto] bg-clip-text text-transparent animate-aurora">
        {children}
      </span>
    </MotionComponent>
  );
}

