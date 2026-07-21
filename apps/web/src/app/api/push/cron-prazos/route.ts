/**
 * Cron diário — varre planos premium e dispara push pros prazos do roadmap.
 *
 * Roda em GET (Vercel Cron) com Bearer CRON_SECRET. Janelas de alerta: 7, 3 e 1 dias.
 * Idempotência via tabela `push_alerts_enviados` (uniq plano+tarefa+janela).
 */
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calcularRoadmap, parseBR } from "@ipet/core";
import { rowToPet, rowToPlano } from "@ipet/core/services/sync";
import type { Pet, PlanoViagem, TarefaRoadmap, Destino } from "@ipet/core";
import { getAdminMessaging } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const JANELAS = [7, 3, 1] as const;

interface PetRowDB {
  id: string;
  owner_id: string;
  nome: string;
  especie: Pet["especie"];
  raca: string;
  data_nascimento: string;
  peso: number;
  tipo_pet: Pet["tipoPet"];
  microchip: string | null;
  foto: string | null;
  vacina: Pet["vacina"] | null;
  sorologia: Pet["sorologia"] | null;
  criado_em: string;
}

interface PlanoRowDB {
  id: string;
  owner_id: string;
  destino: string;
  data_embarque: string;
  companhia_aerea_id: string | null;
  is_premium: boolean;
  pagamento_id: string | null;
  criado_em: string;
}

interface PvPRowDB {
  plano_viagem_id: string;
  pet_id: string;
}

interface PushTokenRow {
  token: string;
}

function copyPushPayload(pet: Pet, tarefa: TarefaRoadmap, plano: PlanoViagem) {
  const dias = tarefa.diasParaPrazo ?? 0;
  const quando =
    dias === 1 ? "amanhã" : dias === 0 ? "hoje" : `em ${dias} dias`;
  return {
    titulo: `${pet.nome} — ${tarefa.titulo}`,
    corpo: `Prazo ${quando} pra viagem a ${plano.destino.replace(/_/g, " ")}.`,
    link: `/viagens/${plano.id}`,
  };
}

export async function GET(req: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!expectedSecret || auth !== `Bearer ${expectedSecret}`) {
    return Response.json({ ok: false, erro: "Não autorizado." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { ok: false, erro: "Supabase não configurado." },
      { status: 503 },
    );
  }

  const messaging = getAdminMessaging();
  if (!messaging) {
    return Response.json(
      { ok: false, erro: "FCM Admin não configurado." },
      { status: 503 },
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const { data: planosRows, error: planosErr } = await admin
    .from("planos_viagem")
    .select("*")
    .eq("is_premium", true);

  if (planosErr) {
    console.error("[cron-prazos] erro ao buscar planos:", planosErr);
    return Response.json(
      { ok: false, erro: "Erro ao buscar planos." },
      { status: 500 },
    );
  }

  let varridos = 0;
  let disparados = 0;
  let pulados = 0;

  for (const planoRow of (planosRows ?? []) as PlanoRowDB[]) {
    const plano = rowToPlano(planoRow);
    const destino: Destino = plano.destino;

    // Pula viagens passadas
    const dataEmbarque = parseBR(plano.dataEmbarque);
    if (!dataEmbarque || dataEmbarque.getTime() < hoje.getTime()) {
      pulados++;
      continue;
    }

    const { data: pvpRows } = await admin
      .from("planos_viagem_pets")
      .select("plano_viagem_id, pet_id")
      .eq("plano_viagem_id", plano.id);

    const petIds = ((pvpRows ?? []) as PvPRowDB[]).map((r) => r.pet_id);
    if (petIds.length === 0) continue;

    const { data: petRows } = await admin
      .from("pets")
      .select("*")
      .in("id", petIds);

    const pets = ((petRows ?? []) as PetRowDB[]).map((r) => rowToPet(r));
    if (pets.length === 0) continue;

    // Tokens do owner (1 vez por plano)
    const { data: tokenRows } = await admin
      .from("push_tokens")
      .select("token")
      .eq("owner_id", planoRow.owner_id)
      .eq("ativo", true);

    const tokens = ((tokenRows ?? []) as PushTokenRow[]).map((t) => t.token);
    if (tokens.length === 0) {
      pulados++;
      continue;
    }

    for (const pet of pets) {
      const roadmap = calcularRoadmap(pet, destino, plano.dataEmbarque, plano.id);
      const alvos = roadmap.tarefas.filter(
        (t) =>
          !t.concluida &&
          t.diasParaPrazo != null &&
          JANELAS.includes(t.diasParaPrazo as (typeof JANELAS)[number]),
      );

      for (const tarefa of alvos) {
        varridos++;
        const dias = tarefa.diasParaPrazo as number;

        // Idempotência: insert com unique constraint. Se já existir, ignora.
        const { error: insertErr } = await admin
          .from("push_alerts_enviados")
          .insert({
            owner_id: planoRow.owner_id,
            plano_id: plano.id,
            tarefa_id: `${pet.id}:${tarefa.id}`,
            dias_restantes: dias,
          });

        if (insertErr) {
          // 23505 = unique_violation → já enviamos. Qualquer outro erro: pula.
          if (insertErr.code !== "23505") {
            console.error("[cron-prazos] erro ao gravar idempotência:", insertErr);
          }
          pulados++;
          continue;
        }

        const payload = copyPushPayload(pet, tarefa, plano);
        try {
          const resultado = await messaging.sendEachForMulticast({
            tokens,
            notification: { title: payload.titulo, body: payload.corpo },
            data: { link: payload.link },
            webpush: { fcmOptions: { link: payload.link } },
          });

          const tokensInvalidos = resultado.responses
            .map((r, i) => (!r.success ? tokens[i] : null))
            .filter((t): t is string => !!t);

          if (tokensInvalidos.length > 0) {
            await admin
              .from("push_tokens")
              .update({ ativo: false })
              .in("token", tokensInvalidos);
          }
          disparados++;
        } catch (e) {
          console.error("[cron-prazos] erro ao enviar push:", e);
        }
      }
    }
  }

  return Response.json({
    ok: true,
    varridos,
    disparados,
    pulados,
    geradoEm: new Date().toISOString(),
  });
}
