"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, Wallet, ArrowUpDown, Receipt, RefreshCw, Search } from "lucide-react";
import { useTranslations } from "@/i18n";

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/accounts": "Accounts",
  "/payouts": "Payouts",
  "/expenses": "Expenses",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const t = useTranslations();
  const title = pageTitles[pathname] ?? "Overview";

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between px-6 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle">
      <h1 className="text-[14px] font-semibold text-text-primary tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-1.5">
        {/* Search trigger */}
        <button className="flex items-center gap-2 h-7 px-2.5 rounded-[var(--radius-sm)] bg-bg-elevated border border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-default transition-all text-[11px]">
          <Search className="h-3 w-3" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline ml-2 text-[9px] text-text-muted bg-bg-surface px-1 py-0.5 rounded border border-border-subtle">⌘K</kbd>
        </button>

        {/* Quick Add */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1 h-7 px-2.5 rounded-[var(--radius-sm)] bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-colors shadow-xs">
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[180px] rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-1 shadow-lg animate-slide-up"
            >
              <DropdownMenu.Item asChild>
                <Link href="/accounts" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] text-text-secondary outline-none transition-colors hover:bg-bg-hover hover:text-text-primary cursor-pointer">
                  <Wallet className="h-3.5 w-3.5 text-text-muted" />
                  New Account
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/payouts" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] text-text-secondary outline-none transition-colors hover:bg-bg-hover hover:text-text-primary cursor-pointer">
                  <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" />
                  New Payout
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/expenses" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] text-text-secondary outline-none transition-colors hover:bg-bg-hover hover:text-text-primary cursor-pointer">
                  <Receipt className="h-3.5 w-3.5 text-text-muted" />
                  New Expense
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border-subtle mx-1" />
              <DropdownMenu.Item asChild>
                <Link href="/accounts" className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] text-text-secondary outline-none transition-colors hover:bg-bg-hover hover:text-text-primary cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5 text-text-muted" />
                  Update Balance
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
