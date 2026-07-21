"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, PawPrint, Map, Plane, BookOpen, Building2,
  MapPin, Hotel, Settings, User, LogOut, X,
} from "lucide-react";
import { useAuthStore } from "@ipet/core";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_PRIMARY = [
  { label: "Início", href: "/", icon: Home },
  { label: "Meus pets", href: "/passaportes", icon: PawPrint },
  { label: "Planejar viagem", href: "/planejar", icon: Map },
  { label: "Minhas viagens", href: "/viagens", icon: Plane },
];

const NAV_REFERENCE = [
  { label: "Regras por país", href: "/regras", icon: BookOpen },
  { label: "Companhias aéreas", href: "/companhias", icon: Building2 },
  { label: "Clínicas parceiras", href: "/clinicas", icon: MapPin },
  { label: "Hotéis pet", href: "/hoteis", icon: Hotel },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const perfil = useAuthStore((s) => s.perfil);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => { onClose(); }, [pathname, onClose]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/auth/entrar");
  }

  const firstName = perfil?.nomeCompleto?.split(" ")[0] ?? "Perfil";

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-label="Fechar menu"
            onClick={onClose}
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-ink text-bone w-80 max-w-[88vw] h-full flex flex-col overflow-hidden"
          >
            <div aria-hidden className="absolute inset-0 paper-grain opacity-50 pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center gap-3 px-5 h-16 border-b border-bone/10 shrink-0">
              <div className="w-8 h-8 rounded-full bg-bone/8 ring-1 ring-bone/15 flex items-center justify-center">
                <PawPrint size={14} strokeWidth={1.5} className="text-bone" />
              </div>
              <div className="leading-tight">
                <p className="font-display text-lg tracking-tight">iPet</p>
                <p className="kicker text-bone/40 mt-0.5">Pet Pass</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="ml-auto p-2 text-bone/55 hover:text-bone hover:bg-bone/8 rounded-full transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Nav */}
            <nav className="relative flex-1 overflow-y-auto py-6 px-4 space-y-6">
              <MenuGroup label="Jornada" items={NAV_PRIMARY} pathname={pathname} />
              <MenuGroup label="Referências" items={NAV_REFERENCE} pathname={pathname} />
            </nav>

            {/* Footer */}
            <div className="relative border-t border-bone/10 p-3 space-y-0.5 shrink-0">
              <MenuItem href="/perfil" Icon={User} pathname={pathname}>
                <span className="truncate">{firstName}</span>
              </MenuItem>
              <MenuItem href="/configuracoes" Icon={Settings} pathname={pathname}>
                Configurações
              </MenuItem>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-bone/45 hover:text-status-crit hover:bg-bone/[0.03] transition-colors w-full"
              >
                <LogOut size={15} strokeWidth={1.5} />
                Sair
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MenuGroup({
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
          <MenuItem key={href} href={href} Icon={Icon} pathname={pathname}>
            {label}
          </MenuItem>
        ))}
      </div>
    </div>
  );
}

function MenuItem({
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
      className={`relative flex items-center gap-3 px-3 py-3 rounded-lg text-[14px] font-medium transition-all ${
        active
          ? "bg-bone/8 text-bone"
          : "text-bone/55 hover:text-bone hover:bg-bone/[0.04]"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-2.5 bottom-2.5 w-[2px] bg-terracotta rounded-full"
        />
      )}
      <Icon size={16} strokeWidth={active ? 1.75 : 1.5} className="shrink-0" />
      {children}
    </Link>
  );
}
