/**
 * iPet — Estimativas de custo detalhadas por destino
 *
 * Modelo rico com fontes, confidence e valores em moeda original.
 * Fonte: pesquisa delegada + curadoria manual — abr/2026.
 *
 * Para atualizar: editar CUSTOS_DETALHADOS abaixo. Novos destinos devem
 * ter `confidence` compatível com o rigor da pesquisa (ALTA = fonte
 * oficial confirmada; MEDIA = mercado; BAIXA = placeholder pendente pesquisa).
 */

import { Destino } from "../domain/types";

// ─── Tipos ────────────────────────────────────────────────────

export type CategoriaCusto =
  | "microchip"
  | "vacinaAntirrabica"
  | "sorologiaFAVN"
  | "cviEmissao"
  | "traducaoJuramentada"
  | "permissaoImportacao"
  | "taxaEntradaDestino"
  | "taxaEmbarqueCia"
  | "caixaIATA"
  | "seguroViagemPet"
  | "hotelPet";

export type RelevanciaCusto = "obrigatorio" | "recomendado" | "opcional" | "nao_aplicavel";

export type ConfidenceCusto = "ALTA" | "MEDIA" | "BAIXA";

export interface FonteCusto {
  url: string;
  titulo: string;
  dataAcesso: string;
}

export interface ItemCustoDetalhado {
  categoria: CategoriaCusto;
  relevancia: RelevanciaCusto;
  minBRL: number;
  maxBRL: number;
  moedaOriginal?: string;
  valorOriginal?: number;
  fontes: FonteCusto[];
  confidence: ConfidenceCusto;
  observacoes: string;
}

interface CategoriaMeta {
  titulo: string;
  tarefaId?: string;
  porViagem?: boolean;
}

export const CATEGORIA_META: Record<CategoriaCusto, CategoriaMeta> = {
  microchip: { titulo: "Implante de microchip", tarefaId: "microchip" },
  vacinaAntirrabica: { titulo: "Vacina antirrábica", tarefaId: "vacina" },
  sorologiaFAVN: { titulo: "Sorologia antirrábica (FAVN)", tarefaId: "sorologia" },
  cviEmissao: { titulo: "CVI — Certificado Veterinário Internacional", tarefaId: "cvi" },
  traducaoJuramentada: { titulo: "Tradução juramentada de documentos" },
  permissaoImportacao: { titulo: "Permissão de importação", tarefaId: "permissao_importacao" },
  taxaEntradaDestino: { titulo: "Taxa de entrada no destino", porViagem: true },
  taxaEmbarqueCia: { titulo: "Taxa de transporte pet (cia aérea)", porViagem: true },
  caixaIATA: { titulo: "Caixa de transporte IATA" },
  seguroViagemPet: { titulo: "Seguro pet de viagem", porViagem: true },
  hotelPet: { titulo: "Hospedagem pet-friendly (est. 7 noites)", porViagem: true },
};

// ─── Fontes reutilizáveis ─────────────────────────────────────

const FONTE_CFMV: FonteCusto = {
  url: "https://www.cfmv.gov.br",
  titulo: "CFMV — Valores de Referência Clínicas BR",
  dataAcesso: "2026-04-24",
};

const FONTE_TECSA: FonteCusto = {
  url: "https://www.tecsa.com.br",
  titulo: "Laboratório TECSA (aprovado UE)",
  dataAcesso: "2026-04-24",
};

const FONTE_VIGIAGRO: FonteCusto = {
  url: "https://www.gov.br/agricultura/pt-br/assuntos/vigilancia-agropecuaria/animais-estimacao",
  titulo: "VIGIAGRO / MAPA",
  dataAcesso: "2026-04-24",
};

const FONTE_IATA: FonteCusto = {
  url: "https://www.iata.org/en/programs/cargo/live-animals/pets/",
  titulo: "IATA Pet Container Requirements",
  dataAcesso: "2026-04-24",
};

// ─── Itens base reutilizáveis (custos realizados no Brasil) ──

const MICROCHIP_BR: ItemCustoDetalhado = {
  categoria: "microchip",
  relevancia: "obrigatorio",
  minBRL: 150,
  maxBRL: 300,
  fontes: [FONTE_CFMV],
  confidence: "MEDIA",
  observacoes: "Procedimento em clínica BR. Obrigatório antes da vacinação antirrábica.",
};

