"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PawPrint, Map, Plane, User } from "lucide-react";

const TABS = [
  { label: "Início", href: "/", icon: Home },
  { label: "Pets", href: "/passaportes", icon: PawPrint },
  { label: "Planejar", href: "/planejar", icon: Map },
  { label: "Viagens", href: "/viagens", icon: Plane },
  { label: "Perfil", href: "/perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 safe-area-pb">
      <div className="flex">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                active ? "text-teal" : "text-navy/40"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
