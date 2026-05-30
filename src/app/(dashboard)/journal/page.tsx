"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { trpc } from "@/server/trpc/client";
import { formatCurrency } from "@/lib/formatters";
import { Plus, Filter, TrendingUp, TrendingDown, X, Image, AlertCircle } from "lucide-react";

export default function JournalPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: tradesList, refetch } = trpc.trades.list.useQuery();
  const { data: stats } = trpc.trades.stats.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const createTrade = trpc.trades.create.useMutation({ onSuccess: () => { refetch(); setModalOpen(false); resetForm(); } });
  const deleteTrade = trpc.trades.delete.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState({ pair: "", direction: "long" as "long" | "short", entryPrice: "", exitPrice: "", positionSize: "", pnl: "", riskReward: "", setup: "", session: "", grade: "", emotion: "", notes: "", mistakes: "", accountId: "", tradeDate: new Date().toISOString().slice(0, 10) });

  function resetForm() {
    setForm({ pair: "", direction: "long", entryPrice: "", exitPrice: "", positionSize: "", pnl: "", riskReward: "", setup: "", session: "", grade: "", emotion: "", notes: "", mistakes: "", accountId: "", tradeDate: new Date().toISOString().slice(0, 10) });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createTrade.mutate({
      pair: form.pair,
      direction: form.direction,
      entryPrice: form.entryPrice || undefined,
      exitPrice: form.exitPrice || undefined,
      positionSize: form.positionSize || undefined,
      pnl: form.pnl || undefined,
      riskReward: form.riskReward || undefined,
      setup: form.setup || undefined,
      session: form.session || undefined,
      grade: form.grade || undefined,
      emotion: form.emotion || undefined,
      notes: form.notes || undefined,
      mistakes: form.mistakes || undefined,
      accountId: form.accountId || undefined,
      tradeDate: form.tradeDate,
    });
  }

  const trades = tradesList ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="f-title">Trade Journal</h2>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--r-sm)] border border-line-1 text-[10px] text-t3 hover:border-line-2 transition-colors">
            <Filter className="h-3 w-3" /> Filter
          </button>
          <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
            <Dialog.Trigger asChild>
              <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--r-sm)] bg-brand text-white text-[10px] font-medium hover:bg-brand-dim transition-colors">
                <Plus className="h-3 w-3" /> Log Trade
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)] border border-line-2 bg-layer-2 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title className="f-title">Log Trade</Dialog.Title>
                  <Dialog.Close className="p-1 text-t4 hover:text-t1 transition-colors rounded"><X className="h-4 w-4" /></Dialog.Close>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Pair + Direction */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="f-label block mb-1">Pair</label>
                      <input value={form.pair} onChange={(e) => setForm({ ...form, pair: e.target.value })} required placeholder="EUR/USD" className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
                    </div>
                    <div>
                      <label className="f-label block mb-1">Direction</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button type="button" onClick={() => setForm({ ...form, direction: "long" })} className={`h-8 rounded-[var(--r-sm)] text-[10px] font-semibold border transition-all ${form.direction === "long" ? "border-up/30 bg-up-soft text-up" : "border-line-1 text-t3"}`}>LONG</button>
                        <button type="button" onClick={() => setForm({ ...form, direction: "short" })} className={`h-8 rounded-[var(--r-sm)] text-[10px] font-semibold border transition-all ${form.direction === "short" ? "border-down/30 bg-down-soft text-down" : "border-line-1 text-t3"}`}>SHORT</button>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Entry, Exit, Size */}
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Entry" value={form.entryPrice} onChange={(v) => setForm({ ...form, entryPrice: v })} placeholder="1.0845" />
                    <Field label="Exit" value={form.exitPrice} onChange={(v) => setForm({ ...form, exitPrice: v })} placeholder="1.0890" />
                    <Field label="Size (lots)" value={form.positionSize} onChange={(v) => setForm({ ...form, positionSize: v })} placeholder="1.0" />
                  </div>

                  {/* Row 3: P&L, RR, Date */}
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="P&L ($)" value={form.pnl} onChange={(v) => setForm({ ...form, pnl: v })} placeholder="235" />
                    <Field label="R:R" value={form.riskReward} onChange={(v) => setForm({ ...form, riskReward: v })} placeholder="2.4" />
                    <Field label="Date" value={form.tradeDate} onChange={(v) => setForm({ ...form, tradeDate: v })} type="date" />
                  </div>

                  {/* Row 4: Setup, Session, Grade, Emotion */}
                  <div className="grid grid-cols-4 gap-3">
                    <Field label="Setup" value={form.setup} onChange={(v) => setForm({ ...form, setup: v })} placeholder="OB" />
                    <Field label="Session" value={form.session} onChange={(v) => setForm({ ...form, session: v })} placeholder="London" />
                    <Field label="Grade" value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} placeholder="A" />
                    <Field label="Emotion" value={form.emotion} onChange={(v) => setForm({ ...form, emotion: v })} placeholder="Confident" />
                  </div>

                  {/* Row 5: Account */}
                  <div>
                    <label className="f-label block mb-1">Account</label>
                    <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 focus:outline-none focus:border-brand transition-colors">
                      <option value="">None</option>
                      {accounts?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="f-label block mb-1">Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Execution notes..." className="w-full px-3 py-2 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors resize-none" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-9 rounded-[var(--r-md)] border border-line-1 text-[12px] font-medium text-t2 hover:bg-layer-3 transition-colors">Cancel</button>
                    <button type="submit" disabled={createTrade.isPending} className="flex-1 h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">
                      {createTrade.isPending ? "Saving..." : "Log Trade"}
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Stats */}
      <div className="metric-grid grid-cols-2 lg:grid-cols-4">
        <div className="metric-cell"><span className="f-label">Total P&L</span><span className={`f-num font-semibold ${(stats?.totalPnl ?? 0) >= 0 ? "text-up" : "text-down"}`}>{(stats?.totalPnl ?? 0) >= 0 ? "+" : ""}${(stats?.totalPnl ?? 0).toFixed(0)}</span></div>
        <div className="metric-cell"><span className="f-label">Win Rate</span><span className="f-num text-t1">{(stats?.winRate ?? 0).toFixed(0)}%</span></div>
        <div className="metric-cell"><span className="f-label">Avg R:R</span><span className="f-num text-t1">{(stats?.avgRR ?? 0).toFixed(1)}</span></div>
        <div className="metric-cell"><span className="f-label">Trades</span><span className="f-num text-t1">{stats?.total ?? 0}</span></div>
      </div>

      {/* Trade List */}
      {trades.length > 0 ? (
        <div className="card-flush">
          <div className="divide-y divide-line-0">
            {trades.map((t, i) => {
              const pnl = Number(t.pnl ?? 0);
              const rr = Number(t.riskReward ?? 0);
              return (
                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="flex items-center gap-4 px-[18px] py-3.5 hover:bg-layer-3/50 transition-colors cursor-pointer group">
                  <div className={`h-8 w-8 rounded-[var(--r-sm)] flex items-center justify-center shrink-0 ${pnl >= 0 ? "bg-up-soft" : "bg-down-soft"}`}>
                    {t.direction === "long" ? <TrendingUp className={`h-3.5 w-3.5 ${pnl >= 0 ? "text-up" : "text-down"}`} /> : <TrendingDown className={`h-3.5 w-3.5 ${pnl >= 0 ? "text-up" : "text-down"}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-semibold text-t1">{t.pair}</span>
                      {t.setup && <span className="pill pill-muted">{t.setup}</span>}
                      {t.grade && <span className={`pill ${t.grade.startsWith("A") ? "pill-up" : t.grade === "B" ? "pill-warn" : "pill-down"}`}>{t.grade}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="f-micro">{t.tradeDate}</span>
                      {t.session && <span className="f-micro">{t.session}</span>}
                      {t.emotion && <span className="f-micro">{t.emotion}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`f-num font-semibold ${pnl >= 0 ? "text-up" : "text-down"}`}>{pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(0)}</div>
                    {rr !== 0 && <div className={`f-num-xs ${rr >= 0 ? "text-up" : "text-down"}`}>{rr >= 0 ? "+" : ""}{rr.toFixed(1)}R</div>}
                  </div>
                  <button onClick={() => deleteTrade.mutate({ id: t.id })} className="opacity-0 group-hover:opacity-100 p-1 text-t4 hover:text-down transition-all"><X className="h-3 w-3" /></button>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card flex items-center justify-center py-16">
          <div className="text-center">
            <div className="h-10 w-10 rounded-lg bg-brand-soft border border-brand/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-5 w-5 text-brand" />
            </div>
            <p className="text-[12px] text-t2 mb-1">No trades logged yet</p>
            <p className="f-sub">Click "Log Trade" to record your first entry</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="f-label block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
    </div>
  );
}
