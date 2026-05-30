"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <Check className="h-4 w-4 text-profit" />,
    error: <X className="h-4 w-4 text-loss" />,
    warning: <AlertTriangle className="h-4 w-4 text-pending" />,
    info: <Info className="h-4 w-4 text-accent" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-profit/20",
    error: "border-loss/20",
    warning: "border-pending/20",
    info: "border-accent/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "pointer-events-auto w-[320px] rounded-[var(--radius-lg)] border bg-bg-surface p-4 card-shadow",
        borderColors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary">{toast.title}</p>
          {toast.description && (
            <p className="text-[11px] text-text-secondary mt-0.5">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-[var(--radius-xs)] p-1 text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      {/* Progress bar */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 rounded-b-[var(--radius-lg)]",
          toast.type === "success" && "bg-profit/40",
          toast.type === "error" && "bg-loss/40",
          toast.type === "warning" && "bg-pending/40",
          toast.type === "info" && "bg-accent/40",
        )}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}
