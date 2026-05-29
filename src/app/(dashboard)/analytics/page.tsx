"use client";

import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const t = useTranslations();
  const { data: roi } = trpc.analytics.challengeROI.useQuery();
  const { data: consistency } = trpc.analytics.payoutConsistency.useQuery();
  const { data: survival } = trpc.analytics.accountSurvival.useQuery();
  const { data: cashflow } = trpc.analytics.cashflow.useQuery();
  const { data: netWorth } = trpc.analytics.netWorthHistory.useQuery();
  const { data: firms } = trpc.analytics.firmPerformance.useQuery();

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Net Worth Growth */}
        <Card variant="elevated">
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-text-primary">{t("analytics.netWorthGrowth")}</h3>
            <div className="h-[220px]">
              {netWorth && netWorth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={netWorth}>
                    <defs>
                      <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#4e5769" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#4e5769" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1d25", border: "1px solid #252830", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="netWorth" stroke="#6366f1" strokeWidth={2} fill="url(#netWorthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-text-muted">
                  Add balance snapshots to see growth
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Cashflow */}
        <Card variant="elevated">
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-text-primary">{t("analytics.cashflowWaterfall")}</h3>
            <div className="h-[220px]">
              {cashflow && cashflow.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#4e5769" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#4e5769" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1d25", border: "1px solid #252830", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="income" fill="#00d97e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ff4560" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-text-muted">
                  Record payouts and expenses to see cashflow
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Firm Performance */}
        <Card variant="elevated" className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-text-primary">{t("analytics.firmPerformance")}</h3>
            {firms && firms.length > 0 ? (
              <div className="flex flex-col gap-3">
                {firms.map((firm) => (
                  <div key={firm.firm} className="flex items-center gap-4">
                    <span className="w-20 text-[12px] font-medium text-text-secondary truncate">{firm.firm}</span>
                    <div className="flex-1 h-6 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, firm.roi > 0 ? (firm.roi / 500) * 100 : 5))}%` }}
                      />
                    </div>
                    <span className={`font-numbers text-[12px] font-medium w-16 text-right ${firm.roi >= 0 ? "text-profit" : "text-loss"}`}>
                      {firm.roi >= 0 ? "+" : ""}{firm.roi.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[120px] items-center justify-center text-[12px] text-text-muted">
                Add funded accounts to compare firm performance
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
