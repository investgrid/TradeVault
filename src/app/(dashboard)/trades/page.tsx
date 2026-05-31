"use client";

import { motion } from "framer-motion";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { Filter, Download } from "lucide-react";

export default function TradesPage() {
  const { data: trades } = trpc.trades.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.trades.stats.useQuery();

  const rows = trades ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="f-title">All Trades</h2>
          <p className="f-sub mt-0.5">
            {stats?.total ?? 0} trades · {stats?.wins ?? 0}W/{stats?.losses ?? 0}L · Net: <span className={(stats?.totalPnl ?? 0) >= 0 ? "text-up" : "text-down"}>${(stats?.totalPnl ?? 0).toFixed(0)}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 h-[26px] px-2 rounded-[var(--r-sm)] border border-line-1 text-[10px] text-t3 hover:border-line-2 transition-colors"><Filter className="h-3 w-3" /> Filter</button>
          <button onClick={() => window.open("/api/export/trades", "_blank")} className="flex items-center gap-1 h-[26px] px-2 rounded-[var(--r-sm)] border border-line-1 text-[10px] text-t3 hover:border-line-2 transition-colors"><Download className="h-3 w-3" /> Export</button>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="card-flush">
          <table className="tv-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Dir</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Size</th>
                <th className="text-right">P&L</th>
                <th className="text-right">R:R</th>
                <th>Setup</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => {
                const pnl = Number(t.pnl ?? 0);
                const rr = Number(t.riskReward ?? 0);
                return (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td className="text-[11px] font-semibold text-t1">{t.pair}</td>
                    <td><span className={`pill ${t.direction === "long" ? "pill-up" : "pill-down"}`}>{t.direction.toUpperCase()}</span></td>
                    <td className="f-num-sm">{t.entryPrice ?? "—"}</td>
                    <td className="f-num-sm">{t.exitPrice ?? "—"}</td>
                    <td className="f-num-sm">{t.positionSize ?? "—"}</td>
                    <td className={`f-num-sm text-right font-medium ${pnl >= 0 ? "text-up" : "text-down"}`}>{pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}</td>
                    <td className={`f-num-sm text-right ${rr >= 0 ? "text-up" : "text-down"}`}>{rr !== 0 ? `${rr >= 0 ? "+" : ""}${rr.toFixed(1)}R` : "—"}</td>
                    <td className="text-[11px] text-t3">{t.setup ?? "—"}</td>
                    <td className="text-[11px] text-t4">{t.tradeDate}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card flex items-center justify-center py-16">
          <p className="f-sub">No trades logged. Use the Journal to log your first trade.</p>
        </div>
      )}
    </div>
  );
}
