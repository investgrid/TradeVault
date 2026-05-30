"use client";

import { cn } from "@/lib/utils";

export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

export function PageSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={className}>{children}</section>;
}
