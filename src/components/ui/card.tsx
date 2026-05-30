"use client";

import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { hoverLift, staggerItem } from "@/lib/motion";

type CardVariant = "default" | "elevated" | "glass" | "glow" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

interface MotionCardProps extends HTMLMotionProps<"div"> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-border-subtle bg-bg-surface",
  elevated: "border-border-default bg-bg-surface card-shadow",
  glass: "glass",
  glow: "border-border-subtle bg-bg-surface gradient-border card-shadow",
  interactive: "border-border-subtle bg-bg-surface hover:border-border-default cursor-pointer",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-[var(--radius-xl)] border p-5 transition-all duration-200",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export function MotionCard({
  className,
  variant = "default",
  children,
  ...props
}: MotionCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={variant === "interactive" ? hoverLift : undefined}
      className={cn(
        "relative rounded-[var(--radius-xl)] border p-5 transition-colors duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
