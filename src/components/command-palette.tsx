"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid, BookOpen, Activity, Wallet, BarChart3, Shield,
  Target, Calendar, Settings, Plus, Search, ArrowRight,
  type LucideIcon, ArrowUpDown, Receipt,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  action: () => void;
  category: string;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: "home", label: "Control Center", shortcut: "G D", icon: LayoutGrid, action: () => router.push("/"), category: "Navigate" },
    { id: "accounts", label: "Accounts", shortcut: "G A", icon: Wallet, action: () => router.push("/accounts"), category: "Navigate" },
    { id: "payouts", label: "Payouts", shortcut: "G P", icon: ArrowUpDown, action: () => router.push("/payouts"), category: "Navigate" },
    { id: "expenses", label: "Expenses", shortcut: "G E", icon: Receipt, action: () => router.push("/expenses"), category: "Navigate" },
    { id: "risk", label: "Risk Control", shortcut: "G R", icon: Shield, action: () => router.push("/risk"), category: "Navigate" },
    { id: "analytics", label: "Analytics", shortcut: "G N", icon: BarChart3, action: () => router.push("/analytics"), category: "Navigate" },
    { id: "journal", label: "Journal", shortcut: "G J", icon: BookOpen, action: () => router.push("/journal"), category: "Navigate" },
    { id: "trades", label: "Trades", shortcut: "G T", icon: Activity, action: () => router.push("/trades"), category: "Navigate" },
    { id: "calendar", label: "Calendar", shortcut: "G C", icon: Calendar, action: () => router.push("/calendar"), category: "Navigate" },
    { id: "goals", label: "Goals", shortcut: "G O", icon: Target, action: () => router.push("/goals"), category: "Navigate" },
    { id: "settings", label: "Settings", shortcut: "G S", icon: Settings, action: () => router.push("/settings"), category: "Navigate" },
    { id: "new-trade", label: "Log New Trade", icon: Plus, action: () => router.push("/journal"), category: "Actions" },
    { id: "new-account", label: "Add Account", icon: Plus, action: () => router.push("/accounts?new=true"), category: "Actions" },
    { id: "new-payout", label: "Record Payout", icon: Plus, action: () => router.push("/payouts"), category: "Actions" },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (open) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); filtered[selected]?.action(); onClose(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, filtered, selected, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="cmd-overlay" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.97, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -6 }} transition={{ duration: 0.12 }} className="cmd-dialog">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line-1">
              <Search className="h-4 w-4 text-t4 shrink-0" />
              <input ref={inputRef} type="text" value={query} onChange={(e) => { setQuery(e.target.value); setSelected(0); }} placeholder="Type a command or search..." className="flex-1 bg-transparent text-[13px] text-t1 placeholder:text-t4 outline-none" />
              <kbd className="text-[9px] text-t4 bg-layer-4 px-1.5 py-0.5 rounded border border-line-1">ESC</kbd>
            </div>
            <div className="max-h-[320px] overflow-y-auto py-1.5">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="px-4 py-1.5"><span className="f-label">{cat}</span></div>
                  {items.map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => { cmd.action(); onClose(); }}
                        onMouseEnter={() => setSelected(idx)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${idx === selected ? "bg-layer-3 text-t1" : "text-t2 hover:bg-layer-3"}`}
                      >
                        <cmd.icon className="h-3.5 w-3.5 text-t4 shrink-0" strokeWidth={1.5} />
                        <span className="flex-1 text-[12px] font-medium">{cmd.label}</span>
                        {cmd.shortcut && <kbd className="text-[9px] text-t4 bg-layer-4 px-1.5 py-0.5 rounded border border-line-0">{cmd.shortcut}</kbd>}
                        {idx === selected && <ArrowRight className="h-3 w-3 text-t4" />}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && <div className="px-4 py-6 text-center f-sub">No results</div>}
            </div>
            <div className="px-4 py-2 border-t border-line-0 flex items-center gap-4">
              <span className="f-micro flex items-center gap-1"><kbd className="text-[8px] bg-layer-4 px-1 rounded">↑↓</kbd> navigate</span>
              <span className="f-micro flex items-center gap-1"><kbd className="text-[8px] bg-layer-4 px-1 rounded">↵</kbd> select</span>
              <span className="f-micro flex items-center gap-1"><kbd className="text-[8px] bg-layer-4 px-1 rounded">esc</kbd> close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
