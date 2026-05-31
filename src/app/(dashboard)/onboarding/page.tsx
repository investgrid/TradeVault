"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/server/trpc/client";
import { ArrowRight, ArrowLeft, Check, Wallet, Shield, Zap } from "lucide-react";

type Step = "welcome" | "account" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [form, setForm] = useState({ name: "", firm: "", balance: "", drawdownType: "static", drawdownPct: "10", splitPct: "80" });
  const create = trpc.accounts.create.useMutation({ onSuccess: () => setStep("complete") });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      name: form.name, type: "funded", firm: form.firm || undefined,
      currentBalance: form.balance, initialBalance: form.balance, currency: "USD",
      funded: { maxDrawdownType: form.drawdownType as any, maxDrawdownPct: form.drawdownPct, profitSplitPct: form.splitPct },
    });
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-hero noise p-8 text-center space-y-6">
              <div className="h-14 w-14 rounded-xl bg-brand/10 flex items-center justify-center mx-auto ring-1 ring-brand/20">
                <Zap className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h1 className="f-display text-t1 mb-2">Welcome to TradeVault</h1>
                <p className="text-[13px] text-t3 leading-relaxed max-w-sm mx-auto">
                  Your trading control center. Let&apos;s set up your first account to start tracking capital, risk, and performance.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Feature icon={Wallet} text="Track all your funded accounts in one place" />
                <Feature icon={Shield} text="Monitor drawdown and risk in real-time" />
                <Feature icon={Zap} text="Deep analytics on your trading business" />
              </div>
              <button onClick={() => setStep("account")} className="w-full h-10 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors flex items-center justify-center gap-2">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}

          {step === "account" && (
            <motion.div key="account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card card-body space-y-5">
              <div>
                <h2 className="f-title mb-1">Add your first account</h2>
                <p className="f-sub">Start with your primary funded account</p>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <Inp label="Account Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="FTMO 100k #1234" required />
                <Inp label="Prop Firm" value={form.firm} onChange={(v) => setForm({ ...form, firm: v })} placeholder="FTMO, Apex, TFT..." />
                <Inp label="Current Balance" value={form.balance} onChange={(v) => setForm({ ...form, balance: v })} placeholder="50000" type="number" required />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="f-label block mb-1.5">DD Type</label>
                    <select value={form.drawdownType} onChange={(e) => setForm({ ...form, drawdownType: e.target.value })} className="w-full h-8 px-2 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[11px] text-t1 focus:outline-none focus:border-brand">
                      <option value="static">Static</option>
                      <option value="trailing">Trailing</option>
                      <option value="eod_trailing">EOD Trail</option>
                    </select>
                  </div>
                  <Inp label="Max DD %" value={form.drawdownPct} onChange={(v) => setForm({ ...form, drawdownPct: v })} placeholder="10" type="number" />
                  <Inp label="Split %" value={form.splitPct} onChange={(v) => setForm({ ...form, splitPct: v })} placeholder="80" type="number" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep("welcome")} className="h-9 w-9 rounded-[var(--r-md)] border border-line-1 flex items-center justify-center text-t4 hover:text-t1 hover:bg-layer-3 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="submit" disabled={create.isPending} className="flex-1 h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {create.isPending ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card card-body text-center space-y-5">
              <div className="h-12 w-12 rounded-full bg-up-soft flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 text-up" />
              </div>
              <div>
                <h2 className="f-title mb-1">You&apos;re all set</h2>
                <p className="f-sub">Your account is ready. Head to the Control Center to start tracking.</p>
              </div>
              <button onClick={() => router.push("/")} className="w-full h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors">
                Go to Control Center
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 text-left px-4 py-2 rounded-[var(--r-md)] bg-layer-3/50">
      <Icon className="h-4 w-4 text-brand shrink-0" />
      <span className="text-[12px] text-t2">{text}</span>
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
