import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "profit" | "loss" | "pending" | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary",
  profit: "bg-profit-muted text-profit",
  loss: "bg-loss-muted text-loss",
  pending: "bg-pending-muted text-pending",
  accent: "bg-accent-soft text-accent",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  profit: "bg-profit",
  loss: "bg-loss",
  pending: "bg-pending",
  accent: "bg-accent",
};

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
}
