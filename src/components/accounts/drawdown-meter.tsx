"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface DrawdownMeterProps {
  usedPercent: number;
  remainingValue: number;
  breachPrice?: number;
  type?: "static" | "trailing" | "eod_trailing";
  compact?: boolean;
  className?: string;
}

export function DrawdownMeter({
  usedPercent,
  remainingValue,
  breachPrice,
  type = "static",
  compact = false,
  className,
}: DrawdownMeterProps) {
  const zone =
    usedPercent < 70 ? "safe" : usedPercent < 90 ? "warning" : "danger";

  const barGradient = {
    safe: "from-profit/70 via-profit to-profit",
    warning: "from-pending/70 via-pending to-pending",
    danger: "from-loss/70 via-loss to-loss",
  }[zone];

  const zoneBg = {
    safe: "bg-profit/[0.03]",
    warning: "bg-pending/[0.03]",
    danger: "bg-loss/[0.04]",
  }[zone];

  const typeLabel = {
    static: "Static DD",
    trailing: "Trailing DD",
    eod_trailing: "EOD Trailing",
  }[type];

  if (compact) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="h-1.5 w-full rounded-full bg-bg-inset overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usedPercent, 100)}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            className={cn("h-full rounded-full bg-gradient-to-r", barGradient)}
          />
        </div>
        <div className="flex justify-between">
          <span className={cn(
            "text-[10px] font-medium",
            zone === "safe" && "text-profit",
            zone === "warning" && "text-pending",
            zone === "danger" && "text-loss",
          )}>
            {usedPercent.toFixed(0)}% DD
          </span>
          <span className="text-[10px] text-text-muted">
            ${remainingValue.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-[var(--radius-lg)] p-4 border border-border-subtle transition-all duration-300",
      zoneBg,
      zone === "danger" && "border-loss/20 animate-pulse-glow",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-secondary">
          Drawdown
        </span>
        <span className="text-code text-text-muted">{typeLabel}</span>
      </div>

      {/* Progress bar with threshold markers */}
      <div className="relative">
        <div className="h-2.5 w-full rounded-full bg-bg-inset overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usedPercent, 100)}%` }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            className={cn("h-full rounded-full bg-gradient-to-r", barGradient)}
          />
        </div>
        {/* Threshold markers */}
        <div className="absolute top-0 left-[70%] h-2.5 w-px bg-pending/30" />
        <div className="absolute top-0 left-[90%] h-2.5 w-px bg-loss/40" />
      </div>

      <div className="flex justify-between items-center">
        <span className={cn(
          "text-[12px] font-semibold",
          zone === "safe" && "text-profit",
          zone === "warning" && "text-pending",
          zone === "danger" && "text-loss",
        )}>
          {usedPercent.toFixed(1)}% used
        </span>
        <span className="text-[12px] text-text-secondary font-medium">
          ${remainingValue.toLocaleString()} remaining
        </span>
      </div>

      {breachPrice && (
        <div className={cn(
          "flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2",
          zone === "danger"
            ? "border-loss/20 bg-loss/[0.05]"
            : "border-border-subtle bg-bg-elevated/50"
        )}>
          <AlertTriangle className={cn(
            "h-3.5 w-3.5 flex-shrink-0",
            zone === "danger" ? "text-loss" : "text-text-muted"
          )} />
          <span className={cn(
            "text-[12px] font-medium",
            zone === "danger" ? "text-loss" : "text-text-secondary"
          )}>
            Breach at ${breachPrice.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
