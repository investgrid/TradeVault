"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-subtle bg-bg-surface/95 backdrop-blur-lg lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors",
                isActive ? "text-accent" : "text-text-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
