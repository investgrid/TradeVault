import type { Variants, Transition } from "framer-motion";

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 0.8,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 0.6,
};

export const springStiff: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.5,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const hoverLift = {
  y: -2,
  transition: springSmooth,
};

export const hoverGlow = {
  boxShadow: "0 0 20px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(0, 0, 0, 0.3)",
  transition: { duration: 0.2 },
};

export const pressShrink = {
  scale: 0.97,
  transition: springStiff,
};

