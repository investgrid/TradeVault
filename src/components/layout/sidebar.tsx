"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import { trpc } from "@/server/trpc/client";
import { authClient } from "@/lib/auth-client";
import { staggerContainer, staggerItem } from "@/lib/motion";
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
  const router = useRouter();
  const t = useTranslations();
  const { data: user } = trpc.user.me.useQuery();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] flex-col border-r border-border-subtle bg-bg-surface lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="relative">
          <img src="/logo.png" alt="TradeVault" width={28} height={28} className="rounded-[6px]" />
          <div className="absolute inset-0 rounded-[6px] ring-1 ring-inset ring-white/[0.06]" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          TradeVault
        </span>
      </div>

      {/* Navigation */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-1 flex-col gap-1 px-3 pt-4"
      >
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <motion.div key={item.href} variants={staggerItem}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary"
                )}
              >
                {/* Active background with glow */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-[var(--radius-md)] bg-accent-medium border border-accent/[0.08]"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}

                {/* Active left indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}

                <item.icon className={cn(
                  "relative h-[18px] w-[18px] transition-colors duration-200",
                  isActive ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
                )} />
                <span className="relative">{t(item.labelKey)}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 border-t border-border-subtle px-3 py-3">
        <Link
          href="/settings"
          className={cn(
            "group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-accent-medium text-text-primary"
              : "text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary"
          )}
        >
          <Settings className={cn(
            "h-[18px] w-[18px] transition-colors",
            pathname === "/settings" ? "text-accent" : "text-text-muted"
          )} />
          {t("nav.settings")}
        </Link>
      </div>

      {/* User section */}
      <div className="border-t border-border-subtle px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5">
            <span className="text-[11px] font-semibold text-accent">
              {user?.name?.[0]?.toUpperCase() ?? "T"}
            </span>
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-accent/20" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-[13px] font-medium text-text-primary truncate">
              {user?.name ?? "Trader"}
            </span>
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
              {user?.plan ?? "free"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-[var(--radius-sm)] p-1.5 text-text-muted transition-all duration-200 hover:bg-loss/10 hover:text-loss"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
