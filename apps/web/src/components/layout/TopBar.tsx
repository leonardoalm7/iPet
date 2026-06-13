"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";

const TITLES: Record<string, string> = {
  "/": "Início",
  "/passaportes": "Meus Pets",
  "/planejar": "Planejar Viagem",
  "/viagens": "Minhas Viagens",
  "/regras": "Regras por País",
  "/companhias": "Companhias Aéreas",
  "/clinicas": "Clínicas Parceiras",
  "/hoteis": "Hotéis Pet",
  "/perfil": "Meu Perfil",
  "/configuracoes": "Configurações",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/viagens/")) return "Detalhe da Viagem";
  if (pathname.startsWith("/passaporte/")) return "Passaporte";
  if (pathname.startsWith("/pets/novo")) return "Novo Pet";
  if (pathname.startsWith("/pets/")) return "Editar Pet";
  if (pathname.startsWith("/regras/")) return "Regras do Destino";
  if (pathname.startsWith("/embarque/")) return "Embarque";
  return "iPet";
}

export function TopBar() {
  const pathname = usePathname();
  return (
    <header className="hidden lg:flex items-center h-16 px-6 bg-white border-b border-border sticky top-0 z-30">
      <h1 className="text-navy font-semibold text-lg">{resolveTitle(pathname)}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/pets/novo"
          className="flex items-center gap-1.5 bg-teal text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-teal-dark transition-colors"
        >
          <Plus size={15} />
          Novo Pet
        </Link>
        <button className="relative p-2 text-navy/60 hover:text-navy hover:bg-surface rounded-lg transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
