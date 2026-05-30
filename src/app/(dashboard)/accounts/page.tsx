"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { Plus, X, ArrowRight } from "lucide-react";

const TYPES = ["funded", "broker", "exchange", "wallet", "cash"] as const;
const DD_TYPES = ["static", "trailing", "eod_trailing"] as const;

export default function AccountsPage() {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "funded" as string, firm: "", balance: "", initialBalance: "",
    currency: "USD", challengeCost: "", maxDrawdownType: "static", maxDrawdownPct: "", profitSplitPct: "80",
  });

  const { data: accounts, refetch } = trpc.accounts.list.useQuery();
  const create = trpc.accounts.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });

  const filtered = accounts?.filter((a) => filter === "all" || a.type === filter) ?? [];
  const totalCap = accounts?.reduce((s, a) => s + Number(a.currentBalance), 0) ?? 0;
  const activeFunded = accounts?.filter((a) => a.type === "funded" && a.status === "active").length ?? 0;
  const breached = accounts?.filter((a) => a.status === "breached").length ?? 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="f-title">Accounts</h2>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--r-sm)] bg-brand text-white text-[10px] font-medium hover:bg-brand-dim transition-colors">
              <Plus className="h-3 w-3" /> Add Account
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)] border border-line-2 bg-layer-2 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="f-title">Add Account</Dialog.Title>
                <Dialog.Close className="p-1 text-t4 hover:text-t1 transition-colors rounded"><X className="h-4 w-4" /></Dialog.Close>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="FTMO #123456" required />
                <div>
                  <span className="f-label block mb-1.5">Type</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {TYPES.map((t) => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, type: t })} className={`h-7 rounded-[var(--r-sm)] border text-[9px] font-semibold uppercase transition-all ${form.type === t ? "border-brand/30 bg-brand-soft text-brand" : "border-line-1 text-t4 hover:text-t2"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <Field label="Firm" value={form.firm} onChange={(v) => setForm({ ...form, firm: v })} placeholder="FTMO, Apex..." />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Balance" value={form.balance} onChange={(v) => setForm({ ...form, balance: v })} placeholder="50000" type="number" required />
                  <Field label="Initial Balance" value={form.initialBalance} onChange={(v) => setForm({ ...form, initialBalance: v })} placeholder="50000" type="number" />
                </div>

                <AnimatePresence>
                  {form.type === "funded" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="rounded-[var(--r-lg)] border border-brand/10 bg-brand-soft/30 p-3 space-y-3">
                        <span className="f-label text-brand">Funded Parameters</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {DD_TYPES.map((dd) => (
                            <button key={dd} type="button" onClick={() => setForm({ ...form, maxDrawdownType: dd })} className={`h-7 rounded-[var(--r-sm)] border text-[9px] font-semibold transition-all ${form.maxDrawdownType === dd ? "border-brand/30 bg-brand-soft text-brand" : "border-line-1 text-t4"}`}>{dd.replace("_", " ")}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Max DD %" value={form.maxDrawdownPct} onChange={(v) => setForm({ ...form, maxDrawdownPct: v })} placeholder="10" type="number" />
                          <Field label="Cost $" value={form.challengeCost} onChange={(v) => setForm({ ...form, challengeCost: v })} placeholder="499" type="number" />
                          <Field label="Split %" value={form.profitSplitPct} onChange={(v) => setForm({ ...form, profitSplitPct: v })} placeholder="80" type="number" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 h-9 rounded-[var(--r-md)] border border-line-1 text-[12px] font-medium text-t2 hover:bg-layer-3 transition-colors">Cancel</button>
                  <button type="submit" disabled={create.isPending} className="flex-1 h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">{create.isPending ? "Saving..." : "Create"}</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* KPIs */}
      <div className="metric-grid grid-cols-2 lg:grid-cols-4">
        <div className="metric-cell"><span className="f-label">Total Accounts</span><span className="f-value text-t1">{accounts?.length ?? 0}</span></div>
        <div className="metric-cell"><span className="f-label">Total Capital</span><span className="f-value text-t1">{formatCurrency(totalCap)}</span></div>
        <div className="metric-cell"><span className="f-label">Active Funded</span><span className="f-value text-up">{activeFunded}</span></div>
        <div className="metric-cell"><span className="f-label">Breached</span><span className={`f-value ${breached > 0 ? "text-down" : "text-t1"}`}>{breached}</span></div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-0.5 rounded-[var(--r-sm)] border border-line-1 p-0.5 w-fit">
        {["all", ...TYPES].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 rounded-[var(--r-sm)] text-[10px] font-medium transition-colors ${filter === f ? "bg-layer-4 text-t1" : "text-t4 hover:text-t2"}`}>{f === "all" ? "All" : f}</button>
        ))}
      </div>

      {/* Account List */}
      <div className="card-flush">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 f-sub">{accounts ? "No accounts match filter" : "Loading..."}</div>
        ) : (
          <div className="divide-y divide-line-0">
            {filtered.map((acc, i) => (
              <motion.div key={acc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <Link href={`/accounts/${acc.id}`} className="group flex items-center justify-between px-[18px] py-3.5 hover:bg-layer-3/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-[var(--r-md)] bg-layer-4 flex items-center justify-center text-[9px] font-bold text-t3 ring-1 ring-line-1 group-hover:ring-line-2 transition-colors">
                      {(acc.firm?.[0] ?? acc.type[0]).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-t1">{acc.name}</div>
                      <div className="f-micro">{acc.firm ?? acc.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="f-num text-t1">{formatCurrency(Number(acc.currentBalance))}</span>
                    <span className={`pill ${acc.status === "active" ? "pill-up" : acc.status === "breached" ? "pill-down" : "pill-muted"}`}>{acc.status}</span>
                    <ArrowRight className="h-3 w-3 text-t4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="f-label block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
    </div>
  );
}
