/**
 * iPet — Compliance KB Loader
 *
 * Importa os arquivos JSON do compliance-kb (fonte única de verdade) e os
 * mapeia para os tipos de domínio usados pelo app.
 *
 * Fonte dos dados: /compliance-kb/destinations/ e /compliance-kb/airlines/
 * Revisão: ver /compliance-kb/REVIEW_GUIDE.md
 */

import { Destino, RegrasCompanhiaAerea, RegrasDestino } from "@/domain/types";

// ─── Imports dos JSON do KB ───────────────────────────────────────────────────

import brasilKB from "../../../../compliance-kb/destinations/brasil.json";
import uniaoEuropeiaKB from "../../../../compliance-kb/destinations/uniao-europeia.json";
import japaoKB from "../../../../compliance-kb/destinations/japao.json";
import euaKB from "../../../../compliance-kb/destinations/eua.json";

import latamKB from "../../../../compliance-kb/airlines/latam.json";
import golKB from "../../../../compliance-kb/airlines/gol.json";
import azulKB from "../../../../compliance-kb/airlines/azul.json";

// ─── Tipos internos do KB (espelham o schema JSON) ───────────────────────────

interface KBDestinationRules {
  exigeMicrochip: boolean;
  exigeVacina: boolean;
  diasCarenciaVacina: number;
  exigeSorologia: boolean;
  diasCarenciaSorologia: number;
  exigeCVI: boolean;
  diasAntesCVI: number;
  exigePermissaoImportacao: boolean;
  observacoes: string;
}

interface KBDestination {
  destino: string;
  nome: string;
  bandeira: string;
  confidence: "ALTA" | "MEDIA" | "BAIXA";
  rules: KBDestinationRules;
}

interface KBDimensoes {
  comprimento: number;
  largura: number;
  altura: number;
}

interface KBCabine {
  pesoMaxKg: number;
  dimensoesMaxCm: KBDimensoes;
  idadeMinimaSemanas: number;
  racasBraquisefálicasPermitidas: boolean;
  observacoes: string;
}

interface KBPorao {
  pesoMaxKg: number;
}

interface KBAirline {
  id: string;
  nome: string;
  codigo: string;
  confidence: "ALTA" | "MEDIA" | "BAIXA";
  cabine: KBCabine;
  porao: KBPorao;
  observacoesGerais: string;
}

// ─── Mapeadores KB → Tipos de domínio ────────────────────────────────────────

function mapDestino(kb: KBDestination): RegrasDestino {
  return {
    destino: kb.destino as Destino,
    nome: kb.nome,
    bandeira: kb.bandeira,
    exigeMicrochip: kb.rules.exigeMicrochip,
    exigeVacina: kb.rules.exigeVacina,
    diasCarenciaVacina: kb.rules.diasCarenciaVacina,
    exigeSorologia: kb.rules.exigeSorologia,
    diasCarenciaSorologia: kb.rules.diasCarenciaSorologia,
    exigeCVI: kb.rules.exigeCVI,
    diasAntesCVI: kb.rules.diasAntesCVI,
    exigePermissaoImportacao: kb.rules.exigePermissaoImportacao,
    observacoes: kb.rules.observacoes,
  };
}

function mapAirline(kb: KBAirline): RegrasCompanhiaAerea {
  return {
    id: kb.id,
    nome: kb.nome,
    codigo: kb.codigo,
    pesoMaxCabine: kb.cabine.pesoMaxKg,
    pesoMaxPorао: kb.porao.pesoMaxKg,
    dimensoesMaxCabine: {
      comprimento: kb.cabine.dimensoesMaxCm.comprimento,
      largura: kb.cabine.dimensoesMaxCm.largura,
      altura: kb.cabine.dimensoesMaxCm.altura,
    },
    idadeMinimaAnimal: kb.cabine.idadeMinimaSemanas,
    racasBraquisefálicasPermitidas: kb.cabine.racasBraquisefálicasPermitidas,
    anotacoes: kb.observacoesGerais,
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const REGRAS_DESTINO_KB: Record<string, RegrasDestino> = {
  BRASIL: mapDestino(brasilKB as KBDestination),
  UNIAO_EUROPEIA: mapDestino(uniaoEuropeiaKB as KBDestination),
  JAPAO: mapDestino(japaoKB as KBDestination),
  EUA: mapDestino(euaKB as KBDestination),
};

export const COMPANHIAS_AEREAS_KB: RegrasCompanhiaAerea[] = [
  mapAirline(latamKB as KBAirline),
  mapAirline(golKB as KBAirline),
  mapAirline(azulKB as KBAirline),
];
