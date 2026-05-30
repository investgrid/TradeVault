"use client";

import { useEffect, useRef } from "react";
import { useSpring, useTransform, motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
  delay?: number;
}

export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString(),
  className,
  duration = 1.2,
  delay = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration,
  });

  const display = useTransform(spring, (current) => format(current));

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => spring.set(value), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, spring, delay]);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  );
}
