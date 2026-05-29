"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { labelKey: "nav.accounts", href: "/accounts", icon: Wallet },
  { labelKey: "nav.payouts", href: "/payouts", icon: ArrowUpDown },
  { labelKey: "nav.expenses", href: "/expenses", icon: Receipt },
  { labelKey: "nav.analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] flex-col border-r border-border-subtle bg-bg-surface lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <img src="/logo.png" alt="TradeVault" width={32} height={32} className="rounded-[6px]" />
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          TradeVault
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-medium text-text-primary"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
              )}
              <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-accent")} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-0.5 border-t border-border-subtle px-3 py-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-accent-medium text-text-primary"
              : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          {t("nav.settings")}
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-border-subtle px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 ring-1 ring-border-subtle">
            <span className="text-[11px] font-semibold text-accent">T</span>
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-[13px] font-medium text-text-primary">Trader</span>
            <span className="text-[11px] text-text-muted">Free Plan</span>
          </div>
          <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
