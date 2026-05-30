"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  BarChart3,
  Menu,
} from "lucide-react";

const items = [
  { labelKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { labelKey: "nav.accounts", href: "/accounts", icon: Wallet },
  { labelKey: "nav.payouts", href: "/payouts", icon: ArrowUpDown },
  { labelKey: "nav.analytics", href: "/analytics", icon: BarChart3 },
  { labelKey: "nav.settings", href: "/settings", icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-glass-border lg:hidden glass-strong">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 transition-colors",
                isActive ? "text-accent" : "text-text-muted active:scale-95"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-accent shadow-[0_0_6px_rgba(99,102,241,0.5)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
