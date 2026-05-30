"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { ArrowLeft, TrendingUp, TrendingDown, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AccountDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [balance, setBalance] = useState("");

  const { data: account, refetch, isLoading } = trpc.accounts.getById.useQuery({ id });
  const updateBalance = trpc.accounts.updateBalance.useMutation({ onSuccess: () => { refetch(); setBalance(""); } });
  const deleteAccount = trpc.accounts.delete.useMutation({ onSuccess: () => router.push("/accounts") });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-48 rounded-[var(--r-md)]" />
        <div className="skeleton h-[140px] rounded-[var(--r-lg)]" />
        <div className="skeleton h-[200px] rounded-[var(--r-lg)]" />
      </div>
    );
  }

  if (!account) {
    return <div className="flex items-center justify-center py-20 f-sub">Account not found</div>;
  }

  const profit = Number(account.currentBalance) - Number(account.initialBalance ?? account.currentBalance);
  const profitPct = account.initialBalance ? (profit / Number(account.initialBalance)) * 100 : 0;

  const dd = account.drawdown;
  const funded = account.funded;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/accounts" className="h-7 w-7 rounded-[var(--r-sm)] flex items-center justify-center text-t4 hover:text-t1 hover:bg-layer-3 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[var(--r-md)] bg-layer-3 flex items-center justify-center text-[11px] font-bold text-t3 ring-1 ring-line-1">
              {(account.firm?.[0] ?? account.type[0]).toUpperCase()}
            </div>
            <div>
              <h2 className="f-title">{account.name}</h2>
              <span className="f-sub">{account.firm ?? account.type}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`pill ${account.status === "active" ? "pill-up" : account.status === "breached" ? "pill-down" : "pill-muted"}`}>
              {account.status}
            </span>
            <button
              onClick={() => { if (confirm("Delete this account?")) deleteAccount.mutate({ id }); }}
              className="h-7 w-7 rounded-[var(--r-sm)] flex items-center justify-center text-t4 hover:text-down hover:bg-down-soft transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Balance Hero */}
      <div className="card-hero noise p-6">
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="f-label block mb-2">Current Balance</span>
            <div className="f-hero text-t1">{formatCurrency(Number(account.currentBalance))}</div>
            {account.initialBalance && (
              <div className="flex items-center gap-1.5 mt-2">
                {profit >= 0 ? <TrendingUp className="h-3 w-3 text-up" /> : <TrendingDown className="h-3 w-3 text-down" />}
                <span className={`f-num-sm font-semibold ${profit >= 0 ? "text-up" : "text-down"}`}>
                  {profit >= 0 ? "+" : ""}{formatCurrency(profit)} ({profitPct >= 0 ? "+" : ""}{profitPct.toFixed(1)}%)
                </span>
                <span className="f-micro">from initial</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="New balance"
              className="h-8 w-32 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors"
            />
            <button
              disabled={!balance || updateBalance.isPending}
              onClick={() => updateBalance.mutate({ id, balance })}
              className="h-8 px-3 rounded-[var(--r-md)] bg-brand text-white text-[11px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-40"
            >
              {updateBalance.isPending ? "..." : "Update"}
            </button>
          </div>
        </div>
      </div>

      {/* Drawdown + Stats Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Drawdown Meter */}
        {dd && (
          <div className="card card-body space-y-4">
            <div className="flex items-center justify-between">
              <span className="f-label">Drawdown</span>
              <span className={`pill ${dd.usedPercent < 50 ? "pill-up" : dd.usedPercent < 80 ? "pill-warn" : "pill-down"}`}>
                {dd.usedPercent.toFixed(1)}% used
              </span>
            </div>

            {/* Visual bar */}
            <div>
              <div className="h-3 rounded-full bg-layer-4 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${dd.usedPercent < 50 ? "dd-fill-safe" : dd.usedPercent < 80 ? "dd-fill-warn" : "dd-fill-danger"}`}
                  style={{ width: `${Math.min(100, dd.usedPercent)}%` }}
                />
                {/* Zone markers */}
                <div className="absolute top-0 bottom-0 left-[70%] w-px bg-warn/30" />
                <div className="absolute top-0 bottom-0 left-[90%] w-px bg-down/30" />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="f-micro">Safe</span>
                <span className="f-micro text-warn">Warning 70%</span>
                <span className="f-micro text-down">Danger 90%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-line-0">
              <div>
                <span className="f-micro block">Remaining</span>
                <span className="f-num-sm text-up">{formatCurrency(dd.remainingAmount)}</span>
              </div>
              <div>
                <span className="f-micro block">Breach At</span>
                <span className="f-num-sm text-down">{formatCurrency(dd.breachPrice)}</span>
              </div>
              <div>
                <span className="f-micro block">Type</span>
                <span className="f-num-sm text-t1">{funded?.maxDrawdownType ?? "static"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Account Metrics */}
        <div className="metric-grid grid-cols-2">
          {funded && (
            <>
              <div className="metric-cell">
                <span className="f-label">Challenge Cost</span>
                <span className="f-value text-t1">${Number(funded.challengeCost ?? 0).toLocaleString()}</span>
              </div>
              <div className="metric-cell">
                <span className="f-label">Profit Split</span>
                <span className="f-value text-t1">{funded.profitSplitPct ?? 80}%</span>
              </div>
            </>
          )}
          <div className="metric-cell">
            <span className="f-label">Total Payouts</span>
            <span className="f-value text-up">{account.totalPayouts > 0 ? formatCurrency(account.totalPayouts) : "—"}</span>
            {account.payoutCount > 0 && <span className="f-micro">{account.payoutCount} received</span>}
          </div>
          <div className="metric-cell">
            <span className="f-label">ROI</span>
            <span className={`f-value ${account.roi >= 0 ? "text-up" : "text-down"}`}>
              {account.roi !== 0 ? `${account.roi >= 0 ? "+" : ""}${account.roi.toFixed(0)}%` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Equity Chart */}
      <div className="card">
        <div className="card-header">
          <span className="f-label">Balance History</span>
          <span className="f-sub">{account.history?.length ?? 0} snapshots</span>
        </div>
        <div className="h-[200px] p-4">
          {account.history && account.history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={account.history.map((s) => ({ date: s.snapshotDate, balance: Number(s.balance) }))}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={profit >= 0 ? "var(--up)" : "var(--down)"} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={profit >= 0 ? "var(--up)" : "var(--down)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-0)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--t4)" }} tickFormatter={(v) => v?.slice(5) ?? ""} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--t4)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} domain={["dataMin - 500", "dataMax + 500"]} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="glass-strong rounded-[var(--r-sm)] px-3 py-1.5">
                      <p className="f-micro">{label}</p>
                      <p className="f-num-sm text-t1">${Number(payload[0].value).toLocaleString()}</p>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey="balance" stroke={profit >= 0 ? "var(--up)" : "var(--down)"} strokeWidth={1.5} fill="url(#balGrad)" animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full f-sub">Update balance daily to build history</div>
          )}
        </div>
      </div>
    </div>
  );
}
