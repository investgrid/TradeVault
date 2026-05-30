"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageWrapper, PageSection } from "@/components/layout/page-wrapper";
import { useTranslations } from "@/i18n";
import { useI18nStore } from "@/i18n";
import { locales, localeNames } from "@/i18n/config";
import { trpc } from "@/server/trpc/client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { LogOut, Download, Trash2, CreditCard, Globe, User } from "lucide-react";

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
    <PageWrapper className="max-w-2xl">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        {/* Profile */}
        <motion.div variants={staggerItem}>
          <Card variant="elevated">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-muted" />
                <h3 className="text-heading text-text-primary">{t("settings.profile")}</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5">
                    <span className="text-[15px] font-semibold text-accent">
                      {user?.name?.[0]?.toUpperCase() ?? "T"}
                    </span>
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-accent/20" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-medium text-text-primary">{user?.name ?? "Trader"}</span>
                    <span className="text-[12px] text-text-muted">{user?.email ?? ""}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-loss hover:bg-loss/10" onClick={handleLogout}>
                  <LogOut className="h-3.5 w-3.5" />
                  {t("nav.logout")}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={staggerItem}>
          <Card variant="elevated">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-text-muted" />
                <h3 className="text-heading text-text-primary">{t("settings.preferences")}</h3>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-[13px] text-text-primary">{t("settings.baseCurrency")}</span>
                  <span className="text-[11px] text-text-muted">{t("settings.baseCurrencyDesc")}</span>
                </div>
                <span className="text-code text-[13px] text-text-secondary">{user?.currency ?? "USD"}</span>
              </div>

              <div className="h-px bg-border-subtle" />

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-[13px] text-text-primary">{t("settings.language")}</span>
                  <span className="text-[11px] text-text-muted">{t("settings.languageDesc")}</span>
                </div>
                <div className="flex gap-1">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`relative rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                        locale === l
                          ? "text-accent"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      {locale === l && (
                        <motion.div
                          layoutId="lang-indicator"
                          className="absolute inset-0 rounded-[var(--radius-sm)] bg-accent-soft border border-accent/20"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative">{localeNames[l]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Subscription */}
        <motion.div variants={staggerItem}>
          <Card variant="elevated">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-text-muted" />
                <h3 className="text-heading text-text-primary">{t("settings.subscription")}</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[13px] text-text-primary">{t("settings.currentPlan")}</span>
                  <span className="text-[11px] text-text-muted">
                    {billing?.plan === "pro" ? t("settings.plans.proLimits") : t("settings.plans.freeLimits")}
                  </span>
                </div>
                <span className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  billing?.plan === "pro"
                    ? "bg-profit-muted text-profit border border-profit/10"
                    : "bg-bg-elevated text-text-secondary border border-border-subtle"
                }`}>
                  {billing?.plan ?? "free"}
                </span>
              </div>

              {billing?.plan !== "pro" ? (
                <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-accent/20 bg-accent-soft/30 p-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.05] to-transparent" />
                  <div className="relative flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-heading text-text-primary">TradeVault Pro</span>
                      <span className="text-[12px] text-text-secondary">{t("settings.plans.proPrice")}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" isLoading={checkoutMutation.isPending} onClick={() => checkoutMutation.mutate({ billing: "monthly" })}>
                        €9/mo
                      </Button>
                      <Button size="sm" variant="secondary" isLoading={checkoutMutation.isPending} onClick={() => checkoutMutation.mutate({ billing: "annual" })}>
                        €49/year — Save 55%
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" isLoading={portalMutation.isPending} onClick={() => portalMutation.mutate()}>
                  {t("settings.manageBilling")}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Data */}
        <motion.div variants={staggerItem}>
          <Card variant="elevated">
            <div className="flex flex-col gap-4">
              <h3 className="text-heading text-text-primary">{t("settings.data")}</h3>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
                  {t("settings.exportCSV")}
                </Button>
                <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />}>
                  {t("settings.deleteAccount")}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}
