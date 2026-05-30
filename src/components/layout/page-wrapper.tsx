"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { pageTransition, staggerItem } from "@/lib/motion";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.div>
  );
}

export function PageSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section variants={staggerItem} className={className}>
      {children}
    </motion.section>
  );
}
