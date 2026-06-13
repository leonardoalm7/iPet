import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      {/* Desktop: offset pelo sidebar */}
      <div className="lg:pl-[240px]">
        <TopBar />
        <main className="px-4 py-6 lg:px-8 pb-24 lg:pb-8 max-w-screen-xl">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
