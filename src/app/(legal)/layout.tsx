import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-border-subtle">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-text-primary hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="TradeVault" width={20} height={20} className="rounded-[4px]" />
            <span className="text-[14px] font-semibold tracking-tight">TradeVault</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="border-t border-border-subtle">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between text-[11px] text-text-muted">
          <span>&copy; {new Date().getFullYear()} TradeVault. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
