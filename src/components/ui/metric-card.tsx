"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem, hoverLift } from "@/lib/motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnimatedNumber } from "./animated-number";
import { Skeleton } from "./skeleton";

interface MetricCardProps {
  label: string;
  value: string;
  numericValue?: number;
  format?: (n: number) => string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
  isLoading?: boolean;
  variant?: "default" | "hero";
}

export function MetricCard({
  label,
  value,
  numericValue,
  format,
  change,
  changeType = "neutral",
  className,
  isLoading,
  variant = "default",
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className={cn(
        "rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-5 space-y-3",
        className
      )}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverLift}
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-[var(--radius-xl)] border p-5 transition-colors duration-200",
        variant === "hero"
          ? "border-border-default bg-bg-surface card-shadow"
          : "border-border-subtle bg-bg-surface hover:border-border-default",
        changeType === "positive" && variant === "hero" && "glow-profit",
        className
      )}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent rounded-t-[var(--radius-xl)]" />

      <span className="text-caption text-text-muted">
        {label}
      </span>

      {numericValue !== undefined && format ? (
        <AnimatedNumber
          value={numericValue}
          format={format}
          className={cn(
            "leading-none tracking-tight text-text-primary",
            variant === "hero" ? "text-display" : "text-metric"
          )}
        />
      ) : (
        <span className={cn(
          "leading-none tracking-tight text-text-primary",
          variant === "hero" ? "text-display" : "text-metric"
        )}>
          {value}
        </span>
      )}

      {change && (
        <div className="flex items-center gap-1.5">
          {changeType === "positive" && <TrendingUp className="h-3.5 w-3.5 text-profit" />}
          {changeType === "negative" && <TrendingDown className="h-3.5 w-3.5 text-loss" />}
          {changeType === "neutral" && <Minus className="h-3.5 w-3.5 text-text-muted" />}
          <span
            className={cn(
              "text-[11px] font-medium",
              changeType === "positive" && "text-profit",
              changeType === "negative" && "text-loss",
              changeType === "neutral" && "text-text-secondary"
            )}
          >
            {change}
          </span>
        </div>
      )}
    </motion.div>
  );
}
