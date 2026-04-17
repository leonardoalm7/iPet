/**
 * iPet — Motor de estimativa de custo
 *
 * Dado um pet + destino, calcula quais itens já foram pagos (baseado
 * nos dados de saúde do pet) e quais ainda estão pendentes.
 */

import { Pet, Destino } from "@/domain/types";
import { CUSTOS_POR_DESTINO, ItemCustoBase } from "@/data/cost-estimates";
import { REGRAS_DESTINO } from "@/data/destinations";

export interface ItemCustoComStatus extends ItemCustoBase {
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
function jaFoiPago(item: ItemCustoBase, pet: Pet, destino: Destino): boolean {
  const regras = REGRAS_DESTINO[destino];

  switch (item.tarefaId) {
    case "microchip":
      return !!(pet.microchip && pet.microchip.length === 15);
    case "vacina":
      return !!(pet.vacina?.valida);
    case "sorologia":
      return pet.sorologia?.status === "OK";
    default:
      return false;
  }
}

export function calcularEstimativaCusto(pet: Pet, destino: Destino): EstimativaCusto {
  const itensBase = CUSTOS_POR_DESTINO[destino] ?? [];

  const itensPagos: ItemCustoComStatus[] = [];
  const itensPendentes: ItemCustoComStatus[] = [];

  for (const item of itensBase) {
    const pago = jaFoiPago(item, pet, destino);
    const comStatus: ItemCustoComStatus = { ...item, status: pago ? "pago" : "pendente" };
    if (pago) {
      itensPagos.push(comStatus);
    } else {
      itensPendentes.push(comStatus);
    }
  }

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
