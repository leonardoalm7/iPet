import Link from "next/link";
import type { Metadata } from "next";
import { getAllSlugs } from "@ipet/core/data/destination-slugs";
import { loadDestinationRules } from "@ipet/core/services/kb-public-loader";
import { ShieldCheck, ChevronRight, Search } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Regras por País | iPet",
  description: "Requisitos sanitários para viajar com pets para mais de 70 destinos.",
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <ShieldCheck size={22} className="text-teal" /> Regras por País
        </h2>
        <p className="text-navy/50 text-sm mt-0.5">{destinos.length} destinos com requisitos sanitários detalhados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {destinos.map(({ slug, regras, tags }) => (
          <Link key={slug} href={`/regras/${slug}`}
            className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{regras.bandeira}</span>
              <div className="min-w-0">
                <p className="font-semibold text-navy truncate">{regras.nome}</p>
                <p className="text-xs text-navy/40 capitalize">{slug.replace(/-/g, " ")}</p>
              </div>
              <ChevronRight size={16} className="text-navy/30 ml-auto shrink-0" />
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span key={t} className="text-xs bg-surface text-navy/60 px-2 py-0.5 rounded-full">{t}</span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Requisitos simples</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
