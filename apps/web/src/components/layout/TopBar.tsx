"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";

const TITLES: Record<string, { kicker: string; title: string }> = {
  "/":             { kicker: "Hoje",        title: "Início" },
  "/passaportes":  { kicker: "Cadastrados", title: "Meus pets" },
  "/planejar":     { kicker: "Novo plano",  title: "Planejar viagem" },
  "/viagens":      { kicker: "Histórico",   title: "Minhas viagens" },
  "/regras":       { kicker: "Compliance",  title: "Regras por país" },
  "/companhias":   { kicker: "Parceiras",   title: "Companhias aéreas" },
  "/clinicas":     { kicker: "Próximas",    title: "Clínicas parceiras" },
  "/hoteis":       { kicker: "Hospedagem",  title: "Hotéis pet" },
  "/perfil":       { kicker: "Conta",       title: "Meu perfil" },
  "/configuracoes":{ kicker: "Preferências",title: "Configurações" },
};

function resolveTitle(pathname: string): { kicker: string; title: string } {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/viagens/"))    return { kicker: "Plano",       title: "Detalhe da viagem" };
  if (pathname.startsWith("/passaporte/")) return { kicker: "Pet Pass",    title: "Passaporte" };
  if (pathname.startsWith("/pets/novo"))   return { kicker: "Cadastro",    title: "Novo pet" };
  if (pathname.startsWith("/pets/"))       return { kicker: "Edição",      title: "Editar pet" };
  if (pathname.startsWith("/regras/"))     return { kicker: "Destino",     title: "Regras do destino" };
  if (pathname.startsWith("/embarque/"))   return { kicker: "Aeroporto",   title: "Embarque" };
  if (pathname.startsWith("/checkout"))    return { kicker: "Pagamento",   title: "Checkout" };
  return { kicker: "", title: "iPet" };
}

export function TopBar() {
  const pathname = usePathname();
  const { kicker, title } = resolveTitle(pathname);
  return (
    <header className="hidden lg:flex items-center h-16 px-8 bg-bone/85 backdrop-blur-md border-b border-border sticky top-0 z-30">
      <div className="leading-tight">
        {kicker && <p className="kicker text-terracotta">{kicker}</p>}
        <h1 className="font-display text-[17px] text-ink tracking-tight mt-0.5">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/pets/novo"
          className="group flex items-center gap-1.5 bg-ink text-bone text-[12px] font-medium tracking-tight px-4 py-2 rounded-full hover:bg-sage transition-colors"
        >
          <Plus size={13} strokeWidth={1.75} className="transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:rotate-90" />
          Novo pet
        </Link>
        <button
          aria-label="Notificações"
          className="relative p-2 text-ink/55 hover:text-ink hover:bg-paper rounded-full transition-colors focus-ring"
        >
          <Bell size={17} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
