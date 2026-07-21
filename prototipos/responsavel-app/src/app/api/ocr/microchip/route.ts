import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `Você é um extrator estruturado de certificados de microchip de pets brasileiros (padrão ISO 11784/11785, FDX-B). Receberá uma foto/scan do certificado e deve extrair APENAS o número de 15 dígitos do microchip e dados auxiliares pra validação cruzada.

Retorne JSON válido com este shape exato (sem texto fora do JSON):
{
  "encontrouMicrochip": boolean,
  "campos": {
    "numeroChip": { "value": string | null, "confidence": 0.0-1.0 },
    "dataImplantacao": { "value": "YYYY-MM-DD" | null, "confidence": 0.0-1.0 },
    "nomePet": { "value": string | null, "confidence": 0.0-1.0 },
    "racaPet": { "value": string | null, "confidence": 0.0-1.0 },
    "tutor": { "value": string | null, "confidence": 0.0-1.0 },
    "veterinario": { "value": string | null, "confidence": 0.0-1.0 }
  },
  "observacao": string | null
}

Regras críticas:
- numeroChip DEVE ser exatamente 15 dígitos (regex /^[0-9]{15}$/). Se vir um número que não bate, retorne value=null e descreva em observacao.
- ATENÇÃO a caracteres ambíguos: 0/O, 1/I, 5/S, 8/B. Em caso de dúvida prefira o dígito numérico (chip ID nunca tem letras).
- Datas SEMPRE em ISO YYYY-MM-DD. Se a carteira mostrar DD/MM/YYYY, converta.
- Confidence reflete sua certeza visual (1.0 = legível e claro; 0.5 = parcialmente visível; <0.5 = adivinhação).
- "encontrouMicrochip": true se houver um número de 15 dígitos extraído com confidence ≥0.5.
- Se a imagem não for um certificado de microchip, encontrouMicrochip=false e observacao explica.
- Nunca invente dígitos. Prefira null com confidence=0 a chutar.`;

interface CampoExtraido {
  value: string | null;
  confidence: number;
}

interface ResultadoOCR {
  encontrouMicrochip: boolean;
  campos: {
    numeroChip: CampoExtraido;
    dataImplantacao: CampoExtraido;
    nomePet: CampoExtraido;
    racaPet: CampoExtraido;
    tutor: CampoExtraido;
    veterinario: CampoExtraido;
  };
  observacao: string | null;
}

interface RespostaAPI {
  ok: true;
  resultado: ResultadoOCR;
  hashDocumento: string;
}

interface RespostaErro {
  ok: false;
  erro: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, erro: "ANTHROPIC_API_KEY não configurada no servidor." } satisfies RespostaErro, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, erro: "Body inválido — esperado multipart/form-data." } satisfies RespostaErro, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ ok: false, erro: "Campo 'file' ausente ou inválido." } satisfies RespostaErro, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ ok: false, erro: `Arquivo muito grande (máx ${MAX_BYTES / 1024 / 1024} MB).` } satisfies RespostaErro, { status: 413 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ ok: false, erro: `Tipo de arquivo não suportado (${file.type}). Use jpg, png, webp ou heic.` } satisfies RespostaErro, { status: 415 });
  }

  const buffer = await file.arrayBuffer();

  const hashBytes = await crypto.subtle.digest("SHA-256", buffer);
  const hashDocumento = Array.from(new Uint8Array(hashBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const base64 = Buffer.from(buffer).toString("base64");

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
              { type: "text", text: "Extraia o número do microchip e dados auxiliares deste certificado. Responda apenas com o JSON." },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    return Response.json({ ok: false, erro: `Erro de rede ao chamar Anthropic: ${e instanceof Error ? e.message : "desconhecido"}` } satisfies RespostaErro, { status: 502 });
  }

  if (!anthropicResponse.ok) {
    const txt = await anthropicResponse.text().catch(() => "");
    return Response.json({ ok: false, erro: `Anthropic API ${anthropicResponse.status}: ${txt.slice(0, 200)}` } satisfies RespostaErro, { status: 502 });
  }

  const payload = (await anthropicResponse.json()) as { content?: { type: string; text?: string }[] };
  const textBlock = payload.content?.find((c) => c.type === "text")?.text ?? "";

  const jsonMatch = textBlock.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ ok: false, erro: "Resposta do modelo sem JSON parseável." } satisfies RespostaErro, { status: 502 });
  }

  let resultado: ResultadoOCR;
  try {
    resultado = JSON.parse(jsonMatch[0]) as ResultadoOCR;
  } catch {
    return Response.json({ ok: false, erro: "JSON do modelo malformado." } satisfies RespostaErro, { status: 502 });
  }

  const numero = resultado.campos.numeroChip.value;
  if (numero && !/^[0-9]{15}$/.test(numero)) {
    resultado.campos.numeroChip = { value: null, confidence: 0 };
    resultado.encontrouMicrochip = false;
    resultado.observacao = `Número extraído ('${numero}') não bate com formato ISO de 15 dígitos. ${resultado.observacao ?? ""}`.trim();
  }

  return Response.json({ ok: true, resultado, hashDocumento } satisfies RespostaAPI);
}
