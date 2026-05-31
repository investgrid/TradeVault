"use client";

import { trpc } from "@/server/trpc/client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useI18nStore } from "@/i18n";
import { locales, localeNames } from "@/i18n/config";
import { LogOut, Download, Trash2, CreditCard, Globe, User } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { locale, setLocale } = useI18nStore();
  const { data: user } = trpc.user.me.useQuery();
  const { data: billing } = trpc.billing.getSubscription.useQuery();
  const checkout = trpc.billing.createCheckout.useMutation({ onSuccess: (d) => { if (d.url) window.location.href = d.url; } });
  const portal = trpc.billing.createPortal.useMutation({ onSuccess: (d) => { if (d.url) window.location.href = d.url; } });

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile */}
      <div className="card card-body space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-t4" />
          <span className="f-label">Profile</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-[14px] font-semibold text-brand ring-1 ring-brand/20">
              {user?.name?.[0]?.toUpperCase() ?? "T"}
            </div>
            <div>
              <div className="text-[13px] font-medium text-t1">{user?.name ?? "Trader"}</div>
              <div className="f-sub">{user?.email ?? ""}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 h-[28px] px-3 rounded-[var(--r-sm)] border border-line-1 text-[10px] text-t3 hover:text-down hover:border-down/20 hover:bg-down-soft transition-colors">
            <LogOut className="h-3 w-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="card card-body space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-t4" />
          <span className="f-label">Preferences</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-[12px] text-t1">Base Currency</div>
            <div className="f-micro">Used for all calculations</div>
          </div>
          <span className="f-num text-t2">{user?.currency ?? "USD"}</span>
        </div>
        <div className="h-px bg-line-0" />
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-[12px] text-t1">Language</div>
            <div className="f-micro">Interface language</div>
          </div>
          <div className="flex gap-1">
            {locales.map((l) => (
              <button key={l} onClick={() => setLocale(l)} className={`px-2.5 py-1 rounded-[var(--r-sm)] text-[10px] font-medium transition-colors ${locale === l ? "bg-brand-soft text-brand" : "text-t4 hover:text-t2"}`}>
                {localeNames[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card card-body space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5 text-t4" />
          <span className="f-label">Subscription</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-t1">Current Plan</div>
            <div className="f-micro">{billing?.plan === "pro" ? "Unlimited accounts, advanced analytics" : "Up to 3 accounts"}</div>
          </div>
          <span className={`pill ${billing?.plan === "pro" ? "pill-up" : "pill-muted"}`}>{(billing?.plan ?? "free").toUpperCase()}</span>
        </div>

        {billing?.plan !== "pro" ? (
          <div className="rounded-[var(--r-lg)] border border-brand/15 bg-brand-soft/30 p-4">
            <div className="text-[13px] font-semibold text-t1 mb-1">TradeVault Pro</div>
            <div className="f-sub mb-3">Unlimited accounts, risk rules, advanced analytics</div>
            <div className="flex gap-2">
              <button onClick={() => checkout.mutate({ billing: "monthly" })} disabled={checkout.isPending} className="h-8 px-3 rounded-[var(--r-md)] bg-brand text-white text-[11px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">€9/mo</button>
              <button onClick={() => checkout.mutate({ billing: "annual" })} disabled={checkout.isPending} className="h-8 px-3 rounded-[var(--r-md)] border border-brand/20 text-brand text-[11px] font-medium hover:bg-brand-soft transition-colors disabled:opacity-50">€49/year — Save 55%</button>
            </div>
          </div>
        ) : (
          <button onClick={() => portal.mutate()} disabled={portal.isPending} className="h-8 px-3 rounded-[var(--r-md)] border border-line-1 text-[11px] text-t2 hover:bg-layer-3 transition-colors">Manage Billing</button>
        )}
      </div>

      {/* Data */}
      <div className="card card-body space-y-4">
        <span className="f-label">Data</span>
        <div className="flex gap-2">
          <button onClick={() => window.open("/api/export?type=all", "_blank")} className="flex items-center gap-1.5 h-8 px-3 rounded-[var(--r-md)] border border-line-1 text-[11px] text-t2 hover:bg-layer-3 transition-colors">
            <Download className="h-3 w-3" /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-[var(--r-md)] border border-down/20 text-[11px] text-down hover:bg-down-soft transition-colors">
            <Trash2 className="h-3 w-3" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
