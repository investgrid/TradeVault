"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/ui/metric-card";
import { MotionCard } from "@/components/ui/card";
import { ChartContainer, PeriodSelector } from "@/components/ui/chart-container";
import { PageWrapper, PageSection } from "@/components/layout/page-wrapper";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-[var(--radius-md)] px-3 py-2 shadow-lg">
      <p className="text-[10px] text-text-muted mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-code text-[12px] text-text-primary">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: entry.color }} />
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const t = useTranslations();
  const [period, setPeriod] = useState("6M");
  const { data: roi } = trpc.analytics.challengeROI.useQuery();
  const { data: consistency } = trpc.analytics.payoutConsistency.useQuery();
  const { data: survival } = trpc.analytics.accountSurvival.useQuery();
  const { data: cashflow } = trpc.analytics.cashflow.useQuery();
  const { data: netWorth } = trpc.analytics.netWorthHistory.useQuery();
  const { data: firms } = trpc.analytics.firmPerformance.useQuery();

  return (
    <PageWrapper>
      {/* KPI Row */}
      <PageSection>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label={t("analytics.challengeROI")}
            value={roi ? `+${roi.roi.toFixed(0)}%` : "—"}
            change={t("analytics.allTime")}
            changeType="positive"
          />
          <MetricCard
            label={t("analytics.fundedCapitalROI")}
            value="—"
            change={t("analytics.monthlyAvg")}
            changeType="neutral"
          />
          <MetricCard
            label={t("analytics.payoutConsistency")}
            value={consistency ? `${consistency.consistency.toFixed(0)}%` : "—"}
            change={consistency ? `${consistency.monthsWithPayout}/${consistency.totalMonths} months` : ""}
            changeType="positive"
          />
          <MetricCard
            label={t("analytics.accountSurvival")}
            value={survival ? `${survival.rate.toFixed(0)}%` : "—"}
            change={survival ? `${survival.active}/${survival.total} accounts` : ""}
            changeType="neutral"
          />
        </motion.div>
      </PageSection>

      {/* Charts */}
      <PageSection>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 lg:grid-cols-2">
          {/* Net Worth Growth */}
          <ChartContainer
            title={t("analytics.netWorthGrowth")}
            subtitle="Portfolio value over time"
            isEmpty={!netWorth || netWorth.length === 0}
            emptyMessage="Add balance snapshots to see growth"
            actions={
              <PeriodSelector
                periods={["3M", "6M", "1Y", "All"]}
                active={period}
                onChange={setPeriod}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorth ?? []} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsNWGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v?.slice(5) ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="netWorth" stroke="var(--accent)" strokeWidth={2} fill="url(#analyticsNWGrad)" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Cashflow */}
          <ChartContainer
            title={t("analytics.cashflowWaterfall")}
            subtitle="Monthly income vs expenses"
            isEmpty={!cashflow || cashflow.length === 0}
            emptyMessage="Record payouts and expenses to see cashflow"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow ?? []} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v?.slice(5) ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income" name="Income" fill="var(--profit)" radius={[3, 3, 0, 0]} opacity={0.85} animationBegin={300} animationDuration={1000} />
                <Bar dataKey="expenses" name="Expenses" fill="var(--loss)" radius={[3, 3, 0, 0]} opacity={0.65} animationBegin={500} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </PageSection>

      {/* Firm Performance */}
      <PageSection>
        <MotionCard variants={staggerItem} variant="elevated">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-heading text-text-primary">{t("analytics.firmPerformance")}</h3>
              <p className="text-[11px] text-text-muted mt-0.5">ROI comparison across prop firms</p>
            </div>
          </div>
          {firms && firms.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {firms.map((firm, i) => (
                <motion.div
                  key={firm.firm}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2.5 w-28">
                    <div className="h-7 w-7 rounded-[var(--radius-sm)] bg-bg-elevated flex items-center justify-center text-[9px] font-bold text-text-secondary ring-1 ring-border-subtle">
                      {firm.firm[0]}
                    </div>
                    <span className="text-[12px] font-medium text-text-primary truncate">{firm.firm}</span>
                  </div>
                  <div className="flex-1 h-7 rounded-full bg-bg-inset overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(5, firm.roi > 0 ? (firm.roi / 500) * 100 : 5))}%` }}
                      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-accent/50 to-accent"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-24 justify-end">
                    <span className={`text-code text-[12px] font-semibold ${firm.roi >= 0 ? "text-profit" : "text-loss"}`}>
                      {firm.roi >= 0 ? "+" : ""}{firm.roi.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-text-muted">{firm.count} accts</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-[120px] items-center justify-center text-[12px] text-text-muted">
              Add funded accounts to compare firm performance
            </div>
          )}
        </MotionCard>
      </PageSection>
    </PageWrapper>
  );
}
