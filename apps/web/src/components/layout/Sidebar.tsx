"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, PawPrint, Map, Plane, BookOpen, Building2,
  MapPin, Hotel, Settings, User, LogOut,
} from "lucide-react";
import { useAuthStore } from "@ipet/core";
import { createClient } from "@/lib/supabase/client";

const NAV_PRIMARY = [
  { label: "Início", href: "/", icon: Home },
  { label: "Meus Pets", href: "/passaportes", icon: PawPrint },
  { label: "Planejar Viagem", href: "/planejar", icon: Map },
  { label: "Minhas Viagens", href: "/viagens", icon: Plane },
];

const NAV_REFERENCE = [
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

  const firstName = perfil?.nomeCompleto?.split(" ")[0] ?? "Perfil";

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-[240px] bg-ink text-bone z-40 overflow-hidden">
      <div aria-hidden className="absolute inset-0 paper-grain opacity-50 pointer-events-none" />

      {/* Brand */}
      <div className="relative flex items-center gap-3 px-6 h-16 border-b border-bone/10 shrink-0">
        <div className="w-8 h-8 rounded-full bg-bone/8 ring-1 ring-bone/15 flex items-center justify-center">
          <PawPrint size={14} strokeWidth={1.5} className="text-bone" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-lg tracking-tight">iPet</p>
          <p className="kicker text-bone/40 mt-0.5">Pet Pass</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto py-5 px-4 space-y-6">
        <NavGroup label="Jornada" items={NAV_PRIMARY} pathname={pathname} />
        <NavGroup label="Referências" items={NAV_REFERENCE} pathname={pathname} />
      </nav>

      {/* Footer */}
      <div className="relative border-t border-bone/10 p-3 space-y-0.5 shrink-0">
        <SidebarItem href="/perfil" Icon={User} pathname={pathname}>
          <span className="truncate">{firstName}</span>
        </SidebarItem>
        <SidebarItem href="/configuracoes" Icon={Settings} pathname={pathname}>
          Configurações
        </SidebarItem>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-bone/45 hover:text-status-crit hover:bg-bone/[0.03] transition-colors w-full"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: typeof NAV_PRIMARY;
  pathname: string;
}) {
  return (
    <div>
      <p className="kicker text-bone/35 px-3 mb-2">{label}</p>
      <div className="space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => (
          <SidebarItem key={href} href={href} Icon={Icon} pathname={pathname}>
            {label}
          </SidebarItem>
        ))}
      </div>
    </div>
  );
}

function SidebarItem({
  href,
  Icon,
  children,
  pathname,
}: {
  href: string;
  Icon: typeof Home;
  children: React.ReactNode;
  pathname: string;
}) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
        active
          ? "bg-bone/8 text-bone"
          : "text-bone/55 hover:text-bone hover:bg-bone/[0.04]"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-[2px] bg-terracotta rounded-full"
        />
      )}
      <Icon size={15} strokeWidth={active ? 1.75 : 1.5} className="shrink-0" />
      {children}
    </Link>
  );
}
