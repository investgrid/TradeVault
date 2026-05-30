"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { trpc } from "@/server/trpc/client";
import { authClient } from "@/lib/auth-client";
import {
  LayoutGrid, Wallet, ArrowUpDown, Receipt, BarChart3, Shield,
  Target, Calendar, BookOpen, Activity, Settings, LogOut, Zap,
  type LucideIcon,
} from "lucide-react";

const MAIN = [
  { label: "Control Center", href: "/", icon: LayoutGrid },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Payouts", href: "/payouts", icon: ArrowUpDown },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Risk", href: "/risk", icon: Shield },
];

const ANALYSIS = [
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Journal", href: "/journal", icon: BookOpen },
  { label: "Trades", href: "/trades", icon: Activity },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Goals", href: "/goals", icon: Target },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { data: user } = trpc.user.me.useQuery();

  const active = (href: string) => href === "/" ? path === "/" : path.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[var(--sidebar)] flex-col border-r border-line-1 bg-layer-1 lg:flex">
      {/* Brand */}
      <div className="flex h-[var(--header)] items-center gap-2.5 px-5 border-b border-line-0">
        <div className="h-[22px] w-[22px] rounded-md bg-brand/15 flex items-center justify-center ring-1 ring-brand/20">
          <Zap className="h-3 w-3 text-brand" />
        </div>
        <span className="text-[13px] font-bold tracking-tight text-t1">TradeVault</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        <NavGroup items={MAIN} path={path} />
        <div className="mx-2 h-px bg-line-0" />
        <NavGroup items={ANALYSIS} path={path} />
      </nav>

      {/* Footer */}
      <div className="border-t border-line-0 p-3 space-y-1">
        <Item item={{ label: "Settings", href: "/settings", icon: Settings }} isActive={active("/settings")} />
        <div className="flex items-center gap-2.5 mt-3 px-2.5 py-1">
          <div className="h-6 w-6 rounded-full bg-brand/10 text-[9px] font-bold text-brand flex items-center justify-center ring-1 ring-line-1 shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "T"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-t1 truncate leading-none">{user?.name ?? "Trader"}</div>
            <div className="text-[9px] text-t4 truncate leading-none mt-0.5">{user?.email ?? ""}</div>
          </div>
          <button onClick={async () => { await authClient.signOut(); router.push("/login"); }} className="p-1 text-t4 hover:text-down transition-colors">
            <LogOut className="h-3 w-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavGroup({ items, path }: { items: { label: string; href: string; icon: LucideIcon }[]; path: string }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const isActive = item.href === "/" ? path === "/" : path.startsWith(item.href);
        return <Item key={item.href} item={item} isActive={isActive} />;
      })}
    </div>
  );
}

function Item({ item, isActive }: { item: { label: string; href: string; icon: LucideIcon }; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-[var(--r-md)] px-2.5 py-[7px] text-[12px] font-medium transition-all duration-100",
        isActive ? "text-t1 bg-layer-3" : "text-t3 hover:text-t2 hover:bg-layer-2"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="nav-pill"
          className="absolute left-0 top-[6px] bottom-[6px] w-[2.5px] rounded-full bg-brand"
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      )}
      <item.icon className={cn("h-[14px] w-[14px] shrink-0", isActive ? "text-brand" : "text-t4 group-hover:text-t3")} strokeWidth={isActive ? 2 : 1.5} />
      {item.label}
    </Link>
  );
}
