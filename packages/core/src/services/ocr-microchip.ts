/**
 * Cliente de OCR para certificado de microchip.
 * Posta uma imagem em /api/ocr/microchip e retorna o número de 15 dígitos
 * + campos auxiliares com confidence por campo.
 */

export interface CampoExtraido {
  value: string | null;
  confidence: number;
}

export interface CamposMicrochip {
  numeroChip: CampoExtraido;
  dataImplantacao: CampoExtraido;
  nomePet: CampoExtraido;
  racaPet: CampoExtraido;
  tutor: CampoExtraido;
  veterinario: CampoExtraido;
}

export interface ResultadoOCRMicrochip {
  encontrouMicrochip: boolean;
  campos: CamposMicrochip;
  observacao: string | null;
}

export type ExtracaoMicrochip =
  | { ok: true; resultado: ResultadoOCRMicrochip; hashDocumento: string }
  | { ok: false; erro: string };

export async function extrairMicrochipDeFoto(file: File): Promise<ExtracaoMicrochip> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/ocr/microchip", { method: "POST", body: formData });
  } catch (e) {
    return { ok: false, erro: `Falha de rede: ${e instanceof Error ? e.message : "desconhecida"}` };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { erro?: string };
    return { ok: false, erro: body.erro ?? `Erro HTTP ${response.status}` };
  }

  return (await response.json()) as ExtracaoMicrochip;
}
