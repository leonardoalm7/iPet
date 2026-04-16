/**
 * iPet Compliance KB — Verificador de Regras Desatualizadas
 *
 * Uso: npx ts-node compliance-kb/scripts/check-stale.ts
 *      (ou: cd compliance-kb && npx ts-node scripts/check-stale.ts)
 *
 * Verifica todos os arquivos JSON do KB e mostra:
 *   - Regras com revisão vencida (nextReviewDate < hoje)
 *   - Regras com revisão próxima (<= 30 dias)
 *   - Regras com confiança BAIXA
 *   - Resumo do estado geral do KB
 */

import * as fs from "fs";
import * as path from "path";

const KB_DIR = path.resolve(__dirname, "..");
const DIRS = ["destinations", "airlines"];
const WARN_DAYS = 30;

interface KBEntry {
  schemaVersion: string;
  destino?: string;
  id?: string;
  nome: string;
  lastVerified: string;
  verifiedBy: string;
  nextReviewDate: string;
  confidence: "ALTA" | "MEDIA" | "BAIXA";
}

function daysDiff(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function loadEntries(): { file: string; category: string; entry: KBEntry }[] {
  const results: { file: string; category: string; entry: KBEntry }[] = [];
  for (const dir of DIRS) {
    const dirPath = path.join(KB_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".json")) continue;
      const fullPath = path.join(dirPath, file);
      const entry = JSON.parse(fs.readFileSync(fullPath, "utf-8")) as KBEntry;
      results.push({ file: path.join(dir, file), category: dir, entry });
    }
  }
  return results;
}

function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries = loadEntries();
  const vencidas: typeof entries = [];
  const proximas: typeof entries = [];
  const baixaConfianca: typeof entries = [];

  for (const item of entries) {
    const reviewDate = new Date(item.entry.nextReviewDate);
    const diff = daysDiff(today, reviewDate);

    if (diff < 0) vencidas.push(item);
    else if (diff <= WARN_DAYS) proximas.push(item);

    if (item.entry.confidence === "BAIXA") baixaConfianca.push(item);
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  iPet Compliance KB — Relatório de Revisão");
  console.log(`  Gerado em: ${today.toISOString().split("T")[0]}`);
  console.log("═══════════════════════════════════════════════════\n");

  console.log(`📦 Total de entradas no KB: ${entries.length}`);
  console.log(`   Destinos: ${entries.filter((e) => e.category === "destinations").length}`);
  console.log(`   Companhias: ${entries.filter((e) => e.category === "airlines").length}\n`);

  if (vencidas.length > 0) {
    console.log(`🔴 VENCIDAS (${vencidas.length}) — revisão obrigatória antes de publicar:`);
    for (const item of vencidas) {
      const diff = Math.abs(daysDiff(today, new Date(item.entry.nextReviewDate)));
      console.log(`   ✗ ${item.entry.nome.padEnd(30)} [${item.file}] — ${diff} dias atrasada`);
    }
    console.log();
  }

  if (proximas.length > 0) {
    console.log(`🟡 PRÓXIMAS (${proximas.length}) — revisão nos próximos ${WARN_DAYS} dias:`);
    for (const item of proximas) {
      const diff = daysDiff(today, new Date(item.entry.nextReviewDate));
      console.log(`   ⚠ ${item.entry.nome.padEnd(30)} [${item.file}] — em ${diff} dias (${item.entry.nextReviewDate})`);
    }
    console.log();
  }

  if (baixaConfianca.length > 0) {
    console.log(`🟠 BAIXA CONFIANÇA (${baixaConfianca.length}) — fontes a confirmar:`);
    for (const item of baixaConfianca) {
      console.log(`   ⚡ ${item.entry.nome.padEnd(30)} [${item.file}]`);
    }
    console.log();
  }

  if (vencidas.length === 0 && proximas.length === 0 && baixaConfianca.length === 0) {
    console.log("✅ Todas as regras estão dentro do prazo e com confiança adequada.\n");
  }

  console.log("─────────────────────────────────────────────────");
  console.log("📋 STATUS COMPLETO:\n");

  for (const item of entries) {
    const reviewDate = new Date(item.entry.nextReviewDate);
    const diff = daysDiff(today, reviewDate);
    const status = diff < 0 ? "🔴 VENCIDA" : diff <= WARN_DAYS ? "🟡 PRÓXIMA" : "🟢 OK     ";
    const conf = item.entry.confidence === "ALTA" ? "●" : item.entry.confidence === "MEDIA" ? "◐" : "○";
    console.log(`  ${status}  ${conf} ${item.entry.nome.padEnd(28)} verificado em ${item.entry.lastVerified} por ${item.entry.verifiedBy}`);
  }
  console.log();
}

main();
