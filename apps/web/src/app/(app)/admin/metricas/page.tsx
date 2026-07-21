/**
 * Métricas BML — agregado real de todos os tutores (tabela events).
 *
 * Server component com service role; acesso restrito aos e-mails em
 * ADMIN_EMAILS (env, separados por vírgula). Sem a env, a rota não existe
 * (notFound) — fail-closed.
 */
import { notFound } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JANELA_DIAS = 30;
const LIMITE_LINHAS = 20000;

interface EventoRow {
  evento: string;
  props: Record<string, unknown>;
  session_id: string;
  criado_em: string;
}

const ETAPAS_JORNADA: { evento: string; label: string }[] = [
  { evento: "pet_cadastrado", label: "Pet cadastrado" },
  { evento: "destino_selecionado", label: "Destino selecionado" },
  { evento: "roadmap_gerado", label: "Roadmap gerado" },
  { evento: "companhia_verificada", label: "Cia aérea verificada" },
  { evento: "tarefa_concluida", label: "Tarefa concluída" },
  { evento: "documento_uploaded", label: "Documento enviado" },
];

const ETAPAS_MONETIZACAO: { evento: string; label: string }[] = [
  { evento: "paywall_exibido", label: "Paywall exibido" },
  { evento: "paywall_clicado", label: "Paywall clicado" },
  { evento: "checkout_iniciado", label: "Checkout iniciado" },
  { evento: "pagamento_aprovado", label: "Pagamento aprovado" },
];

async function requireAdmin(): Promise<void> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!email || !adminEmails.includes(email)) notFound();
}

async function carregarEventos(): Promise<EventoRow[] | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  const admin = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const desde = new Date(
    Date.now() - JANELA_DIAS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await admin
    .from("events")
    .select("evento, props, session_id, criado_em")
    .gte("criado_em", desde)
    .order("criado_em", { ascending: true })
    .limit(LIMITE_LINHAS);

  if (error) {
    console.error("[metricas] erro ao carregar events:", error);
    return null;
  }
  return (data ?? []) as EventoRow[];
}

function rankear(values: string[]): { item: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const v of values) map[v] = (map[v] || 0) + 1;
  return Object.entries(map)
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count);
}

function pct(parte: number, todo: number): string {
  return todo > 0 ? `${Math.round((parte / todo) * 100)}%` : "—";
}

