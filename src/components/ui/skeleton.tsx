"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "card" | "metric";
  style?: React.CSSProperties;
}

export function Skeleton({ className, variant = "text", style }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded-md",
    circle: "h-8 w-8 rounded-full",
    card: "h-32 w-full rounded-[var(--radius-xl)]",
    metric: "h-[72px] w-full rounded-[var(--radius-xl)]",
  };

  return (
    <div className={cn("skeleton", variants[variant], className)} style={style} />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-6", className)}>
      <div className="space-y-3 mb-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex items-end gap-1.5 h-[180px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)]">
          <Skeleton variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
