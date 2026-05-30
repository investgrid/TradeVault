"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gradient";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_1px_3px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]",
  secondary:
    "bg-bg-elevated text-text-primary border border-border-default hover:border-border-strong hover:bg-bg-overlay",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
  danger:
    "bg-loss/10 text-loss border border-loss/20 hover:bg-loss/20 hover:border-loss/30",
  gradient:
    "bg-gradient-to-r from-accent to-accent-hover text-white shadow-[0_2px_8px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)]",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-[11px] rounded-[var(--radius-sm)] gap-1.5",
  sm: "h-8 px-3 text-[12px] rounded-[var(--radius-sm)] gap-1.5",
  md: "h-9 px-4 text-[13px] rounded-[var(--radius-md)] gap-2",
  lg: "h-11 px-6 text-[14px] rounded-[var(--radius-md)] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, icon, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none",
          "disabled:opacity-40 disabled:pointer-events-none",
          "active:scale-[0.97]",
          variants[variant],
          sizes[size],
          isLoading && "pointer-events-none opacity-70",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
