"use client";

import { motion } from "framer-motion";
import { MetricCard } from "@/components/ui/metric-card";
import { MotionCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { DrawdownMeter } from "@/components/accounts/drawdown-meter";
import { ChartContainer, PeriodSelector } from "@/components/ui/chart-container";
import { PageWrapper, PageSection } from "@/components/layout/page-wrapper";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/motion";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Info, AlertCircle, TrendingUp, Wallet, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const t = useTranslations();
  const { data: dashboard, isLoading: dashLoading } = trpc.analytics.dashboard.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const { data: payouts } = trpc.income.list.useQuery();
  const { data: cashflow } = trpc.analytics.cashflow.useQuery();
  const { data: netWorthHistory } = trpc.analytics.netWorthHistory.useQuery();
  const { data: insights } = trpc.insights.generate.useQuery();
  const [period, setPeriod] = useState("3M");

  const fundedAccounts = accounts?.filter((a) => a.type === "funded" && a.status === "active") ?? [];
  const recentPayouts = payouts?.slice(0, 5) ?? [];

  return (
    <PageWrapper>
      {/* Hero Metrics */}
      <PageSection>
        {dashLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6"
          >
            <MetricCard
              label={t("dashboard.netWorth")}
              value={dashboard ? formatCurrency(dashboard.netWorth) : "—"}
              numericValue={dashboard?.netWorth}
              format={(n) => formatCurrency(n)}
              change={dashboard ? formatPercent(dashboard.growthMoM) + " vs last month" : ""}
              changeType={dashboard && dashboard.growthMoM >= 0 ? "positive" : "negative"}
              variant="hero"
            />
            <MetricCard
              label={t("dashboard.fundedCapital")}
              value={dashboard ? formatCurrency(dashboard.fundedCapital) : "—"}
              numericValue={dashboard?.fundedCapital}
              format={(n) => formatCurrency(n)}
              change={dashboard ? `${dashboard.fundedCount} active` : ""}
              changeType="neutral"
            />
            <MetricCard
              label={t("dashboard.realCapital")}
              value={dashboard ? formatCurrency(dashboard.realCapital) : "—"}
              numericValue={dashboard?.realCapital}
              format={(n) => formatCurrency(n)}
              changeType="neutral"
            />
            <MetricCard
              label={t("dashboard.pendingPayouts")}
              value={dashboard ? formatCurrency(dashboard.pendingPayouts) : "—"}
              numericValue={dashboard?.pendingPayouts}
              format={(n) => formatCurrency(n)}
              change={dashboard && dashboard.pendingPayouts > 0 ? "awaiting" : ""}
              changeType={dashboard && dashboard.pendingPayouts > 0 ? "neutral" : "neutral"}
            />
            <MetricCard
              label={t("dashboard.monthlyNet")}
              value={dashboard ? formatCurrency(dashboard.monthlyNet) : "—"}
              numericValue={dashboard?.monthlyNet}
              format={(n) => formatCurrency(n)}
              changeType={dashboard && dashboard.monthlyNet >= 0 ? "positive" : "negative"}
            />
            <MetricCard
              label={t("dashboard.growthMoM")}
              value={dashboard ? formatPercent(dashboard.growthMoM) : "—"}
              changeType={dashboard && dashboard.growthMoM >= 0 ? "positive" : "negative"}
            />
          </motion.div>
        )}
      </PageSection>

      {/* Charts Row */}
      <PageSection>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 lg:grid-cols-5"
        >
          {/* Net Worth / Equity Evolution */}
          <ChartContainer
            title={t("dashboard.equityEvolution")}
            subtitle="Net worth trend"
            className="lg:col-span-3"
            isEmpty={!netWorthHistory || netWorthHistory.length === 0}
            emptyMessage="Add accounts and update balances to see your equity evolution"
            actions={
              <PeriodSelector
                periods={["1M", "3M", "6M", "1Y"]}
                active={period}
                onChange={setPeriod}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthHistory ?? []} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v) => v?.slice(5) ?? ""}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#netWorthGradient)"
                  animationBegin={200}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Capital Allocation */}
          <ChartContainer
            title={t("dashboard.capitalAllocation")}
            subtitle="Portfolio breakdown"
            className="lg:col-span-2"
            isEmpty={!dashboard || dashboard.netWorth === 0}
            emptyMessage="Add accounts to see allocation"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              {dashboard && dashboard.netWorth > 0 && (
                <>
                  <div className="relative h-[130px] w-[130px]">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-subtle)" strokeWidth="7" />
                      <motion.circle
                        cx="50" cy="50" r="38" fill="none" stroke="var(--accent)" strokeWidth="7"
                        strokeDasharray={`${(dashboard.fundedCapital / dashboard.netWorth) * 239} 239`}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 239 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                      />
                      <motion.circle
                        cx="50" cy="50" r="38" fill="none" stroke="var(--profit)" strokeWidth="7"
                        strokeDasharray={`${(dashboard.realCapital / dashboard.netWorth) * 239} 239`}
                        strokeDashoffset={`-${(dashboard.fundedCapital / dashboard.netWorth) * 239}`}
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-text-muted">Total</span>
                      <span className="text-metric text-[15px] text-text-primary">
                        {formatCurrency(dashboard.netWorth, "USD", true)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                        <span className="text-[12px] text-text-secondary">Funded Capital</span>
                      </div>
                      <span className="text-code text-text-primary">{formatCurrency(dashboard.fundedCapital)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-profit" />
                        <span className="text-[12px] text-text-secondary">Real Capital</span>
                      </div>
                      <span className="text-code text-text-primary">{formatCurrency(dashboard.realCapital)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ChartContainer>
        </motion.div>
      </PageSection>

      {/* Funded Accounts */}
      {fundedAccounts.length > 0 && (
        <PageSection>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading text-text-primary">{t("dashboard.fundedAccounts")}</h2>
            <Link href="/accounts" className="text-[12px] font-medium text-accent hover:text-accent-hover transition-colors">
              View all
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            {fundedAccounts.slice(0, 6).map((acc) => {
              const profit = Number(acc.currentBalance) - Number(acc.initialBalance ?? acc.currentBalance);
              return (
                <motion.div key={acc.id} variants={staggerItem}>
                  <Link href={`/accounts/${acc.id}`}>
                    <MotionCard variant="interactive" className="p-4" whileHover={hoverLift}>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-bg-elevated text-[11px] font-bold text-text-secondary ring-1 ring-border-subtle">
                              {(acc.firm?.[0] ?? "F").toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-semibold text-text-primary">{acc.name}</span>
                              <span className="text-[11px] text-text-muted">{acc.firm ?? "Funded"}</span>
                            </div>
                          </div>
                          <Badge variant="profit" dot>Active</Badge>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-display text-[20px] text-text-primary">
                            {formatCurrency(Number(acc.currentBalance))}
                          </span>
                          <span className={`flex items-center gap-0.5 text-code text-[11px] font-medium ${profit >= 0 ? "text-profit" : "text-loss"}`}>
                            {profit >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {formatCurrency(Math.abs(profit))}
                          </span>
                        </div>
                      </div>
                    </MotionCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </PageSection>
      )}

      {/* Cashflow + Payout Timeline */}
      <PageSection>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 lg:grid-cols-2"
        >
          {/* Cashflow Chart */}
          <ChartContainer
            title="Monthly Cashflow"
            subtitle="Income vs expenses"
            isEmpty={!cashflow || cashflow.length === 0}
            emptyMessage="Record payouts and expenses to see cashflow"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow ?? []} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v) => v?.slice(5) ?? ""}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="income"
                  fill="var(--profit)"
                  radius={[3, 3, 0, 0]}
                  opacity={0.8}
                  animationBegin={300}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--loss)"
                  radius={[3, 3, 0, 0]}
                  opacity={0.6}
                  animationBegin={500}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Payout Timeline */}
          <MotionCard variants={staggerItem} variant="default" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-heading text-text-primary">{t("dashboard.payoutTimeline")}</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Recent payouts</p>
              </div>
              <Link href="/payouts" className="text-[11px] font-medium text-accent hover:text-accent-hover transition-colors">
                View all
              </Link>
            </div>
            {recentPayouts.length > 0 ? (
              <div className="relative flex flex-col gap-0.5">
                {/* Connecting line */}
                <div className="absolute left-[7px] top-4 bottom-4 w-px bg-border-subtle" />

                {recentPayouts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 hover:bg-bg-elevated/40 transition-colors"
                  >
                    {/* Status dot */}
                    <div className={`relative z-10 h-[9px] w-[9px] rounded-full ring-2 ring-bg-surface ${
                      p.status === "received" ? "bg-profit" :
                      p.status === "processing" ? "bg-pending animate-pulse-glow" :
                      "bg-text-muted"
                    }`} />

                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-text-primary">
                          {accounts?.find((a) => a.id === p.accountId)?.name ?? "Payout"}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {p.receivedAt ?? p.requestedAt ?? ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-code text-[12px] font-medium text-text-primary">
                          {formatCurrency(Number(p.amountNet ?? p.amountGross))}
                        </span>
                        <Badge
                          variant={p.status === "received" ? "profit" : p.status === "processing" ? "pending" : "default"}
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] text-center">
                <Clock className="h-8 w-8 text-text-muted/50 mb-2" />
                <p className="text-[12px] text-text-muted">No payouts yet</p>
              </div>
            )}
          </MotionCard>
        </motion.div>
      </PageSection>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <PageSection>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2"
          >
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className={`flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5 transition-all ${
                  insight.severity === "critical"
                    ? "border-loss/20 bg-loss-muted glow-loss"
                    : insight.severity === "warning"
                    ? "border-pending/20 bg-pending-muted"
                    : "border-border-subtle bg-bg-elevated/30"
                }`}
              >
                {insight.severity === "critical" ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-loss" />
                ) : insight.severity === "warning" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-pending" />
                ) : (
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                )}
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[12px] font-semibold text-text-primary">{insight.title}</span>
                  <span className="text-[11px] text-text-secondary leading-relaxed">{insight.body}</span>
                </div>
                {insight.actionUrl && (
                  <Link href={insight.actionUrl} className="shrink-0 text-[11px] font-medium text-accent hover:text-accent-hover transition-colors">
                    View
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </PageSection>
      )}

      {/* Empty state */}
      {(!accounts || accounts.length === 0) && !dashLoading && (
        <PageSection>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border-default bg-bg-surface p-12 text-center gradient-border"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent" />
            <div className="relative flex flex-col items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft border border-accent/10 animate-float">
                <Wallet className="h-7 w-7 text-accent" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-heading-lg text-text-primary">{t("onboarding.welcome")}</h3>
                <p className="text-[13px] text-text-secondary max-w-sm mx-auto leading-relaxed">
                  {t("onboarding.addFirst")}
                </p>
              </div>
              <Link
                href="/onboarding"
                className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-accent to-accent-hover px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_2px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200"
              >
                <TrendingUp className="h-4 w-4" />
                Get Started
              </Link>
            </div>
          </motion.div>
        </PageSection>
      )}
    </PageWrapper>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-[var(--radius-md)] px-3 py-2 shadow-lg">
      <p className="text-[10px] text-text-muted mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-code text-[12px] text-text-primary">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}
