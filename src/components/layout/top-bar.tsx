"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { NotificationPanel } from "@/components/notifications";

const TITLES: Record<string, string> = {
  "/": "Control Center", "/accounts": "Accounts", "/payouts": "Payouts",
  "/expenses": "Expenses", "/risk": "Risk Control", "/analytics": "Analytics",
  "/journal": "Journal", "/trades": "Trades", "/calendar": "Calendar",
  "/goals": "Goals", "/playbook": "Playbook", "/psychology": "Psychology",
  "/insights": "Insights", "/reports": "Reports", "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const [cmd, setCmd] = useState(false);
  const base = `/${pathname.split("/")[1] ?? ""}`;
  const title = TITLES[pathname] ?? TITLES[base] ?? "Control Center";

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmd(true); } };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[var(--header)] items-center justify-between px-6 border-b border-line-0 bg-layer-0/80 backdrop-blur-lg">
        <h1 className="text-[13px] font-semibold text-t1 tracking-tight">{title}</h1>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCmd(true)} className="flex items-center gap-1.5 h-[26px] px-2.5 rounded-[var(--r-sm)] border border-line-1 text-t4 hover:text-t2 hover:border-line-2 transition-all text-[10px]">
            <Search className="h-3 w-3" /><span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline ml-1 text-[8px] text-t4/60 bg-layer-2 px-1 rounded">⌘K</kbd>
          </button>
          <NotificationPanel />
          <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--r-sm)] bg-brand text-white text-[10px] font-medium hover:bg-brand-dim transition-colors">
            <Plus className="h-3 w-3" /><span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </header>
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
    </>
  );
}
