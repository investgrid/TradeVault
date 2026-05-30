"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Card, MotionCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Input } from "@/components/ui/input";
import { PageWrapper, PageSection } from "@/components/layout/page-wrapper";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { staggerContainer, staggerItem, scaleIn, hoverLift } from "@/lib/motion";
import { Plus, X, ArrowRight } from "lucide-react";

const ACCOUNT_TYPES = ["funded", "broker", "exchange", "wallet", "cash"] as const;
const DD_TYPES = ["static", "trailing", "eod_trailing"] as const;

export default function AccountsPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "funded" as string, firm: "", balance: "", initialBalance: "",
    currency: "USD", notes: "",
    challengeCost: "", maxDrawdownType: "static", maxDrawdownPct: "", profitSplitPct: "80",
  });

  const { data: accounts, refetch } = trpc.accounts.list.useQuery();
  const createMutation = trpc.accounts.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });

  const filtered = accounts?.filter((a) => filter === "all" || a.type === filter) ?? [];
  const totalCapital = accounts?.reduce((s, a) => s + Number(a.currentBalance), 0) ?? 0;
  const activeFunded = accounts?.filter((a) => a.type === "funded" && a.status === "active").length ?? 0;
  const breached = accounts?.filter((a) => a.status === "breached").length ?? 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      name: form.name, type: form.type as any, firm: form.firm || undefined,
      currentBalance: form.balance, initialBalance: form.initialBalance || form.balance,
      currency: form.currency,
      funded: form.type === "funded" ? {
        challengeCost: form.challengeCost || undefined,
        maxDrawdownType: form.maxDrawdownType as any,
        maxDrawdownPct: form.maxDrawdownPct || undefined,
        profitSplitPct: form.profitSplitPct,
      } : undefined,
    });
  }

  return (
    <PageWrapper>
      {/* Header */}
      <PageSection>
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-text-secondary">{t("accounts.subtitle")}</p>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {t("accounts.addAccount")}
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
              <Dialog.Content asChild>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={scaleIn}
                  className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-6 shadow-xl card-shadow"
                >
                  <div className="flex items-center justify-between mb-5">
                    <Dialog.Title className="text-heading text-text-primary">{t("accounts.addAccount")}</Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="rounded-[var(--radius-sm)] p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input id="name" label={t("accounts.name")} placeholder="FTMO #123456" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">{t("accounts.type")}</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {ACCOUNT_TYPES.map((type) => (
                          <button key={type} type="button" onClick={() => setForm({ ...form, type })}
                            className={`rounded-[var(--radius-sm)] border px-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                              form.type === type
                                ? "border-accent bg-accent-soft text-accent shadow-sm"
                                : "border-border-subtle bg-bg-elevated text-text-muted hover:text-text-secondary hover:border-border-default"
                            }`}>
                            {t(`accounts.types.${type}`).split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input id="firm" label={t("accounts.firm")} placeholder="FTMO, Apex..." value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input id="balance" label={t("accounts.balance")} type="number" placeholder="50000" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} required />
                      <Input id="initialBalance" label={t("accounts.initialBalance")} type="number" placeholder="50000" value={form.initialBalance} onChange={(e) => setForm({ ...form, initialBalance: e.target.value })} />
                    </div>

                    <AnimatePresence>
                      {form.type === "funded" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-accent/10 bg-accent-soft/30 p-3.5">
                            <span className="text-caption text-accent">Funded Parameters</span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {DD_TYPES.map((dd) => (
                                <button key={dd} type="button" onClick={() => setForm({ ...form, maxDrawdownType: dd })}
                                  className={`rounded-[var(--radius-sm)] border px-2 py-1.5 text-[10px] font-semibold transition-all ${
                                    form.maxDrawdownType === dd
                                      ? "border-accent bg-accent-soft text-accent"
                                      : "border-border-subtle text-text-muted hover:text-text-secondary"
                                  }`}>
                                  {t(`accounts.funded.drawdownTypes.${dd}`)}
                                </button>
                              ))}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <Input id="maxDD" label="Max DD %" type="number" placeholder="10" value={form.maxDrawdownPct} onChange={(e) => setForm({ ...form, maxDrawdownPct: e.target.value })} />
                              <Input id="cost" label="Challenge $" type="number" placeholder="499" value={form.challengeCost} onChange={(e) => setForm({ ...form, challengeCost: e.target.value })} />
                              <Input id="split" label="Split %" type="number" placeholder="80" value={form.profitSplitPct} onChange={(e) => setForm({ ...form, profitSplitPct: e.target.value })} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3 pt-2">
                      <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="flex-1">{t("common.cancel")}</Button>
                      <Button type="submit" className="flex-1" isLoading={createMutation.isPending}>
                        {t("common.save")}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </PageSection>

      {/* Metric cards */}
      <PageSection>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label={t("accounts.totalAccounts")} value={String(accounts?.length ?? 0)} />
          <MetricCard label={t("accounts.totalCapital")} value={formatCurrency(totalCapital)} numericValue={totalCapital} format={(n) => formatCurrency(n)} />
          <MetricCard label={t("accounts.activeFunded")} value={String(activeFunded)} changeType="neutral" />
          <MetricCard label={t("accounts.breached")} value={String(breached)} changeType={breached > 0 ? "negative" : "neutral"} />
        </motion.div>
      </PageSection>

      {/* Account list */}
      <PageSection>
        <Card variant="elevated" className="overflow-hidden p-0">
          {/* Filter tabs */}
          <div className="border-b border-border-subtle px-5 py-3">
            <div className="flex items-center gap-1">
              {["all", ...ACCOUNT_TYPES].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative rounded-[var(--radius-sm)] px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    filter === f
                      ? "text-accent"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {filter === f && (
                    <motion.div
                      layoutId="account-filter"
                      className="absolute inset-0 rounded-[var(--radius-sm)] bg-accent-soft border border-accent/10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">
                    {f === "all" ? t("common.all") : t(`accounts.types.${f}`).split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-border-subtle">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-10 w-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-text-muted">
                    <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 8h6M6 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[13px] text-text-muted">
                  {accounts ? "No accounts match this filter" : t("common.loading")}
                </p>
              </div>
            )}
            {filtered.map((account, i) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/accounts/${account.id}`}
                  className="group flex items-center justify-between px-5 py-4 transition-all hover:bg-bg-elevated/30"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-bg-elevated text-[11px] font-bold text-text-secondary ring-1 ring-border-subtle group-hover:ring-border-default transition-colors">
                      {(account.firm?.[0] ?? account.type[0]).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-text-primary">{account.name}</span>
                      <span className="text-[11px] text-text-muted">{account.firm ?? account.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-code text-[13px] text-text-primary">
                      {formatCurrency(Number(account.currentBalance))}
                    </span>
                    <Badge
                      variant={account.status === "active" ? "profit" : account.status === "breached" ? "loss" : "default"}
                      dot
                    >
                      {t(`accounts.statuses.${account.status}`)}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>
      </PageSection>
    </PageWrapper>
  );
}
