import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 px-4 py-6 pb-20 lg:px-8 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
