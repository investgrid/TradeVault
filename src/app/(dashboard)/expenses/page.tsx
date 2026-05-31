"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { trpc } from "@/server/trpc/client";

const CATEGORIES = ["challenge_fees", "failed_challenge_fees", "subscriptions", "vps", "data_feeds", "education", "software", "banking_fees", "crypto_fees", "taxes_estimated", "other"] as const;
const CAT_LABELS: Record<string, string> = { challenge_fees: "Challenge Fees", failed_challenge_fees: "Failed Challenges", subscriptions: "Subscriptions", vps: "VPS", data_feeds: "Data Feeds", education: "Education", software: "Software", banking_fees: "Banking", crypto_fees: "Crypto Fees", taxes_estimated: "Taxes", other: "Other" };

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ category: "challenge_fees", amount: "", vendor: "", description: "", expenseDate: new Date().toISOString().slice(0, 10), isRecurring: false });

  const { data: expenses, refetch } = trpc.expenses.list.useQuery();
  const { data: payouts } = trpc.income.list.useQuery();
  const create = trpc.expenses.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); setForm({ ...form, amount: "", vendor: "", description: "" }); } });
  const del = trpc.expenses.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = expenses?.filter((e) => filter === "all" || e.category === filter) ?? [];
  const thisMonth = expenses?.filter((e) => { const d = new Date(e.expenseDate); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s, e) => s + Number(e.amount), 0) ?? 0;
  const ytd = expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0;
  const totalIncome = payouts?.filter((p) => p.status === "received").reduce((s, p) => s + Number(p.amountNet ?? p.amountGross ?? 0), 0) ?? 0;
  const ratio = totalIncome > 0 ? ((ytd / totalIncome) * 100).toFixed(0) + "%" : "—";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ category: form.category, amount: form.amount, vendor: form.vendor || undefined, description: form.description || undefined, expenseDate: form.expenseDate, isRecurring: form.isRecurring });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="f-title">Expenses</h2>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--r-sm)] bg-brand text-white text-[10px] font-medium hover:bg-brand-dim transition-colors"><Plus className="h-3 w-3" /> Add Expense</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)] border border-line-2 bg-layer-2 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="f-title">Add Expense</Dialog.Title>
                <Dialog.Close className="p-1 text-t4 hover:text-t1 rounded"><X className="h-4 w-4" /></Dialog.Close>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="f-label block mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 focus:outline-none focus:border-brand">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Amount" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="499" type="number" required />
                  <Inp label="Date" value={form.expenseDate} onChange={(v) => setForm({ ...form, expenseDate: v })} type="date" required />
                </div>
                <Inp label="Vendor" value={form.vendor} onChange={(v) => setForm({ ...form, vendor: v })} placeholder="TradingView, FTMO..." />
                <Inp label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Optional note" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} className="h-3.5 w-3.5 rounded border-line-1 accent-brand" />
                  <span className="text-[11px] text-t2">Recurring expense</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 h-9 rounded-[var(--r-md)] border border-line-1 text-[12px] font-medium text-t2 hover:bg-layer-3 transition-colors">Cancel</button>
                  <button type="submit" disabled={create.isPending} className="flex-1 h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">{create.isPending ? "Saving..." : "Save"}</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* KPIs */}
      <div className="metric-grid grid-cols-2 lg:grid-cols-4">
        <div className="metric-cell"><span className="f-label">This Month</span><span className="f-value text-down">${thisMonth.toLocaleString()}</span></div>
        <div className="metric-cell"><span className="f-label">Year to Date</span><span className="f-value text-t1">${ytd.toLocaleString()}</span></div>
        <div className="metric-cell"><span className="f-label">Expense Ratio</span><span className={`f-value ${totalIncome > 0 && (ytd / totalIncome) > 0.3 ? "text-down" : "text-t1"}`}>{ratio}</span></div>
        <div className="metric-cell"><span className="f-label">Total Entries</span><span className="f-value text-t1">{expenses?.length ?? 0}</span></div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-0.5 overflow-x-auto rounded-[var(--r-sm)] border border-line-1 p-0.5 w-fit">
        <button onClick={() => setFilter("all")} className={`px-2 py-1 rounded-[var(--r-sm)] text-[9px] font-medium whitespace-nowrap transition-colors ${filter === "all" ? "bg-layer-4 text-t1" : "text-t4 hover:text-t2"}`}>All</button>
        {CATEGORIES.slice(0, 6).map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`px-2 py-1 rounded-[var(--r-sm)] text-[9px] font-medium whitespace-nowrap transition-colors ${filter === c ? "bg-layer-4 text-t1" : "text-t4 hover:text-t2"}`}>{CAT_LABELS[c]}</button>
        ))}
      </div>

      {/* List */}
      <div className="card-flush">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 f-sub">{expenses ? "No expenses found" : "Loading..."}</div>
        ) : (
          <div className="divide-y divide-line-0">
            {filtered.map((exp) => (
              <div key={exp.id} className="group flex items-center justify-between px-[18px] py-3.5 hover:bg-layer-3/50 transition-colors">
                <div>
                  <div className="text-[12px] font-medium text-t1">{exp.vendor ?? CAT_LABELS[exp.category] ?? exp.category}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="f-micro">{exp.expenseDate}</span>
                    <span className="pill pill-muted text-[8px]">{CAT_LABELS[exp.category] ?? exp.category}</span>
                    {exp.isRecurring && <span className="pill pill-brand text-[8px]">Recurring</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="f-num font-medium text-down">-${Number(exp.amount).toLocaleString()}</span>
                  <button onClick={() => { if (confirm("Delete?")) del.mutate({ id: exp.id }); }} className="opacity-0 group-hover:opacity-100 p-1 text-t4 hover:text-down transition-all"><X className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="f-label block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
    </div>
  );
}
