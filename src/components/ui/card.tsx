import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glow";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-5 transition-all duration-200",
          variant === "elevated" && "card-shadow hover:-translate-y-0.5 hover:border-border-default",
          variant === "glow" && "gradient-border card-shadow",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