const VACINA_BR: ItemCustoDetalhado = {
  categoria: "vacinaAntirrabica",
  relevancia: "obrigatorio",
  minBRL: 80,
  maxBRL: 150,
  fontes: [FONTE_CFMV],
  confidence: "MEDIA",
  observacoes: "Dose única anual. Renova toda a carência se aplicada após o microchip.",
};

const SOROLOGIA_BR: ItemCustoDetalhado = {
  categoria: "sorologiaFAVN",
  relevancia: "obrigatorio",
  minBRL: 800,
  maxBRL: 1500,
  fontes: [FONTE_TECSA],
  confidence: "ALTA",
  observacoes: "Inclui coleta e envio a lab credenciado MAPA (TECSA, USP, Pasteur). Prazo de resultado: ~30–45 dias.",
};

const CVI_BR: ItemCustoDetalhado = {
  categoria: "cviEmissao",
  relevancia: "obrigatorio",
  minBRL: 150,
  maxBRL: 500,
  fontes: [FONTE_VIGIAGRO],
  confidence: "MEDIA",
  observacoes: "Endosso VIGIAGRO/MAPA é gratuito. Custo é da consulta veterinária para emitir o Atestado de Saúde pré-embarque.",
};

const TRADUCAO_NAO_APLICAVEL_UE: ItemCustoDetalhado = {
  categoria: "traducaoJuramentada",
  relevancia: "nao_aplicavel",
  minBRL: 0,
  maxBRL: 0,
  fontes: [],
  confidence: "ALTA",
  observacoes: "NÃO APLICÁVEL. CVI do MAPA para a UE é bilíngue (Português/Inglês) e aceito nos pontos de entrada europeus.",
};

const TRADUCAO_GENERICA: ItemCustoDetalhado = {
  categoria: "traducaoJuramentada",
  relevancia: "obrigatorio",
  minBRL: 200,
  maxBRL: 600,
  fontes: [],
  confidence: "MEDIA",
  observacoes: "Por documento. Necessária para destinos que exigem idioma local (ex: Japão, Oriente Médio).",
};

const CAIXA_IATA_GENERICA: ItemCustoDetalhado = {
  categoria: "caixaIATA",
  relevancia: "recomendado",
  minBRL: 300,
  maxBRL: 2000,
  fontes: [FONTE_IATA],
  confidence: "MEDIA",
  observacoes: "Homologação IATA obrigatória. Tamanho varia com o porte do pet. Obrigatória para voo no porão.",
};

const SEGURO_PET_GENERICO: ItemCustoDetalhado = {
  categoria: "seguroViagemPet",
  relevancia: "recomendado",
  minBRL: 200,
  maxBRL: 600,
  fontes: [],
  confidence: "MEDIA",
  observacoes: "Cobre custos veterinários no destino, repatriação e cancelamento. Varia conforme idade e dias de viagem.",
};

const HOTEL_PET_GENERICO: ItemCustoDetalhado = {
  categoria: "hotelPet",
  relevancia: "opcional",
  minBRL: 700,
  maxBRL: 3000,
  fontes: [],
  confidence: "BAIXA",
  observacoes: "Estimativa para 7 noites em hospedagem pet-friendly. Valores variam muito por destino.",
};

// ─── Taxa de embarque por faixa de rota (placeholder p/ destinos sem pesquisa) ──

function taxaEmbarqueGenerica(
  min: number,
  max: number,
  nota: string
): ItemCustoDetalhado {
  return {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: min,
    maxBRL: max,
    fontes: [],
    confidence: "BAIXA",
    observacoes: nota,
  };
}

const TAXA_EMBARQUE_CURTO = taxaEmbarqueGenerica(
  200,
  500,
  "Voos domésticos/América do Sul. Confirme com sua cia aérea."
);

const TAXA_EMBARQUE_MEDIO = taxaEmbarqueGenerica(
  400,
  900,
  "Voos transatlânticos. Confirme com sua cia aérea."
);

const TAXA_EMBARQUE_LONGO = taxaEmbarqueGenerica(
  600,
  1400,
  "Voos para Ásia/Oceania. Algumas cias cobram por trecho. Confirme com sua cia."
);

const PERMISSAO_GENERICA: ItemCustoDetalhado = {
  categoria: "permissaoImportacao",
  relevancia: "obrigatorio",
  minBRL: 0,
  maxBRL: 150,
  fontes: [],
  confidence: "BAIXA",
  observacoes: "Formulário oficial costuma ser gratuito, mas pode haver custo de tradução/despachante.",
};

