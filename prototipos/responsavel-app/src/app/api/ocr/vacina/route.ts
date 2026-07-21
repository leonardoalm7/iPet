import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `Você é um extrator estruturado de dados de carteiras de vacinação de pets brasileiras. Receberá uma foto de uma carteira (BychosVet, Love Doggy, Vetnil, etc) e deve extrair APENAS os dados da vacina antirrábica mais recente.

Retorne JSON válido com este shape exato (sem texto fora do JSON):
{
  "encontrouVacinaAntirrabica": boolean,
  "campos": {
    "dataAplicacao": { "value": "YYYY-MM-DD" | null, "confidence": 0.0-1.0 },
    "dataValidade": { "value": "YYYY-MM-DD" | null, "confidence": 0.0-1.0 },
    "nomeComercial": { "value": string | null, "confidence": 0.0-1.0 },
    "lote": { "value": string | null, "confidence": 0.0-1.0 },
    "fabricante": { "value": string | null, "confidence": 0.0-1.0 },
    "vetAplicador": { "value": string | null, "confidence": 0.0-1.0 },
    "crmv": { "value": string | null, "confidence": 0.0-1.0 }
  },
  "observacao": string | null
}

Regras:
- Datas SEMPRE em ISO YYYY-MM-DD. Se a carteira mostrar DD/MM/YYYY, converta.
- Se um campo não estiver visível ou ilegível, value=null e confidence=0.
- Confidence reflete sua certeza visual (1.0 = legível e claro; 0.5 = parcialmente visível; <0.5 = adivinhação).
- "encontrouVacinaAntirrabica": true se houver qualquer registro de antirrábica/raiva/rabies/rabisin/defensor/nobivac.
- Se a imagem não for uma carteira de vacinação ou estiver totalmente ilegível, encontrouVacinaAntirrabica=false e observacao explica.
- Nunca invente dados. Prefira null com confidence=0 a chutar.`;

interface CampoExtraido {
  value: string | null;
  confidence: number;
}

interface ResultadoOCR {
  encontrouVacinaAntirrabica: boolean;
  campos: {
    dataAplicacao: CampoExtraido;
    dataValidade: CampoExtraido;
    nomeComercial: CampoExtraido;
    lote: CampoExtraido;
    fabricante: CampoExtraido;
    vetAplicador: CampoExtraido;
    crmv: CampoExtraido;
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
              {
                type: "image",
                source: { type: "base64", media_type: file.type, data: base64 },
              },
              {
                type: "text",
                text: "Extraia os dados da vacina antirrábica desta carteira. Responda apenas com o JSON.",
              },
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

  return Response.json({ ok: true, resultado, hashDocumento } satisfies RespostaAPI);
}
