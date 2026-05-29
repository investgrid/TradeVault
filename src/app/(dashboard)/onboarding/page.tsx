"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { ArrowRight, Check, Wallet, BarChart3, Shield } from "lucide-react";

type Step = "welcome" | "account" | "details" | "complete";

export default function OnboardingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [accountData, setAccountData] = useState({
    name: "",
    firm: "",
    balance: "",
    drawdownType: "static",
    maxDrawdown: "",
    challengeCost: "",
  });

  const createAccount = trpc.accounts.create.useMutation({
    onSuccess: () => router.push("/"),
  });

  function handleFinish() {
    if (accountData.name && accountData.balance) {
      createAccount.mutate({
        name: accountData.name,
        type: "funded",
        firm: accountData.firm || undefined,
        currentBalance: accountData.balance,
        initialBalance: accountData.balance,
        funded: {
          maxDrawdownType: accountData.drawdownType as any,
          maxDrawdownPct: accountData.maxDrawdown || undefined,
          challengeCost: accountData.challengeCost || undefined,
          profitSplitPct: "80",
        },
      });
    } else {
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {(["welcome", "account", "details", "complete"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                  step === s
                    ? "bg-accent text-white glow-accent"
                    : (["welcome", "account", "details", "complete"].indexOf(step) > i)
                    ? "bg-profit/20 text-profit"
                    : "bg-bg-elevated text-text-muted"
                }`}
              >
                {["welcome", "account", "details", "complete"].indexOf(step) > i ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div className={`h-px w-8 ${
                  ["welcome", "account", "details", "complete"].indexOf(step) > i
                    ? "bg-profit/40"
                    : "bg-border-subtle"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step: Welcome */}
        {step === "welcome" && (
          <Card variant="glow" className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft">
              <img src="/logo.png" alt="TradeVault" width={40} height={40} className="rounded-lg" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-text-primary">
                {t("onboarding.welcome")}
              </h1>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {t("onboarding.addFirst")}
              </p>
            </div>
            <div className="grid w-full grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] bg-bg-elevated p-4">
                <Wallet className="h-5 w-5 text-accent" />
                <span className="text-[10px] font-medium text-text-secondary">Multi-Account</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] bg-bg-elevated p-4">
                <BarChart3 className="h-5 w-5 text-profit" />
                <span className="text-[10px] font-medium text-text-secondary">Analytics</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] bg-bg-elevated p-4">
                <Shield className="h-5 w-5 text-pending" />
                <span className="text-[10px] font-medium text-text-secondary">Risk Control</span>
              </div>
            </div>
            <Button className="mt-2 w-full gap-2" onClick={() => setStep("account")}>
              {t("onboarding.addAccount")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        )}

        {/* Step: Account basics */}
        {step === "account" && (
          <Card variant="glow" className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("accounts.addAccount")}
              </h2>
              <p className="text-[13px] text-text-secondary">
                Basic info about your funded account
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                id="name"
                label={t("accounts.name")}
                placeholder="FTMO #123456"
                value={accountData.name}
                onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
              />
              <Input
                id="firm"
                label={t("accounts.firm")}
                placeholder="FTMO, Apex, MyFundedFX..."
                value={accountData.firm}
                onChange={(e) => setAccountData({ ...accountData, firm: e.target.value })}
              />
              <Input
                id="balance"
                label={t("accounts.balance")}
                type="number"
                placeholder="50000"
                value={accountData.balance}
                onChange={(e) => setAccountData({ ...accountData, balance: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("welcome")}>
                {t("common.back")}
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => setStep("details")}
                disabled={!accountData.name || !accountData.balance}
              >
                {t("common.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Funded details */}
        {step === "details" && (
          <Card variant="glow" className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("accounts.funded.drawdownType")}
              </h2>
              <p className="text-[13px] text-text-secondary">
                Configure your risk parameters
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {/* Drawdown type selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  {t("accounts.funded.drawdownType")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["static", "trailing", "eod_trailing"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAccountData({ ...accountData, drawdownType: type })}
                      className={`rounded-[var(--radius-md)] border px-3 py-2 text-[11px] font-medium transition-all ${
                        accountData.drawdownType === type
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-default"
                      }`}
                    >
                      {t(`accounts.funded.drawdownTypes.${type}`)}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                id="maxDrawdown"
                label={t("accounts.funded.maxDrawdown") + " (%)"}
                type="number"
                placeholder="10"
                value={accountData.maxDrawdown}
                onChange={(e) => setAccountData({ ...accountData, maxDrawdown: e.target.value })}
              />
              <Input
                id="challengeCost"
                label={t("accounts.funded.challengeCost")}
                type="number"
                placeholder="499"
                value={accountData.challengeCost}
                onChange={(e) => setAccountData({ ...accountData, challengeCost: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("account")}>
                {t("common.back")}
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setStep("complete")}>
                {t("common.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <Card variant="glow" className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-profit/10">
              <Check className="h-8 w-8 text-profit" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-text-primary">
                You&apos;re all set!
              </h2>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Your account <span className="font-medium text-text-primary">{accountData.name}</span> has been configured.
                You can now see your dashboard with real-time metrics.
              </p>
            </div>

            {/* Summary card */}
            <div className="w-full rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated p-4">
              <div className="flex flex-col gap-2 text-left">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">Account</span>
                  <span className="font-medium text-text-primary">{accountData.name}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">Firm</span>
                  <span className="font-medium text-text-primary">{accountData.firm || "—"}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">Balance</span>
                  <span className="font-numbers font-medium text-text-primary">${Number(accountData.balance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">Max DD</span>
                  <span className="font-numbers font-medium text-text-primary">{accountData.maxDrawdown || "10"}%</span>
                </div>
              </div>
            </div>

            <Button className="w-full gap-2" onClick={handleFinish}>
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
