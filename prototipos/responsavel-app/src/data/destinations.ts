import { RegrasDestino } from "@/domain/types";

export const REGRAS_DESTINO: Record<string, RegrasDestino> = {
  BRASIL: {
    destino: "BRASIL",
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
    observacoes:
      "Voos domésticos: vacina antirrábica com mínimo 21 dias de carência. Atestado de saúde emitido em até 10 dias antes do embarque.",
  },
  UNIAO_EUROPEIA: {
    destino: "UNIAO_EUROPEIA",
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
    observacoes:
      "Microchip ISO 11784/11785 obrigatório antes da vacinação. Sorologia antirrábica ≥0,5 UI/mL em laboratório credenciado pelo MAPA. Carência de 90 dias da data da coleta. CVI emitido entre 10 e 2 dias antes do embarque.",
  },
  JAPAO: {
    destino: "JAPAO",
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
    observacoes:
      "Processo mais rigoroso do mundo. Sorologia em laboratório aprovado pelo Japão. Carência de 180 dias. Permissão de importação obrigatória com antecedência. Recomenda-se iniciar o processo com 12 meses de antecedência.",
  },
  EUA: {
    destino: "EUA",
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
    observacoes:
      "CDC exige vacina antirrábica com certificado em inglês. CVI emitido com até 10 dias de antecedência. Regras específicas por estado de destino podem se aplicar.",
  },
};

export const DESTINOS_LISTA = Object.values(REGRAS_DESTINO);
