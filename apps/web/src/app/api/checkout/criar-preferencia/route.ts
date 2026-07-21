import type { NextRequest } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const VALOR_BRL = 99;

interface CorpoRequest {
  planoId: string;
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

  let body: CorpoRequest;
  try {
    body = (await req.json()) as CorpoRequest;
  } catch {
    return Response.json({ ok: false, erro: "Corpo inválido." }, { status: 400 });
  }
  if (!body?.planoId) {
    return Response.json(
      { ok: false, erro: "planoId obrigatório." },
      { status: 400 },
    );
  }

  const { data: plano, error } = await supabase
    .from("planos_viagem")
    .select("id, owner_id, destino, is_premium")
    .eq("id", body.planoId)
    .eq("owner_id", user.id)
    .single();

  if (error || !plano) {
    return Response.json(
      { ok: false, erro: "Plano não encontrado." },
      { status: 404 },
    );
  }
  if (plano.is_premium) {
    return Response.json(
      { ok: false, erro: "Plano já é premium." },
      { status: 400 },
    );
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  // Dev fallback: sem MP configurado, success page ativa premium localmente.
  if (!accessToken) {
    return Response.json({
      ok: true,
      mockMode: true,
      initPoint: `${appUrl}/checkout/sucesso?planoId=${plano.id}&mock=1`,
    });
  }

  const mp = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(mp);

  // O Mercado Pago rejeita auto_return quando back_urls.success não é https
  // (erro "auto_return invalid. back_url.success must be defined") — em dev
  // local (http://localhost) isso derrubaria toda criação de preferência.
  const appUrlEhHttps = appUrl.startsWith("https://");

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: plano.id,
            title: `iPet Travel Plan — ${plano.destino}`,
            description: "Roadmap completo de viagem com seu pet",
            quantity: 1,
            unit_price: VALOR_BRL,
            currency_id: "BRL",
            category_id: "services",
          },
        ],
        payer: { email: user.email ?? undefined },
        external_reference: plano.id,
        metadata: { owner_id: user.id, plano_id: plano.id },
        statement_descriptor: "IPET",
        back_urls: {
          success: `${appUrl}/checkout/sucesso?planoId=${plano.id}`,
          failure: `${appUrl}/checkout/${plano.id}?status=failure`,
          pending: `${appUrl}/checkout/sucesso?planoId=${plano.id}&status=pending`,
        },
        ...(appUrlEhHttps ? { auto_return: "approved" as const } : {}),
        notification_url: `${appUrl}/api/checkout/webhook`,
      },
    });

    if (!result.init_point) {
      return Response.json(
        { ok: false, erro: "MP não retornou init_point." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true, initPoint: result.init_point });
  } catch (e) {
    console.error("[checkout] erro ao criar preferência MP:", e);
    return Response.json(
      { ok: false, erro: "Erro ao iniciar pagamento." },
      { status: 502 },
    );
  }
}
