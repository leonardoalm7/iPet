"use client";

import Link from "next/link";
import { Home, BookOpen, Plane, PlusCircle } from "lucide-react";

type NavItem = "home" | "passaportes" | "viagens";

interface Props {
  active: NavItem;
}

const items = [
  { id: "home" as NavItem, label: "Início", icon: Home, href: "/" },
  { id: "passaportes" as NavItem, label: "Passaportes", icon: BookOpen, href: "/passaportes" },
  { id: "viagens" as NavItem, label: "Viagens", icon: Plane, href: "/viagens" },
];

export function BottomNav({ active }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur border-t border-gray-200 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive
                  ? "text-teal"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
