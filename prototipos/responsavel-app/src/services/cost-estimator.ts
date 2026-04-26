/**
 * iPet — Motor de estimativa de custo
 *
 * Dado um pet + destino, calcula quais itens já foram pagos (baseado
 * nos dados de saúde do pet) e quais ainda estão pendentes.
 */

import { Pet, Destino } from "@/domain/types";
import {
  CUSTOS_DETALHADOS,
  CATEGORIA_META,
  ItemCustoDetalhado,
} from "@/data/cost-estimates";

export interface ItemCustoComStatus extends ItemCustoDetalhado {
  /** id estável dentro do destino — usado em listas React */
  id: string;
  /** título legível, vindo do CATEGORIA_META */
  titulo: string;
  /** id da tarefa do roadmap, se aplicável */
  tarefaId?: string;
  /** se for por viagem (não amortiza entre viagens) */
  porViagem?: boolean;
  status: "pago" | "pendente";
}

export interface EstimativaCusto {
  itensPagos: ItemCustoComStatus[];
  itensPendentes: ItemCustoComStatus[];
  totalPagoMin: number;
  totalPagoMax: number;
  totalPendenteMin: number;
  totalPendenteMax: number;
  totalGeralMin: number;
  totalGeralMax: number;
}

function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export { formatBRL };

/**
 * Determina se um item já foi "pago" com base nos dados do pet.
 * Microchip e vacina são marcados como pagos se o pet já tem o registro.
 * Sorologia: marcada se status === "OK".
 * Demais itens: sempre pendentes (não temos como confirmar).
 */
function jaFoiPago(item: ItemCustoDetalhado, pet: Pet): boolean {
  switch (item.categoria) {
    case "microchip":
      return !!(pet.microchip && pet.microchip.length === 15);
    case "vacinaAntirrabica":
      return !!pet.vacina?.valida;
    case "sorologiaFAVN":
      return pet.sorologia?.status === "OK";
    default:
      return false;
  }
}

/**
 * Lookup direto de custo por tarefaId — não depende do pet.
 * Usado pelo ServicoCard para mostrar custo inline ao lado da tarefa.
 */
export function getCustoPorTarefaId(
  destino: Destino,
  tarefaId: string,
): { minBRL: number; maxBRL: number } | null {
  const itens = CUSTOS_DETALHADOS[destino] ?? [];
  for (const item of itens) {
    if (item.relevancia === "nao_aplicavel") continue;
    const meta = CATEGORIA_META[item.categoria];
    if (meta.tarefaId === tarefaId) {
      return { minBRL: item.minBRL, maxBRL: item.maxBRL };
    }
  }
  return null;
}

export function calcularEstimativaCusto(pet: Pet, destino: Destino): EstimativaCusto {
  const itensBase = (CUSTOS_DETALHADOS[destino] ?? []).filter(
    (i) => i.relevancia !== "nao_aplicavel"
  );

  const itensPagos: ItemCustoComStatus[] = [];
  const itensPendentes: ItemCustoComStatus[] = [];

  itensBase.forEach((item, idx) => {
    const meta = CATEGORIA_META[item.categoria];
    const pago = jaFoiPago(item, pet);
    const comStatus: ItemCustoComStatus = {
      ...item,
      id: `${destino}-${item.categoria}-${idx}`,
      titulo: meta.titulo,
      tarefaId: meta.tarefaId,
      porViagem: meta.porViagem,
      status: pago ? "pago" : "pendente",
    };
    if (pago) {
      itensPagos.push(comStatus);
    } else {
      itensPendentes.push(comStatus);
    }
  });

  const soma = (arr: ItemCustoComStatus[], campo: "minBRL" | "maxBRL") =>
    arr.reduce((acc, i) => acc + i[campo], 0);

  const totalPagoMin = soma(itensPagos, "minBRL");
  const totalPagoMax = soma(itensPagos, "maxBRL");
  const totalPendenteMin = soma(itensPendentes, "minBRL");
  const totalPendenteMax = soma(itensPendentes, "maxBRL");

  return {
    itensPagos,
    itensPendentes,
    totalPagoMin,
    totalPagoMax,
    totalPendenteMin,
    totalPendenteMax,
    totalGeralMin: totalPagoMin + totalPendenteMin,
    totalGeralMax: totalPagoMax + totalPendenteMax,
  };
}
