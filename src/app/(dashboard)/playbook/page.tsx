"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { trpc } from "@/server/trpc/client";
import { Plus, X, Star, ChevronRight, FileText } from "lucide-react";

export default function PlaybookPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", rules: "", bestPair: "", bestSession: "" });
  const { data: setups, refetch } = trpc.playbook.list.useQuery();
  const create = trpc.playbook.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); setForm({ name: "", description: "", rules: "", bestPair: "", bestSession: "" }); } });
  const del = trpc.playbook.delete.useMutation({ onSuccess: () => refetch() });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ name: form.name, description: form.description || undefined, rules: form.rules || undefined, bestPair: form.bestPair || undefined, bestSession: form.bestSession || undefined });
  }

  const list = setups ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="f-title">Playbook</h2>
          <p className="f-sub mt-0.5">Define your edge — the setups you trade and their rules</p>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--r-sm)] bg-brand text-white text-[10px] font-medium hover:bg-brand-dim transition-colors"><Plus className="h-3 w-3" /> New Setup</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)] border border-line-2 bg-layer-2 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="f-title">New Setup</Dialog.Title>
                <Dialog.Close className="p-1 text-t4 hover:text-t1 rounded"><X className="h-4 w-4" /></Dialog.Close>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Inp label="Setup Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Order Block" required />
                <Inp label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Entry on OB retracement after displacement" />
                <div>
                  <label className="f-label block mb-1.5">Rules (one per line)</label>
                  <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={4} placeholder={"Wait for displacement\nEntry on 50% OB\nSL below OB low\nTP at opposing OB"} className="w-full px-3 py-2 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Best Pair" value={form.bestPair} onChange={(v) => setForm({ ...form, bestPair: v })} placeholder="EUR/USD" />
                  <Inp label="Best Session" value={form.bestSession} onChange={(v) => setForm({ ...form, bestSession: v })} placeholder="London" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 h-9 rounded-[var(--r-md)] border border-line-1 text-[12px] font-medium text-t2 hover:bg-layer-3 transition-colors">Cancel</button>
                  <button type="submit" disabled={create.isPending} className="flex-1 h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">{create.isPending ? "Saving..." : "Create"}</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Setup List */}
      {list.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((setup) => {
            const rules = setup.rules ? setup.rules.split("\n").filter(Boolean) : [];
            return (
              <div key={setup.id} className="card card-body group relative">
                <button onClick={() => { if (confirm("Delete setup?")) del.mutate({ id: setup.id }); }} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-t4 hover:text-down transition-all"><X className="h-3 w-3" /></button>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[13px] font-semibold text-t1">{setup.name}</h3>
                    {setup.description && <p className="f-sub mt-0.5">{setup.description}</p>}
                    <div className="flex items-center gap-1.5 mt-2">
                      {setup.bestPair && <span className="pill pill-muted">{setup.bestPair}</span>}
                      {setup.bestSession && <span className="pill pill-muted">{setup.bestSession}</span>}
                    </div>
                  </div>
                </div>
                {rules.length > 0 && (
                  <div className="border-t border-line-0 pt-2.5 mt-2">
                    <span className="f-label block mb-1.5">Rules</span>
                    <div className="space-y-1">
                      {rules.slice(0, 4).map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-brand shrink-0" />
                          <span className="text-[10px] text-t2">{r}</span>
                        </div>
                      ))}
                      {rules.length > 4 && <span className="f-micro">+{rules.length - 4} more</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card flex items-center justify-center py-16">
          <div className="text-center">
            <div className="h-10 w-10 rounded-lg bg-brand-soft border border-brand/10 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-5 w-5 text-brand" />
            </div>
            <p className="text-[12px] text-t2 mb-1">No setups defined</p>
            <p className="f-sub">Create your first trading setup to define your edge</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="f-label block mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
    </div>
  );
}
