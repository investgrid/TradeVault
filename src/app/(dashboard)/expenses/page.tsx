"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { Plus, X } from "lucide-react";

const CATEGORIES = ["challenge_fees", "failed_challenge_fees", "subscriptions", "vps", "data_feeds", "education", "software", "banking_fees", "crypto_fees", "taxes_estimated", "other"] as const;

export default function ExpensesPage() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    category: "challenge_fees", amount: "", vendor: "", description: "",
    expenseDate: new Date().toISOString().split("T")[0], isRecurring: false, recurrenceFrequency: "monthly",
  });

  const { data: expenses, refetch } = trpc.expenses.list.useQuery();
  const createMutation = trpc.expenses.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });

  const filtered = expenses?.filter((e) => filter === "all" || e.category === filter) ?? [];
  const thisMonth = expenses?.filter((e) => {
    const d = new Date(e.expenseDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + Number(e.amount), 0) ?? 0;
  const ytd = expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      category: form.category,
      amount: form.amount,
      vendor: form.vendor || undefined,
      description: form.description || undefined,
      expenseDate: form.expenseDate,
      isRecurring: form.isRecurring,
      recurrenceFrequency: form.isRecurring ? form.recurrenceFrequency as any : undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-text-secondary">{t("expenses.subtitle")}</p>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />{t("expenses.addExpense")}</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-border-subtle bg-bg-surface p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="text-[15px] font-semibold text-text-primary">{t("expenses.addExpense")}</Dialog.Title>
                <Dialog.Close asChild><button className="text-text-muted hover:text-text-secondary"><X className="h-4 w-4" /></button></Dialog.Close>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">{t("expenses.category")}</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="h-9 rounded-[var(--radius-md)] border border-border-default bg-bg-elevated px-3 text-[13px] text-text-primary">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{t(`expenses.categories.${c}`)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input id="amount" label={t("expenses.amount")} type="number" placeholder="499" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                  <Input id="date" label={t("expenses.date")} type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} required />
                </div>
                <Input id="vendor" label={t("expenses.vendor")} placeholder="TradingView, FTMO..." value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
                <Input id="desc" label={t("expenses.description")} placeholder="Optional note" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                    className="h-4 w-4 rounded border-border-default bg-bg-elevated accent-accent" />
                  <label htmlFor="recurring" className="text-[12px] text-text-secondary">{t("expenses.recurring")}</label>
                  {form.isRecurring && (
                    <select value={form.recurrenceFrequency} onChange={(e) => setForm({ ...form, recurrenceFrequency: e.target.value })}
                      className="h-7 rounded-[var(--radius-sm)] border border-border-default bg-bg-elevated px-2 text-[11px] text-text-primary">
                      <option value="weekly">{t("expenses.frequencies.weekly")}</option>
                      <option value="monthly">{t("expenses.frequencies.monthly")}</option>
                      <option value="quarterly">{t("expenses.frequencies.quarterly")}</option>
                      <option value="annual">{t("expenses.frequencies.annual")}</option>
                    </select>
                  )}
                </div>
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
        <MetricCard label={t("expenses.thisMonth")} value={`$${thisMonth.toLocaleString()}`} changeType="negative" />
        <MetricCard label={t("expenses.yearToDate")} value={`$${ytd.toLocaleString()}`} />
        <MetricCard label={t("expenses.expenseRatio")} value="—" />
        <MetricCard label={t("expenses.topCategory")} value="—" />
      </section>

      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="border-b border-border-subtle px-5 py-3 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setFilter("all")} className={`whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-semibold ${filter === "all" ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text-secondary"}`}>
              {t("common.all")}
            </button>
            {CATEGORIES.slice(0, 6).map((c) => (
              <button key={c} onClick={() => setFilter(c)} className={`whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-semibold ${filter === c ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text-secondary"}`}>
                {t(`expenses.categories.${c}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border-subtle">
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
              {expenses ? "No expenses found" : t("common.loading")}
            </div>
          )}
          {filtered.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between px-5 py-4 transition-all hover:bg-bg-elevated/50">
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-text-primary">
                    {expense.vendor ?? t(`expenses.categories.${expense.category}`)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted">{expense.expenseDate}</span>
                    {expense.isRecurring && <Badge variant="accent">Recurring</Badge>}
                  </div>
                </div>
              </div>
              <span className="font-numbers text-[13px] font-medium text-loss">
                -${Number(expense.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
