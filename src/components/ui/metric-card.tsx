"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/lib/motion";
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
        "rounded-[var(--radius-lg)] border border-border-subtle bg-bg-surface p-4 space-y-2.5",
        className
      )}>
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-2.5 w-14" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "group relative flex flex-col rounded-[var(--radius-lg)] border transition-all duration-200",
        variant === "hero"
          ? "border-border-default bg-bg-elevated p-4 shadow-sm"
          : "border-border-subtle bg-bg-surface p-4 hover:border-border-default hover:bg-bg-elevated/50",
        className
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-text-tertiary mb-2">
        {label}
      </span>

      {numericValue !== undefined && format ? (
        <AnimatedNumber
          value={numericValue}
          format={format}
          className={cn(
            "text-text-primary leading-none",
            variant === "hero" ? "text-display" : "text-metric-sm"
          )}
        />
      ) : (
        <span className={cn(
          "text-text-primary leading-none",
          variant === "hero" ? "text-display" : "text-metric-sm"
        )}>
          {value}
        </span>
      )}

      {change && (
        <div className="flex items-center gap-1 mt-2">
          {changeType === "positive" && <TrendingUp className="h-3 w-3 text-profit" />}
          {changeType === "negative" && <TrendingDown className="h-3 w-3 text-loss" />}
          {changeType === "neutral" && <Minus className="h-3 w-3 text-text-muted" />}
          <span
            className={cn(
              "text-[10px] font-medium",
              changeType === "positive" && "text-profit",
              changeType === "negative" && "text-loss",
              changeType === "neutral" && "text-text-tertiary"
            )}
          >
            {change}
          </span>
        </div>
      )}
    </motion.div>
  );
}
