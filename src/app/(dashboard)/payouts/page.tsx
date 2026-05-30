"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, ArrowDownRight, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageWrapper, PageSection } from "@/components/layout/page-wrapper";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { staggerContainer } from "@/lib/motion";

type PayoutStatus = "requested" | "processing" | "received" | "rejected";

const STATUS_BADGE_MAP: Record<
  PayoutStatus,
  { variant: "profit" | "pending" | "default" | "loss"; dot: boolean }
> = {
  received: { variant: "profit", dot: true },
  processing: { variant: "pending", dot: true },
  requested: { variant: "default", dot: true },
  rejected: { variant: "loss", dot: true },
};

export default function PayoutsPage() {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: payouts, isLoading, refetch } = trpc.income.list.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const createMutation = trpc.income.create.useMutation({
    onSuccess: () => {
      refetch();
      setModalOpen(false);
      resetForm();
    },
  });

  // Form state
  const [accountId, setAccountId] = useState("");
  const [amountGross, setAmountGross] = useState("");
  const [splitPercent, setSplitPercent] = useState("80");
  const [platformFee, setPlatformFee] = useState("");
  const [transferFee, setTransferFee] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState<PayoutStatus>("received");
  const [requestedAt, setRequestedAt] = useState("");
  const [receivedAt, setReceivedAt] = useState("");

  const amountNet = useMemo(() => {
    const gross = parseFloat(amountGross) || 0;
    const split = parseFloat(splitPercent) || 0;
    const pFee = parseFloat(platformFee) || 0;
    const tFee = parseFloat(transferFee) || 0;
    return ((gross * split) / 100 - pFee - tFee).toFixed(2);
  }, [amountGross, splitPercent, platformFee, transferFee]);

  function resetForm() {
    setAccountId("");
    setAmountGross("");
    setSplitPercent("80");
    setPlatformFee("");
    setTransferFee("");
    setMethod("");
    setStatus("received");
    setRequestedAt("");
    setReceivedAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      accountId: accountId || undefined,
      type: "payout",
      amountGross,
      amountNet: amountNet !== "0.00" ? amountNet : undefined,
      splitPct: splitPercent || undefined,
      platformFee: platformFee || undefined,
      transferFee: transferFee || undefined,
      method: method || undefined,
      status,
      requestedAt: requestedAt || undefined,
      receivedAt: receivedAt || undefined,
    });
  }

  // Compute header stats
  const stats = useMemo(() => {
    if (!payouts) return { totalReceived: 0, pending: 0, inProcess: 0 };
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    let totalReceived = 0;
    let pending = 0;
    let inProcess = 0;

    for (const p of payouts) {
      const net = parseFloat(p.amountNet ?? p.amountGross ?? "0");
      if (p.status === "received") {
        const receivedDate = p.receivedAt ? new Date(p.receivedAt) : new Date(p.createdAt);
        if (receivedDate >= yearStart) totalReceived += net;
      } else if (p.status === "requested") {
        pending += net;
      } else if (p.status === "processing") {
        inProcess += net;
      }
    }

    return { totalReceived, pending, inProcess };
  }, [payouts]);

  function getAccountName(accountId: string | null | undefined) {
    if (!accountId || !accounts) return "Unknown";
    const account = accounts.find((a: any) => a.id === accountId);
    return account?.name ?? "Unknown";
  }

  function getAccountFirm(accountId: string | null | undefined) {
    if (!accountId || !accounts) return "";
    const account = accounts.find((a: any) => a.id === accountId);
    return account?.firm ?? "";
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <PageWrapper>
      {/* Header */}
      <PageSection>
      <div className="flex items-center justify-between">
        <div />
        <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
          <Dialog.Trigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {t("payouts.addPayout")}
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-6 card-shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-base font-semibold text-text-primary">
                  {t("payouts.addPayout")}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="rounded-[var(--radius-sm)] p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Account Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="h-9 w-full rounded-[var(--radius-md)] border border-border-default bg-bg-elevated px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors duration-150"
                  >
                    <option value="">Select account...</option>
                    {accounts?.map((account: any) => (
                      <option key={account.id} value={account.id}>
                        {account.firm ? `${account.firm} — ` : ""}
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gross + Split row */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("payouts.amountGross")}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amountGross}
                    onChange={(e) => setAmountGross(e.target.value)}
                    required
                  />
                  <Input
                    label={t("payouts.splitPercent")}
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="80"
                    value={splitPercent}
                    onChange={(e) => setSplitPercent(e.target.value)}
                  />
                </div>

                {/* Net Amount (read-only computed) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    {t("payouts.amountNet")}
                  </label>
                  <div className="flex h-9 items-center rounded-[var(--radius-md)] border border-border-default bg-bg-elevated/50 px-3">
                    <span className="font-numbers text-sm text-text-primary">
                      ${amountNet}
                    </span>
                  </div>
                </div>

                {/* Fees row */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("payouts.platformFee")}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                  />
                  <Input
                    label={t("payouts.transferFee")}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                  />
                </div>

                {/* Method + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("payouts.method")}
                    placeholder="Wire, Crypto, etc."
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-secondary">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as PayoutStatus)}
                      className="h-9 w-full rounded-[var(--radius-md)] border border-border-default bg-bg-elevated px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors duration-150"
                    >
                      <option value="requested">{t("payouts.statuses.requested")}</option>
                      <option value="processing">{t("payouts.statuses.processing")}</option>
                      <option value="received">{t("payouts.statuses.received")}</option>
                      <option value="rejected">{t("payouts.statuses.rejected")}</option>
                    </select>
                  </div>
                </div>

                {/* Dates row */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("payouts.requestedAt")}
                    type="date"
                    value={requestedAt}
                    onChange={(e) => setRequestedAt(e.target.value)}
                  />
                  <Input
                    label={t("payouts.receivedAt")}
                    type="date"
                    value={receivedAt}
                    onChange={(e) => setReceivedAt(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-border-subtle">
                  <Dialog.Close asChild>
                    <Button variant="ghost" type="button">
                      {t("common.cancel")}
                    </Button>
                  </Dialog.Close>
                  <Button type="submit" disabled={createMutation.isPending || !amountGross}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("common.save")
                    )}
                  </Button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      </PageSection>

      {/* Header Stats */}
      <PageSection>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label={t("payouts.totalReceived")}
          value={formatCurrency(stats.totalReceived)}
          change="+34% vs last year"
          changeType="positive"
        />
        <MetricCard
          label={t("payouts.pending")}
          value={formatCurrency(stats.pending)}
          change={`${payouts?.filter((p) => p.status === "requested").length ?? 0} payouts`}
          changeType="neutral"
        />
        <MetricCard
          label={t("payouts.inProcess")}
          value={formatCurrency(stats.inProcess)}
          change="Est. 3-5 days"
          changeType="neutral"
        />
        <MetricCard
          label={t("payouts.nextEligible")}
          value="—"
          change=""
          changeType="neutral"
        />
      </motion.div>
      </PageSection>

      {/* Payouts List */}
      <PageSection>
      <Card variant="default" className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <h2 className="text-sm font-medium text-text-primary">
            {t("payouts.recentPayouts")}
          </h2>
          <div className="flex items-center gap-2">
            <ArrowDownRight className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-xs text-text-muted">
              {payouts?.length ?? 0} records
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            <span className="ml-2 text-sm text-text-muted">{t("common.loading")}</span>
          </div>
        ) : !payouts?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Clock className="h-8 w-8 text-text-muted/50" />
            <p className="text-sm text-text-muted">No payouts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {payouts.map((payout: any) => {
              const statusKey = (payout.status as PayoutStatus) ?? "requested";
              const badgeConfig = STATUS_BADGE_MAP[statusKey];
              const firmName = getAccountFirm(payout.accountId);
              const accountName = getAccountName(payout.accountId);
              const gross = parseFloat(payout.amountGross ?? "0");
              const net = parseFloat(payout.amountNet ?? payout.amountGross ?? "0");
              const displayDate = payout.receivedAt ?? payout.requestedAt ?? payout.createdAt;

              return (
                <div
                  key={payout.id}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-bg-elevated/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-bg-elevated text-xs font-bold text-text-secondary">
                      {firmName?.[0]?.toUpperCase() ?? "P"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary">
                        {firmName ? `${firmName} — ` : ""}{accountName}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(displayDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="font-numbers text-sm text-text-primary">
                        {formatCurrency(net)}
                      </span>
                      {gross !== net && (
                        <span className="font-numbers text-xs text-text-muted">
                          gross {formatCurrency(gross)}
                        </span>
                      )}
                    </div>
                    <Badge variant={badgeConfig.variant} dot={badgeConfig.dot}>
                      {t(`payouts.statuses.${statusKey}`)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      </PageSection>
    </PageWrapper>
  );
}
