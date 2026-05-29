"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { Plus, X } from "lucide-react";

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-text-secondary">{t("accounts.subtitle")}</p>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />{t("accounts.addAccount")}</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="text-[15px] font-semibold text-text-primary">{t("accounts.addAccount")}</Dialog.Title>
                <Dialog.Close asChild><button className="text-text-muted hover:text-text-secondary"><X className="h-4 w-4" /></button></Dialog.Close>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input id="name" label={t("accounts.name")} placeholder="FTMO #123456" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">{t("accounts.type")}</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ACCOUNT_TYPES.map((type) => (
                      <button key={type} type="button" onClick={() => setForm({ ...form, type })}
                        className={`rounded-[var(--radius-sm)] border px-2 py-1.5 text-[10px] font-medium transition-all ${form.type === type ? "border-accent bg-accent-soft text-accent" : "border-border-subtle bg-bg-elevated text-text-muted hover:text-text-secondary"}`}>
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
                {form.type === "funded" && (
                  <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated/50 p-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Funded Parameters</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {DD_TYPES.map((dd) => (
                        <button key={dd} type="button" onClick={() => setForm({ ...form, maxDrawdownType: dd })}
                          className={`rounded-[var(--radius-sm)] border px-2 py-1.5 text-[10px] font-medium ${form.maxDrawdownType === dd ? "border-accent bg-accent-soft text-accent" : "border-border-subtle text-text-muted"}`}>
                          {t(`accounts.funded.drawdownTypes.${dd}`)}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input id="maxDD" label="Max DD %" type="number" placeholder="10" value={form.maxDrawdownPct} onChange={(e) => setForm({ ...form, maxDrawdownPct: e.target.value })} />
                      <Input id="cost" label={t("accounts.funded.challengeCost")} type="number" placeholder="499" value={form.challengeCost} onChange={(e) => setForm({ ...form, challengeCost: e.target.value })} />
                      <Input id="split" label={t("accounts.funded.profitSplit")} type="number" placeholder="80" value={form.profitSplitPct} onChange={(e) => setForm({ ...form, profitSplitPct: e.target.value })} />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" type="button" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t("accounts.totalAccounts")} value={String(accounts?.length ?? 0)} />
        <MetricCard label={t("accounts.totalCapital")} value={`$${totalCapital.toLocaleString()}`} />
        <MetricCard label={t("accounts.activeFunded")} value={String(activeFunded)} />
        <MetricCard label={t("accounts.breached")} value={String(breached)} changeType={breached > 0 ? "negative" : "neutral"} />
      </section>

      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="border-b border-border-subtle px-5 py-3">
          <div className="flex items-center gap-1.5">
            {["all", ...ACCOUNT_TYPES].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-semibold transition-all ${filter === f ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text-secondary"}`}>
                {f === "all" ? t("common.all") : t(`accounts.types.${f}`).split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border-subtle">
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
              {accounts ? "No accounts found" : t("common.loading")}
            </div>
          )}
          {filtered.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}
              className="flex items-center justify-between px-5 py-4 transition-all hover:bg-bg-elevated/50">
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-bg-elevated text-[10px] font-bold text-text-secondary ring-1 ring-border-subtle">
                  {(account.firm?.[0] ?? account.type[0]).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-text-primary">{account.name}</span>
                  <span className="text-[11px] text-text-muted">{account.firm ?? account.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-numbers text-[13px] font-medium text-text-primary">
                  ${Number(account.currentBalance).toLocaleString()}
                </span>
                <Badge variant={account.status === "active" ? "profit" : account.status === "breached" ? "loss" : "default"} dot>
                  {t(`accounts.statuses.${account.status}`)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
