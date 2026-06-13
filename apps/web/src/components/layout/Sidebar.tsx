"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, PawPrint, Map, Plane, BookOpen, Building2,
  MapPin, Hotel, Settings, User, ChevronRight, LogOut,
} from "lucide-react";
import { useAuthStore } from "@ipet/core";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { label: "Início", href: "/", icon: Home },
  { label: "Meus Pets", href: "/passaportes", icon: PawPrint },
  { label: "Planejar Viagem", href: "/planejar", icon: Map },
  { label: "Minhas Viagens", href: "/viagens", icon: Plane },
  { label: "Regras por País", href: "/regras", icon: BookOpen },
  { label: "Companhias Aéreas", href: "/companhias", icon: Building2 },
  { label: "Clínicas Parceiras", href: "/clinicas", icon: MapPin },
  { label: "Hotéis Pet", href: "/hoteis", icon: Hotel },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const perfil = useAuthStore((s) => s.perfil);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/entrar");
  }

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-[240px] bg-sidebar border-r border-navy/30 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10 shrink-0">
        <span className="text-2xl">🐾</span>
        <span className="text-white font-bold text-xl tracking-tight">iPet</span>
        <span className="ml-auto text-xs text-teal-light/60 font-medium">Web</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal text-white"
                  : "text-white/70 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: perfil + configurações */}
      <div className="border-t border-white/10 p-3 space-y-1 shrink-0">
        <Link
          href="/perfil"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/perfil"
              ? "bg-teal text-white"
              : "text-white/70 hover:bg-sidebar-hover hover:text-white"
          }`}
        >
          <User size={18} />
          <span className="truncate">{perfil?.nomeCompleto?.split(" ")[0] ?? "Perfil"}</span>
        </Link>
        <Link
          href="/configuracoes"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/configuracoes"
              ? "bg-teal text-white"
              : "text-white/70 hover:bg-sidebar-hover hover:text-white"
          }`}
        >
          <Settings size={18} />
          Configurações
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
