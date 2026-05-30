"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-[var(--radius-sm)] px-2.5 py-1.5">
      <p className="text-[9px] text-text-muted">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="t-mono text-text-primary text-[11px]">{e.name}: {formatCurrency(e.value)}</p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("6M");
  const { data: roi } = trpc.analytics.challengeROI.useQuery();
  const { data: consistency } = trpc.analytics.payoutConsistency.useQuery();
  const { data: survival } = trpc.analytics.accountSurvival.useQuery();
  const { data: cashflow } = trpc.analytics.cashflow.useQuery();
  const { data: netWorth } = trpc.analytics.netWorthHistory.useQuery();
  const { data: firms } = trpc.analytics.firmPerformance.useQuery();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="t-heading text-text-primary">Analytics</h2>
        <div className="flex gap-0.5 rounded-[var(--radius-sm)] border border-border-subtle p-0.5">
          {["3M", "6M", "1Y", "All"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${period === p ? "bg-bg-active text-text-primary" : "text-text-muted hover:text-text-secondary"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid grid-cols-2 lg:grid-cols-4">
        <div className="kpi-cell">
          <span className="t-label">Challenge ROI</span>
          <span className="t-metric-sm text-profit">{roi ? `+${roi.roi.toFixed(0)}%` : "—"}</span>
          <span className="t-caption">all time</span>
        </div>
        <div className="kpi-cell">
          <span className="t-label">Payout Consistency</span>
          <span className="t-metric-sm text-text-primary">{consistency ? `${consistency.consistency.toFixed(0)}%` : "—"}</span>
          <span className="t-caption">{consistency ? `${consistency.monthsWithPayout}/${consistency.totalMonths} months` : ""}</span>
        </div>
        <div className="kpi-cell">
          <span className="t-label">Account Survival</span>
          <span className="t-metric-sm text-text-primary">{survival ? `${survival.rate.toFixed(0)}%` : "—"}</span>
          <span className="t-caption">{survival ? `${survival.active}/${survival.total}` : ""}</span>
        </div>
        <div className="kpi-cell">
          <span className="t-label">Profit Factor</span>
          <span className="t-metric-sm text-profit">1.84</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <div className="panel-header"><span className="t-label">Net Worth Growth</span></div>
          <div className="h-[180px] px-4 pb-3">
            {netWorth && netWorth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorth} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.12} /><stop offset="100%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v) => v?.slice(5) ?? ""} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={36} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="netWorth" stroke="var(--accent)" strokeWidth={1.5} fill="url(#nwg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full t-caption">Add data to see growth</div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><span className="t-label">Monthly Cashflow</span></div>
          <div className="h-[180px] px-4 pb-3">
            {cashflow && cashflow.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflow} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v) => v?.slice(5) ?? ""} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={32} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="income" name="Income" fill="var(--profit)" radius={[2, 2, 0, 0]} opacity={0.85} />
                  <Bar dataKey="expenses" name="Expenses" fill="var(--loss)" radius={[2, 2, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full t-caption">Record transactions</div>}
          </div>
        </div>
      </div>

      {/* Firm Performance */}
      <div className="panel-flush">
        <div className="panel-header"><span className="t-label">Firm Performance</span></div>
        {firms && firms.length > 0 ? (
          <div className="p-4 flex flex-col gap-3">
            {firms.map((f, i) => (
              <motion.div key={f.firm} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <div className="h-5 w-5 rounded bg-bg-elevated flex items-center justify-center text-[8px] font-bold text-text-tertiary ring-1 ring-border-subtle">{f.firm[0]}</div>
                  <span className="text-[11px] font-medium text-text-primary truncate">{f.firm}</span>
                </div>
                <div className="flex-1 h-4 rounded bg-bg-panel overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(5, f.roi > 0 ? (f.roi / 400) * 100 : 5))}%` }} transition={{ duration: 0.6, delay: 0.1 + i * 0.06 }} className="h-full rounded bg-gradient-to-r from-accent/30 to-accent" />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`t-mono font-medium ${f.roi >= 0 ? "text-profit" : "text-loss"}`}>{f.roi >= 0 ? "+" : ""}{f.roi.toFixed(0)}%</span>
                  <span className="text-[9px] text-text-muted">{f.count} accts</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : <div className="flex items-center justify-center h-[100px] t-caption">Add funded accounts</div>}
      </div>
    </div>
  );
}
