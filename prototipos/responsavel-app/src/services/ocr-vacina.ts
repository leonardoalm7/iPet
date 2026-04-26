/**
 * Cliente de OCR para carteira de vacinação.
 * Posta uma imagem em /api/ocr/vacina e retorna campos estruturados
 * com confidence por campo.
 */

export interface CampoExtraido {
  value: string | null;
  confidence: number;
}

export interface CamposVacina {
  dataAplicacao: CampoExtraido;
  dataValidade: CampoExtraido;
  nomeComercial: CampoExtraido;
  lote: CampoExtraido;
  fabricante: CampoExtraido;
  vetAplicador: CampoExtraido;
  crmv: CampoExtraido;
}

export interface ResultadoOCRVacina {
  encontrouVacinaAntirrabica: boolean;
  campos: CamposVacina;
  observacao: string | null;
}

export type ExtracaoVacina =
  | { ok: true; resultado: ResultadoOCRVacina; hashDocumento: string }
  | { ok: false; erro: string };

export async function extrairVacinaDeFoto(file: File): Promise<ExtracaoVacina> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/ocr/vacina", { method: "POST", body: formData });
  } catch (e) {
    return { ok: false, erro: `Falha de rede: ${e instanceof Error ? e.message : "desconhecida"}` };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { erro?: string };
    return { ok: false, erro: body.erro ?? `Erro HTTP ${response.status}` };
  }

  return (await response.json()) as ExtracaoVacina;
}

export function confidenceMedia(campos: CamposVacina): number {
  const valores = Object.values(campos)
    .filter((c) => c.value !== null)
    .map((c) => c.confidence);
  if (valores.length === 0) return 0;
  return valores.reduce((s, v) => s + v, 0) / valores.length;
}

export function confidenceLabel(c: number): "alta" | "media" | "baixa" {
  if (c >= 0.85) return "alta";
  if (c >= 0.6) return "media";
  return "baixa";
}
