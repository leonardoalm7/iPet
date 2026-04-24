import Link from "next/link";
import type { Metadata } from "next";
import { getAllSlugs } from "@/data/destination-slugs";
import { loadDestinationRules } from "@/services/kb-public-loader";
import { ChevronRight, ShieldCheck, PawPrint } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Regras para viajar com pet por destino | iPet Pass",
  description:
    "Consulte os requisitos sanitários para viajar com cão ou gato para cada país: vacinas, microchip, sorologia, CVI e prazos. Dados verificados por especialistas.",
  openGraph: {
    title: "Regras para viajar com pet por destino | iPet Pass",
    description:
      "Requisitos sanitários por país para viagem internacional com pets. Verificado por especialistas.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RegrasIndexPage() {
  const slugs = getAllSlugs();

  const destinos = slugs
    .map((slug) => {
      const regras = loadDestinationRules(slug);
      if (!regras) return null;
      const requisitos = [
        regras.rules.exigeMicrochip && "Microchip",
        regras.rules.exigeVacina && "Vacina",
        regras.rules.exigeSorologia && "Sorologia",
        regras.rules.exigeCVI && "CVI",
        regras.rules.exigePermissaoImportacao && "Permissão",
      ].filter(Boolean) as string[];
      return { slug, regras, requisitos };
    })
    .filter(Boolean) as {
    slug: string;
    regras: NonNullable<ReturnType<typeof loadDestinationRules>>;
    requisitos: string[];
  }[];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Regras para viajar com pet por destino",
    description:
      "Índice de requisitos sanitários por país para viagem internacional com cães e gatos.",
    publisher: { "@type": "Organization", name: "iPet Pass" },
    hasPart: destinos.map((d) => ({
      "@type": "Article",
      name: `Regras para viajar com pet para ${d.regras.nome}`,
      url: `/regras/${d.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="min-h-screen bg-white">
        <header className="border-b border-border px-5 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <PawPrint className="w-5 h-5 text-teal" />
              <p className="text-sm text-teal font-semibold">iPet Pass</p>
            </div>
            <h1 className="text-2xl font-bold text-navy">
              Regras para viajar com pet
            </h1>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Requisitos sanitários por país: vacinas, microchip, sorologia, CVI
              e prazos. Dados verificados por especialistas.
            </p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-5 py-6">
          <div className="grid gap-3">
            {destinos.map((d) => (
              <Link
                key={d.slug}
                href={`/regras/${d.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-border p-4 hover:border-navy/30 transition-colors"
              >
                <span className="text-3xl flex-shrink-0">
                  {d.regras.bandeira}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy">
                    {d.regras.nome}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {d.requisitos.map((req) => (
                      <span
                        key={req}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy/5 text-navy/70"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                  {d.regras.rules.exigeSorologia && (
                    <p className="text-[10px] text-ipet-orange mt-1">
                      Carência sorologia:{" "}
                      {d.regras.rules.diasCarenciaSorologia} dias
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>

          <section className="bg-navy/5 border border-navy/10 rounded-2xl p-6 text-center space-y-3 mt-8">
            <ShieldCheck className="w-8 h-8 text-navy mx-auto" />
            <h2 className="text-lg font-bold text-navy">
              Não sabe por onde começar?
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              O iPet Pass calcula prazos retroativos, monta seu checklist
              personalizado e alerta sobre datas críticas.
            </p>
            <Link
              href="/auth/cadastro"
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
            >
              Criar conta gratuita
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>

          <footer className="text-center pt-6 mt-6 border-t border-border">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Informações verificadas com base em fontes oficiais. Regras podem
              mudar — consulte sempre a autoridade sanitária do país de destino.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
