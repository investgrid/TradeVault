"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[12px] font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "h-9 w-full rounded-[var(--radius-md)] border bg-bg-elevated px-3 text-[13px] text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-glow-accent focus:border-accent",
              "transition-all duration-200",
              icon && "pl-9",
              error
                ? "border-loss ring-glow-loss"
                : "border-border-default hover:border-border-strong",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] text-loss font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
