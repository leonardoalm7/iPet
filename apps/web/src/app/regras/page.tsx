import Link from "next/link";
import type { Metadata } from "next";
import { getAllSlugs } from "@ipet/core/data/destination-slugs";
import { loadDestinationRules } from "@ipet/core/services/kb-public-loader";
import { ShieldCheck, ChevronRight } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Regras por país para viajar com pets — iPet",
  description:
    "Requisitos sanitários, vacinas, microchip e prazos para viajar com cães e gatos para mais de 70 destinos.",
};

export default function RegrasPage() {
  const slugs = getAllSlugs();
  const destinos = slugs
    .map((slug) => {
      const regras = loadDestinationRules(slug);
      if (!regras) return null;
      const tags = [
        regras.rules.exigeMicrochip && "Microchip",
        regras.rules.exigeVacina && "Vacina",
        regras.rules.exigeSorologia && "Sorologia",
        regras.rules.exigeCVI && "CVI",
        regras.rules.exigePermissaoImportacao && "Permissão",
      ].filter(Boolean) as string[];
      return { slug, regras, tags };
    })
    .filter(Boolean) as NonNullable<{
      slug: string;
      regras: NonNullable<ReturnType<typeof loadDestinationRules>>;
      tags: string[];
    }>[];

  return (
    <article className="space-y-10">
      <header>
        <p className="kicker text-terracotta flex items-center gap-1.5">
          <ShieldCheck size={11} strokeWidth={1.5} /> Compliance sanitário
        </p>
        <h1 className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-[1.05] font-light tracking-tight text-ink mt-3">
          Regras por{" "}
          <span className="font-display-soft italic text-sage-deep">país</span>
        </h1>
        <p className="text-[14px] text-muted mt-4 leading-relaxed max-w-2xl">
          Requisitos sanitários atualizados para viajar com seu pet. {destinos.length}{" "}
          destinos curados manualmente com fonte oficial. Use como ponto de partida —
          sempre confirme com MAPA/VIGIAGRO antes de comprar passagem.
        </p>
      </header>

      <div className="editorial-rule" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinos.map(({ slug, regras, tags }) => (
          <Link
            key={slug}
            href={`/regras/${slug}`}
            className="group bg-paper rounded-2xl border border-border p-5 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{regras.bandeira}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[16px] text-ink leading-tight tracking-tight truncate">
                  {regras.nome}
                </p>
                <p className="text-[10px] font-mono text-faint uppercase tracking-widest mt-1">
                  {slug.replace(/-/g, " ")}
                </p>
              </div>
              <ChevronRight
                size={15}
                strokeWidth={1.5}
                className="text-faint group-hover:text-ink transition-colors shrink-0"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.length > 0 ? (
                tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono uppercase tracking-wider bg-bone-deep text-ink/70 px-2 py-1 rounded-full"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-wider bg-sage-soft text-sage-deep px-2 py-1 rounded-full">
                  Requisitos simples
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <aside className="bg-ink text-bone rounded-2xl p-8 relative overflow-hidden">
        <div className="paper-grain absolute inset-0 opacity-70" aria-hidden />
        <div className="relative">
          <p className="kicker text-terracotta-soft">Próximo passo</p>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-tight font-light tracking-tight mt-3">
            Use a{" "}
            <span className="font-display-soft italic text-sage-soft">
              calculadora de prazo
            </span>{" "}
            pra saber se ainda dá tempo.
          </h2>
          <p className="text-[13px] text-bone/60 mt-3 max-w-xl leading-relaxed">
            Informe destino e data de embarque. Mostramos a janela ideal pra
            iniciar microchip, vacina e sorologia.
          </p>
          <Link
            href="/ferramentas/calculadora-quarentena"
            className="inline-flex items-center gap-2 mt-6 bg-bone text-ink px-5 py-2.5 rounded-full text-[12px] font-medium hover:bg-sage-soft transition-colors"
          >
            Abrir calculadora <ChevronRight size={13} strokeWidth={1.75} />
          </Link>
        </div>
      </aside>
    </article>
  );
}
