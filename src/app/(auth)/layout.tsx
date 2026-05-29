export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base p-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <img src="/logo.png" alt="TradeVault" width={48} height={48} className="rounded-[10px]" />
        <span className="text-lg font-semibold tracking-tight text-text-primary">TradeVault</span>
      </div>
      <div className="w-full max-w-[380px]">{children}</div>
    </div>
  );
}