// ─── Fontes específicas de destinos EU (payload da pesquisa abr/2026) ──

const FONTE_BMEL: FonteCusto = {
  url: "https://www.bmel.de/EN/topics/animals/pets-and-zoo-animals/pets-entry-regulation.html",
  titulo: "BMEL — Ministério da Agricultura Alemão",
  dataAcesso: "2026-04-24",
};

const FONTE_DGAV: FonteCusto = {
  url: "https://www.dgav.pt/vaiviajar/conteudo/conteudo-animais-de-companhia/entrar-em-portugal-a-partir-de-um-pais-fora-da-ue",
  titulo: "DGAV — Direção-Geral de Alimentação e Veterinária (Portugal)",
  dataAcesso: "2026-04-24",
};

const FONTE_HARC: FonteCusto = {
  url: "https://www.cityoflondon.gov.uk/services/animal-health-welfare/heathrow-animal-reception-centre",
  titulo: "HARC — Heathrow Animal Reception Centre",
  dataAcesso: "2026-04-24",
};

const FONTE_CEE_PETS: FonteCusto = {
  url: "https://ec.europa.eu/food/animals/pet-movement_en",
  titulo: "Comissão Europeia — Animal Health (pet movement)",
  dataAcesso: "2026-04-24",
};

const FONTE_TAP: FonteCusto = {
  url: "https://www.flytap.com/en-us/information/traveling-with-animals/pets",
  titulo: "TAP Air Portugal — Pet Fees",
  dataAcesso: "2026-04-24",
};

const FONTE_LATAM: FonteCusto = {
  url: "https://www.latamairlines.com",
  titulo: "LATAM — Pet Fees",
  dataAcesso: "2026-04-24",
};

const FONTE_AIRFRANCE: FonteCusto = {
  url: "https://wwws.airfrance.com.br/information/passagers/animaux-voyage-avion",
  titulo: "Air France — Animaux",
  dataAcesso: "2026-04-24",
};

const FONTE_KLM: FonteCusto = {
  url: "https://www.klm.com/information/pets",
  titulo: "KLM — Pet Rules",
  dataAcesso: "2026-04-24",
};

const FONTE_IBERIA: FonteCusto = {
  url: "https://www.iberia.com/br/viajar-com-iberia/animais/",
  titulo: "Iberia — Pets",
  dataAcesso: "2026-04-24",
};

const FONTE_ITA: FonteCusto = {
  url: "https://www.ita-airways.com/pt_br/fly-ita/baggage/animal-transportation.html",
  titulo: "ITA Airways — Animal Transportation",
  dataAcesso: "2026-04-24",
};

const FONTE_BA_CARGO: FonteCusto = {
  url: "https://www.britishairways.com",
  titulo: "IAG Cargo / British Airways",
  dataAcesso: "2026-04-24",
};

// ─── Templates EU ─────────────────────────────────────────────

const SOROLOGIA_UE: ItemCustoDetalhado = {
  categoria: "sorologiaFAVN",
  relevancia: "obrigatorio",
  minBRL: 800,
  maxBRL: 1500,
  fontes: [FONTE_TECSA],
  confidence: "ALTA",
  observacoes: "Brasil é país 'não listado' na UE — exige sorologia com carência de 90 dias pré-embarque. Lab credenciado (TECSA, USP, Pasteur).",
};

const TAXA_ENTRADA_UE_ZERO = (fonte: FonteCusto): ItemCustoDetalhado => ({
  categoria: "taxaEntradaDestino",
  relevancia: "nao_aplicavel",
  minBRL: 0,
  maxBRL: 0,
  moedaOriginal: "EUR",
  valorOriginal: 0,
  fontes: [fonte],
  confidence: "ALTA",
  observacoes: "Isento. Não há cobrança de taxa sanitária no aeroporto para controle de rotina.",
});

// ─── CUSTOS_DETALHADOS — base de dados ────────────────────────

