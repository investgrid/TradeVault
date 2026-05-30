"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/lib/motion";
import { ChartSkeleton } from "./skeleton";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isEmpty?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
}

export function ChartContainer({
  title,
  subtitle,
  actions,
  isEmpty,
  isLoading,
  emptyMessage = "No data available",
  children,
  className,
  height = "h-[200px]",
}: ChartContainerProps) {
  if (isLoading) {
    return <ChartSkeleton className={className} />;
  }

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "rounded-[var(--radius-lg)] border border-border-subtle bg-bg-surface",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-text-primary tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-text-tertiary mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>

      {isEmpty ? (
        <div className={cn("flex items-center justify-center px-4 pb-4", height)}>
          <p className="text-[11px] text-text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <div className={cn("px-2 pb-3", height)}>{children}</div>
      )}
    </motion.div>
  );
}

export function PeriodSelector({
  periods,
  active,
  onChange,
}: {
  periods: string[];
  active: string;
  onChange: (period: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-[var(--radius-sm)] bg-bg-elevated p-0.5 border border-border-subtle">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            "px-2 py-0.5 rounded-[3px] text-[10px] font-medium transition-all duration-150",
            active === period
              ? "bg-bg-active text-text-primary shadow-xs"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
