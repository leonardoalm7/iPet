import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminMessaging } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const maxDuration = 15;

interface CorpoTestar {
  titulo?: string;
  corpo?: string;
  link?: string;
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

  const messaging = getAdminMessaging();
  if (!messaging) {
    return Response.json(
      { ok: false, erro: "FCM Admin não configurado." },
      { status: 503 },
    );
  }

  const { data: tokens, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("owner_id", user.id)
    .eq("ativo", true);

  if (error) {
    return Response.json(
      { ok: false, erro: "Erro ao buscar tokens." },
      { status: 500 },
    );
  }
  if (!tokens?.length) {
    return Response.json(
      { ok: false, erro: "Nenhum device registrado." },
      { status: 404 },
    );
  }

  let body: CorpoTestar = {};
  try {
    body = (await req.json()) as CorpoTestar;
  } catch {
    /* body opcional */
  }

  const notificationTitle = body.titulo ?? "iPet — Teste";
  const notificationBody =
    body.corpo ?? "Suas notificações estão funcionando.";
  const link = body.link ?? "/";

  const resultado = await messaging.sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    notification: { title: notificationTitle, body: notificationBody },
    data: { link },
    webpush: {
      fcmOptions: { link },
    },
  });

  const tokensInvalidos = resultado.responses
    .map((r, i) => (!r.success ? tokens[i].token : null))
    .filter((t): t is string => !!t);

  if (tokensInvalidos.length > 0) {
    await supabase
      .from("push_tokens")
      .update({ ativo: false })
      .in("token", tokensInvalidos)
      .eq("owner_id", user.id);
  }

  return Response.json({
    ok: true,
    sucesso: resultado.successCount,
    falha: resultado.failureCount,
  });
}
