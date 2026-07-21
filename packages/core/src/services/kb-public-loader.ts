/**
 * kb-public-loader — versão browser-safe.
 *
 * Usa KB_DESTINOS pré-gerado em vez de ler arquivos JSON com fs,
 * permitindo uso tanto em Server Components quanto em Client Components.
 */

import { KB_DESTINOS } from "../data/kb-generated";
import { slugToDestino } from "../data/destination-slugs";
import type { Destino } from "../domain/types";

export interface RegrasPublicas {
  destino: string;
  nome: string;
  bandeira: string;
  lastVerified: string;
  verifiedBy: string;
  confidence: string;
  sources: { url: string; title: string; type: string }[];
  rules: {
    exigeMicrochip: boolean;
    microchipPadrao?: string;
    exigeVacina: boolean;
    diasCarenciaVacina: number;
    validadeVacinaAnos?: number;
    exigeSorologia: boolean;
    diasCarenciaSorologia: number;
    valorMinimoSorologia?: string;
    laboratoriosCredenciados?: string;
    exigeCVI: boolean;
    diasAntesCVI: number;
    emissoresCVI?: string;
    exigePermissaoImportacao: boolean;
    observacoes: string;
    racasProibidas?: string[];
    racasRestritasFocinheira?: string[];
    exigeSeguroResponsabilidade?: boolean;
  };
}

export function loadDestinationRules(slug: string): RegrasPublicas | null {
  const destino = slugToDestino(slug) as Destino | undefined;
  if (!destino) return null;

  const kb = (KB_DESTINOS as Record<string, unknown>)[destino] as (typeof KB_DESTINOS)[Destino] | undefined;
  if (!kb) return null;

  return {
    destino: kb.destino,
    nome: kb.nome,
    bandeira: kb.bandeira,
    lastVerified: (kb as { _kbLastVerified?: string })._kbLastVerified ?? "—",
    verifiedBy: "iPet Compliance Team",
    confidence: (kb as { _kbConfidence?: string })._kbConfidence ?? "MEDIA",
    sources: [],
    rules: {
      exigeMicrochip: kb.exigeMicrochip,
      exigeVacina: kb.exigeVacina,
      diasCarenciaVacina: kb.diasCarenciaVacina,
      exigeSorologia: kb.exigeSorologia,
      diasCarenciaSorologia: kb.diasCarenciaSorologia,
      exigeCVI: kb.exigeCVI,
      diasAntesCVI: kb.diasAntesCVI,
      exigePermissaoImportacao: kb.exigePermissaoImportacao,
      observacoes: kb.observacoes,
      racasProibidas: kb.racasProibidas,
      racasRestritasFocinheira: kb.racasRestritasFocinheira,
      exigeSeguroResponsabilidade: kb.exigeSeguroResponsabilidade,
    },
  };
}

export function generateFAQs(regras: RegrasPublicas): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const nome = regras.nome;

  faqs.push({
    question: `Quais documentos preciso para viajar com pet para ${nome}?`,
    answer: buildDocumentList(regras),
  });

  if (regras.rules.exigeSorologia) {
    faqs.push({
      question: `Preciso de sorologia antirrábica para levar meu pet para ${nome}?`,
      answer: `Sim. ${nome} exige sorologia antirrábica com resultado ${regras.rules.valorMinimoSorologia || "≥0,5 UI/mL"}, com carência mínima de ${regras.rules.diasCarenciaSorologia} dias antes do embarque.`,
    });
  }

  faqs.push({
    question: `Qual a carência da vacina antirrábica para ${nome}?`,
    answer: `A vacina antirrábica deve ter sido aplicada há pelo menos ${regras.rules.diasCarenciaVacina} dias antes do embarque${regras.rules.validadeVacinaAnos ? ` e ter validade de ${regras.rules.validadeVacinaAnos} ano(s)` : ""}.`,
  });

  if (regras.rules.exigeMicrochip) {
    faqs.push({
      question: `Preciso de microchip para viajar com pet para ${nome}?`,
      answer: `Sim. ${nome} exige microchip ${regras.rules.microchipPadrao || "padrão ISO 11784/11785"}. O microchip deve ser implantado ANTES da vacinação.`,
    });
  }

  if (regras.rules.exigeCVI) {
    faqs.push({
      question: `Quando devo emitir o CVI para viajar com pet para ${nome}?`,
      answer: `O CVI deve ser emitido entre ${regras.rules.diasAntesCVI} e 2 dias antes do embarque por médico veterinário credenciado pelo MAPA.`,
    });
  }

  return faqs;
}

function buildDocumentList(regras: RegrasPublicas): string {
  const docs: string[] = [];
  if (regras.rules.exigeMicrochip) docs.push("Microchip ISO 11784/11785");
  if (regras.rules.exigeVacina) docs.push(`Vacina antirrábica (carência de ${regras.rules.diasCarenciaVacina} dias)`);
  if (regras.rules.exigeSorologia) docs.push(`Sorologia antirrábica (carência de ${regras.rules.diasCarenciaSorologia} dias)`);
  if (regras.rules.exigeCVI) docs.push(`CVI (${regras.rules.diasAntesCVI} a 2 dias antes do embarque)`);
  if (regras.rules.exigePermissaoImportacao) docs.push("Permissão de importação");
  return `Para viajar com pet para ${regras.nome}, você precisa de: ${docs.join("; ")}.`;
}
