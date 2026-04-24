import fs from "fs";
import path from "path";

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
  };
}

export function loadDestinationRules(slug: string): RegrasPublicas | null {
  const filePath = path.join(
    process.cwd(),
    "..",
    "..",
    "compliance-kb",
    "destinations",
    `${slug}.json`
  );

  if (!fs.existsSync(filePath)) return null;

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return {
    destino: raw.destino,
    nome: raw.nome,
    bandeira: raw.bandeira,
    lastVerified: raw.lastVerified,
    verifiedBy: raw.verifiedBy,
    confidence: raw.confidence,
    sources: raw.sources ?? [],
    rules: {
      exigeMicrochip: raw.rules.exigeMicrochip,
      microchipPadrao: raw.rules.microchipPadrao,
      exigeVacina: raw.rules.exigeVacina,
      diasCarenciaVacina: raw.rules.diasCarenciaVacina,
      validadeVacinaAnos: raw.rules.validadeVacinaAnos,
      exigeSorologia: raw.rules.exigeSorologia,
      diasCarenciaSorologia: raw.rules.diasCarenciaSorologia,
      valorMinimoSorologia: raw.rules.valorMinimoSorologia,
      laboratoriosCredenciados: raw.rules.laboratoriosCredenciados,
      exigeCVI: raw.rules.exigeCVI,
      diasAntesCVI: raw.rules.diasAntesCVI,
      emissoresCVI: raw.rules.emissoresCVI,
      exigePermissaoImportacao: raw.rules.exigePermissaoImportacao,
      observacoes: raw.rules.observacoes,
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
      answer: `Sim. ${nome} exige sorologia antirrábica com resultado ${regras.rules.valorMinimoSorologia || ">=0,5 UI/mL"}, com carência mínima de ${regras.rules.diasCarenciaSorologia} dias antes do embarque. O exame deve ser feito em laboratório credenciado pelo MAPA.`,
    });
  }

  faqs.push({
    question: `Qual a carência da vacina antirrábica para ${nome}?`,
    answer: `A vacina antirrábica deve ter sido aplicada há pelo menos ${regras.rules.diasCarenciaVacina} dias antes do embarque${regras.rules.validadeVacinaAnos ? ` e ter validade de ${regras.rules.validadeVacinaAnos} ano${regras.rules.validadeVacinaAnos > 1 ? "s" : ""}` : ""}.`,
  });

  if (regras.rules.exigeMicrochip) {
    faqs.push({
      question: `Preciso de microchip para viajar com pet para ${nome}?`,
      answer: `Sim. ${nome} exige microchip ${regras.rules.microchipPadrao || "padrão ISO 11784/11785"}. O microchip deve ser implantado ANTES da vacinação antirrábica.`,
    });
  }

  if (regras.rules.exigeCVI) {
    faqs.push({
      question: `Quando devo emitir o CVI para viajar com pet para ${nome}?`,
      answer: `O Certificado Veterinário Internacional (CVI) deve ser emitido entre ${regras.rules.diasAntesCVI} e 2 dias antes do embarque, por um médico veterinário credenciado pelo MAPA.${regras.rules.emissoresCVI ? ` ${regras.rules.emissoresCVI}` : ""}`,
    });
  }

  if (regras.rules.exigePermissaoImportacao) {
    faqs.push({
      question: `${nome} exige permissão de importação para pets?`,
      answer: `Sim. É necessário solicitar uma permissão de importação junto ao órgão de controle animal de ${nome} com antecedência. Recomendamos iniciar o processo com pelo menos 6 meses de antecedência.`,
    });
  }

  return faqs;
}

function buildDocumentList(regras: RegrasPublicas): string {
  const docs: string[] = [];
  if (regras.rules.exigeMicrochip) docs.push("Microchip ISO 11784/11785");
  if (regras.rules.exigeVacina) docs.push(`Vacina antirrábica (carência de ${regras.rules.diasCarenciaVacina} dias)`);
  if (regras.rules.exigeSorologia) docs.push(`Sorologia antirrábica (carência de ${regras.rules.diasCarenciaSorologia} dias)`);
  if (regras.rules.exigeCVI) docs.push(`CVI — Certificado Veterinário Internacional (${regras.rules.diasAntesCVI} a 2 dias antes do embarque)`);
  if (regras.rules.exigePermissaoImportacao) docs.push("Permissão de importação do país de destino");
  return `Para viajar com pet para ${regras.nome}, você precisa de: ${docs.join("; ")}.`;
}
