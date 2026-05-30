"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid,
  BookOpen,
  Activity,
  Wallet,
  BarChart3,
  Shield,
  Target,
  Calendar,
  Brain,
  FileText,
  PieChart,
  Lightbulb,
  Settings,
  Plus,
  Search,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid, action: () => router.push("/"), category: "Navigation" },
    { id: "journal", label: "Trade Journal", icon: BookOpen, action: () => router.push("/journal"), category: "Navigation" },
    { id: "trades", label: "Trades", icon: Activity, action: () => router.push("/trades"), category: "Navigation" },
    { id: "accounts", label: "Accounts", icon: Wallet, action: () => router.push("/accounts"), category: "Navigation" },
    { id: "analytics", label: "Analytics", icon: BarChart3, action: () => router.push("/analytics"), category: "Navigation" },
    { id: "risk", label: "Risk Control", icon: Shield, action: () => router.push("/risk"), category: "Navigation" },
    { id: "goals", label: "Goals", icon: Target, action: () => router.push("/goals"), category: "Navigation" },
    { id: "calendar", label: "Calendar", icon: Calendar, action: () => router.push("/calendar"), category: "Navigation" },
    { id: "playbook", label: "Playbook", icon: FileText, action: () => router.push("/playbook"), category: "Navigation" },
    { id: "psychology", label: "Psychology", icon: Brain, action: () => router.push("/psychology"), category: "Navigation" },
    { id: "reports", label: "Reports", icon: PieChart, action: () => router.push("/reports"), category: "Navigation" },
    { id: "insights", label: "Insights", icon: Lightbulb, action: () => router.push("/insights"), category: "Navigation" },
    { id: "settings", label: "Settings", icon: Settings, action: () => router.push("/settings"), category: "Navigation" },
    { id: "new-trade", label: "Log New Trade", description: "Record a new trade entry", icon: Plus, action: () => router.push("/journal?new=true"), category: "Actions" },
    { id: "new-account", label: "Add Account", description: "Connect a new trading account", icon: Plus, action: () => router.push("/accounts?new=true"), category: "Actions" },
  ];

  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selected]) {
          filtered[selected].action();
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selected, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="cmd-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="cmd-dialog"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
              <Search className="h-4 w-4 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                placeholder="Search commands, pages, actions..."
                className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
              />
              <kbd className="text-[9px] text-text-disabled bg-bg-elevated px-1.5 py-0.5 rounded border border-border-subtle">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-1.5">
                    <span className="text-caption">{category}</span>
                  </div>
                  {items.map((cmd) => {
                    const globalIndex = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelected(globalIndex)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                          globalIndex === selected
                            ? "bg-bg-hover text-text-primary"
                            : "text-text-secondary hover:bg-bg-hover"
                        }`}
                      >
                        <cmd.icon className="h-3.5 w-3.5 text-text-muted shrink-0" strokeWidth={1.5} />
                        <div className="flex flex-1 flex-col min-w-0">
                          <span className="text-[12px] font-medium truncate">{cmd.label}</span>
                          {cmd.description && (
                            <span className="text-[10px] text-text-muted truncate">{cmd.description}</span>
                          )}
                        </div>
                        {globalIndex === selected && (
                          <ArrowRight className="h-3 w-3 text-text-muted shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-[12px] text-text-muted">No results found</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