export default async function MetricasAdminPage() {
  await requireAdmin();
  const eventos = await carregarEventos();

  if (eventos === null) {
    return (
      <div className="max-w-3xl pb-8">
        <p className="kicker text-terracotta">Admin</p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
          Métricas BML
        </h1>
        <p className="text-[13px] text-muted mt-4">
          Supabase não configurado ou tabela <code>events</code> indisponível.
          Aplique a migration <code>007_events.sql</code> e defina{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>
      </div>
    );
  }

  const contagem: Record<string, number> = {};
  for (const e of eventos) contagem[e.evento] = (contagem[e.evento] || 0) + 1;
  const sessoes = new Set(eventos.map((e) => e.session_id)).size;

  const funilJornada = ETAPAS_JORNADA.map((et) => ({
    ...et,
    total: contagem[et.evento] || 0,
  }));
  const funilMonetizacao = ETAPAS_MONETIZACAO.map((et) => ({
    ...et,
    total: contagem[et.evento] || 0,
  }));

  const destinos = rankear(
    eventos
      .filter((e) => e.evento === "destino_selecionado")
      .map((e) => String(e.props.destino ?? "?")),
  ).slice(0, 5);
  const cias = rankear(
    eventos
      .filter((e) => e.evento === "companhia_verificada")
      .map((e) => String(e.props.companhiaId ?? "?")),
  ).slice(0, 5);

  const ocr = (prefixo: "ocr_vacina" | "ocr_microchip") => ({
    iniciado: contagem[`${prefixo}_iniciado`] || 0,
    sucesso: contagem[`${prefixo}_sucesso`] || 0,
    aceito: contagem[`${prefixo}_aceito`] || 0,
    falha: contagem[`${prefixo}_falha`] || 0,
  });
  const ocrVacina = ocr("ocr_vacina");
  const ocrChip = ocr("ocr_microchip");

  const serviceViews = contagem["service_card_view"] || 0;
  const serviceClicks = contagem["service_cta_click"] || 0;

  const primeiro = eventos[0]?.criado_em ?? null;
  const ultimo = eventos[eventos.length - 1]?.criado_em ?? null;

  return (
    <div className="max-w-3xl space-y-10 pb-10">
      <header>
        <p className="kicker text-terracotta">Admin · últimos {JANELA_DIAS} dias</p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
          Métricas BML
        </h1>
        <p className="text-[13px] text-muted mt-2.5">
          Agregado de todos os tutores — fonte: tabela <code>events</code> no
          Supabase.
          {primeiro && ultimo && (
            <> Período com dados: {formatarData(primeiro)} → {formatarData(ultimo)}.</>
          )}
        </p>
      </header>

      <section className="grid grid-cols-3 gap-4">
        <StatTile valor={eventos.length.toLocaleString("pt-BR")} label="Eventos" />
        <StatTile valor={sessoes.toLocaleString("pt-BR")} label="Sessões" />
        <StatTile
          valor={pct(
            funilMonetizacao[3].total,
            funilMonetizacao[0].total,
          )}
          label="Paywall → pagamento"
        />
      </section>

      <Funil
        titulo="Funil da jornada"
        descricao="Do cadastro do pet ao documento enviado."
        etapas={funilJornada}
      />

      <Funil
        titulo="Funil de monetização"
        descricao="Modelo TurboTax — exibição do paywall até pagamento aprovado."
        etapas={funilMonetizacao}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ListaCard titulo="Top destinos" items={destinos} />
        <ListaCard titulo="Top cias aéreas" items={cias} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <OcrCard titulo="OCR · carteira de vacinação" dados={ocrVacina} />
        <OcrCard titulo="OCR · microchip" dados={ocrChip} />
      </section>

      <section className="bg-paper border border-border rounded-2xl p-6">
        <h2 className="text-[15px] font-medium text-ink">iPet Services</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <MiniStat label="Views" valor={serviceViews} />
          <MiniStat label="Cliques" valor={serviceClicks} />
          <MiniStat label="CTR" valor={pct(serviceClicks, serviceViews)} />
        </div>
      </section>

      <section className="bg-paper border border-border rounded-2xl p-6">
        <h2 className="text-[15px] font-medium text-ink">Contagem por evento</h2>
        {Object.keys(contagem).length === 0 ? (
          <p className="text-[13px] text-muted mt-3">
            Nenhum evento recebido ainda. Os apps enviam em lote pra{" "}
            <code>/api/events</code> conforme os tutores usam.
          </p>
        ) : (
          <div className="mt-4 space-y-1.5">
            {Object.entries(contagem)
              .sort(([, a], [, b]) => b - a)
              .map(([evento, count]) => (
                <div
                  key={evento}
                  className="flex justify-between text-[13px] gap-4"
                >
                  <span className="text-muted truncate">{evento}</span>
                  <span className="font-mono text-ink">{count}</span>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Componentes ─────────────────────────────────────────────

function StatTile({ valor, label }: { valor: string; label: string }) {
  return (
    <div className="bg-paper border border-border rounded-2xl p-5">
      <p className="font-display text-3xl font-light text-ink leading-none">
        {valor}
      </p>
      <p className="text-[11px] uppercase tracking-wide text-faint mt-2">
        {label}
      </p>
    </div>
  );
}

function Funil({
  titulo,
  descricao,
  etapas,
}: {
  titulo: string;
  descricao: string;
  etapas: { evento: string; label: string; total: number }[];
}) {
  const max = Math.max(...etapas.map((e) => e.total), 1);
  const vazio = etapas.every((e) => e.total === 0);

  return (
    <section className="bg-paper border border-border rounded-2xl p-6">
      <h2 className="text-[15px] font-medium text-ink">{titulo}</h2>
      <p className="text-[12px] text-muted mt-1">{descricao}</p>
      {vazio ? (
        <p className="text-[13px] text-muted mt-4">Sem dados no período.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {etapas.map((etapa, i) => {
            const largura = (etapa.total / max) * 100;
            const dropoff =
              i > 0 && etapas[i - 1].total > 0
                ? Math.round((1 - etapa.total / etapas[i - 1].total) * 100)
                : null;
            return (
              <div key={etapa.evento}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-muted">{etapa.label}</span>
                  <span className="text-ink font-medium">
                    {etapa.total.toLocaleString("pt-BR")}
                    {dropoff !== null && dropoff > 0 && (
                      <span className="text-status-crit ml-1.5 text-[11px]">
                        −{dropoff}%
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-3 bg-bone-deep rounded-[4px] overflow-hidden">
                  <div
                    className="h-full bg-sage rounded-r-[4px]"
                    style={{ width: `${Math.max(largura, 1.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ListaCard({
  titulo,
  items,
}: {
  titulo: string;
  items: { item: string; count: number }[];
}) {
  return (
    <div className="bg-paper border border-border rounded-2xl p-6">
      <h2 className="text-[15px] font-medium text-ink">{titulo}</h2>
      {items.length === 0 ? (
        <p className="text-[13px] text-muted mt-3">Sem dados.</p>
      ) : (
        <div className="mt-4 space-y-1.5">
          {items.map(({ item, count }, i) => (
            <div key={item} className="flex justify-between text-[13px] gap-3">
              <span className="text-graphite truncate">
                <span className="text-faint mr-1.5">{i + 1}.</span>
                {item.replace(/_/g, " ")}
              </span>
              <span className="font-mono text-ink">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OcrCard({
  titulo,
  dados,
}: {
  titulo: string;
  dados: { iniciado: number; sucesso: number; aceito: number; falha: number };
}) {
  return (
    <div className="bg-paper border border-border rounded-2xl p-6">
      <h2 className="text-[15px] font-medium text-ink">{titulo}</h2>
      {dados.iniciado === 0 ? (
        <p className="text-[13px] text-muted mt-3">Nenhuma tentativa.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 mt-4">
          <MiniStat label="Tentativas" valor={dados.iniciado} />
          <MiniStat label="Sucesso" valor={pct(dados.sucesso, dados.iniciado)} />
          <MiniStat label="Aceito" valor={pct(dados.aceito, dados.sucesso)} />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, valor }: { label: string; valor: number | string }) {
  return (
    <div className="bg-surface rounded-xl p-3 text-center">
      <p className="text-[17px] font-medium text-ink leading-tight">{valor}</p>
      <p className="text-[10px] uppercase tracking-wide text-faint mt-1">
        {label}
      </p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}
