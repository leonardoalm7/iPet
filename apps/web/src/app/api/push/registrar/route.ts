import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface CorpoRegistrar {
  token: string;
  userAgent?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { ok: false, erro: "Não autenticado." },
      { status: 401 },
    );
  }

  let body: CorpoRegistrar;
  try {
    body = (await req.json()) as CorpoRegistrar;
  } catch {
    return Response.json({ ok: false, erro: "Corpo inválido." }, { status: 400 });
  }
  if (!body?.token) {
    return Response.json(
      { ok: false, erro: "token obrigatório." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      {
        owner_id: user.id,
        token: body.token,
        user_agent: body.userAgent ?? null,
        ativo: true,
      },
      { onConflict: "owner_id,token" },
    );

  if (error) {
    console.error("[push] erro ao registrar token:", error);
    return Response.json(
      { ok: false, erro: "Erro ao registrar." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { ok: false, erro: "Não autenticado." },
      { status: 401 },
    );
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return Response.json(
      { ok: false, erro: "token obrigatório." },
      { status: 400 },
    );
  }

  await supabase
    .from("push_tokens")
    .update({ ativo: false })
    .eq("owner_id", user.id)
    .eq("token", token);

  return Response.json({ ok: true });
}
