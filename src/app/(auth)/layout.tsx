export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg-base p-4 overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-profit/[0.02] blur-[100px]" />
      </div>

      {/* Logo */}
      <div className="relative mb-8 flex flex-col items-center gap-3">
        <div className="relative">
          <img src="/logo.png" alt="TradeVault" width={44} height={44} className="rounded-[10px]" />
          <div className="absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/[0.08]" />
        </div>
        <span className="text-heading-lg tracking-tight text-text-primary">TradeVault</span>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-[380px]">{children}</div>
    </div>
  );
}
