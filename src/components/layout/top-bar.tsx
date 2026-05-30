"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, Wallet, ArrowUpDown, Receipt, RefreshCw, Command } from "lucide-react";
import { useTranslations } from "@/i18n";
import { Button } from "@/components/ui/button";
import { scaleIn } from "@/lib/motion";

const pageKeys: Record<string, string> = {
  "/": "nav.dashboard",
  "/accounts": "nav.accounts",
  "/payouts": "nav.payouts",
  "/expenses": "nav.expenses",
  "/analytics": "nav.analytics",
  "/settings": "nav.settings",
  "/onboarding": "nav.dashboard",
};

export function TopBar() {
  const pathname = usePathname();
  const t = useTranslations();
  const titleKey = pageKeys[pathname] ?? "nav.dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border-subtle px-6 glass">
      <div className="flex items-center gap-3">
        <h1 className="text-heading text-text-primary">
          {t(titleKey)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Command palette hint */}
        <button className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] border border-border-subtle bg-bg-elevated/50 text-text-muted hover:text-text-secondary hover:border-border-default transition-all duration-200">
          <Command className="h-3 w-3" />
          <span className="text-[11px]">K</span>
        </button>

        {/* Quick Add */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("nav.quickAdd")}</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              asChild
            >
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={scaleIn}
                className="z-50 min-w-[200px] rounded-[var(--radius-lg)] border border-border-subtle bg-bg-surface p-1.5 shadow-xl"
              >
                <DropdownMenu.Item asChild>
                  <Link href="/accounts" className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                    <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft">
                      <Wallet className="h-3.5 w-3.5 text-accent" />
                    </div>
                    {t("quickAdd.addAccount")}
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/payouts" className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                    <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-profit-muted">
                      <ArrowUpDown className="h-3.5 w-3.5 text-profit" />
                    </div>
                    {t("quickAdd.newPayout")}
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/expenses" className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                    <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-loss-muted">
                      <Receipt className="h-3.5 w-3.5 text-loss" />
                    </div>
                    {t("quickAdd.newExpense")}
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1.5 h-px bg-border-subtle" />
                <DropdownMenu.Item asChild>
                  <Link href="/accounts" className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                    <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-pending-muted">
                      <RefreshCw className="h-3.5 w-3.5 text-pending" />
                    </div>
                    {t("quickAdd.updateBalance")}
                  </Link>
                </DropdownMenu.Item>
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