// Itens padrão UE (para países sem taxa/fee específicos)
const ITENS_PADRAO_UE: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  {
    ...SOROLOGIA_UE,
    observacoes: "Obrigatório para a UE. Todos os Estados-Membros exigem sorologia com quarentena de 90 dias pré-embarque (Brasil não é país isento).",
  },
  {
    ...CVI_BR,
    observacoes: "Finlândia e Malta exigem certificado adicional de desparasitação contra tênia (Echinococcus).",
  },
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    categoria: "taxaEntradaDestino",
    relevancia: "recomendado",
    minBRL: 0,
    maxBRL: 300,
    moedaOriginal: "EUR",
    valorOriginal: 50,
    fontes: [FONTE_CEE_PETS],
    confidence: "MEDIA",
    observacoes: "Maioria dos países UE não cobra taxa no porto de entrada. Exceções: Chipre e Malta podem exigir taxa veterinária de ~EUR 50 via Border Inspection Post.",
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 2500,
    fontes: [],
    confidence: "MEDIA",
    observacoes: "Rotas intercontinentais LATAM/TAP/Lufthansa para a UE variam de EUR 150 a EUR 300. Cabine até 8kg; acima, porão.",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

// País por país
const ITENS_ALEMANHA: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_UE,
  CVI_BR,
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    ...TAXA_ENTRADA_UE_ZERO(FONTE_BMEL),
    observacoes: "Não há cobrança de taxa sanitária no aeroporto (Frankfurt/Munique) se o pet viajar na cabine ou excesso de bagagem com documentação correta.",
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 2000,
    moedaOriginal: "USD",
    valorOriginal: 150,
    fontes: [FONTE_TAP, FONTE_LATAM],
    confidence: "ALTA",
    observacoes: "USD 150 a USD 300 (TAP/LATAM) por trecho, dependendo de cabine (até 8kg) ou porão.",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_PORTUGAL: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_UE,
  CVI_BR,
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    categoria: "taxaEntradaDestino",
    relevancia: "obrigatorio",
    minBRL: 253,
    maxBRL: 253,
    moedaOriginal: "EUR",
    valorOriginal: 42.25,
    fontes: [FONTE_DGAV],
    confidence: "ALTA",
    observacoes: "DGAV cobra EUR 42,25 para inspeção de 1 animal no Ponto de Entrada (Lisboa/Porto). Aviso de Chegada com 48h de antecedência.",
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 2000,
    moedaOriginal: "EUR",
    valorOriginal: 150,
    fontes: [FONTE_TAP],
    confidence: "ALTA",
    observacoes: "TAP cobra de EUR 150 a EUR 300 para rotas intercontinentais saindo do Brasil.",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_REINO_UNIDO: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  {
    ...SOROLOGIA_UE,
    observacoes: "Reino Unido (DEFRA) exige as mesmas carências da UE: 3 meses pós-coleta em lab aprovado.",
  },
  {
    ...CVI_BR,
    observacoes: "CVI formato GBHC (específico UK), emitido pelo VIGIAGRO.",
  },
  {
    categoria: "traducaoJuramentada",
    relevancia: "nao_aplicavel",
    minBRL: 0,
    maxBRL: 0,
    fontes: [],
    confidence: "ALTA",
    observacoes: "NÃO APLICÁVEL. Certificado GBHC é emitido em inglês.",
  },
  {
    categoria: "taxaEntradaDestino",
    relevancia: "obrigatorio",
    minBRL: 2788,
    maxBRL: 2788,
    moedaOriginal: "GBP",
    valorOriginal: 410,
    fontes: [FONTE_HARC],
    confidence: "ALTA",
    observacoes: "Cães/gatos só podem entrar no UK como CARGA MANIFESTADA. HARC (Heathrow) cobra £ 410 de inspeção. Despachantes aduaneiros cobram taxas adicionais.",
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 3500,
    maxBRL: 10000,
    fontes: [FONTE_BA_CARGO],
    confidence: "MEDIA",
    observacoes: "Exclusivo carga. Custo calculado por peso/volume (Live Animal Cargo). Significativamente mais caro que passageiro.",
  },
  {
    ...CAIXA_IATA_GENERICA,
    minBRL: 500,
    maxBRL: 2500,
    observacoes: "Homologação IATA obrigatória. Exigências mais estritas de estrutura para o porão.",
  },
  {
    ...SEGURO_PET_GENERICO,
    observacoes: "Fortemente recomendado devido ao transporte como carga.",
  },
  HOTEL_PET_GENERICO,
];

