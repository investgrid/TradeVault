"use client";

import { Plus, Star, ChevronRight } from "lucide-react";

const SETUPS = [
  { id: "1", name: "Order Block", wr: 68, rr: 2.4, trades: 42, pair: "EUR/USD", session: "London", rules: ["Wait for displacement", "Entry on 50% OB", "SL below OB low", "TP at opposing OB"] },
  { id: "2", name: "FVG Entry", wr: 55, rr: 1.8, trades: 28, pair: "GBP/JPY", session: "NY", rules: ["Gap unfilled", "Align HTF bias", "Enter 50% gap", "SL outside FVG"] },
  { id: "3", name: "Breaker Block", wr: 72, rr: 3.1, trades: 18, pair: "NAS100", session: "NY", rules: ["Swing broken", "Return to zone", "Confirmation candle", "Trail after 1R"] },
  { id: "4", name: "Liquidity Sweep", wr: 61, rr: 2.0, trades: 35, pair: "XAU/USD", session: "London", rules: ["EQH/EQL present", "Sweep + reject", "Entry on 15m close", "Target opposing liq"] },
];

export default function PlaybookPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="t-heading text-text-primary">Playbook</h2>
        <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--radius-sm)] bg-accent text-white text-[10px] font-medium hover:bg-accent-hover transition-colors">
          <Plus className="h-3 w-3" /> New Setup
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SETUPS.map((s) => (
          <div key={s.id} className="panel panel-body cursor-pointer hover:border-border-default transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-text-primary">{s.name}</span>
                  {s.wr >= 65 && <Star className="h-3 w-3 text-pending fill-pending" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="pill pill-neutral">{s.pair}</span>
                  <span className="pill pill-neutral">{s.session}</span>
                </div>
              </div>
              <ChevronRight className="h-3 w-3 text-text-muted" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div><span className="t-label block">Win Rate</span><span className={`t-metric-xs ${s.wr >= 60 ? "text-profit" : "text-text-primary"}`}>{s.wr}%</span></div>
              <div><span className="t-label block">Avg R:R</span><span className="t-metric-xs text-text-primary">{s.rr}</span></div>
              <div><span className="t-label block">Trades</span><span className="t-metric-xs text-text-primary">{s.trades}</span></div>
            </div>

            <div className="border-t border-border-subtle pt-2">
              <span className="t-label block mb-1">Rules</span>
              <div className="flex flex-col gap-0.5">
                {s.rules.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-accent shrink-0" />
                    <span className="text-[10px] text-text-secondary">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
