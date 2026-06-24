import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllSlugs, slugToDestino } from "@ipet/core/data/destination-slugs";
import { loadDestinationRules, generateFAQs } from "@ipet/core/services/kb-public-loader";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllSlugs().map((destino) => ({ destino }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destino: string }>;
}): Promise<Metadata> {
  const { destino: slug } = await params;
  const regras = loadDestinationRules(slug);
  if (!regras) return {};

  const title = `Regras para viajar com pet para ${regras.nome} | iPet Pass`;
  const description = `Requisitos sanitários para levar seu cão ou gato para ${regras.nome}: ${regras.rules.exigeMicrochip ? "microchip, " : ""}vacina antirrábica${regras.rules.exigeSorologia ? ", sorologia" : ""}${regras.rules.exigeCVI ? ", CVI" : ""}. Verificado em ${regras.lastVerified}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function RegrasDestinoPage({
  params,
}: {
  params: Promise<{ destino: string }>;
}) {
  const { destino: slug } = await params;
  const destino = slugToDestino(slug);
  if (!destino) notFound();

  const regras = loadDestinationRules(slug);
  if (!regras) notFound();

  const faqs = generateFAQs(regras);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Regras para viajar com pet para ${regras.nome}`,
    author: { "@type": "Organization", name: "iPet Pass" },
    publisher: { "@type": "Organization", name: "iPet Pass" },
    dateModified: regras.lastVerified,
    description: `Requisitos sanitários completos para viajar com cão ou gato para ${regras.nome}.`,
  };

  const requisitos = [
    {
      label: "Microchip ISO",
      exige: regras.rules.exigeMicrochip,
      detalhe: regras.rules.microchipPadrao,
    },
    {
      label: "Vacina Antirrábica",
      exige: regras.rules.exigeVacina,
      detalhe: `Carência: ${regras.rules.diasCarenciaVacina} dias${regras.rules.validadeVacinaAnos ? ` · Validade: ${regras.rules.validadeVacinaAnos} ano${regras.rules.validadeVacinaAnos > 1 ? "s" : ""}` : ""}`,
    },
    {
      label: "Sorologia Antirrábica",
      exige: regras.rules.exigeSorologia,
      detalhe: regras.rules.exigeSorologia
        ? `${regras.rules.valorMinimoSorologia} · Carência: ${regras.rules.diasCarenciaSorologia} dias`
        : undefined,
    },
    {
      label: "CVI (Certificado Veterinário Internacional)",
      exige: regras.rules.exigeCVI,
      detalhe: regras.rules.exigeCVI
        ? `Emitir entre ${regras.rules.diasAntesCVI} e 2 dias antes do embarque`
        : undefined,
    },
    {
      label: "Permissão de Importação",
      exige: regras.rules.exigePermissaoImportacao,
      detalhe: regras.rules.exigePermissaoImportacao
        ? "Solicitar ao órgão de controle animal do destino com antecedência"
        : undefined,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen bg-white">
        <header className="border-b border-border px-5 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/regras" className="hover:text-navy transition-colors">
              Regras por destino
            </Link>
            <span>/</span>
            <span className="text-navy font-medium">{regras.nome}</span>
          </nav>
        </header>

        <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{regras.bandeira}</span>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  Regras para viajar com pet para {regras.nome}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Verificado em {regras.lastVerified} por {regras.verifiedBy}
                </p>
              </div>
            </div>
            {regras.rules.observacoes && (
              <p className="text-sm text-gray-500 leading-relaxed mt-4 bg-surface rounded-xl p-4 border border-border">
                {regras.rules.observacoes}
              </p>
            )}
          </div>

          <section>
            <h2 className="text-lg font-semibold text-navy mb-4">
              Requisitos sanitários
            </h2>
            <div className="space-y-3">
              {requisitos.map((req) => (
                <div
                  key={req.label}
                  className={`rounded-xl border p-4 ${
                    req.exige
                      ? "border-navy/10 bg-navy/5"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {req.exige ? (
                      <CheckCircle2 className="w-5 h-5 text-navy flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${req.exige ? "text-navy" : "text-gray-400"}`}>
                        {req.label}
                        <span className="ml-2 text-xs font-normal">
                          {req.exige ? "Obrigatório" : "Não exigido"}
                        </span>
                      </p>
                      {req.detalhe && (
                        <p className="text-xs text-gray-400 mt-0.5">{req.detalhe}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(regras.rules.racasProibidas?.length || regras.rules.racasRestritasFocinheira?.length) && (
            <section className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-red-700">Raças proibidas ou restritas</p>
              </div>
              {!!regras.rules.racasProibidas?.length && (
                <>
                  <p className="text-xs text-red-600 font-medium mb-1.5">Entrada completamente negada:</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {regras.rules.racasProibidas.map((r) => (
                      <span key={r} className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">{r}</span>
                    ))}
                  </div>
                </>
              )}
              {!!regras.rules.racasRestritasFocinheira?.length && (
                <>
                  <p className="text-xs text-amber-700 font-medium mb-1.5">Permitidas com restrições (focinheira + seguro):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {regras.rules.racasRestritasFocinheira.map((r) => (
                      <span key={r} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium">{r}</span>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {regras.rules.exigeSorologia && (
            <section className="bg-orange-light border border-ipet-orange/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-ipet-orange" />
                <p className="text-sm font-semibold text-navy">
                  Atenção: carência de {regras.rules.diasCarenciaSorologia} dias
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                A sorologia antirrábica exige uma carência de{" "}
                {regras.rules.diasCarenciaSorologia} dias entre a coleta do sangue
                e a data de embarque. Planeje com antecedência para não ser
                surpreendido.
              </p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-navy mb-4">
              Perguntas frequentes
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="rounded-xl border border-border bg-white group"
                >
                  <summary className="px-4 py-3 text-sm font-medium text-navy cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <p className="px-4 pb-4 text-xs text-gray-500 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy mb-3">
              Fontes oficiais
            </h2>
            <div className="space-y-2">
              {regras.sources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-navy/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-teal flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy truncate">{source.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{source.url}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="bg-navy/5 border border-navy/10 rounded-2xl p-6 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-navy mx-auto" />
            <h2 className="text-lg font-bold text-navy">
              Monte seu roadmap personalizado
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              O iPet Pass calcula datas retroativas exatas, alerta sobre prazos
              e gera um checklist completo para o dia do embarque.
            </p>
            <Link
              href="/auth/cadastro"
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
            >
              Criar conta gratuita
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>

          <footer className="text-center pt-4 border-t border-border">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              As informações nesta página foram verificadas em {regras.lastVerified}{" "}
              com base em fontes oficiais. Regras podem mudar — consulte sempre a
              autoridade sanitária do país de destino.
            </p>
            <Link
              href="/regras"
              className="text-xs text-teal hover:text-teal-dark font-medium mt-2 inline-block"
            >
              Ver todos os destinos
            </Link>
          </footer>
        </main>
      </div>
    </>
  );
}
