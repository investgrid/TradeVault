"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated mb-4"
      >
        <Icon className="h-5 w-5 text-text-muted" />
      </motion.div>
      <h3 className="text-heading text-text-primary mb-1">{title}</h3>
      <p className="text-[12px] text-text-muted max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
