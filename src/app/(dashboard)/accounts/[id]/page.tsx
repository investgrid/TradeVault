"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, MotionCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { DrawdownMeter } from "@/components/accounts/drawdown-meter";
import { ChartContainer } from "@/components/ui/chart-container";
import { PageWrapper, PageSection } from "@/components/layout/page-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AccountDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const id = params.id as string;
  const [balance, setBalance] = useState("");

  const { data: account, refetch, isLoading } = trpc.accounts.getById.useQuery({ id });
  const updateBalance = trpc.accounts.updateBalance.useMutation({ onSuccess: () => { refetch(); setBalance(""); } });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (!account) {
    return <div className="flex items-center justify-center py-20 text-text-muted">Account not found</div>;
  }

  const profit = Number(account.currentBalance) - Number(account.initialBalance ?? account.currentBalance);
  const profitPercent = account.initialBalance ? (profit / Number(account.initialBalance)) * 100 : 0;

  return (
    <PageWrapper>
      {/* Header */}
      <PageSection>
        <div className="flex items-center gap-4">
          <Link href="/accounts" className="rounded-[var(--radius-md)] p-2 text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-bg-elevated text-[12px] font-bold text-text-secondary ring-1 ring-border-subtle">
                {(account.firm?.[0] ?? account.type[0]).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h2 className="text-heading-lg text-text-primary">{account.name}</h2>
                <span className="text-[12px] text-text-muted">{account.firm ?? t(`accounts.types.${account.type}`)}</span>
              </div>
            </div>
            <Badge variant={account.status === "active" ? "profit" : account.status === "breached" ? "loss" : "default"} dot size="md">
              {t(`accounts.statuses.${account.status}`)}
            </Badge>
          </div>
        </div>
      </PageSection>

      {/* Balance Hero */}
      <PageSection>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-6 gradient-border card-shadow"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-caption text-text-muted">
                {t("accounts.detail.currentBalance")}
              </span>
              <AnimatedNumber
                value={Number(account.currentBalance)}
                format={(n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                className="text-hero text-text-primary"
              />
              {account.initialBalance && (
                <div className="flex items-center gap-1.5">
                  {profit >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-profit" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-loss" />
                  )}
                  <span className={`text-[13px] font-medium ${profit >= 0 ? "text-profit" : "text-loss"}`}>
                    {profit >= 0 ? "+" : ""}{formatCurrency(profit)} ({profitPercent >= 0 ? "+" : ""}{profitPercent.toFixed(1)}%)
                  </span>
                  <span className="text-[12px] text-text-muted">from initial</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="balance"
                placeholder="New balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-36"
              />
              <Button
                size="sm"
                isLoading={updateBalance.isPending}
                disabled={!balance}
                onClick={() => updateBalance.mutate({ id, balance })}
              >
                Update
              </Button>
            </div>
          </div>
        </motion.div>
      </PageSection>

      {/* Drawdown + Stats */}
      <PageSection>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 lg:grid-cols-2"
        >
          {/* Drawdown */}
          {account.drawdown && (
            <MotionCard variants={staggerItem} variant="elevated">
              <DrawdownMeter
                usedPercent={account.drawdown.usedPercent}
                remainingValue={account.drawdown.remainingAmount}
                breachPrice={account.drawdown.breachPrice}
                type={account.funded?.maxDrawdownType as any}
              />
            </MotionCard>
          )}

          {/* Stats Grid */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
            {account.funded && (
              <>
                <Card className="flex flex-col gap-1.5">
                  <span className="text-caption text-text-muted">Challenge Cost</span>
                  <span className="text-metric text-[18px] text-text-primary">
                    ${Number(account.funded.challengeCost ?? 0).toLocaleString()}
                  </span>
                </Card>
                <Card className="flex flex-col gap-1.5">
                  <span className="text-caption text-text-muted">Profit Split</span>
                  <span className="text-metric text-[18px] text-text-primary">
                    {account.funded.profitSplitPct ?? 80}%
                  </span>
                </Card>
              </>
            )}
            <Card className="flex flex-col gap-1.5">
              <span className="text-caption text-text-muted">Total Payouts</span>
              <span className="text-metric text-[18px] text-profit">—</span>
            </Card>
            <Card className="flex flex-col gap-1.5">
              <span className="text-caption text-text-muted">ROI</span>
              <span className="text-metric text-[18px] text-profit">—</span>
            </Card>
          </motion.div>
        </motion.div>
      </PageSection>

      {/* Balance History Chart */}
      <PageSection>
        <ChartContainer
          title={t("accounts.detail.balanceHistory")}
          subtitle="Balance evolution over time"
          isEmpty={!account.history || account.history.length === 0}
          emptyMessage="Update your balance daily to see history"
          height="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={account.history?.map((s) => ({ date: s.snapshotDate, balance: Number(s.balance) })) ?? []}
              margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
            >
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={profit >= 0 ? "var(--profit)" : "var(--loss)"} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={profit >= 0 ? "var(--profit)" : "var(--loss)"} stopOpacity={0} />
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
                domain={["dataMin - 1000", "dataMax + 1000"]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="glass-strong rounded-[var(--radius-md)] px-3 py-2 shadow-lg">
                      <p className="text-[10px] text-text-muted">{label}</p>
                      <p className="text-code text-[12px] text-text-primary">
                        ${Number(payload[0].value).toLocaleString()}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={profit >= 0 ? "var(--profit)" : "var(--loss)"}
                strokeWidth={2}
                fill="url(#balanceGradient)"
                animationBegin={200}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </PageSection>
    </PageWrapper>
  );
}
