"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Payouts", href: "/payouts", icon: ArrowUpDown },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const { data: user } = trpc.user.me.useQuery();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[220px] flex-col bg-bg-surface lg:flex border-r border-border-subtle">
      {/* Workspace header */}
      <div className="flex h-[52px] items-center gap-2.5 px-4 border-b border-border-subtle">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
          <img src="/logo.png" alt="" width={16} height={16} className="rounded-[3px]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-text-primary leading-tight tracking-tight">
            TradeVault
          </span>
          <span className="text-[10px] text-text-tertiary leading-tight">
            {user?.plan === "pro" ? "Pro" : "Free"} workspace
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-3">
        <span className="px-2 mb-1 text-[10px] font-medium text-text-muted uppercase tracking-wider">
          Platform
        </span>
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "text-text-primary bg-bg-active"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-[var(--radius-md)] bg-bg-active border border-border-default"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3 w-3 text-text-muted" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150",
            pathname === "/settings"
              ? "text-text-primary bg-bg-active"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
          )}
        >
          <Settings className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
          Settings
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-border-subtle px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-accent/5 text-[10px] font-bold text-accent ring-1 ring-border-default">
            {user?.name?.[0]?.toUpperCase() ?? "T"}
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="text-[12px] font-medium text-text-primary truncate leading-tight">
              {user?.name ?? "Trader"}
            </span>
            <span className="text-[10px] text-text-muted truncate leading-tight">
              {user?.email ?? ""}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-[var(--radius-sm)] p-1 text-text-muted hover:text-loss hover:bg-loss-muted transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
