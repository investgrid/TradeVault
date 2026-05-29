"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeType = "neutral",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-5 transition-all duration-200 hover:border-border-default hover:bg-bg-elevated/50",
        className
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <span className="font-numbers text-[22px] font-medium leading-none tracking-tight text-text-primary">
        {value}
      </span>
      {change && (
        <div className="flex items-center gap-1.5">
          {changeType === "positive" && <TrendingUp className="h-3 w-3 text-profit" />}
          {changeType === "negative" && <TrendingDown className="h-3 w-3 text-loss" />}
          {changeType === "neutral" && <Minus className="h-3 w-3 text-text-muted" />}
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
    </div>
  );
}
