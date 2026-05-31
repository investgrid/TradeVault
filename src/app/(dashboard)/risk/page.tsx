"use client";

import Link from "next/link";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { Shield, AlertTriangle, CheckCircle, Activity } from "lucide-react";

export default function RiskPage() {
  const { data: accountsData } = trpc.accounts.listWithFunded.useQuery();
  const accounts = accountsData ?? [];
  const funded = accounts.filter((a) => a.type === "funded" && a.status === "active");
  const breached = accounts.filter((a) => a.status === "breached");
  const totalExposure = funded.reduce((s, a) => s + Number(a.currentBalance), 0);

  const rows = funded.map((acc) => {
    const initial = Number(acc.initialBalance ?? acc.currentBalance);
    const current = Number(acc.currentBalance);
    const maxDdPct = acc.funded?.maxDrawdownPct ? Number(acc.funded.maxDrawdownPct) : 10;
    const ddType = acc.funded?.maxDrawdownType ?? "static";
    const hwm = acc.funded?.currentHighWaterMark ? Number(acc.funded.currentHighWaterMark) : initial;

    let maxDdAbs: number;
    let loss: number;

    if (ddType === "trailing" || ddType === "eod_trailing") {
      maxDdAbs = hwm * (maxDdPct / 100);
      loss = Math.max(0, hwm - current);
    } else {
      maxDdAbs = initial * (maxDdPct / 100);
      loss = Math.max(0, initial - current);
    }

    const usage = maxDdAbs > 0 ? (loss / maxDdAbs) * 100 : 0;
    const remaining = Math.max(0, maxDdAbs - loss);
    const breach = ddType === "trailing" || ddType === "eod_trailing"
      ? hwm - maxDdAbs
      : initial - maxDdAbs;
    const state: "safe" | "warn" | "danger" = usage >= 85 ? "danger" : usage >= 60 ? "warn" : "safe";

    return { ...acc, usage, remaining, breach, maxDdAbs, maxDdPct, ddType, loss, state };
  });

  const avgUsage = rows.length > 0 ? rows.reduce((s, r) => s + r.usage, 0) / rows.length : 0;
  const totalBuffer = rows.reduce((s, r) => s + r.remaining, 0);
  const danger = rows.filter((r) => r.state === "danger").length;
  const warn = rows.filter((r) => r.state === "warn").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="h-4 w-4 text-t3" />
          <h2 className="f-title">Risk Control</h2>
        </div>
        <div className="flex items-center gap-2">
          {danger > 0 && <span className="pill pill-down"><AlertTriangle className="h-2.5 w-2.5" />{danger} critical</span>}
          {warn > 0 && <span className="pill pill-warn">{warn} warning</span>}
          {danger === 0 && warn === 0 && funded.length > 0 && <span className="pill pill-up"><CheckCircle className="h-2.5 w-2.5" />All clear</span>}
        </div>
      </div>

      {/* KPIs */}
      <div className="metric-grid grid-cols-2 lg:grid-cols-5">
        <div className="metric-cell metric-cell-accent">
          <span className="f-label">Global Exposure</span>
          <span className="f-value text-t1">{formatCurrency(totalExposure)}</span>
          <span className="f-sub">{funded.length} accounts</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Avg DD Usage</span>
          <span className={`f-value ${avgUsage < 50 ? "text-up" : avgUsage < 75 ? "text-warn" : "text-down"}`}>{avgUsage.toFixed(1)}%</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Total Buffer</span>
          <span className="f-value text-up">{formatCurrency(totalBuffer)}</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">At Risk</span>
          <span className={`f-value ${(danger + warn) > 0 ? "text-warn" : "text-t1"}`}>{danger + warn}</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Breached</span>
          <span className={`f-value ${breached.length > 0 ? "text-down" : "text-up"}`}>{breached.length}</span>
        </div>
      </div>

      {/* Drawdown Table */}
      <div className="card-flush">
        <div className="card-header">
          <span className="f-label">Drawdown Radar</span>
          <span className="f-sub">{rows.length} monitored</span>
        </div>
        {rows.length > 0 ? (
          <table className="tv-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Balance</th>
                <th>DD Type</th>
                <th>DD Usage</th>
                <th>Buffer</th>
                <th>Breach At</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/accounts/${r.id}`} className="flex items-center gap-2 group">
                      <div className="h-5 w-5 rounded bg-layer-4 flex items-center justify-center text-[8px] font-bold text-t3 ring-1 ring-line-1">{(r.firm?.[0] ?? "F").toUpperCase()}</div>
                      <div>
                        <div className="text-[11px] font-medium text-t1 group-hover:text-brand transition-colors">{r.name}</div>
                        <div className="f-micro">{r.firm ?? "Funded"} · {r.maxDdPct}% max</div>
                      </div>
                    </Link>
                  </td>
                  <td className="f-num-sm">{formatCurrency(Number(r.currentBalance))}</td>
                  <td><span className="pill pill-muted">{r.ddType}</span></td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 dd-track">
                        <div className={`dd-fill ${r.state === "safe" ? "dd-fill-safe" : r.state === "warn" ? "dd-fill-warn" : "dd-fill-danger"}`} style={{ width: `${Math.min(100, r.usage)}%` }} />
                      </div>
                      <span className={`f-num-xs font-semibold ${r.state === "safe" ? "text-up" : r.state === "warn" ? "text-warn" : "text-down"}`}>{r.usage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="f-num-sm text-up">{formatCurrency(r.remaining)}</td>
                  <td className="f-num-sm text-down">{formatCurrency(r.breach)}</td>
                  <td><span className={`pill ${r.state === "safe" ? "pill-up" : r.state === "warn" ? "pill-warn" : "pill-down"}`}>{r.state}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Activity className="h-5 w-5 text-t4" />
            <p className="f-sub">Add funded accounts to monitor risk</p>
          </div>
        )}
      </div>

      {/* Breached */}
      {breached.length > 0 && (
        <div className="card-flush">
          <div className="card-header"><span className="f-label text-down">Breached Accounts</span></div>
          <div className="divide-y divide-line-0">
            {breached.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between px-[18px] py-3">
                <div className="flex items-center gap-2.5">
                  <div className="dot dot-down" />
                  <div>
                    <div className="text-[11px] font-medium text-t1">{acc.name}</div>
                    <div className="f-micro">{acc.firm}</div>
                  </div>
                </div>
                <span className="f-num-sm text-down">{formatCurrency(Number(acc.currentBalance))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
