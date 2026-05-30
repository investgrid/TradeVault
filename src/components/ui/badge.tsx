"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type BadgeVariant = "default" | "profit" | "loss" | "pending" | "accent";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
  animate?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary border-border-subtle",
  profit: "bg-profit-muted text-profit border-profit/10",
  loss: "bg-loss-muted text-loss border-loss/10",
  pending: "bg-pending-muted text-pending border-pending/10",
  accent: "bg-accent-soft text-accent border-accent/10",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  profit: "bg-profit",
  loss: "bg-loss",
  pending: "bg-pending",
  accent: "bg-accent",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
  dot,
  animate,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border font-semibold uppercase tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        animate && (variant === "loss" || variant === "pending") && "animate-pulse-glow",
        className
      )}
    >
      {dot && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
