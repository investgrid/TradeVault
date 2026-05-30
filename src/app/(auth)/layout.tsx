import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-layer-0 p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-brand/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-up/[0.015] blur-[100px]" />
      </div>

      <div className="relative mb-8 flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center ring-1 ring-brand/20">
          <Zap className="h-5 w-5 text-brand" />
        </div>
        <span className="text-[16px] font-bold tracking-tight text-t1">TradeVault</span>
      </div>

      <div className="relative w-full max-w-[380px]">{children}</div>
    </div>
  );
}
