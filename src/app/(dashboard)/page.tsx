"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const t = useTranslations();
  const { data: dashboard } = trpc.analytics.dashboard.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const { data: payouts } = trpc.income.list.useQuery();
  const { data: cashflow } = trpc.analytics.cashflow.useQuery();

  const fundedAccounts = accounts?.filter((a) => a.type === "funded" && a.status === "active") ?? [];
  const recentPayouts = payouts?.slice(0, 4) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Metrics */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label={t("dashboard.netWorth")}
          value={dashboard ? formatCurrency(dashboard.netWorth) : "—"}
          change={dashboard ? formatPercent(dashboard.growthMoM) + " " + t("dashboard.vsLastMonth") : ""}
          changeType={dashboard && dashboard.growthMoM >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label={t("dashboard.fundedCapital")}
          value={dashboard ? formatCurrency(dashboard.fundedCapital) : "—"}
          change={dashboard ? `${dashboard.fundedCount} active` : ""}
          changeType="neutral"
        />
        <MetricCard
          label={t("dashboard.realCapital")}
          value={dashboard ? formatCurrency(dashboard.realCapital) : "—"}
          changeType="neutral"
        />
        <MetricCard
          label={t("dashboard.pendingPayouts")}
          value={dashboard ? formatCurrency(dashboard.pendingPayouts) : "—"}
          changeType="neutral"
        />
        <MetricCard
          label={t("dashboard.monthlyNet")}
          value={dashboard ? formatCurrency(dashboard.monthlyNet) : "—"}
          changeType={dashboard && dashboard.monthlyNet >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label={t("dashboard.growthMoM")}
          value={dashboard ? formatPercent(dashboard.growthMoM) : "—"}
          changeType={dashboard && dashboard.growthMoM >= 0 ? "positive" : "negative"}
        />
      </section>

      {/* Charts Row */}
      <section className="grid gap-4 lg:grid-cols-5">
        <Card variant="elevated" className="lg:col-span-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-text-primary">
                {t("dashboard.equityEvolution")}
              </h2>
              <div className="flex gap-1">
                {["1M", "3M", "6M", "1Y"].map((p) => (
                  <button key={p} className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${p === "3M" ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text-secondary"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex h-[200px] items-end justify-between gap-1 px-2">
              {cashflow && cashflow.length > 0 ? (
                cashflow.map((m, i) => {
                  const max = Math.max(...cashflow.map((c) => c.income || 1));
                  const h = max > 0 ? (m.income / max) * 100 : 5;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full flex-col items-center" style={{ height: "180px", justifyContent: "flex-end" }}>
                        <div className="w-full rounded-t-sm bg-gradient-to-t from-accent/40 to-accent/80 transition-all hover:from-accent/60 hover:to-accent" style={{ height: `${Math.max(5, h)}%` }} />
                      </div>
                      <span className="text-[9px] text-text-muted">{m.month.slice(5)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex w-full items-center justify-center text-[12px] text-text-muted">
                  {t("dashboard.emptyChart")}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-[13px] font-semibold text-text-primary">{t("dashboard.capitalAllocation")}</h2>
            {dashboard && dashboard.netWorth > 0 ? (
              <>
                <div className="flex flex-1 items-center justify-center py-4">
                  <div className="relative h-[140px] w-[140px]">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" strokeWidth="8"
                        strokeDasharray={`${(dashboard.fundedCapital / dashboard.netWorth) * 251} 251`} strokeLinecap="round" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--profit)" strokeWidth="8"
                        strokeDasharray={`${(dashboard.realCapital / dashboard.netWorth) * 251} 251`}
                        strokeDashoffset={`-${(dashboard.fundedCapital / dashboard.netWorth) * 251}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-numbers text-[16px] font-semibold text-text-primary">{formatCurrency(dashboard.netWorth, "USD", true)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-accent" /><span className="text-[11px] text-text-secondary">Funded</span></div>
                    <span className="font-numbers text-[11px] text-text-primary">{formatCurrency(dashboard.fundedCapital)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-profit" /><span className="text-[11px] text-text-secondary">Real</span></div>
                    <span className="font-numbers text-[11px] text-text-primary">{formatCurrency(dashboard.realCapital)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-[12px] text-text-muted">{t("dashboard.noData")}</div>
            )}
          </div>
        </Card>
      </section>

      {/* Funded Accounts */}
      {fundedAccounts.length > 0 && (
        <section>
          <h2 className="mb-3 text-[13px] font-semibold text-text-primary">{t("dashboard.fundedAccounts")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {fundedAccounts.slice(0, 6).map((acc) => {
              const profit = Number(acc.currentBalance) - Number(acc.initialBalance ?? acc.currentBalance);
              return (
                <Link key={acc.id} href={`/accounts/${acc.id}`}>
                  <Card variant="elevated" className="p-4 hover:border-border-default transition-all">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-bg-elevated text-[10px] font-bold text-text-secondary ring-1 ring-border-subtle">
                            {(acc.firm?.[0] ?? "F").toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-semibold text-text-primary">{acc.name}</span>
                            <span className="text-[10px] text-text-muted">{acc.firm ?? "Funded"}</span>
                          </div>
                        </div>
                        <Badge variant="profit" dot>Active</Badge>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-numbers text-[18px] font-semibold text-text-primary">
                          {formatCurrency(Number(acc.currentBalance))}
                        </span>
                        <span className={`flex items-center gap-0.5 font-numbers text-[11px] font-medium ${profit >= 0 ? "text-profit" : "text-loss"}`}>
                          {profit >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {formatCurrency(Math.abs(profit))}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Payout Timeline */}
      {recentPayouts.length > 0 && (
        <section>
          <Card variant="elevated">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-text-primary">{t("dashboard.payoutTimeline")}</h2>
                <Link href="/payouts" className="text-[11px] font-medium text-accent hover:text-accent-hover transition-colors">View all</Link>
              </div>
              <div className="flex flex-col gap-2">
                {recentPayouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-[var(--radius-md)] bg-bg-elevated/50 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-1.5 w-1.5 rounded-full ${p.status === "received" ? "bg-profit" : p.status === "processing" ? "bg-pending" : "bg-text-muted"}`} />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-text-primary">
                          {accounts?.find((a) => a.id === p.accountId)?.name ?? "Payout"}
                        </span>
                        <span className="text-[10px] text-text-muted">{p.receivedAt ?? p.requestedAt ?? ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-numbers text-[12px] font-medium text-text-primary">
                        {formatCurrency(Number(p.amountNet ?? p.amountGross))}
                      </span>
                      <Badge variant={p.status === "received" ? "profit" : p.status === "processing" ? "pending" : "default"} dot>
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Empty state */}
      {(!accounts || accounts.length === 0) && (
        <Card variant="glow" className="flex flex-col items-center gap-4 py-12 text-center">
          <img src="/logo.png" alt="TradeVault" width={48} height={48} className="rounded-lg opacity-60" />
          <div className="flex flex-col gap-1">
            <h3 className="text-[15px] font-semibold text-text-primary">{t("onboarding.welcome")}</h3>
            <p className="text-[13px] text-text-secondary">{t("onboarding.addFirst")}</p>
          </div>
          <Link href="/accounts" className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-[13px] font-medium text-white hover:bg-accent-hover transition-colors">
            {t("onboarding.addAccount")}
          </Link>
        </Card>
      )}
    </div>
  );
}
