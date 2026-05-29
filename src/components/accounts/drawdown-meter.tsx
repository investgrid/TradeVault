"use client";

import { cn } from "@/lib/utils";

interface DrawdownMeterProps {
  usedPercent: number;
  remainingValue: number;
  breachPrice?: number;
  type?: "static" | "trailing" | "eod_trailing";
  className?: string;
}

export function DrawdownMeter({
  usedPercent,
  remainingValue,
  breachPrice,
  type = "static",
  className,
}: DrawdownMeterProps) {
  const zone =
    usedPercent < 70 ? "safe" : usedPercent < 90 ? "warning" : "danger";

  const barColor = {
    safe: "bg-profit",
    warning: "bg-pending",
    danger: "bg-loss",
  }[zone];

  const typeLabel = {
    static: "Static DD",
    trailing: "Trailing DD",
    eod_trailing: "EOD Trailing",
  }[type];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          Drawdown
        </span>
        <span className="text-xs text-text-muted">{typeLabel}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-bg-elevated">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${Math.min(usedPercent, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className={cn(
          zone === "safe" && "text-profit",
          zone === "warning" && "text-pending",
          zone === "danger" && "text-loss",
        )}>
          {usedPercent.toFixed(1)}% used
        </span>
        <span className="text-text-secondary">
          ${remainingValue.toLocaleString()} remaining
        </span>
      </div>

      {breachPrice && (
        <div className="mt-1 rounded-[var(--radius-sm)] border border-border-subtle bg-bg-elevated px-2.5 py-1.5">
          <span className="text-xs text-text-muted">
            Breach: ${breachPrice.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
