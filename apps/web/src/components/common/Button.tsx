import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";
type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-[#3b82f6] text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20",
  outline:
    "border border-white/10 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
  secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700",
  ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white",
  destructive:
    "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
  link: "text-blue-400 underline-offset-4 hover:underline bg-transparent",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2",
  xs: "h-7 px-2 text-xs",
  sm: "h-8 px-3 text-sm",
  lg: "h-10 px-6",
  icon: "h-9 w-9 p-0",
  "icon-xs": "h-7 w-7 p-0",
  "icon-sm": "h-8 w-8 p-0",
  "icon-lg": "h-10 w-10 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
