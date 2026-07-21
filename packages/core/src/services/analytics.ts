import { v4 as uuid } from "uuid";

// ── Eventos do funil (tipados) ───────────────────────────────

type EventosFunil = {
  pet_cadastrado: { especie: string; temMicrochip: boolean };
  pet_editado: { campos: string[] };
  destino_selecionado: { destino: string };
  roadmap_gerado: { destino: string; qtdTarefas: number };
  tarefa_concluida: { tarefaId: string; destino: string };
  companhia_verificada: { companhiaId: string; veredicto: string };
  documento_uploaded: { tipo: string };
  abandono_etapa: { etapa: string; tempoMs: number };
  pagina_visitada: { rota: string };
  paywall_exibido: { destino: string };
  paywall_clicado: { planoId: string; destino: string };
  checkout_iniciado: { planoId: string; destino: string };
  pagamento_aprovado: { planoId: string; destino: string; metodo: string };
  pagamento_recusado: { planoId: string; destino: string; motivo?: string };
  calculadora_usada: { destino: string; temTempo: boolean };
  calculadora_cta_clicado: { destino: string };
  service_card_view: { etapa: string; destino: string };
  service_cta_click: { etapa: string; destino: string };
  ocr_vacina_iniciado: { tamanhoBytes: number; tipo: string };
  ocr_vacina_sucesso: { confidenceMedia: number; camposPreenchidos: number; encontrouAntirrabica: boolean };
  ocr_vacina_falha: { motivo: string };
  ocr_vacina_aceito: { camposEditados: number };
  ocr_microchip_iniciado: { tamanhoBytes: number; tipo: string };
  ocr_microchip_sucesso: { confidence: number; encontrouMicrochip: boolean };
  ocr_microchip_falha: { motivo: string };
  ocr_microchip_aceito: { numero: string };
};

export type NomeEvento = keyof EventosFunil;

// Record<NomeEvento, true> força atualizar esta lista quando um evento
// novo entra no type map — a whitelist de /api/events deriva daqui.
const EVENTO_FLAGS: Record<NomeEvento, true> = {
  pet_cadastrado: true,
  pet_editado: true,
  destino_selecionado: true,
  roadmap_gerado: true,
  tarefa_concluida: true,
  companhia_verificada: true,
  documento_uploaded: true,
  abandono_etapa: true,
  pagina_visitada: true,
  paywall_exibido: true,
  paywall_clicado: true,
  checkout_iniciado: true,
  pagamento_aprovado: true,
  pagamento_recusado: true,
  calculadora_usada: true,
  calculadora_cta_clicado: true,
  service_card_view: true,
  service_cta_click: true,
  ocr_vacina_iniciado: true,
  ocr_vacina_sucesso: true,
  ocr_vacina_falha: true,
  ocr_vacina_aceito: true,
  ocr_microchip_iniciado: true,
  ocr_microchip_sucesso: true,
  ocr_microchip_falha: true,
  ocr_microchip_aceito: true,
};

export const NOMES_EVENTOS = Object.keys(EVENTO_FLAGS) as NomeEvento[];

export interface EventoRegistrado<K extends NomeEvento = NomeEvento> {
  id: string;
  evento: K;
  props: EventosFunil[K];
  timestamp: string;
  sessionId: string;
}

// ── Sessão ───────────────────────────────────────────────────

const STORAGE_KEY = "ipet_analytics";
const SESSION_KEY = "ipet_session";

function hasStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && typeof sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

