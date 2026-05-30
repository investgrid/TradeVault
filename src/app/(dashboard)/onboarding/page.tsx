"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { ArrowRight, ArrowLeft, Check, Wallet, BarChart3, Shield, Sparkles } from "lucide-react";

type Step = "welcome" | "account" | "details" | "complete";
const STEPS: Step[] = ["welcome", "account", "details", "complete"];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

export default function OnboardingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [direction, setDirection] = useState(1);
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

  function goTo(next: Step) {
    const curr = STEPS.indexOf(step);
    const nextIdx = STEPS.indexOf(next);
    setDirection(nextIdx > curr ? 1 : -1);
    setStep(next);
  }

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

  const currentIdx = STEPS.indexOf(step);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: step === s ? 1.1 : 1,
                  backgroundColor: currentIdx > i
                    ? "rgba(0, 217, 126, 0.15)"
                    : step === s
                    ? "var(--accent)"
                    : "var(--bg-elevated)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold"
              >
                {currentIdx > i ? (
                  <Check className="h-3.5 w-3.5 text-profit" />
                ) : (
                  <span className={step === s ? "text-white" : "text-text-muted"}>{i + 1}</span>
                )}
              </motion.div>
              {i < 3 && (
                <motion.div
                  className="h-px w-8 rounded-full"
                  animate={{
                    backgroundColor: currentIdx > i ? "rgba(0, 217, 126, 0.3)" : "var(--border-subtle)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {step === "welcome" && (
              <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-8 text-center gradient-border card-shadow">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent" />
                <div className="relative flex flex-col items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft border border-accent/10">
                    <img src="/logo.png" alt="TradeVault" width={36} height={36} className="rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-heading-lg text-text-primary">{t("onboarding.welcome")}</h1>
                    <p className="text-[13px] leading-relaxed text-text-secondary max-w-sm">
                      {t("onboarding.addFirst")}
                    </p>
                  </div>
                  <div className="grid w-full grid-cols-3 gap-3 pt-2">
                    {[
                      { icon: Wallet, label: "Multi-Account", color: "text-accent" },
                      { icon: BarChart3, label: "Analytics", color: "text-profit" },
                      { icon: Shield, label: "Risk Control", color: "text-pending" },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex flex-col items-center gap-2.5 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated/50 p-4">
                        <Icon className={`h-5 w-5 ${color}`} />
                        <span className="text-[10px] font-medium text-text-secondary">{label}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="gradient" className="mt-2 w-full gap-2" onClick={() => goTo("account")}>
                    {t("onboarding.addAccount")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === "account" && (
              <div className="rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-8 card-shadow gradient-border">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-heading-lg text-text-primary">{t("accounts.addAccount")}</h2>
                    <p className="text-[13px] text-text-secondary">Basic info about your funded account</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="name"
                      label={t("accounts.name")}
                      placeholder="FTMO #123456"
                      icon={<Wallet className="h-3.5 w-3.5" />}
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
                    <Button variant="ghost" onClick={() => goTo("welcome")} icon={<ArrowLeft className="h-3.5 w-3.5" />}>
                      {t("common.back")}
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => goTo("details")}
                      disabled={!accountData.name || !accountData.balance}
                    >
                      {t("common.next")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-8 card-shadow gradient-border">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-heading-lg text-text-primary">Risk Parameters</h2>
                    <p className="text-[13px] text-text-secondary">Configure drawdown and challenge details</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">
                        {t("accounts.funded.drawdownType")}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["static", "trailing", "eod_trailing"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setAccountData({ ...accountData, drawdownType: type })}
                            className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-[11px] font-semibold transition-all ${
                              accountData.drawdownType === type
                                ? "border-accent bg-accent-soft text-accent shadow-sm"
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
                      label="Max Drawdown (%)"
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
                    <Button variant="ghost" onClick={() => goTo("account")} icon={<ArrowLeft className="h-3.5 w-3.5" />}>
                      {t("common.back")}
                    </Button>
                    <Button className="flex-1 gap-2" onClick={() => goTo("complete")}>
                      {t("common.next")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-8 text-center card-shadow">
                <div className="absolute inset-0 bg-gradient-to-b from-profit/[0.03] to-transparent" />
                <div className="relative flex flex-col items-center gap-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-profit/10 glow-profit"
                  >
                    <Sparkles className="h-7 w-7 text-profit" />
                  </motion.div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-heading-lg text-text-primary">You&apos;re all set!</h2>
                    <p className="text-[13px] leading-relaxed text-text-secondary">
                      Your account <span className="font-medium text-text-primary">{accountData.name}</span> is ready.
                    </p>
                  </div>

                  <div className="w-full rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated/50 p-4">
                    <div className="flex flex-col gap-2.5 text-left">
                      {[
                        ["Account", accountData.name],
                        ["Firm", accountData.firm || "—"],
                        ["Balance", `$${Number(accountData.balance || 0).toLocaleString()}`],
                        ["Max DD", `${accountData.maxDrawdown || "10"}%`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between text-[12px]">
                          <span className="text-text-muted">{label}</span>
                          <span className="text-code text-text-primary">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="gradient" className="w-full gap-2" onClick={handleFinish} isLoading={createAccount.isPending}>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
