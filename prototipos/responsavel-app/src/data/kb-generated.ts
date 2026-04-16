// ============================================================
// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITAR DIRETAMENTE
// Fonte: /compliance-kb/destinations/ e /compliance-kb/airlines/
// Gerado em: 2026-04-16
// Para atualizar: editar os JSONs no compliance-kb/ e rodar
//   npx ts-node compliance-kb/scripts/generate-app-data.ts
// ============================================================

import type { RegrasDestino, RegrasCompanhiaAerea, Destino } from "@/domain/types";

// Extensão interna: campos _kb* são metadados de curadoria, não expostos pelo tipo público
type RegrasDestinoComMeta = RegrasDestino & {
  _kbConfidence: "ALTA" | "MEDIA" | "BAIXA";
  _kbLastVerified: string;
  _kbNextReview: string;
};

type RegrasAereaComMeta = RegrasCompanhiaAerea & {
  _kbConfidence: "ALTA" | "MEDIA" | "BAIXA";
  _kbLastVerified: string;
  _kbNextReview: string;
};

export const KB_DESTINOS: Record<Destino, RegrasDestinoComMeta> = {
  BRASIL: {
    destino: "BRASIL" as const,
    nome: "Brasil",
    bandeira: "🇧🇷",
    exigeMicrochip: false,
    exigeVacina: true,
    diasCarenciaVacina: 21,
    exigeSorologia: false,
    diasCarenciaSorologia: 0,
    exigeCVI: false,
    diasAntesCVI: 0,
    exigePermissaoImportacao: false,
    observacoes: "Para voos domésticos: vacina antirrábica válida com mínimo 21 dias de carência. Recomenda-se atestado de saúde emitido por médico veterinário em até 10 dias antes do embarque (exigido por algumas companhias). Filhotes com menos de 8 semanas geralmente não são aceitos.",
    // KB metadata
    _kbConfidence: "ALTA" as const,
    _kbLastVerified: "2026-04-16",
    _kbNextReview: "2026-07-16",
  },
  UNIAO_EUROPEIA: {
    destino: "UNIAO_EUROPEIA" as const,
    nome: "União Europeia",
    bandeira: "🇪🇺",
    exigeMicrochip: true,
    exigeVacina: true,
    diasCarenciaVacina: 21,
    exigeSorologia: true,
    diasCarenciaSorologia: 90,
    exigeCVI: true,
    diasAntesCVI: 10,
    exigePermissaoImportacao: false,
    observacoes: "Sequência obrigatória: (1) Implante de microchip → (2) Vacina antirrábica (≥21 dias antes da sorologia) → (3) Sorologia em lab credenciado (≥90 dias antes do embarque) → (4) CVI (emitir entre D-10 e D-2 antes do embarque). Países como Reino Unido, Irlanda, Malta, Finlândia e Noruega exigem tratamento adicional contra Echinococcus multilocularis (verificar regras específicas por país).",
    // KB metadata
    _kbConfidence: "ALTA" as const,
    _kbLastVerified: "2026-04-16",
    _kbNextReview: "2026-07-16",
  },
  JAPAO: {
    destino: "JAPAO" as const,
    nome: "Japão",
    bandeira: "🇯🇵",
    exigeMicrochip: true,
    exigeVacina: true,
    diasCarenciaVacina: 21,
    exigeSorologia: true,
    diasCarenciaSorologia: 180,
    exigeCVI: true,
    diasAntesCVI: 10,
    exigePermissaoImportacao: true,
    observacoes: "O processo mais rigoroso do mundo. Sequência: (1) Microchip → (2) Vacinação primária + reforço → (3) Sorologia em lab aprovado pelo AQS → (4) Aguardar 180 dias → (5) Solicitar Advance Notification ao AQS (40 dias antes do embarque) → (6) CVI + formulários específicos. Risco de quarentena no Japão se qualquer etapa estiver incorreta. RECOMENDAÇÃO: iniciar o processo com 12 meses de antecedência.",
    // KB metadata
    _kbConfidence: "ALTA" as const,
    _kbLastVerified: "2026-04-16",
    _kbNextReview: "2026-07-16",
  },
  EUA: {
    destino: "EUA" as const,
    nome: "Estados Unidos",
    bandeira: "🇺🇸",
    exigeMicrochip: false,
    exigeVacina: true,
    diasCarenciaVacina: 21,
    exigeSorologia: false,
    diasCarenciaSorologia: 0,
    exigeCVI: true,
    diasAntesCVI: 10,
    exigePermissaoImportacao: false,
    observacoes: "CDC exige vacina antirrábica válida com certificado em inglês. CVI em até 10 dias antes. Regras para cães mudaram em 2023 — verificar classificação do Brasil como país de alto ou baixo risco para raiva no CDC. Gatos têm regras mais flexíveis. Regras estaduais (Havaí, etc.) podem adicionar requisitos.",
    // KB metadata
    _kbConfidence: "MEDIA" as const,
    _kbLastVerified: "2026-04-16",
    _kbNextReview: "2026-07-16",
  }
};

export const KB_COMPANHIAS: RegrasAereaComMeta[] = [
  {
    id: "latam",
    nome: "LATAM Airlines",
    codigo: "LA",
    pesoMaxCabine: 10,
    pesoMaxPorао: 45,
    dimensoesMaxCabine: { comprimento: 45, largura: 35, altura: 25 },
    idadeMinimaAnimal: 8,
    racasBraquisefálicasPermitidas: false,
    anotacoes: "⚠️ Regras variam por rota (doméstica/internacional) e aeronave. Sempre confirmar com a LATAM na reserva. Taxa cobrada por trecho.",
    // KB metadata
    _kbConfidence: "MEDIA" as const,
    _kbLastVerified: "2026-04-16",
    _kbNextReview: "2026-07-16",
  },
  {
    id: "gol",
    nome: "GOL Linhas Aéreas",
    codigo: "G3",
    pesoMaxCabine: 10,
    pesoMaxPorао: 32,
    dimensoesMaxCabine: { comprimento: 45, largura: 35, altura: 25 },
    idadeMinimaAnimal: 8,
    racasBraquisefálicasPermitidas: false,
    anotacoes: "⚠️ Verificar disponibilidade de vagas para animais no momento da reserva — é limitado por voo.",
    // KB metadata
    _kbConfidence: "MEDIA" as const,
    _kbLastVerified: "2026-04-16",
    _kbNextReview: "2026-07-16",
  },
  {
    id: "azul",
    nome: "Azul Linhas Aéreas",
    codigo: "AD",
    pesoMaxCabine: 10,
    pesoMaxPorао: 45,
    dimensoesMaxCabine: { comprimento: 43, largura: 30, altura: 23 },
    idadeMinimaAnimal: 8,
    racasBraquisefálicasPermitidas: true,
    anotacoes: "⚠️ A permissão de raças braquicefálicas é o diferencial da Azul, mas deve ser SEMPRE confirmada no momento da reserva. Lista de raças aceitas pode variar.",
    // KB metadata
    _kbConfidence: "MEDIA" as const,
    _kbLastVerified: "2026-04-16",
    _kbNextReview: "2026-07-16",
  }
];
