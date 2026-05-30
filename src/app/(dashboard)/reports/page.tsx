"use client";

import { useState } from "react";
import { Download, Clock, Calendar } from "lucide-react";

const SESSIONS = [
  { session: "Asian", trades: 8, pnl: 120, wr: 50, rr: 1.2 },
  { session: "London", trades: 32, pnl: 2840, wr: 72, rr: 2.6 },
  { session: "New York", trades: 24, pnl: 980, wr: 54, rr: 1.8 },
  { session: "London Close", trades: 3, pnl: -180, wr: 33, rr: 0.8 },
];

const WEEKDAYS = [
  { day: "Monday", trades: 12, pnl: 840, wr: 67 },
  { day: "Tuesday", trades: 15, pnl: -220, wr: 47 },
  { day: "Wednesday", trades: 18, pnl: 1250, wr: 72 },
  { day: "Thursday", trades: 14, pnl: 680, wr: 64 },
  { day: "Friday", trades: 8, pnl: 320, wr: 63 },
];

const PAIRS = [
  { pair: "EUR/USD", trades: 18, pnl: 1420, wr: 67, rr: 2.2 },
  { pair: "GBP/JPY", trades: 12, pnl: -340, wr: 42, rr: 1.4 },
  { pair: "NAS100", trades: 8, pnl: 2100, wr: 75, rr: 3.2 },
  { pair: "XAU/USD", trades: 15, pnl: 1860, wr: 73, rr: 2.8 },
  { pair: "USD/JPY", trades: 14, pnl: 820, wr: 64, rr: 1.9 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="t-heading text-text-primary">Performance Reports</h2>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 rounded-[var(--radius-sm)] border border-border-subtle p-0.5">
            {["week", "month", "quarter"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${period === p ? "bg-bg-active text-text-primary" : "text-text-muted hover:text-text-secondary"}`}>{p[0].toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
          <button className="flex items-center gap-1 h-[26px] px-2 rounded-[var(--radius-sm)] border border-border-subtle text-[10px] text-text-secondary hover:border-border-default transition-colors"><Download className="h-3 w-3" /> Export</button>
        </div>
      </div>

      <div className="kpi-grid grid-cols-2 lg:grid-cols-5">
        <div className="kpi-cell"><span className="t-label">Total P&L</span><span className="t-metric-sm text-profit">+$5,860</span></div>
        <div className="kpi-cell"><span className="t-label">Trades</span><span className="t-metric-sm text-text-primary">67</span></div>
        <div className="kpi-cell"><span className="t-label">Win Rate</span><span className="t-metric-sm text-text-primary">63%</span></div>
        <div className="kpi-cell"><span className="t-label">Avg R:R</span><span className="t-metric-sm text-text-primary">2.1</span></div>
        <div className="kpi-cell"><span className="t-label">Profit Factor</span><span className="t-metric-sm text-profit">1.84</span></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Session */}
        <div className="panel-flush">
          <div className="panel-header"><span className="t-label">By Session</span><Clock className="h-3 w-3 text-text-muted" /></div>
          <table className="data-table">
            <thead><tr><th>Session</th><th className="text-right">Trades</th><th className="text-right">WR</th><th className="text-right">P&L</th></tr></thead>
            <tbody>
              {SESSIONS.map((s) => (
                <tr key={s.session}>
                  <td className="text-[11px] font-medium text-text-primary">{s.session}</td>
                  <td className="t-mono text-right">{s.trades}</td>
                  <td className="t-mono text-right">{s.wr}%</td>
                  <td className={`t-mono text-right font-medium ${s.pnl >= 0 ? "text-profit" : "text-loss"}`}>{s.pnl >= 0 ? "+" : ""}${s.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weekday */}
        <div className="panel-flush">
          <div className="panel-header"><span className="t-label">By Weekday</span><Calendar className="h-3 w-3 text-text-muted" /></div>
          <table className="data-table">
            <thead><tr><th>Day</th><th className="text-right">Trades</th><th className="text-right">WR</th><th className="text-right">P&L</th></tr></thead>
            <tbody>
              {WEEKDAYS.map((d) => (
                <tr key={d.day}>
                  <td className="text-[11px] font-medium text-text-primary">{d.day}</td>
                  <td className="t-mono text-right">{d.trades}</td>
                  <td className="t-mono text-right">{d.wr}%</td>
                  <td className={`t-mono text-right font-medium ${d.pnl >= 0 ? "text-profit" : "text-loss"}`}>{d.pnl >= 0 ? "+" : ""}${d.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pair Performance */}
      <div className="panel-flush">
        <div className="panel-header"><span className="t-label">Pair Performance</span></div>
        <table className="data-table">
          <thead><tr><th>Pair</th><th className="text-right">Trades</th><th className="text-right">P&L</th><th className="text-right">Win Rate</th><th className="text-right">Avg R:R</th><th className="text-right">Edge</th></tr></thead>
          <tbody>
            {PAIRS.map((p) => {
              const exp = (p.wr / 100) * p.rr - (1 - p.wr / 100);
              return (
                <tr key={p.pair}>
                  <td className="text-[11px] font-semibold text-text-primary">{p.pair}</td>
                  <td className="t-mono text-right">{p.trades}</td>
                  <td className={`t-mono text-right font-medium ${p.pnl >= 0 ? "text-profit" : "text-loss"}`}>{p.pnl >= 0 ? "+" : ""}${p.pnl}</td>
                  <td className="t-mono text-right">{p.wr}%</td>
                  <td className="t-mono text-right">{p.rr}</td>
                  <td className={`t-mono text-right font-medium ${exp > 0 ? "text-profit" : "text-loss"}`}>{exp > 0 ? "+" : ""}{exp.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
