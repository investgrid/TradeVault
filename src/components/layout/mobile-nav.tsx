"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutGrid, Wallet, Shield, BarChart3, Menu } from "lucide-react";

const NAV = [
  { label: "Home", href: "/", icon: LayoutGrid },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Risk", href: "/risk", icon: Shield },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "More", href: "/settings", icon: Menu },
];

export function MobileNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-line-1 lg:hidden glass-strong">
      <div className="flex h-14 items-center justify-around">
        {NAV.map((item) => {
          const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("relative flex flex-col items-center gap-0.5 px-3 py-1", active ? "text-brand" : "text-t4")}>
              <item.icon className="h-4 w-4" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] font-medium">{item.label}</span>
              {active && <motion.div layoutId="mob" className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-brand" transition={{ type: "spring", stiffness: 350, damping: 28 }} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
