/**
 * Fonte de verdade: /compliance-kb/airlines/
 * Este arquivo apenas reexporta os dados carregados pelo kb-loader.
 * Para atualizar regras, edite os JSONs no compliance-kb e siga o REVIEW_GUIDE.md.
 */

import { COMPANHIAS_AEREAS_KB } from "../services/kb-loader";

export const COMPANHIAS_AEREAS = COMPANHIAS_AEREAS_KB;

export const COMPANHIAS_MAPA: Record<string, (typeof COMPANHIAS_AEREAS)[number]> =
  Object.fromEntries(COMPANHIAS_AEREAS.map((c) => [c.id, c]));
