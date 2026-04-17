/**
 * iPet — Base de estimativas de custo por destino
 *
 * Valores em BRL (faixa mín–máx), curados manualmente.
 * Fonte: pesquisa de mercado, tabelas CFMV, sites de cias aéreas — jan/2026.
 * Para atualizar: editar os valores abaixo e versionar o arquivo.
 */

import { Destino } from "@/domain/types";

export type CategoriaItem = "obrigatorio" | "recomendado" | "opcional";

export interface ItemCustoBase {
  id: string;
  titulo: string;
  categoria: CategoriaItem;
  minBRL: number;
  maxBRL: number;
  nota?: string;
  /** ID da tarefa do roadmap que marca este item como concluído */
  tarefaId?: string;
  /** Se true, o custo é por viagem (taxa da cia aérea, hotel etc.) */
  porViagem?: boolean;
}

// ─── Itens comuns a todos os destinos ────────────────────────

const MICROCHIP: ItemCustoBase = {
  id: "microchip",
  titulo: "Implante de microchip",
  categoria: "obrigatorio",
  minBRL: 80,
  maxBRL: 250,
  nota: "Valor inclui procedimento em clínica. Kit home: ~R$ 40 (sem implante profissional).",
  tarefaId: "microchip",
};

const VACINA: ItemCustoBase = {
  id: "vacina",
  titulo: "Vacina antirrábica",
  categoria: "obrigatorio",
  minBRL: 70,
  maxBRL: 200,
  nota: "Dose única anual. Renova toda a carência se aplicada após o microchip.",
  tarefaId: "vacina",
};

const CVI: ItemCustoBase = {
  id: "cvi",
  titulo: "CVI — Certificado Veterinário Internacional",
  categoria: "obrigatorio",
  minBRL: 180,
  maxBRL: 500,
  nota: "Emitido por vet credenciado MAPA. Valor pode incluir apostilamento.",
  tarefaId: "cvi",
};

const CAIXA_IATA: ItemCustoBase = {
  id: "caixa_iata",
  titulo: "Caixa de transporte IATA",
  categoria: "recomendado",
  minBRL: 150,
  maxBRL: 800,
  nota: "Tamanho varia com o porte do pet. Obrigatória para voo no porão.",
};

const SEGURO_PET: ItemCustoBase = {
  id: "seguro_pet",
  titulo: "Seguro pet de viagem",
  categoria: "recomendado",
  minBRL: 280,
  maxBRL: 750,
  nota: "Cobre custos veterinários no destino, repatriação e cancelamento.",
  porViagem: true,
};

// Taxas de embarque por destino (cobradas pela cia aérea — estimativa média)
const TAXA_EMBARQUE_CURTO: ItemCustoBase = {
  id: "taxa_embarque",
  titulo: "Taxa de transporte pet (cia aérea)",
  categoria: "obrigatorio",
  minBRL: 200,
  maxBRL: 500,
  nota: "Valor médio para voos domésticos/América do Sul. Confirme com sua cia.",
  porViagem: true,
};

const TAXA_EMBARQUE_MEDIO: ItemCustoBase = {
  id: "taxa_embarque",
  titulo: "Taxa de transporte pet (cia aérea)",
  categoria: "obrigatorio",
  minBRL: 400,
  maxBRL: 900,
  nota: "Valor médio para voos transatlânticos. Confirme com sua cia.",
  porViagem: true,
};

const TAXA_EMBARQUE_LONGO: ItemCustoBase = {
  id: "taxa_embarque",
  titulo: "Taxa de transporte pet (cia aérea)",
  categoria: "obrigatorio",
  minBRL: 600,
  maxBRL: 1_400,
  nota: "Voos para Ásia/Oceania. Algumas cias cobram por trecho. Confirme com sua cia.",
  porViagem: true,
};

const SOROLOGIA: ItemCustoBase = {
  id: "sorologia",
  titulo: "Sorologia antirrábica FAVN",
  categoria: "obrigatorio",
  minBRL: 400,
  maxBRL: 1_200,
  nota: "Laboratório credenciado pelo MAPA. Prazo de resultado: ~30–45 dias.",
  tarefaId: "sorologia",
};

const PERMISSAO_IMPORTACAO: ItemCustoBase = {
  id: "permissao_importacao",
  titulo: "Permissão de importação",
  categoria: "obrigatorio",
  minBRL: 0,
  maxBRL: 150,
  nota: "Japão/Austrália: formulário gratuito, mas pode haver custo de tradução juramentada.",
  tarefaId: "permissao_importacao",
};

const TRADUCAO_JURAMENTADA: ItemCustoBase = {
  id: "traducao",
  titulo: "Tradução juramentada de documentos",
  categoria: "obrigatorio",
  minBRL: 200,
  maxBRL: 600,
  nota: "Por documento. Necessária para destinos que exigem idioma local.",
};

const HOTEL_PET: ItemCustoBase = {
  id: "hotel_pet",
  titulo: "Hospedagem pet-friendly (estimativa 7 noites)",
  categoria: "opcional",
  minBRL: 700,
  maxBRL: 3_000,
  nota: "Valores variam muito por destino. Pesquise hotéis pet-friendly no destino.",
  porViagem: true,
};

// ─── Mapa de itens por destino ────────────────────────────────

export const CUSTOS_POR_DESTINO: Record<Destino, ItemCustoBase[]> = {
  BRASIL: [
    VACINA,
    CVI,
    TAXA_EMBARQUE_CURTO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  ARGENTINA: [
    MICROCHIP,
    VACINA,
    CVI,
    TAXA_EMBARQUE_CURTO,
    CAIXA_IATA,
    SEGURO_PET,
  ],

  CHILE: [
    MICROCHIP,
    VACINA,
    CVI,
    TAXA_EMBARQUE_CURTO,
    CAIXA_IATA,
    SEGURO_PET,
  ],

  URUGUAI: [
    MICROCHIP,
    VACINA,
    CVI,
    TAXA_EMBARQUE_CURTO,
    CAIXA_IATA,
    SEGURO_PET,
  ],

  MEXICO: [
    MICROCHIP,
    VACINA,
    CVI,
    TAXA_EMBARQUE_MEDIO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  EUA: [
    MICROCHIP,
    VACINA,
    CVI,
    TAXA_EMBARQUE_MEDIO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  CANADA: [
    MICROCHIP,
    VACINA,
    CVI,
    TAXA_EMBARQUE_MEDIO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  UNIAO_EUROPEIA: [
    MICROCHIP,
    VACINA,
    SOROLOGIA,
    CVI,
    TAXA_EMBARQUE_MEDIO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  PORTUGAL: [
    MICROCHIP,
    VACINA,
    SOROLOGIA,
    CVI,
    TAXA_EMBARQUE_MEDIO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  REINO_UNIDO: [
    MICROCHIP,
    VACINA,
    SOROLOGIA,
    CVI,
    TAXA_EMBARQUE_MEDIO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  JAPAO: [
    MICROCHIP,
    VACINA,
    SOROLOGIA,
    PERMISSAO_IMPORTACAO,
    TRADUCAO_JURAMENTADA,
    CVI,
    TAXA_EMBARQUE_LONGO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],

  AUSTRALIA: [
    MICROCHIP,
    VACINA,
    SOROLOGIA,
    PERMISSAO_IMPORTACAO,
    TRADUCAO_JURAMENTADA,
    CVI,
    TAXA_EMBARQUE_LONGO,
    CAIXA_IATA,
    SEGURO_PET,
    HOTEL_PET,
  ],
};
