"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus, Menu, PawPrint } from "lucide-react";

const TITLES: Record<string, string> = {
  "/": "Início",
  "/passaportes": "Meus pets",
  "/planejar": "Planejar",
  "/viagens": "Viagens",
  "/regras": "Regras",
  "/companhias": "Companhias",
  "/clinicas": "Clínicas",
  "/hoteis": "Hotéis",
  "/perfil": "Perfil",
  "/configuracoes": "Configurações",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/viagens/")) return "Viagem";
  if (pathname.startsWith("/passaporte/")) return "Passaporte";
  if (pathname.startsWith("/pets/novo")) return "Novo pet";
  if (pathname.startsWith("/pets/")) return "Editar pet";
  if (pathname.startsWith("/regras/")) return "Regras";
  if (pathname.startsWith("/embarque/")) return "Embarque";
  if (pathname.startsWith("/checkout")) return "Checkout";
  if (pathname.startsWith("/ferramentas/")) return "Ferramentas";
  return "iPet";
}

export function MobileHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-bone/85 backdrop-blur-md border-b border-border flex items-center h-14 px-4 gap-2">
      <button
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="p-2 -ml-1 text-ink/65 hover:text-ink hover:bg-paper rounded-full transition-colors focus-ring"
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>
      {isHome ? (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center">
            <PawPrint size={12} strokeWidth={1.5} className="text-bone" />
          </div>
          <span className="font-display text-lg text-ink tracking-tight">iPet</span>
        </div>
      ) : (
        <h1 className="font-display text-[16px] text-ink tracking-tight truncate">
          {resolveTitle(pathname)}
        </h1>
      )}
      <div className="ml-auto flex items-center gap-0.5">
        <Link
          href="/pets/novo"
          aria-label="Novo pet"
          className="p-2 text-ink/65 hover:text-ink hover:bg-paper rounded-full transition-colors"
        >
          <Plus size={18} strokeWidth={1.5} />
        </Link>
        <button
          aria-label="Notificações"
          className="p-2 text-ink/65 hover:text-ink hover:bg-paper rounded-full transition-colors"
        >
          <Bell size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
