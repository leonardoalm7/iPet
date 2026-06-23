"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { MobileHeader } from "./MobileHeader";
import { MobileMenu } from "./MobileMenu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[240px]">
        <MobileHeader onOpenMenu={() => setMenuOpen(true)} />
        <TopBar />
        <main className="px-4 py-5 lg:px-8 lg:py-6 pb-24 lg:pb-8 max-w-screen-2xl mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
