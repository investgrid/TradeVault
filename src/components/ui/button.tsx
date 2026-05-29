import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
  secondary:
    "bg-bg-elevated text-text-primary border border-border-default hover:border-border-strong hover:bg-bg-overlay",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
  danger:
    "bg-loss/10 text-loss border border-loss/20 hover:bg-loss/20",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-[11px] rounded-[var(--radius-sm)]",
  sm: "h-8 px-3 text-[12px] rounded-[var(--radius-sm)]",
  md: "h-9 px-4 text-[13px] rounded-[var(--radius-md)]",
  lg: "h-11 px-6 text-[14px] rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none",
          "disabled:opacity-40 disabled:pointer-events-none",
          "active:scale-[0.97]",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
