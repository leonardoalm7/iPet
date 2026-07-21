import type { NextRequest } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 15;

interface WebhookPayload {
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string | number };
  resource?: string;
}

export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!accessToken || !serviceRoleKey || !supabaseUrl) {
    console.warn("[webhook] credenciais faltando", {
      hasAccessToken: !!accessToken,
      hasServiceRole: !!serviceRoleKey,
      hasSupabaseUrl: !!supabaseUrl,
    });
    return Response.json(
      { ok: false, erro: "Webhook não configurado." },
      { status: 503 },
    );
  }

  let body: WebhookPayload;
  try {
    body = (await req.json()) as WebhookPayload;
  } catch {
    return Response.json({ ok: false, erro: "Body inválido." }, { status: 400 });
  }

  const isPaymentEvent =
    body.type === "payment" ||
    body.topic === "payment" ||
    body.action?.startsWith("payment");
  if (!isPaymentEvent) {
    return Response.json({ ok: true, ignored: true });
  }

  const paymentId =
    body.data?.id ?? body.resource?.split("/").filter(Boolean).pop();
  if (!paymentId) {
    return Response.json(
      { ok: false, erro: "Sem payment id." },
      { status: 400 },
    );
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken });
    const result = await new Payment(mp).get({ id: String(paymentId) });

    if (result.status !== "approved") {
      return Response.json({
        ok: true,
        status: result.status,
        ignored: true,
      });
    }

    const planoId = result.external_reference;
    if (!planoId) {
      return Response.json(
        { ok: false, erro: "Pagamento sem external_reference." },
        { status: 400 },
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: updateError } = await admin
      .from("planos_viagem")
      .update({
        is_premium: true,
        pagamento_id: String(result.id ?? paymentId),
      })
      .eq("id", planoId);

    if (updateError) {
      console.error("[webhook] erro ao atualizar plano:", updateError);
      return Response.json(
        { ok: false, erro: "Erro ao ativar premium." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("[webhook] erro genérico:", e);
    return Response.json(
      { ok: false, erro: "Erro ao processar notificação." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return Response.json({ ok: true, hint: "POST com payload MP" });
}
