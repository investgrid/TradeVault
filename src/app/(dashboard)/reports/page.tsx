"use client";

import { useMemo } from "react";
import { Download, Clock, Calendar, BarChart3 } from "lucide-react";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ReportsPage() {
  const { data: allTrades, isLoading } = trpc.trades.list.useQuery({ limit: 200 });

  const { sessions, weekdays, pairs, totals } = useMemo(() => {
    if (!allTrades || allTrades.length === 0) {
      return { sessions: [], weekdays: [], pairs: [], totals: { pnl: 0, trades: 0, winRate: 0, avgRR: 0, profitFactor: 0 } };
    }

    // Group by session
    const sessionMap: Record<string, { trades: number; wins: number; pnl: number; rr: number }> = {};
    const weekdayMap: Record<string, { trades: number; wins: number; pnl: number }> = {};
    const pairMap: Record<string, { trades: number; wins: number; pnl: number; rr: number }> = {};

    let totalWins = 0;
    let totalPnl = 0;
    let totalRR = 0;
    let grossProfit = 0;
    let grossLoss = 0;

    for (const t of allTrades) {
      const pnl = Number(t.pnl ?? 0);
      const rr = Number(t.riskReward ?? 0);
      const isWin = pnl > 0;

      totalPnl += pnl;
      totalRR += rr;
      if (isWin) { totalWins++; grossProfit += pnl; }
      else { grossLoss += Math.abs(pnl); }

      // Session
      const sess = t.session || "Unknown";
      if (!sessionMap[sess]) sessionMap[sess] = { trades: 0, wins: 0, pnl: 0, rr: 0 };
      sessionMap[sess].trades++;
      sessionMap[sess].pnl += pnl;
      sessionMap[sess].rr += rr;
      if (isWin) sessionMap[sess].wins++;

      // Weekday
      if (t.tradeDate) {
        const dayIdx = new Date(t.tradeDate + "T12:00:00").getDay();
        const dayName = WEEKDAY_NAMES[dayIdx];
        if (!weekdayMap[dayName]) weekdayMap[dayName] = { trades: 0, wins: 0, pnl: 0 };
        weekdayMap[dayName].trades++;
        weekdayMap[dayName].pnl += pnl;
        if (isWin) weekdayMap[dayName].wins++;
      }

      // Pair
      const pair = t.pair || "Unknown";
      if (!pairMap[pair]) pairMap[pair] = { trades: 0, wins: 0, pnl: 0, rr: 0 };
      pairMap[pair].trades++;
      pairMap[pair].pnl += pnl;
      pairMap[pair].rr += rr;
      if (isWin) pairMap[pair].wins++;
    }

    const total = allTrades.length;
    const winRate = total > 0 ? (totalWins / total) * 100 : 0;
    const avgRR = total > 0 ? totalRR / total : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    const sessions = Object.entries(sessionMap)
      .map(([session, d]) => ({
        session,
        trades: d.trades,
        pnl: d.pnl,
        wr: d.trades > 0 ? Math.round((d.wins / d.trades) * 100) : 0,
        rr: d.trades > 0 ? +(d.rr / d.trades).toFixed(1) : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const weekdays = orderedDays
      .filter((d) => weekdayMap[d])
      .map((day) => ({
        day,
        trades: weekdayMap[day].trades,
        pnl: weekdayMap[day].pnl,
        wr: weekdayMap[day].trades > 0 ? Math.round((weekdayMap[day].wins / weekdayMap[day].trades) * 100) : 0,
      }));

    const pairs = Object.entries(pairMap)
      .map(([pair, d]) => ({
        pair,
        trades: d.trades,
        pnl: d.pnl,
        wr: d.trades > 0 ? Math.round((d.wins / d.trades) * 100) : 0,
        rr: d.trades > 0 ? +(d.rr / d.trades).toFixed(1) : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    return {
      sessions,
      weekdays,
      pairs,
      totals: { pnl: totalPnl, trades: total, winRate, avgRR, profitFactor },
    };
  }, [allTrades]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-[var(--r-md)]" />
        <div className="metric-grid grid-cols-5"><div className="skeleton h-16 rounded-[var(--r-md)]" /><div className="skeleton h-16 rounded-[var(--r-md)]" /><div className="skeleton h-16 rounded-[var(--r-md)]" /><div className="skeleton h-16 rounded-[var(--r-md)]" /><div className="skeleton h-16 rounded-[var(--r-md)]" /></div>
      </div>
    );
  }

  if (!allTrades || allTrades.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[55vh]">
        <div className="flex flex-col items-center gap-4 max-w-xs text-center">
          <div className="h-12 w-12 rounded-xl bg-layer-3 border border-line-1 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-t4" />
          </div>
          <div>
            <h2 className="f-title mb-1">No Reports Yet</h2>
            <p className="f-sub leading-relaxed">Log trades to see session, weekday, and pair performance breakdowns.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="f-title text-t1">Performance Reports</h2>
        <span className="f-micro text-t4">{totals.trades} trades analyzed</span>
      </div>

      <div className="metric-grid grid-cols-2 lg:grid-cols-5">
        <div className="metric-cell">
          <span className="f-label">Total P&L</span>
          <span className={`f-num font-semibold ${totals.pnl >= 0 ? "text-up" : "text-down"}`}>
            {totals.pnl >= 0 ? "+" : ""}{formatCurrency(totals.pnl)}
          </span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Trades</span>
          <span className="f-num text-t1">{totals.trades}</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Win Rate</span>
          <span className="f-num text-t1">{totals.winRate.toFixed(0)}%</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Avg R:R</span>
          <span className="f-num text-t1">{totals.avgRR.toFixed(1)}</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Profit Factor</span>
          <span className={`f-num font-semibold ${totals.profitFactor >= 1 ? "text-up" : "text-down"}`}>
            {totals.profitFactor === Infinity ? "∞" : totals.profitFactor.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Session */}
        <div className="card-flush">
          <div className="card-header">
            <span className="f-label">By Session</span>
            <Clock className="h-3 w-3 text-t4" />
          </div>
          <table className="tv-table">
            <thead><tr><th>Session</th><th className="text-right">Trades</th><th className="text-right">WR</th><th className="text-right">Avg RR</th><th className="text-right">P&L</th></tr></thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.session}>
                  <td className="text-[11px] font-medium text-t1">{s.session}</td>
                  <td className="f-num-sm text-right">{s.trades}</td>
                  <td className="f-num-sm text-right">{s.wr}%</td>
                  <td className="f-num-sm text-right">{s.rr}</td>
                  <td className={`f-num-sm text-right font-medium ${s.pnl >= 0 ? "text-up" : "text-down"}`}>{s.pnl >= 0 ? "+" : ""}{formatCurrency(s.pnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weekday */}
        <div className="card-flush">
          <div className="card-header">
            <span className="f-label">By Weekday</span>
            <Calendar className="h-3 w-3 text-t4" />
          </div>
          <table className="tv-table">
            <thead><tr><th>Day</th><th className="text-right">Trades</th><th className="text-right">WR</th><th className="text-right">P&L</th></tr></thead>
            <tbody>
              {weekdays.map((d) => (
                <tr key={d.day}>
                  <td className="text-[11px] font-medium text-t1">{d.day}</td>
                  <td className="f-num-sm text-right">{d.trades}</td>
                  <td className="f-num-sm text-right">{d.wr}%</td>
                  <td className={`f-num-sm text-right font-medium ${d.pnl >= 0 ? "text-up" : "text-down"}`}>{d.pnl >= 0 ? "+" : ""}{formatCurrency(d.pnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pair Performance */}
      <div className="card-flush">
        <div className="card-header"><span className="f-label">Pair Performance</span></div>
        <table className="tv-table">
          <thead><tr><th>Pair</th><th className="text-right">Trades</th><th className="text-right">P&L</th><th className="text-right">Win Rate</th><th className="text-right">Avg R:R</th><th className="text-right">Edge</th></tr></thead>
          <tbody>
            {pairs.map((p) => {
              const exp = (p.wr / 100) * p.rr - (1 - p.wr / 100);
              return (
                <tr key={p.pair}>
                  <td className="text-[11px] font-semibold text-t1">{p.pair}</td>
                  <td className="f-num-sm text-right">{p.trades}</td>
                  <td className={`f-num-sm text-right font-medium ${p.pnl >= 0 ? "text-up" : "text-down"}`}>{p.pnl >= 0 ? "+" : ""}{formatCurrency(p.pnl)}</td>
                  <td className="f-num-sm text-right">{p.wr}%</td>
                  <td className="f-num-sm text-right">{p.rr}</td>
                  <td className={`f-num-sm text-right font-medium ${exp > 0 ? "text-up" : "text-down"}`}>{exp > 0 ? "+" : ""}{exp.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
