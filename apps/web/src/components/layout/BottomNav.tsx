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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bone/90 backdrop-blur-lg border-t border-border z-40 safe-area-pb">
      <div className="flex">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center pt-2.5 pb-2 gap-1 group"
            >
              <div
                className={`relative h-9 w-12 flex items-center justify-center rounded-full transition-all ${
                  active ? "bg-ink" : ""
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 1.75 : 1.5}
                  className={`transition-colors ${
                    active ? "text-bone" : "text-ink/45 group-hover:text-ink"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] tracking-wider transition-colors ${
                  active ? "text-ink font-medium" : "text-ink/45"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
