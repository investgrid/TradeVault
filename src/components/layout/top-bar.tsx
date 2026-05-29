"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, Wallet, ArrowUpDown, Receipt, RefreshCw } from "lucide-react";
import { useTranslations } from "@/i18n";
import { Button } from "@/components/ui/button";

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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border-subtle bg-bg-base/90 px-6 backdrop-blur-md">
      <h1 className="text-[15px] font-semibold text-text-primary">
        {t(titleKey)}
      </h1>

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
            className="z-50 min-w-[180px] rounded-[var(--radius-lg)] border border-border-subtle bg-bg-surface p-1.5 shadow-xl"
          >
            <DropdownMenu.Item asChild>
              <Link href="/accounts" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                <Wallet className="h-3.5 w-3.5" />
                {t("quickAdd.addAccount")}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link href="/payouts" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {t("quickAdd.newPayout")}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link href="/expenses" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                <Receipt className="h-3.5 w-3.5" />
                {t("quickAdd.newExpense")}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />
            <DropdownMenu.Item asChild>
              <Link href="/accounts" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-medium text-text-secondary outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer">
                <RefreshCw className="h-3.5 w-3.5" />
                {t("quickAdd.updateBalance")}
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
