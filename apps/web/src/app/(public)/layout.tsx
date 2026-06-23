import Link from "next/link";
import { PawPrint, Plane, ShieldCheck } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.2fr_1fr]">
        {/* ──────────── Editorial panel (left) ──────────── */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink text-bone p-12 xl:p-16">
          {/* atmospheric layers */}
          <div
            aria-hidden
            className="absolute inset-0 paper-grain opacity-80"
          />
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-[460px] h-[460px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,123,78,0.18) 0%, transparent 65%)",
            }}
          />
          <div
            aria-hidden
            className="absolute -bottom-40 -left-20 w-[520px] h-[520px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(63,92,76,0.35) 0%, transparent 60%)",
            }}
          />

          {/* logo */}
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bone/8 backdrop-blur-sm flex items-center justify-center ring-1 ring-bone/15">
              <PawPrint size={18} strokeWidth={1.5} className="text-bone" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-xl tracking-tight">iPet</p>
              <p className="kicker text-bone/45 mt-0.5">Pet Pass</p>
            </div>
          </div>

          {/* editorial copy */}
          <div className="relative max-w-md">
            <p className="kicker text-terracotta/80">N.º 01 — Concierge</p>
            <h1 className="font-display text-[clamp(2.5rem,4vw,3.75rem)] leading-[1.02] font-light tracking-tight mt-5">
              A viagem do seu pet,{" "}
              <em className="font-display-soft italic text-terracotta">
                cuidada
              </em>{" "}
              do primeiro carimbo ao embarque.
            </h1>
            <div className="editorial-rule my-8 opacity-30" />
            <p className="text-bone/65 text-sm leading-relaxed max-w-sm">
              Reúna documentos, vacinas e prazos em um único painel.
              Construído com veterinários, validado em rotas reais.
            </p>
          </div>

          {/* footnotes */}
          <div className="relative flex items-center gap-8 text-xs text-bone/55">
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} strokeWidth={1.5} />
              Compliance VIGIAGRO
            </span>
            <span className="flex items-center gap-2">
              <Plane size={14} strokeWidth={1.5} />
              Brasil · UE · Japão
            </span>
          </div>
        </aside>

        {/* ──────────── Form panel (right) ──────────── */}
        <main className="relative flex flex-col">
          {/* mobile mini-brand */}
          <div className="lg:hidden flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
                <PawPrint size={14} strokeWidth={1.5} className="text-bone" />
              </div>
              <span className="font-display text-lg">iPet</span>
            </div>
            <Link
              href="/auth/login"
              className="kicker text-ink/60 hover:text-ink transition-colors"
            >
              Entrar
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-12 sm:p-12">
            {children}
          </div>

          <footer className="border-t border-border/60 px-6 py-5 sm:px-12 flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center justify-between text-[11px] text-muted">
            <span>© {new Date().getFullYear()} iPet · Pet Pass</span>
            <div className="flex gap-5">
              <Link href="/lgpd" className="link-underline">LGPD</Link>
              <Link href="/regras" className="link-underline">Regras</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
