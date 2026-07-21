/**
 * iPet — Compliance KB Loader
 *
 * Reexporta os dados gerados a partir dos JSONs do compliance-kb.
 *
 * Fonte de verdade: /compliance-kb/destinations/ e /compliance-kb/airlines/
 * Arquivo gerado:   /prototipos/responsavel-app/src/data/kb-generated.ts
 *
 * Para atualizar as regras:
 *   1. Edite os JSONs em /compliance-kb/destinations/ ou /compliance-kb/airlines/
 *   2. Siga o checklist em /compliance-kb/REVIEW_GUIDE.md
 *   3. Execute: npx ts-node compliance-kb/scripts/generate-app-data.ts
 *   4. Commit os JSONs + kb-generated.ts juntos
 */

import { KB_DESTINOS, KB_COMPANHIAS } from "../data/kb-generated";
import type { RegrasDestino, RegrasCompanhiaAerea } from "../domain/types";

export const REGRAS_DESTINO_KB: Record<string, RegrasDestino> = KB_DESTINOS;

export const COMPANHIAS_AEREAS_KB: RegrasCompanhiaAerea[] = KB_COMPANHIAS;
