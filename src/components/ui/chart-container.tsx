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
  emptyMessage = "No data available yet",
  children,
  className,
  height = "h-[220px]",
}: ChartContainerProps) {
  if (isLoading) {
    return <ChartSkeleton className={className} />;
  }

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-heading text-text-primary">{title}</h3>
          {subtitle && (
            <p className="text-[12px] text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>

      {isEmpty ? (
        <div className={cn("flex items-center justify-center", height)}>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-text-muted">
                <path d="M2 14L6 8L10 11L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[12px] text-text-muted">{emptyMessage}</p>
          </div>
        </div>
      ) : (
        <div className={height}>{children}</div>
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
    <div className="flex items-center gap-0.5 p-0.5 rounded-[var(--radius-sm)] bg-bg-elevated/60 border border-border-subtle">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            "px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition-all duration-200",
            active === period
              ? "bg-accent text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
