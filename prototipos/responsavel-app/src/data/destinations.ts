/**
 * Fonte de verdade: /compliance-kb/destinations/
 * Este arquivo apenas reexporta os dados carregados pelo kb-loader.
 * Para atualizar regras, edite os JSONs no compliance-kb e siga o REVIEW_GUIDE.md.
 */

import { REGRAS_DESTINO_KB } from "@/services/kb-loader";
import type { Destino, RegrasDestino } from "@/domain/types";

export const REGRAS_DESTINO = REGRAS_DESTINO_KB;

export const DESTINOS_LISTA = Object.values(REGRAS_DESTINO);

// re-export para facilitar acesso tipado
export { REGRAS_DESTINO_KB };

// ── Agrupamento por região (para seletores de UI) ───────────

export type Regiao =
  | "America do Sul"
  | "America Central"
  | "America do Norte"
  | "Europa"
  | "Oriente Medio"
  | "Asia"
  | "Oceania"
  | "Africa";

const MAPA_REGIAO: Record<string, Regiao> = {
  BRASIL: "America do Sul",
  ARGENTINA: "America do Sul",
  CHILE: "America do Sul",
  URUGUAI: "America do Sul",
  COLOMBIA: "America do Sul",
  PERU: "America do Sul",
  PARAGUAI: "America do Sul",
  BOLIVIA: "America do Sul",
  EQUADOR: "America do Sul",
  MEXICO: "America Central",
  PANAMA: "America Central",
  COSTA_RICA: "America Central",
  EUA: "America do Norte",
  CANADA: "America do Norte",
  PORTUGAL: "Europa",
  ESPANHA: "Europa",
  FRANCA: "Europa",
  ALEMANHA: "Europa",
  ITALIA: "Europa",
  HOLANDA: "Europa",
  REINO_UNIDO: "Europa",
  SUICA: "Europa",
  NORUEGA: "Europa",
  EMIRADOS_ARABES: "Oriente Medio",
  ISRAEL: "Oriente Medio",
  JAPAO: "Asia",
  COREIA_DO_SUL: "Asia",
  SINGAPURA: "Asia",
  AUSTRALIA: "Oceania",
  NOVA_ZELANDIA: "Oceania",
  AFRICA_DO_SUL: "Africa",
};

const ORDEM_REGIAO: Regiao[] = [
  "America do Sul",
  "America Central",
  "America do Norte",
  "Europa",
  "Oriente Medio",
  "Asia",
  "Oceania",
  "Africa",
];

export interface GrupoDestino {
  regiao: Regiao;
  destinos: RegrasDestino[];
}

export function getDestinosAgrupados(): GrupoDestino[] {
  const grupos = new Map<Regiao, RegrasDestino[]>();

  for (const d of DESTINOS_LISTA) {
    const regiao = MAPA_REGIAO[d.destino] ?? "America do Sul";
    if (!grupos.has(regiao)) grupos.set(regiao, []);
    grupos.get(regiao)!.push(d);
  }

  return ORDEM_REGIAO
    .filter((r) => grupos.has(r))
    .map((regiao) => ({
      regiao,
      destinos: grupos.get(regiao)!,
    }));
}