function getSessionId(): string {
  if (!hasStorage()) return "ssr";

  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = uuid();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// ── Core ─────────────────────────────────────────────────────

function getEventos(): EventoRegistrado[] {
  if (!hasStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function salvar(eventos: EventoRegistrado[]): void {
  if (!hasStorage()) return;

  const MAX = 5000;
  const trimmed = eventos.length > MAX ? eventos.slice(-MAX) : eventos;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function track<K extends NomeEvento>(
  evento: K,
  props: EventosFunil[K],
): void {
  const registro: EventoRegistrado<K> = {
    id: uuid(),
    evento,
    props,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  const todos = getEventos();
  todos.push(registro as EventoRegistrado);
  salvar(todos);

  enfileirar(registro as EventoRegistrado);
}

// ── Fila de envio pro Supabase (via /api/events) ─────────────
// localStorage continua sendo o registro local; a fila só guarda
// o que ainda não foi confirmado pelo servidor. Envio best-effort:
// offline ou Supabase fora, a fila segura (cap 1000) e tenta de novo.

const QUEUE_KEY = "ipet_analytics_queue";
const LOTE_MAX = 50;
const FILA_MAX = 1000;

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pagehideRegistrado = false;

function getFila(): EventoRegistrado[] {
  if (!hasStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function salvarFila(fila: EventoRegistrado[]): void {
  if (!hasStorage()) return;
  const trimmed = fila.length > FILA_MAX ? fila.slice(-FILA_MAX) : fila;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
}

function enfileirar(registro: EventoRegistrado): void {
  if (!hasStorage() || typeof fetch === "undefined") return;
  const fila = getFila();
  fila.push(registro);
  salvarFila(fila);
  agendarFlush();
}

function agendarFlush(): void {
  registrarPagehide();
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushEventos();
  }, 2000);
}

function registrarPagehide(): void {
  if (pagehideRegistrado || typeof window === "undefined") return;
  pagehideRegistrado = true;
  window.addEventListener("pagehide", () => {
    const fila = getFila();
    if (!fila.length || typeof navigator === "undefined" || !navigator.sendBeacon) return;
    const lote = fila.slice(0, LOTE_MAX);
    const blob = new Blob([JSON.stringify({ eventos: lote })], {
      type: "application/json",
    });
    // Dedupe por id no servidor — reenvio em dobro é inofensivo.
    if (navigator.sendBeacon("/api/events", blob)) {
      const ids = new Set(lote.map((e) => e.id));
      salvarFila(getFila().filter((e) => !ids.has(e.id)));
    }
  });
}

export async function flushEventos(): Promise<void> {
  if (!hasStorage() || typeof fetch === "undefined") return;
  const fila = getFila();
  if (!fila.length) return;

  const lote = fila.slice(0, LOTE_MAX);
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventos: lote }),
      keepalive: true,
    });
    // 2xx: enviado. 4xx: lote rejeitado — reenviar não vai mudar o
    // veredicto, descarta pra fila não travar. 5xx/offline: mantém.
    if (res.ok || (res.status >= 400 && res.status < 500)) {
      const ids = new Set(lote.map((e) => e.id));
      salvarFila(getFila().filter((e) => !ids.has(e.id)));
      if (res.ok && getFila().length > 0) agendarFlush();
    }
  } catch {
    /* offline — fila mantida pro próximo track */
  }
}

// ── Consultas (para o dashboard) ─────────────────────────────

export function getAll(): EventoRegistrado[] {
  return getEventos();
}

export function getByEvento<K extends NomeEvento>(
  nome: K,
): EventoRegistrado<K>[] {
  return getEventos().filter(
    (e) => e.evento === nome,
  ) as EventoRegistrado<K>[];
}

export function getContagemPorEvento(): Record<string, number> {
  const eventos = getEventos();
  const contagem: Record<string, number> = {};
  for (const e of eventos) {
    contagem[e.evento] = (contagem[e.evento] || 0) + 1;
  }
  return contagem;
}

export function getSessoes(): string[] {
  const ids = new Set(getEventos().map((e) => e.sessionId));
  return [...ids];
}

export function getFunil(): { etapa: string; total: number }[] {
  const contagem = getContagemPorEvento();
  const etapas: NomeEvento[] = [
    "pet_cadastrado",
    "destino_selecionado",
    "roadmap_gerado",
    "companhia_verificada",
    "tarefa_concluida",
    "documento_uploaded",
  ];
  return etapas.map((etapa) => ({
    etapa,
    total: contagem[etapa] || 0,
  }));
}

export function limparEventos(): void {
  if (!hasStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}
