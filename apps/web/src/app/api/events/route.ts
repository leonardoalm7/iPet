/**
 * Recebe lotes de eventos de analytics do cliente (fila do @ipet/core).
 *
 * Aceita sessão anônima (páginas públicas LLMO/calculadora trackeiam sem
 * login); quando há sessão Supabase, anexa owner_id. Escreve com service
 * role — a tabela events tem RLS sem policies e não é acessível via anon key.
 * Idempotente: id (uuid do cliente) é PK, reenvio de lote é ignorado.
 */
import type { NextRequest } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NOMES_EVENTOS } from "@ipet/core/services/analytics";

export const runtime = "nodejs";
export const maxDuration = 10;

const EVENTOS_VALIDOS = new Set<string>(NOMES_EVENTOS);
const LOTE_MAX = 50;
const PROPS_MAX_BYTES = 2048;
const ID_MAX = 64;

interface EventoLote {
  id?: unknown;
  evento?: unknown;
  props?: unknown;
  timestamp?: unknown;
  sessionId?: unknown;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validar(e: EventoLote) {
  if (typeof e.id !== "string" || e.id.length > ID_MAX || !UUID_RE.test(e.id))
    return null;
  if (typeof e.evento !== "string" || !EVENTOS_VALIDOS.has(e.evento))
    return null;
  if (typeof e.sessionId !== "string" || e.sessionId.length > ID_MAX)
    return null;
  if (typeof e.timestamp !== "string" || isNaN(Date.parse(e.timestamp)))
    return null;
  const props =
    e.props && typeof e.props === "object" && !Array.isArray(e.props)
      ? (e.props as Record<string, unknown>)
      : {};
  if (JSON.stringify(props).length > PROPS_MAX_BYTES) return null;
  return {
    id: e.id.toLowerCase(),
    evento: e.evento,
    props,
    session_id: e.sessionId,
    criado_em: new Date(e.timestamp).toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { ok: false, erro: "Supabase não configurado." },
      { status: 503 },
    );
  }

  let body: { eventos?: unknown };
  try {
    body = (await req.json()) as { eventos?: unknown };
  } catch {
    return Response.json({ ok: false, erro: "Corpo inválido." }, { status: 400 });
  }
  if (!Array.isArray(body.eventos) || body.eventos.length === 0) {
    return Response.json(
      { ok: false, erro: "eventos deve ser um array não vazio." },
      { status: 400 },
    );
  }

  const validos = (body.eventos as EventoLote[])
    .slice(0, LOTE_MAX)
    .map(validar)
    .filter((e): e is NonNullable<ReturnType<typeof validar>> => e !== null);

  if (validos.length === 0) {
    return Response.json(
      { ok: false, erro: "Nenhum evento válido no lote." },
      { status: 400 },
    );
  }

  // owner_id é opcional — páginas públicas trackeiam sem sessão.
  let ownerId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    ownerId = user?.id ?? null;
  } catch {
    /* sem cookie de sessão — segue anônimo */
  }

  const admin = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await admin
    .from("events")
    .upsert(
      validos.map((e) => ({ ...e, owner_id: ownerId })),
      { onConflict: "id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("[events] erro ao gravar lote:", error);
    return Response.json(
      { ok: false, erro: "Erro ao gravar eventos." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, recebidos: validos.length });
}
