import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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

  const planoId = new URL(req.url).searchParams.get("planoId");
  if (!planoId) {
    return Response.json(
      { ok: false, erro: "planoId obrigatório." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("planos_viagem")
    .select("id, is_premium, pagamento_id")
    .eq("id", planoId)
    .eq("owner_id", user.id)
    .single();

  if (error || !data) {
    return Response.json(
      { ok: false, erro: "Plano não encontrado." },
      { status: 404 },
    );
  }

  return Response.json({
    ok: true,
    planoId: data.id,
    isPremium: data.is_premium,
    pagamentoId: data.pagamento_id,
  });
}
