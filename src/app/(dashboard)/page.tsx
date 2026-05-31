"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { trpc } from "@/server/trpc/client";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  ArrowUpRight, ArrowDownRight, AlertTriangle, Shield, Clock,
  ChevronRight, Activity, Wallet, Zap, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [period, setPeriod] = useState("3M");
  const { data: dashboard, isLoading } = trpc.analytics.dashboard.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const { data: payouts } = trpc.income.list.useQuery();
  const periodDays = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365 }[period] ?? 90;
  const { data: equity } = trpc.analytics.netWorthHistory.useQuery({ days: periodDays });
  const { data: insights } = trpc.insights.generate.useQuery();
  const { data: todayData } = trpc.trades.todayStats.useQuery();

  const funded = accounts?.filter((a) => a.type === "funded" && a.status === "active") ?? [];
  const breached = accounts?.filter((a) => a.status === "breached") ?? [];
  const recentPayouts = payouts?.slice(0, 4) ?? [];

  const nw = dashboard?.netWorth ?? 0;
  const fc = dashboard?.fundedCapital ?? 0;
  const rc = dashboard?.realCapital ?? 0;
  const pending = dashboard?.pendingPayouts ?? 0;
  const monthly = dashboard?.monthlyNet ?? 0;
  const growth = dashboard?.growthMoM ?? 0;

  if (isLoading) return <Loading />;
  if (!accounts || accounts.length === 0) return <Empty />;

  const todayTrades = todayData?.count ?? 0;
  const dangerAccounts = funded.filter((a) => {
    const init = Number(a.initialBalance ?? a.currentBalance);
    const loss = Math.max(0, init - Number(a.currentBalance));
    return (loss / (init * 0.1)) > 0.7;
  }).length;

  return (
    <div className="space-y-5">
      {/* ━━━ DAILY STATUS BAR ━━━ */}
      <div className="flex items-center gap-4 px-4 py-2.5 rounded-[var(--r-lg)] bg-layer-2 border border-line-0">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-up animate-blink" />
          <span className="f-num-xs text-t2">Today</span>
        </div>
        <div className="h-3 w-px bg-line-1" />
        <span className="f-num-xs text-t3">{todayTrades} trades</span>
        {(todayData?.pnl ?? 0) !== 0 && (
          <>
            <div className="h-3 w-px bg-line-1" />
            <span className={`f-num-xs font-semibold ${(todayData?.pnl ?? 0) >= 0 ? "text-up" : "text-down"}`}>
              {(todayData?.pnl ?? 0) >= 0 ? "+" : ""}${Math.abs(todayData?.pnl ?? 0).toFixed(0)} today
            </span>
          </>
        )}
        <div className="h-3 w-px bg-line-1" />
        <span className="f-num-xs text-t3">{funded.length} active accounts</span>
        {dangerAccounts > 0 && (
          <>
            <div className="h-3 w-px bg-line-1" />
            <span className="f-num-xs text-down">{dangerAccounts} at risk</span>
          </>
        )}
        {pending > 0 && (
          <>
            <div className="h-3 w-px bg-line-1" />
            <span className="f-num-xs text-warn">{formatCurrency(pending)} pending</span>
          </>
        )}
        <div className="ml-auto">
          <span className="f-micro">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
        </div>
      </div>

      {/* ━━━ HERO METRIC ━━━ */}
      <div className="card-hero noise p-6">
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <span className="f-label block mb-2">Total Net Worth</span>
            <div className="f-hero text-t1">{formatCurrency(nw)}</div>
            <div className="flex items-center gap-1.5 mt-2">
              {growth >= 0 ? <ArrowUpRight className="h-3 w-3 text-up" /> : <ArrowDownRight className="h-3 w-3 text-down" />}
              <span className={`f-num-sm font-semibold ${growth >= 0 ? "text-up" : "text-down"}`}>
                {growth >= 0 ? "+" : ""}{growth.toFixed(1)}% this month
              </span>
            </div>
          </div>
          <div className="flex gap-6">
            <MiniStat label="Funded" value={formatCurrency(fc)} sub={`${funded.length} accounts`} />
            <MiniStat label="Real" value={formatCurrency(rc)} />
            <MiniStat label="Pending" value={formatCurrency(pending)} color="warn" />
            <MiniStat label="Monthly P&L" value={`${monthly >= 0 ? "+" : ""}${formatCurrency(monthly)}`} color={monthly >= 0 ? "up" : "down"} />
          </div>
        </div>
      </div>

      {/* ━━━ MAIN GRID ━━━ */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Equity Curve */}
        <div className="lg:col-span-8 card">
          <div className="card-header">
            <span className="f-label">Equity Evolution</span>
            <div className="flex gap-0.5">
              {(["1M", "3M", "6M", "1Y"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-0.5 rounded-[var(--r-sm)] text-[9px] font-medium transition-colors ${period === p ? "bg-layer-4 text-t1" : "text-t4 hover:text-t2"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-[220px] p-4">
            {equity && equity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equity} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line-0)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--t4)" }} tickFormatter={(v) => v?.slice(5) ?? ""} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--t4)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={36} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="netWorth" stroke="var(--brand)" strokeWidth={2} fill="url(#eqFill)" animationDuration={500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full f-sub">Update balances to see your equity curve</div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Risk Overview */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-t4" />
                <span className="f-label">Risk State</span>
              </div>
              <Link href="/risk" className="text-[10px] text-brand hover:text-brand/80 transition-colors">View</Link>
            </div>
            <div className="card-body-tight space-y-3">
              {funded.slice(0, 3).map((acc) => {
                const initial = Number(acc.initialBalance ?? acc.currentBalance);
                const loss = Math.max(0, initial - Number(acc.currentBalance));
                const maxDd = initial * 0.1;
                const pct = maxDd > 0 ? Math.min(100, (loss / maxDd) * 100) : 0;
                return (
                  <div key={acc.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-t1 truncate">{acc.name}</span>
                      <span className={`f-num-xs ${pct < 50 ? "text-up" : pct < 80 ? "text-warn" : "text-down"}`}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="dd-track">
                      <div className={`dd-fill ${pct < 50 ? "dd-fill-safe" : pct < 80 ? "dd-fill-warn" : "dd-fill-danger"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {breached.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <AlertTriangle className="h-3 w-3 text-down" />
                  <span className="text-[10px] font-medium text-down">{breached.length} breached</span>
                </div>
              )}
              {funded.length === 0 && <p className="f-sub text-center py-3">No funded accounts</p>}
            </div>
          </div>

          {/* Active Accounts */}
          <div className="card flex-1">
            <div className="card-header">
              <span className="f-label">Active Accounts</span>
              <Link href="/accounts" className="text-[10px] text-brand hover:text-brand/80 transition-colors">All</Link>
            </div>
            <div className="card-body-tight">
              {funded.length > 0 ? (
                <div className="space-y-0.5">
                  {funded.slice(0, 4).map((acc) => {
                    const pnl = Number(acc.currentBalance) - Number(acc.initialBalance ?? acc.currentBalance);
                    return (
                      <Link key={acc.id} href={`/accounts/${acc.id}`} className="flex items-center gap-2.5 rounded-[var(--r-sm)] px-2 py-[6px] hover:bg-layer-3 transition-colors">
                        <div className="h-[18px] w-[18px] rounded bg-layer-4 flex items-center justify-center text-[7px] font-bold text-t3 ring-1 ring-line-1">{(acc.firm?.[0] ?? "F").toUpperCase()}</div>
                        <span className="flex-1 text-[11px] font-medium text-t1 truncate">{acc.name}</span>
                        <div className="text-right">
                          <div className="f-num-xs text-t1">{formatCurrency(Number(acc.currentBalance))}</div>
                          <div className={`text-[8px] font-medium ${pnl >= 0 ? "text-up" : "text-down"}`}>{pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="f-sub text-center py-3">Add funded accounts</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ BOTTOM ROW ━━━ */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Payout Pipeline */}
        <div className="lg:col-span-5 card-flush">
          <div className="card-header">
            <span className="f-label">Payout Pipeline</span>
            <Link href="/payouts" className="text-[10px] text-brand hover:text-brand/80 transition-colors">All</Link>
          </div>
          {recentPayouts.length > 0 ? (
            <div className="divide-y divide-line-0">
              {recentPayouts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-[18px] py-3 hover:bg-layer-3/50 transition-colors">
                  <div className={`dot ${p.status === "received" ? "dot-up" : p.status === "processing" ? "dot-warn" : "dot-off"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-t1 truncate">{accounts?.find((a) => a.id === p.accountId)?.name ?? "Payout"}</div>
                    <div className="f-micro">{p.receivedAt ?? p.requestedAt ?? ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="f-num-sm text-t1">{formatCurrency(Number(p.amountNet ?? p.amountGross))}</div>
                    <span className={`pill text-[8px] ${p.status === "received" ? "pill-up" : p.status === "processing" ? "pill-warn" : "pill-muted"}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[130px] f-sub">No payouts yet</div>
          )}
        </div>

        {/* Capital Split */}
        <div className="lg:col-span-3 card">
          <div className="card-header"><span className="f-label">Capital Split</span></div>
          <div className="card-body flex flex-col items-center gap-4">
            {nw > 0 ? (
              <>
                <div className="relative h-[88px] w-[88px]">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line-1)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--brand)" strokeWidth="6" strokeDasharray={`${(fc / nw) * 251} 251`} strokeLinecap="round" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--up)" strokeWidth="6" strokeDasharray={`${(rc / nw) * 251} 251`} strokeDashoffset={`-${(fc / nw) * 251}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="f-num-xs text-t1">{formatCurrency(nw, "USD", true)}</span>
                  </div>
                </div>
                <div className="w-full space-y-1.5">
                  <LegendRow color="brand" label="Funded" value={formatCurrency(fc)} pct={((fc / nw) * 100).toFixed(0)} />
                  <LegendRow color="up" label="Real" value={formatCurrency(rc)} pct={((rc / nw) * 100).toFixed(0)} />
                </div>
              </>
            ) : (
              <p className="f-sub py-4">Add accounts</p>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="lg:col-span-4 card-flush">
          <div className="card-header"><span className="f-label">Alerts</span></div>
          {insights && insights.length > 0 ? (
            <div className="divide-y divide-line-0">
              {insights.slice(0, 3).map((ins, i) => (
                <div key={i} className="flex items-start gap-2.5 px-[18px] py-3">
                  {ins.severity === "critical" ? <AlertTriangle className="h-3 w-3 text-down mt-0.5 shrink-0" /> :
                   ins.severity === "warning" ? <AlertTriangle className="h-3 w-3 text-warn mt-0.5 shrink-0" /> :
                   <Zap className="h-3 w-3 text-brand mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-t1 leading-tight">{ins.title}</div>
                    <div className="text-[10px] text-t4 mt-0.5 line-clamp-2 leading-snug">{ins.body}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[130px] f-sub">No alerts</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub components ─── */

function MiniStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  const c = color === "up" ? "text-up" : color === "down" ? "text-down" : color === "warn" ? "text-warn" : "text-t1";
  return (
    <div className="hidden sm:block">
      <span className="f-micro block mb-0.5">{label}</span>
      <span className={`f-num-sm font-semibold ${c}`}>{value}</span>
      {sub && <span className="f-micro block mt-0.5">{sub}</span>}
    </div>
  );
}

function LegendRow({ color, label, value, pct }: { color: string; label: string; value: string; pct: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full bg-${color}`} />
        <span className="text-[10px] text-t2">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="f-num-xs text-t1">{value}</span>
        <span className="f-micro">{pct}%</span>
      </div>
    </div>
  );
}

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-[var(--r-sm)] px-3 py-1.5 shadow-lg">
      <p className="f-micro">{label}</p>
      {payload.map((e: any, i: number) => <p key={i} className="f-num-sm text-t1">{formatCurrency(e.value)}</p>)}
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-5">
      <div className="card-hero p-6"><div className="skeleton h-16 w-48 rounded-[var(--r-md)]" /></div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 card"><div className="skeleton h-[260px] m-4 rounded-[var(--r-md)]" /></div>
        <div className="lg:col-span-4 card"><div className="skeleton h-[260px] m-4 rounded-[var(--r-md)]" /></div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <div className="flex flex-col items-center gap-5 max-w-xs text-center">
        <div className="h-14 w-14 rounded-xl bg-brand-soft border border-brand/10 flex items-center justify-center glow-brand">
          <TrendingUp className="h-6 w-6 text-brand" />
        </div>
        <div>
          <h2 className="f-title mb-1.5">Welcome to TradeVault</h2>
          <p className="text-[12px] text-t3 leading-relaxed">Your trading control center. Add your first account to start tracking capital, risk, and growth.</p>
        </div>
        <Link href="/accounts?new=true" className="flex items-center gap-1.5 rounded-[var(--r-md)] bg-brand px-4 py-2 text-[11px] font-medium text-white hover:bg-brand-dim transition-colors">
          <Wallet className="h-3.5 w-3.5" /> Add Account
        </Link>
      </div>
    </div>
  );
}
