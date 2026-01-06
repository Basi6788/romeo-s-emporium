import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.15)] text-primary-foreground hover:bg-white/15 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(31,38,135,0.25)] active:scale-95",
        destructive:
          "bg-rose-500/15 backdrop-blur-md border border-rose-400/30 shadow-[0_8px_32px_rgba(225,29,72,0.15)] text-rose-100 hover:bg-rose-500/20 hover:border-rose-400/40 hover:shadow-[0_8px_32px_rgba(225,29,72,0.25)] active:scale-95",
        outline:
          "bg-transparent backdrop-blur-sm border-2 border-white/25 text-foreground hover:bg-white/10 hover:border-white/40 hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)] active:scale-95",
        secondary:
          "bg-blue-500/10 backdrop-blur-md border border-blue-400/25 shadow-[0_8px_32px_rgba(59,130,246,0.1)] text-blue-100 hover:bg-blue-500/15 hover:border-blue-400/35 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] active:scale-95",
        ghost:
          "bg-transparent text-foreground hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-white/20 active:scale-95",
        link: "bg-transparent text-primary underline-offset-4 hover:underline hover:bg-transparent",
      },
      size: {
        default: "h-12 px-6 py-3 rounded-2xl",
        sm: "h-9 px-4 rounded-xl",
        lg: "h-14 px-8 rounded-3xl",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };