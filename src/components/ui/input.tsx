import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-9 w-full rounded-[var(--radius-md)] border bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            "transition-colors duration-150",
            error ? "border-loss" : "border-border-default",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-loss">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
