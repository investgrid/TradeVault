import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-layer-0">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-[var(--sidebar)]">
        <TopBar />
        <main className="flex-1 px-5 py-4 pb-20 lg:px-6 lg:py-5 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
