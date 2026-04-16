/**
 * Fonte de verdade: /compliance-kb/destinations/
 * Este arquivo apenas reexporta os dados carregados pelo kb-loader.
 * Para atualizar regras, edite os JSONs no compliance-kb e siga o REVIEW_GUIDE.md.
 */

import { REGRAS_DESTINO_KB } from "@/services/kb-loader";

export const REGRAS_DESTINO = REGRAS_DESTINO_KB;

export const DESTINOS_LISTA = Object.values(REGRAS_DESTINO);

// re-export para facilitar acesso tipado
export { REGRAS_DESTINO_KB };
