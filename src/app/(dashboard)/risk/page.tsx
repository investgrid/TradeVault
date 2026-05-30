"use client";

import Link from "next/link";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function RiskPage() {
  const { data: accounts } = trpc.accounts.list.useQuery();
  const funded = accounts?.filter((a) => a.type === "funded" && a.status === "active") ?? [];
  const breached = accounts?.filter((a) => a.status === "breached") ?? [];
  const totalExposure = funded.reduce((s, a) => s + Number(a.currentBalance), 0);

  const rows = funded.map((acc) => {
    const initial = Number(acc.initialBalance ?? acc.currentBalance);
    const current = Number(acc.currentBalance);
    const maxDdPct = 10;
    const maxDdAbs = initial * (maxDdPct / 100);
    const loss = Math.max(0, initial - current);
    const usage = maxDdAbs > 0 ? (loss / maxDdAbs) * 100 : 0;
    const remaining = Math.max(0, maxDdAbs - loss);
    const breach = initial - maxDdAbs;
    const state: "safe" | "warn" | "danger" = usage >= 90 ? "danger" : usage >= 60 ? "warn" : "safe";
    return { ...acc, usage, remaining, breach, maxDdAbs, loss, state };
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
          {danger === 0 && warn === 0 && <span className="pill pill-up"><CheckCircle className="h-2.5 w-2.5" />All clear</span>}
        </div>
      </div>

      {/* KPIs */}
      <div className="metric-grid grid-cols-2 lg:grid-cols-4">
        <div className="metric-cell">
          <span className="f-label">Global Exposure</span>
          <span className="f-value text-t1">{formatCurrency(totalExposure)}</span>
          <span className="f-sub">{funded.length} accounts</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Avg DD Usage</span>
          <span className={`f-value ${avgUsage < 50 ? "text-up" : avgUsage < 80 ? "text-warn" : "text-down"}`}>{avgUsage.toFixed(1)}%</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Total Buffer</span>
          <span className="f-value text-up">{formatCurrency(totalBuffer)}</span>
        </div>
        <div className="metric-cell">
          <span className="f-label">Breached All-Time</span>
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
                        <div className="f-micro">{r.firm ?? "Funded"}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="f-num-sm">{formatCurrency(Number(r.currentBalance))}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 dd-track">
                        <div className={`dd-fill ${r.state === "safe" ? "dd-fill-safe" : r.state === "warn" ? "dd-fill-warn" : "dd-fill-danger"}`} style={{ width: `${r.usage}%` }} />
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
          <div className="flex items-center justify-center h-[160px] f-sub">No funded accounts to monitor</div>
        )}
      </div>
    </div>
  );
}