const ITENS_FRANCA: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_UE,
  CVI_BR,
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    ...TAXA_ENTRADA_UE_ZERO({
      url: "https://agriculture.gouv.fr/voyager-avec-son-animal-de-compagnie",
      titulo: "Ministério da Agricultura — França",
      dataAcesso: "2026-04-24",
    }),
    observacoes: "Isento no aeroporto (CDG/ORY) para controle de rotina.",
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 2000,
    moedaOriginal: "EUR",
    valorOriginal: 125,
    fontes: [FONTE_AIRFRANCE],
    confidence: "ALTA",
    observacoes: "Air France cobra EUR 125 a EUR 200 em voos intercontinentais dependendo do porão/cabine.",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_ESPANHA: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_UE,
  CVI_BR,
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    ...TAXA_ENTRADA_UE_ZERO({
      url: "https://www.mapa.gob.es",
      titulo: "MAPA Espanha",
      dataAcesso: "2026-04-24",
    }),
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 2000,
    moedaOriginal: "USD",
    valorOriginal: 150,
    fontes: [FONTE_IBERIA],
    confidence: "ALTA",
    observacoes: "Iberia cobra USD 150 a USD 300 em rotas intercontinentais.",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_HOLANDA: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_UE,
  CVI_BR,
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    ...TAXA_ENTRADA_UE_ZERO({
      url: "https://english.nvwa.nl/topics/travelling-to-the-netherlands-with-your-dog-or-cat",
      titulo: "NVWA — Holanda",
      dataAcesso: "2026-04-24",
    }),
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 2000,
    moedaOriginal: "EUR",
    valorOriginal: 125,
    fontes: [FONTE_KLM],
    confidence: "ALTA",
    observacoes: "KLM cobra entre EUR 125 e EUR 200.",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_IRLANDA: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_UE,
  {
    ...CVI_BR,
    minBRL: 200,
    maxBRL: 500,
    observacoes: "Deve incluir registro de tratamento contra Echinococcus multilocularis.",
  },
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    categoria: "taxaEntradaDestino",
    relevancia: "recomendado",
    minBRL: 0,
    maxBRL: 300,
    moedaOriginal: "EUR",
    valorOriginal: 50,
    fontes: [{
      url: "https://www.gov.ie/en/service/bringing-your-pet-dog-cat-or-ferret-into-ireland/",
      titulo: "Gov.ie — DAFM (Irlanda)",
      dataAcesso: "2026-04-24",
    }],
    confidence: "MEDIA",
    observacoes: "Exige agendamento prévio. Pode haver taxa de compliance via cargo handling agents em Dublin.",
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 4000,
    fontes: [],
    confidence: "MEDIA",
    observacoes: "Varia conforme despacho como excesso de bagagem ou carga via handling agent (frequentemente obrigatório para cães grandes).",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_ITALIA: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_UE,
  CVI_BR,
  TRADUCAO_NAO_APLICAVEL_UE,
  {
    ...TAXA_ENTRADA_UE_ZERO({
      url: "https://www.salute.gov.it",
      titulo: "Ministério da Saúde — Itália",
      dataAcesso: "2026-04-24",
    }),
    observacoes: "Isento no aeroporto para cães não comerciais acompanhados.",
  },
  {
    categoria: "taxaEmbarqueCia",
    relevancia: "obrigatorio",
    minBRL: 900,
    maxBRL: 2000,
    moedaOriginal: "EUR",
    valorOriginal: 150,
    fontes: [FONTE_ITA],
    confidence: "MEDIA",
    observacoes: "ITA cobra a partir de EUR 150 para cabine e mais para porão em voos intercontinentais.",
  },
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

// ─── Templates placeholder para destinos sem pesquisa (confidence BAIXA) ──

function placeholder(observacao: string, relevancia: RelevanciaCusto = "obrigatorio"): Partial<ItemCustoDetalhado> {
  return {
    fontes: [],
    confidence: "BAIXA",
    observacoes: `[PLACEHOLDER — aguarda pesquisa delegada] ${observacao}`,
    relevancia,
  };
}

const ITENS_MERCOSUL_PLACEHOLDER: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  CVI_BR,
  TAXA_EMBARQUE_CURTO,
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
];

const ITENS_AMERICA_NORTE_PLACEHOLDER: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  CVI_BR,
  TAXA_EMBARQUE_MEDIO,
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  SOROLOGIA_BR,
  PERMISSAO_GENERICA,
  TRADUCAO_GENERICA,
  CVI_BR,
  TAXA_EMBARQUE_LONGO,
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

const ITENS_ASIA_SEM_SOROLOGIA_PLACEHOLDER: ItemCustoDetalhado[] = [
  MICROCHIP_BR,
  VACINA_BR,
  PERMISSAO_GENERICA,
  TRADUCAO_GENERICA,
  CVI_BR,
  TAXA_EMBARQUE_LONGO,
  CAIXA_IATA_GENERICA,
  SEGURO_PET_GENERICO,
  HOTEL_PET_GENERICO,
];

