/**
 * iPet Compliance KB — Gerador de Dados para o App
 *
 * Lê os JSONs do compliance-kb e gera:
 *   prototipos/responsavel-app/src/data/kb-generated.ts
 *
 * Uso: npx ts-node compliance-kb/scripts/generate-app-data.ts
 *
 * QUANDO RODAR:
 *   - Após atualizar qualquer JSON em destinations/ ou airlines/
 *   - Como parte do fluxo de revisão descrito no REVIEW_GUIDE.md
 *   - O arquivo gerado deve ser commitado junto com o JSON atualizado
 */

import * as fs from "fs";
import * as path from "path";

// Script deve ser executado a partir da raiz do repositório iPet/
// Ex: npx ts-node compliance-kb/scripts/generate-app-data.ts
const REPO_ROOT = process.cwd();
const KB_DIR = path.join(REPO_ROOT, "compliance-kb");
// Saídas: packages/core é o consumidor do app vivo (apps/web); prototipos é legado.
const OUTPUTS = [
  { file: "packages/core/src/data/kb-generated.ts", importPath: "../domain/types" },
  { file: "prototipos/responsavel-app/src/data/kb-generated.ts", importPath: "@/domain/types" },
];

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

interface KBDestination {
  destino: string;
  nome: string;
  bandeira: string;
  confidence: string;
  lastVerified: string;
  nextReviewDate: string;
  rules: {
    exigeMicrochip: boolean;
    exigeVacina: boolean;
    diasCarenciaVacina: number;
    exigeSorologia: boolean;
    diasCarenciaSorologia: number;
    exigeCVI: boolean;
    diasAntesCVI: number;
    exigePermissaoImportacao: boolean;
    observacoes: string;
    racasProibidas?: string[];
    racasRestritasFocinheira?: string[];
    exigeSeguroResponsabilidade?: boolean;
    tipoAcesso?: string;
    tipoAcessoDetalhe?: string;
    tarefasAdicionais?: unknown[];
  };
}

interface KBAirline {
  id: string;
  nome: string;
  codigo: string;
  confidence: string;
  lastVerified: string;
  nextReviewDate: string;
  cabine: {
    pesoMaxKg: number;
    dimensoesMaxCm?: { comprimento: number; largura: number; altura: number };
    idadeMinimaSemanas?: number;
    racasBraquisefálicasPermitidas: boolean;
    observacoes: string;
  };
  porao: {
    pesoMaxKg?: number;
    racasBraquisefálicasPermitidas?: boolean;
  };
  racasPerigosasBanidas?: boolean;
  observacoesGerais: string;
}

