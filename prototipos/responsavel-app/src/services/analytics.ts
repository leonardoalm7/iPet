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

interface EventoRegistrado<K extends NomeEvento = NomeEvento> {
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
