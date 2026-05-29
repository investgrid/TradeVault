"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AccountDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const id = params.id as string;
  const [balance, setBalance] = useState("");

  const { data: account, refetch } = trpc.accounts.getById.useQuery({ id });
  const updateBalance = trpc.accounts.updateBalance.useMutation({ onSuccess: () => { refetch(); setBalance(""); } });

  if (!account) {
    return <div className="flex items-center justify-center py-20 text-text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link href="/accounts" className="rounded-[var(--radius-md)] p-2 text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-bg-elevated text-[12px] font-bold text-text-secondary ring-1 ring-border-subtle">
              {(account.firm?.[0] ?? account.type[0]).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h2 className="text-[16px] font-semibold text-text-primary">{account.name}</h2>
              <span className="text-[12px] text-text-muted">{account.firm ?? t(`accounts.types.${account.type}`)}</span>
            </div>
          </div>
          <Badge variant={account.status === "active" ? "profit" : account.status === "breached" ? "loss" : "default"} dot>
            {t(`accounts.statuses.${account.status}`)}
          </Badge>
        </div>
      </div>

      {/* Balance + Update */}
      <Card variant="glow">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              {t("accounts.detail.currentBalance")}
            </span>
            <span className="font-numbers text-[28px] font-semibold leading-none text-text-primary">
              ${Number(account.currentBalance).toLocaleString()}
            </span>
            {account.initialBalance && (
              <span className={`font-numbers text-[12px] font-medium ${Number(account.currentBalance) >= Number(account.initialBalance) ? "text-profit" : "text-loss"}`}>
                {Number(account.currentBalance) >= Number(account.initialBalance) ? "+" : ""}
                ${(Number(account.currentBalance) - Number(account.initialBalance)).toLocaleString()} from initial
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="balance"
              placeholder="New balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-32"
            />
            <Button
              size="sm"
              disabled={!balance || updateBalance.isPending}
              onClick={() => updateBalance.mutate({ id, balance })}
            >
              {t("accounts.detail.updateBalance")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Drawdown */}
      {account.drawdown && (
        <Card variant="elevated">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-primary">{t("accounts.drawdown.title")}</span>
              <span className="text-[11px] text-text-muted">
                {account.funded?.maxDrawdownType ? t(`accounts.funded.drawdownTypes.${account.funded.maxDrawdownType}`) : ""}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-elevated">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  account.drawdown.zone === "safe" ? "bg-profit" :
                  account.drawdown.zone === "warning" ? "bg-pending" : "bg-loss"
                }`}
                style={{ width: `${Math.min(account.drawdown.usedPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className={
                account.drawdown.zone === "safe" ? "text-profit" :
                account.drawdown.zone === "warning" ? "text-pending" : "text-loss"
              }>
                {account.drawdown.usedPercent.toFixed(1)}% used
              </span>
              <span className="text-text-secondary">
                ${account.drawdown.remainingAmount.toLocaleString()} {t("accounts.drawdown.remaining")}
              </span>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated px-3 py-2">
              <span className="text-[11px] text-text-muted">
                {t("accounts.drawdown.breach")}: <span className="font-numbers font-medium text-text-secondary">${account.drawdown.breachPrice.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {account.funded && (
          <>
            <Card>
              <span className="text-[11px] text-text-muted">{t("accounts.funded.challengeCost")}</span>
              <p className="font-numbers text-[16px] font-medium text-text-primary">${Number(account.funded.challengeCost ?? 0).toLocaleString()}</p>
            </Card>
            <Card>
              <span className="text-[11px] text-text-muted">{t("accounts.funded.profitSplit")}</span>
              <p className="font-numbers text-[16px] font-medium text-text-primary">{account.funded.profitSplitPct ?? 80}%</p>
            </Card>
          </>
        )}
        <Card>
          <span className="text-[11px] text-text-muted">{t("accounts.detail.totalPayouts")}</span>
          <p className="font-numbers text-[16px] font-medium text-profit">—</p>
        </Card>
        <Card>
          <span className="text-[11px] text-text-muted">{t("accounts.detail.roi")}</span>
          <p className="font-numbers text-[16px] font-medium text-profit">—</p>
        </Card>
      </div>

      {/* Balance History */}
      <Card variant="elevated">
        <div className="flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold text-text-primary">{t("accounts.detail.balanceHistory")}</h3>
          {account.history && account.history.length > 0 ? (
            <div className="flex h-[160px] items-end gap-1">
              {account.history.map((snap, i) => {
                const values = account.history!.map((s) => Number(s.balance));
                const max = Math.max(...values);
                const min = Math.min(...values);
                const range = max - min || 1;
                const h = ((Number(snap.balance) - min) / range) * 100;
                return (
                  <div key={i} className="flex-1 rounded-t-sm bg-accent/50 hover:bg-accent transition-colors" style={{ height: `${Math.max(5, h)}%` }} />
                );
              })}
            </div>
          ) : (
            <div className="flex h-[160px] items-center justify-center text-[12px] text-text-muted">
              Update your balance daily to see history
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