function serialize(val: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);

  if (val === null) return "null";
  if (typeof val === "string") return JSON.stringify(val);
  if (typeof val === "number" || typeof val === "boolean") return String(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    const items = val.map((v) => `${padIn}${serialize(v, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }

  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>).map(
      ([k, v]) => `${padIn}${k}: ${serialize(v, indent + 1)}`
    );
    return `{\n${entries.join(",\n")},\n${pad}}`;
  }

  return String(val);
}

function main() {
  const destinationFiles = [
    "brasil",
    // Américas
    "eua",
    "canada",
    "mexico",
    "argentina",
    "chile",
    "uruguai",
    "colombia",
    "peru",
    "paraguai",
    "bolivia",
    "equador",
    "venezuela",
    // Europa EU
    "portugal",
    "espanha",
    "franca",
    "alemanha",
    "italia",
    "holanda",
    "austria",
    "belgica",
    "bulgaria",
    "chipre",
    "croacia",
    "dinamarca",
    "eslovaquia",
    "eslovenia",
    "estonia",
    "finlandia",
    "grecia",
    "hungria",
    "irlanda",
    "letonia",
    "lituania",
    "luxemburgo",
    "malta",
    "polonia",
    "republica-tcheca",
    "romenia",
    "suecia",
    // Europa não-EU
    "reino-unido",
    "suica",
    "noruega",
    "turquia",
    // Ásia
    "japao",
    "china",
    "hong-kong",
    "taiwan",
    "tailandia",
    "indonesia",
    "malasia",
    "filipinas",
    "india",
    "coreia-do-sul",
    "singapura",
    // Oriente Médio
    "catar",
    "arabia-saudita",
    "emirados-arabes",
    "israel",
    // Oceania
    "australia",
    "nova-zelandia",
  ];
  const airlineFiles = [
    "latam",
    "gol",
    "azul",
    "tap",
    "air-france",
    "iberia",
    "copa",
    "american",
    "emirates",
    "lufthansa",
    "klm",
    "turkish",
    "qatar-airways",
    "united",
    "delta",
    "avianca",
    "aerolineas-argentinas",
    "british-airways",
  ];

  const destinations = destinationFiles.map((f) =>
    loadJson<KBDestination>(path.join(KB_DIR, "destinations", `${f}.json`))
  );

  const airlines = airlineFiles.map((f) =>
    loadJson<KBAirline>(path.join(KB_DIR, "airlines", `${f}.json`))
  );

  const destEntries = destinations
    .map((d) => {
      const r = d.rules;
      return `  ${d.destino}: {
    destino: "${d.destino}" as const,
    nome: ${JSON.stringify(d.nome)},
    bandeira: ${JSON.stringify(d.bandeira)},
    exigeMicrochip: ${r.exigeMicrochip},
    exigeVacina: ${r.exigeVacina},
    diasCarenciaVacina: ${r.diasCarenciaVacina},
    exigeSorologia: ${r.exigeSorologia},
    diasCarenciaSorologia: ${r.diasCarenciaSorologia},
    exigeCVI: ${r.exigeCVI},
    diasAntesCVI: ${r.diasAntesCVI},
    exigePermissaoImportacao: ${r.exigePermissaoImportacao},
    observacoes: ${JSON.stringify(r.observacoes)},${r.racasProibidas?.length ? `\n    racasProibidas: ${JSON.stringify(r.racasProibidas)},` : ""}${r.racasRestritasFocinheira?.length ? `\n    racasRestritasFocinheira: ${JSON.stringify(r.racasRestritasFocinheira)},` : ""}${r.exigeSeguroResponsabilidade !== undefined ? `\n    exigeSeguroResponsabilidade: ${r.exigeSeguroResponsabilidade},` : ""}${r.tipoAcesso ? `\n    tipoAcesso: ${JSON.stringify(r.tipoAcesso)} as const,` : ""}${r.tipoAcessoDetalhe ? `\n    tipoAcessoDetalhe: ${JSON.stringify(r.tipoAcessoDetalhe)},` : ""}${r.tarefasAdicionais?.length ? `\n    tarefasAdicionais: ${JSON.stringify(r.tarefasAdicionais)},` : ""}
    // KB metadata
    _kbConfidence: ${JSON.stringify(d.confidence)} as const,
    _kbLastVerified: ${JSON.stringify(d.lastVerified)},
    _kbNextReview: ${JSON.stringify(d.nextReviewDate)},
  }`;
    })
    .join(",\n");

  const airlineEntries = airlines
    .map((a) => {
      return `  {
    id: ${JSON.stringify(a.id)},
    nome: ${JSON.stringify(a.nome)},
    codigo: ${JSON.stringify(a.codigo)},
    pesoMaxCabine: ${a.cabine.pesoMaxKg},
    pesoMaxPorao: ${a.porao.pesoMaxKg ?? 0},
    dimensoesMaxCabine: { comprimento: ${a.cabine.dimensoesMaxCm?.comprimento ?? 0}, largura: ${a.cabine.dimensoesMaxCm?.largura ?? 0}, altura: ${a.cabine.dimensoesMaxCm?.altura ?? 0} },
    idadeMinimaAnimal: ${a.cabine.idadeMinimaSemanas ?? 0},
    braquicefalicoCabine: ${a.cabine.racasBraquisefálicasPermitidas},
    braquicefalicoPorao: ${a.porao.racasBraquisefálicasPermitidas ?? false},
    racasPerigosasBanidas: ${a.racasPerigosasBanidas ?? false},
    anotacoes: ${JSON.stringify(a.observacoesGerais)},
    // KB metadata
    _kbConfidence: ${JSON.stringify(a.confidence)} as const,
    _kbLastVerified: ${JSON.stringify(a.lastVerified)},
    _kbNextReview: ${JSON.stringify(a.nextReviewDate)},
  }`;
    })
    .join(",\n");

  const now = new Date().toISOString().split("T")[0];

  for (const out of OUTPUTS) {
  const output = `// ============================================================
// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITAR DIRETAMENTE
// Fonte: /compliance-kb/destinations/ e /compliance-kb/airlines/
// Gerado em: ${now}
// Para atualizar: editar os JSONs no compliance-kb/ e rodar
//   npx ts-node compliance-kb/scripts/generate-app-data.ts
// ============================================================

import type { RegrasDestino, RegrasCompanhiaAerea, Destino } from "${out.importPath}";

// Extensão interna: campos _kb* são metadados de curadoria, não expostos pelo tipo público
type RegrasDestinoComMeta = RegrasDestino & {
  _kbConfidence: "ALTA" | "MEDIA" | "BAIXA";
  _kbLastVerified: string;
  _kbNextReview: string;
};

type RegrasAereaComMeta = RegrasCompanhiaAerea & {
  _kbConfidence: "ALTA" | "MEDIA" | "BAIXA";
  _kbLastVerified: string;
  _kbNextReview: string;
};

export const KB_DESTINOS: Record<Destino, RegrasDestinoComMeta> = {
${destEntries}
};

export const KB_COMPANHIAS: RegrasAereaComMeta[] = [
${airlineEntries}
];
`;

  const outPath = path.join(REPO_ROOT, out.file);
  fs.writeFileSync(outPath, output, "utf-8");
  console.log(`✅ Gerado: ${outPath}`);
  console.log(`   Destinos: ${destinations.length}`);
  console.log(`   Companhias: ${airlines.length}`);
  }
}

main();
