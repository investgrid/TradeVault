"use client";

import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Clock } from "lucide-react";
import { trpc } from "@/server/trpc/client";

export default function PayoutsPage() {
  const [open, setOpen] = useState(false);
  const { data: payouts, isLoading, refetch } = trpc.income.list.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const create = trpc.income.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); resetForm(); } });
  const del = trpc.income.delete.useMutation({ onSuccess: () => refetch() });

  const [accountId, setAccountId] = useState("");
  const [amountGross, setAmountGross] = useState("");
  const [splitPercent, setSplitPercent] = useState("80");
  const [platformFee, setPlatformFee] = useState("");
  const [transferFee, setTransferFee] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState<"requested" | "processing" | "received" | "rejected">("received");
  const [requestedAt, setRequestedAt] = useState("");
  const [receivedAt, setReceivedAt] = useState("");

  const amountNet = useMemo(() => {
    const g = parseFloat(amountGross) || 0;
    const s = parseFloat(splitPercent) || 0;
    const pf = parseFloat(platformFee) || 0;
    const tf = parseFloat(transferFee) || 0;
    return ((g * s) / 100 - pf - tf).toFixed(2);
  }, [amountGross, splitPercent, platformFee, transferFee]);

  function resetForm() { setAccountId(""); setAmountGross(""); setSplitPercent("80"); setPlatformFee(""); setTransferFee(""); setMethod(""); setStatus("received"); setRequestedAt(""); setReceivedAt(""); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      accountId: accountId || undefined, type: "payout", amountGross,
      amountNet: amountNet !== "0.00" ? amountNet : undefined,
      splitPct: splitPercent || undefined, platformFee: platformFee || undefined,
      transferFee: transferFee || undefined, method: method || undefined,
      status, requestedAt: requestedAt || undefined, receivedAt: receivedAt || undefined,
    });
  }

  const stats = useMemo(() => {
    if (!payouts) return { received: 0, pending: 0, processing: 0 };
    let received = 0, pending = 0, processing = 0;
    for (const p of payouts) {
      const net = parseFloat(p.amountNet ?? p.amountGross ?? "0");
      if (p.status === "received") received += net;
      else if (p.status === "requested") pending += net;
      else if (p.status === "processing") processing += net;
    }
    return { received, pending, processing };
  }, [payouts]);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="f-title">Payouts</h2>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-1 h-[26px] px-2.5 rounded-[var(--r-sm)] bg-brand text-white text-[10px] font-medium hover:bg-brand-dim transition-colors"><Plus className="h-3 w-3" /> Add Payout</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)] border border-line-2 bg-layer-2 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="f-title">Record Payout</Dialog.Title>
                <Dialog.Close className="p-1 text-t4 hover:text-t1 rounded"><X className="h-4 w-4" /></Dialog.Close>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="f-label block mb-1.5">Account</label>
                  <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 focus:outline-none focus:border-brand">
                    <option value="">Select account...</option>
                    {accounts?.map((a) => <option key={a.id} value={a.id}>{a.firm ? `${a.firm} — ` : ""}{a.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Gross Amount" value={amountGross} onChange={setAmountGross} placeholder="5000" type="number" required />
                  <Inp label="Split %" value={splitPercent} onChange={setSplitPercent} placeholder="80" type="number" />
                </div>
                <div className="rounded-[var(--r-md)] bg-layer-3 px-3 py-2 flex items-center justify-between">
                  <span className="f-label">Net Amount</span>
                  <span className="f-num text-t1">${amountNet}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Platform Fee" value={platformFee} onChange={setPlatformFee} placeholder="0" type="number" />
                  <Inp label="Transfer Fee" value={transferFee} onChange={setTransferFee} placeholder="0" type="number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Method" value={method} onChange={setMethod} placeholder="Wire, Crypto..." />
                  <div>
                    <label className="f-label block mb-1.5">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full h-8 px-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 focus:outline-none focus:border-brand">
                      <option value="received">Received</option>
                      <option value="processing">Processing</option>
                      <option value="requested">Requested</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Requested At" value={requestedAt} onChange={setRequestedAt} type="date" />
                  <Inp label="Received At" value={receivedAt} onChange={setReceivedAt} type="date" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 h-9 rounded-[var(--r-md)] border border-line-1 text-[12px] font-medium text-t2 hover:bg-layer-3 transition-colors">Cancel</button>
                  <button type="submit" disabled={create.isPending || !amountGross} className="flex-1 h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">{create.isPending ? "Saving..." : "Save"}</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* KPIs */}
      <div className="metric-grid grid-cols-2 lg:grid-cols-4">
        <div className="metric-cell"><span className="f-label">Total Received (YTD)</span><span className="f-value text-up">{fmt(stats.received)}</span></div>
        <div className="metric-cell"><span className="f-label">Pending</span><span className="f-value text-warn">{fmt(stats.pending)}</span></div>
        <div className="metric-cell"><span className="f-label">Processing</span><span className="f-value text-t1">{fmt(stats.processing)}</span></div>
        <div className="metric-cell"><span className="f-label">Total Payouts</span><span className="f-value text-t1">{payouts?.length ?? 0}</span></div>
      </div>

      {/* List */}
      <div className="card-flush">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 f-sub">Loading...</div>
        ) : !payouts?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Clock className="h-6 w-6 text-t4" />
            <p className="f-sub">No payouts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-line-0">
            {payouts.map((p: any) => {
              const net = parseFloat(p.amountNet ?? p.amountGross ?? "0");
              const gross = parseFloat(p.amountGross ?? "0");
              const accName = accounts?.find((a) => a.id === p.accountId)?.name ?? "Payout";
              const firm = accounts?.find((a) => a.id === p.accountId)?.firm;
              return (
                <div key={p.id} className="group flex items-center justify-between px-[18px] py-3.5 hover:bg-layer-3/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`dot ${p.status === "received" ? "dot-up" : p.status === "processing" ? "dot-warn" : "dot-off"}`} />
                    <div>
                      <div className="text-[12px] font-medium text-t1">{firm ? `${firm} — ` : ""}{accName}</div>
                      <div className="f-micro">{p.receivedAt ?? p.requestedAt ?? ""}{p.method ? ` · ${p.method}` : ""}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="f-num text-t1">{fmt(net)}</div>
                      {gross !== net && <div className="f-micro">gross {fmt(gross)}</div>}
                    </div>
                    <span className={`pill ${p.status === "received" ? "pill-up" : p.status === "processing" ? "pill-warn" : "pill-muted"}`}>{p.status}</span>
                    <button onClick={() => { if (confirm("Delete?")) del.mutate({ id: p.id }); }} className="opacity-0 group-hover:opacity-100 p-1 text-t4 hover:text-down transition-all"><X className="h-3 w-3" /></button>
                  </div>
                </div>
              );
            })}
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