// ─── Mapa por destino ─────────────────────────────────────────

export const CUSTOS_DETALHADOS: Record<Destino, ItemCustoDetalhado[]> = {
  // Brasil — voo doméstico
  BRASIL: [
    VACINA_BR,
    CVI_BR,
    TAXA_EMBARQUE_CURTO,
    CAIXA_IATA_GENERICA,
    SEGURO_PET_GENERICO,
    HOTEL_PET_GENERICO,
  ],

  // Mercosul / América do Sul — placeholder
  ARGENTINA: ITENS_MERCOSUL_PLACEHOLDER,
  CHILE: ITENS_MERCOSUL_PLACEHOLDER,
  URUGUAI: ITENS_MERCOSUL_PLACEHOLDER,
  COLOMBIA: ITENS_MERCOSUL_PLACEHOLDER,
  PERU: ITENS_MERCOSUL_PLACEHOLDER,
  PARAGUAI: ITENS_MERCOSUL_PLACEHOLDER,
  BOLIVIA: ITENS_MERCOSUL_PLACEHOLDER,
  EQUADOR: ITENS_MERCOSUL_PLACEHOLDER,
  VENEZUELA: [
    MICROCHIP_BR,
    VACINA_BR,
    CVI_BR,
    PERMISSAO_GENERICA,
    TAXA_EMBARQUE_CURTO,
    CAIXA_IATA_GENERICA,
    SEGURO_PET_GENERICO,
  ],

  // América Central / Norte — placeholder
  MEXICO: ITENS_AMERICA_NORTE_PLACEHOLDER,
  EUA: ITENS_AMERICA_NORTE_PLACEHOLDER,
  CANADA: ITENS_AMERICA_NORTE_PLACEHOLDER,

  // Europa — pesquisa delegada abr/2026
  ALEMANHA: ITENS_ALEMANHA,
  PORTUGAL: ITENS_PORTUGAL,
  REINO_UNIDO: ITENS_REINO_UNIDO,
  FRANCA: ITENS_FRANCA,
  ESPANHA: ITENS_ESPANHA,
  HOLANDA: ITENS_HOLANDA,
  IRLANDA: ITENS_IRLANDA,
  ITALIA: ITENS_ITALIA,

  // Padrão UE (20 países) — payload da pesquisa
  AUSTRIA: ITENS_PADRAO_UE,
  BELGICA: ITENS_PADRAO_UE,
  BULGARIA: ITENS_PADRAO_UE,
  CHIPRE: ITENS_PADRAO_UE,
  CROACIA: ITENS_PADRAO_UE,
  DINAMARCA: ITENS_PADRAO_UE,
  ESLOVAQUIA: ITENS_PADRAO_UE,
  ESLOVENIA: ITENS_PADRAO_UE,
  ESTONIA: ITENS_PADRAO_UE,
  FINLANDIA: ITENS_PADRAO_UE,
  GRECIA: ITENS_PADRAO_UE,
  HUNGRIA: ITENS_PADRAO_UE,
  LETONIA: ITENS_PADRAO_UE,
  LITUANIA: ITENS_PADRAO_UE,
  LUXEMBURGO: ITENS_PADRAO_UE,
  MALTA: ITENS_PADRAO_UE,
  POLONIA: ITENS_PADRAO_UE,
  REPUBLICA_TCHECA: ITENS_PADRAO_UE,
  ROMENIA: ITENS_PADRAO_UE,
  SUECIA: ITENS_PADRAO_UE,

  // Ásia — placeholder
  JAPAO: ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER,
  CHINA: ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER,
  TAIWAN: ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER,
  INDONESIA: ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER,
  HONG_KONG: ITENS_ASIA_SEM_SOROLOGIA_PLACEHOLDER,
  TAILANDIA: ITENS_ASIA_SEM_SOROLOGIA_PLACEHOLDER,
  MALASIA: ITENS_ASIA_SEM_SOROLOGIA_PLACEHOLDER,
  FILIPINAS: ITENS_ASIA_SEM_SOROLOGIA_PLACEHOLDER,
  INDIA: ITENS_ASIA_SEM_SOROLOGIA_PLACEHOLDER,

  // Oriente Médio — placeholder
  CATAR: ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER,
  ARABIA_SAUDITA: ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER,

  // Oceania — placeholder
  AUSTRALIA: ITENS_ASIA_COM_SOROLOGIA_PLACEHOLDER,
};
