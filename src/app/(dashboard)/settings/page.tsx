"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";
import { useI18nStore } from "@/i18n";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { trpc } from "@/server/trpc/client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { locale, setLocale } = useI18nStore();
  const { data: user } = trpc.user.me.useQuery();
  const { data: billing } = trpc.billing.getSubscription.useQuery();
  const checkoutMutation = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => { if (data.url) window.location.href = data.url; },
  });
  const portalMutation = trpc.billing.createPortal.useMutation({
    onSuccess: (data) => { if (data.url) window.location.href = data.url; },
  });

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Profile */}
      <Card variant="elevated">
        <div className="flex flex-col gap-4">
          <h3 className="text-[13px] font-semibold text-text-primary">{t("settings.profile")}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 ring-1 ring-border-subtle">
                <span className="text-[15px] font-semibold text-accent">
                  {user?.name?.[0]?.toUpperCase() ?? "T"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-text-primary">{user?.name ?? "Trader"}</span>
                <span className="text-[12px] text-text-muted">{user?.email ?? ""}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card variant="elevated">
        <div className="flex flex-col gap-5">
          <h3 className="text-[13px] font-semibold text-text-primary">{t("settings.preferences")}</h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] text-text-primary">{t("settings.baseCurrency")}</span>
              <span className="text-[11px] text-text-muted">{t("settings.baseCurrencyDesc")}</span>
            </div>
            <span className="font-numbers text-[13px] font-medium text-text-secondary">{user?.currency ?? "USD"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] text-text-primary">{t("settings.language")}</span>
              <span className="text-[11px] text-text-muted">{t("settings.languageDesc")}</span>
            </div>
            <div className="flex gap-1.5">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                    locale === l
                      ? "bg-accent-soft text-accent border border-accent/30"
                      : "text-text-muted hover:text-text-secondary border border-transparent"
                  }`}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card variant="elevated">
        <div className="flex flex-col gap-5">
          <h3 className="text-[13px] font-semibold text-text-primary">{t("settings.subscription")}</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] text-text-primary">{t("settings.currentPlan")}</span>
              <span className="text-[11px] text-text-muted">
                {billing?.plan === "pro" ? t("settings.plans.proLimits") : t("settings.plans.freeLimits")}
              </span>
            </div>
            <span className="rounded-[var(--radius-sm)] bg-bg-elevated px-2.5 py-1 text-[11px] font-semibold text-text-secondary uppercase">
              {billing?.plan ?? "free"}
            </span>
          </div>

          {billing?.plan !== "pro" ? (
            <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-accent/20 bg-accent-soft p-4">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-text-primary">TradeVault Pro</span>
                <span className="text-[11px] text-text-secondary">{t("settings.plans.proPrice")}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => checkoutMutation.mutate({ billing: "monthly" })} disabled={checkoutMutation.isPending}>
                  €9/mo
                </Button>
                <Button size="sm" variant="secondary" onClick={() => checkoutMutation.mutate({ billing: "annual" })} disabled={checkoutMutation.isPending}>
                  €49/year
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
              {t("settings.manageBilling")}
            </Button>
          )}
        </div>
      </Card>

      {/* Data */}
      <Card variant="elevated">
        <div className="flex flex-col gap-4">
          <h3 className="text-[13px] font-semibold text-text-primary">{t("settings.data")}</h3>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">{t("settings.exportCSV")}</Button>
            <Button variant="danger" size="sm">{t("settings.deleteAccount")}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
