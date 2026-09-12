import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-paper dark:bg-ink">
      <Sidebar />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}