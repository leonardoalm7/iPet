"use client";

/**
 * RoadmapTimeline — Visualização cronológica do roadmap de compliance
 *
 * Exibe todas as tarefas como nós em uma linha do tempo vertical,
 * agrupadas por mês, com marcadores especiais para HOJE e EMBARQUE.
 * Design nível super app: referências PetLove/Petz para polish e UX.
 */

import { RoadmapCompliance, TarefaRoadmap, StatusTarefa } from "@/domain/types";
import { parseBR, formatBR } from "@/services/travel-roadmap";
import {
  differenceInDays,
  format,
  isSameMonth,
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  XCircle,
  Lock,
  Plane,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
  Info,
} from "lucide-react";

// ─── Configuração visual por status ──────────────────────────────────────────

const STATUS_STYLE: Record<
  StatusTarefa,
  {
    dot: string;
    ring: string;
    badge: string;
    badgeText: string;
    icon: React.ElementType;
    iconColor: string;
    cardBorder: string;
    cardBg: string;
  }
> = {
  CONCLUIDA: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    badge: "bg-emerald-900/40 border border-emerald-700/40",
    badgeText: "text-emerald-400",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    cardBorder: "border-emerald-800/30",
    cardBg: "bg-emerald-900/10",
  },
  PENDENTE: {
    dot: "bg-sky-500",
    ring: "ring-sky-500/30",
    badge: "bg-sky-900/40 border border-sky-700/40",
    badgeText: "text-sky-400",
    icon: Clock,
    iconColor: "text-sky-400",
    cardBorder: "border-sky-800/30",
    cardBg: "bg-sky-900/10",
  },
  URGENTE: {
    dot: "bg-amber-500",
    ring: "ring-amber-500/40",
    badge: "bg-amber-900/40 border border-amber-700/40",
    badgeText: "text-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    cardBorder: "border-amber-700/40",
    cardBg: "bg-amber-900/15",
  },
  CRITICO: {
    dot: "bg-orange-500",
    ring: "ring-orange-500/50",
    badge: "bg-orange-900/40 border border-orange-700/40",
    badgeText: "text-orange-300",
    icon: Zap,
    iconColor: "text-orange-400",
    cardBorder: "border-orange-700/40",
    cardBg: "bg-orange-900/15",
  },
  VENCIDA: {
    dot: "bg-red-500",
    ring: "ring-red-500/40",
    badge: "bg-red-900/40 border border-red-700/40",
    badgeText: "text-red-400",
    icon: XCircle,
    iconColor: "text-red-400",
    cardBorder: "border-red-800/40",
    cardBg: "bg-red-900/10",
  },
  BLOQUEADA: {
    dot: "bg-gray-600",
    ring: "ring-gray-600/20",
    badge: "bg-gray-800 border border-gray-700",
    badgeText: "text-gray-500",
    icon: Lock,
    iconColor: "text-gray-500",
    cardBorder: "border-gray-800",
    cardBg: "bg-gray-900/20",
  },
  NAO_APLICAVEL: {
    dot: "bg-gray-700",
    ring: "ring-gray-700/20",
    badge: "bg-gray-800 border border-gray-700",
    badgeText: "text-gray-600",
    icon: CheckCircle2,
    iconColor: "text-gray-600",
    cardBorder: "border-gray-800",
    cardBg: "bg-transparent",
  },
};

const STATUS_LABEL: Record<StatusTarefa, string> = {
  CONCLUIDA: "Concluída",
  PENDENTE: "Pendente",
  URGENTE: "Urgente",
  CRITICO: "Crítico",
  VENCIDA: "Vencida",
  BLOQUEADA: "Bloqueada",
  NAO_APLICAVEL: "N/A",
};

// ─── Tipos internos ───────────────────────────────────────────────────────────

type TimelineItem =
  | { kind: "tarefa"; tarefa: TarefaRoadmap; date: Date }
  | { kind: "hoje"; date: Date }
  | { kind: "voo"; date: Date }
  | { kind: "liberacao"; date: Date; label: string };

// ─── Componente principal ─────────────────────────────────────────────────────

export function RoadmapTimeline({ roadmap }: { roadmap: RoadmapCompliance }) {
  const hoje = startOfDay(new Date());
  const dataVoo = parseBR(roadmap.dataEmbarque);
  const diasAteVoo = differenceInDays(dataVoo, hoje);

  // Separa tarefas com prazo das sem prazo
  const semPrazo = roadmap.tarefas.filter(
    (t) => !t.prazo && t.status !== "NAO_APLICAVEL"
  );
  const comPrazo = roadmap.tarefas
    .filter((t) => t.prazo && t.status !== "NAO_APLICAVEL")
    .map((t) => ({ kind: "tarefa" as const, tarefa: t, date: parseBR(t.prazo!) }));

  // Monta itens da timeline ordenados por data
  const itensBase: TimelineItem[] = [
    ...comPrazo,
    { kind: "voo", date: dataVoo },
  ];

  if (roadmap.dataLiberacao) {
    const dtLib = parseBR(roadmap.dataLiberacao);
    if (isBefore(dtLib, dataVoo)) {
      itensBase.push({
        kind: "liberacao",
        date: dtLib,
        label: `Liberado a partir de ${formatBR(dtLib)}`,
      });
    }
  }

  // Insere o marcador HOJE na posição correta
  const itensOrdenados = itensBase.sort((a, b) => a.date.getTime() - b.date.getTime());
  const idxHoje = itensOrdenados.findIndex((i) => isAfter(i.date, hoje));
  const itensComHoje: TimelineItem[] = [
    ...itensOrdenados.slice(0, idxHoje === -1 ? itensOrdenados.length : idxHoje),
    { kind: "hoje", date: hoje },
    ...(idxHoje === -1 ? [] : itensOrdenados.slice(idxHoje)),
  ];

  // Agrupa por mês
  type Grupo = { mesAno: string; itens: TimelineItem[] };
  const grupos: Grupo[] = [];
  for (const item of itensComHoje) {
    const mesAno = format(item.date, "MMMM yyyy", { locale: ptBR });
    const mesAnoCap = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);
    const ultimo = grupos[grupos.length - 1];
    if (!ultimo || ultimo.mesAno !== mesAnoCap) {
      grupos.push({ mesAno: mesAnoCap, itens: [item] });
    } else {
      ultimo.itens.push(item);
    }
  }

  // Contadores para a barra de progresso
  const total = roadmap.tarefas.filter(
    (t) => t.status !== "NAO_APLICAVEL" && t.status !== "BLOQUEADA"
  ).length;
  const concluidas = roadmap.tarefas.filter((t) => t.status === "CONCLUIDA").length;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Contador de dias + progresso ─────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-5 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-400" />
            <span className="text-sm text-gray-300 font-medium">
              {diasAteVoo > 0
                ? `${diasAteVoo} dias para o embarque`
                : diasAteVoo === 0
                ? "Hoje é o dia do embarque!"
                : `Voo há ${Math.abs(diasAteVoo)} dias`}
            </span>
          </div>
          <span className="text-sky-400 text-sm font-semibold">{pct}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-2 rounded-full ${
              pct === 100
                ? "bg-emerald-500"
                : pct >= 60
                ? "bg-sky-500"
                : pct >= 30
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {concluidas} de {total} etapas concluídas
        </p>
      </div>

      {/* ── Tarefas sem prazo (já feitas ou pré-requisitos) ──────────── */}
      {semPrazo.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 px-1">
            Sem prazo definido
          </p>
          <div className="flex flex-col gap-2">
            {semPrazo.map((t) => (
              <TarefaCard key={t.id} tarefa={t} semPrazo />
            ))}
          </div>
        </div>
      )}

      {/* ── Timeline cronológica ──────────────────────────────────────── */}
      <div className="relative">
        {/* Linha vertical contínua */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-800" />

        <div className="flex flex-col gap-0">
          {grupos.map((grupo, gi) => (
            <div key={grupo.mesAno}>
              {/* Cabeçalho do mês */}
              <div className="flex items-center gap-3 mb-3 mt-4 first:mt-0">
                <div className="w-10 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {grupo.mesAno}
                </span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              {grupo.itens.map((item, ii) => {
                if (item.kind === "hoje") return <MarcadorHoje key="hoje" />;
                if (item.kind === "voo") return <MarcadorVoo key="voo" date={item.date} />;
                if (item.kind === "liberacao") return <MarcadorLiberacao key="lib" label={item.label} />;
                return (
                  <TarefaNode
                    key={item.tarefa.id}
                    tarefa={item.tarefa}
                    date={item.date}
                    isLast={gi === grupos.length - 1 && ii === grupo.itens.length - 1}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Nó de tarefa na timeline ─────────────────────────────────────────────────

function TarefaNode({
  tarefa,
  date,
  isLast,
}: {
  tarefa: TarefaRoadmap;
  date: Date;
  isLast: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const style = STATUS_STYLE[tarefa.status];
  const Icon = style.icon;
  const hoje = startOfDay(new Date());
  const dias = differenceInDays(date, hoje);

  return (
    <div className="flex gap-3 pb-4">
      {/* Dot na linha */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div
          className={`w-4 h-4 rounded-full ring-4 ${style.dot} ${style.ring} z-10 flex-shrink-0 mt-1`}
        />
      </div>

      {/* Card da tarefa */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => setAberto(!aberto)}
          className={`w-full text-left rounded-2xl border p-3.5 transition-all ${style.cardBg} ${style.cardBorder} ${
            aberto ? "rounded-b-none border-b-0" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className={`w-4 h-4 flex-shrink-0 ${style.iconColor}`} />
              <p className={`text-sm font-medium leading-tight truncate ${
                tarefa.status === "CONCLUIDA" ? "text-gray-400 line-through" : "text-white"
              }`}>
                {tarefa.titulo}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge} ${style.badgeText}`}>
                {STATUS_LABEL[tarefa.status]}
              </span>
              {aberto ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              )}
            </div>
          </div>

          {/* Data e countdown */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {format(date, "d 'de' MMM", { locale: ptBR })}
              </span>
            </div>
            {tarefa.status !== "CONCLUIDA" && (
              <span
                className={`text-xs font-medium ${
                  dias < 0
                    ? "text-red-400"
                    : dias <= 7
                    ? "text-amber-400"
                    : "text-gray-500"
                }`}
              >
                {dias < 0
                  ? `${Math.abs(dias)}d atrás`
                  : dias === 0
                  ? "hoje"
                  : `em ${dias} dias`}
              </span>
            )}
          </div>
        </button>

        {/* Detalhe expandido */}
        <AnimatePresence>
          {aberto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`overflow-hidden rounded-b-2xl border border-t-0 px-4 pb-4 pt-3 ${style.cardBorder} ${style.cardBg}`}
            >
              <p className="text-gray-400 text-xs leading-relaxed mb-2">
                {tarefa.descricao}
              </p>
              {tarefa.nota && (
                <div className="flex items-start gap-2 bg-gray-800/60 rounded-xl p-2.5">
                  <Info className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-xs leading-relaxed">{tarefa.nota}</p>
                </div>
              )}
              {tarefa.precisaClinica && tarefa.status !== "CONCLUIDA" && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs text-sky-400">Requer clínica veterinária</span>
                </div>
              )}
              {tarefa.bloqueadaPor.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Aguardando: {tarefa.bloqueadaPor.join(", ")}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tarefas sem prazo (concluídas / pré-requisitos) ─────────────────────────

function TarefaCard({
  tarefa,
  semPrazo,
}: {
  tarefa: TarefaRoadmap;
  semPrazo?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const style = STATUS_STYLE[tarefa.status];
  const Icon = style.icon;

  return (
    <div>
      <button
        onClick={() => setAberto(!aberto)}
        className={`w-full text-left rounded-2xl border p-3.5 transition-all ${style.cardBg} ${style.cardBorder} ${
          aberto ? "rounded-b-none border-b-0" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className={`w-4 h-4 flex-shrink-0 ${style.iconColor}`} />
            <p className={`text-sm font-medium truncate ${
              tarefa.status === "CONCLUIDA" ? "text-gray-400 line-through" : "text-white"
            }`}>
              {tarefa.titulo}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge} ${style.badgeText}`}>
              {STATUS_LABEL[tarefa.status]}
            </span>
            {aberto ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden rounded-b-2xl border border-t-0 px-4 pb-4 pt-3 ${style.cardBorder} ${style.cardBg}`}
          >
            <p className="text-gray-400 text-xs leading-relaxed mb-2">{tarefa.descricao}</p>
            {tarefa.nota && (
              <div className="flex items-start gap-2 bg-gray-800/60 rounded-xl p-2.5">
                <Info className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-xs leading-relaxed">{tarefa.nota}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Marcadores especiais ─────────────────────────────────────────────────────

function MarcadorHoje() {
  return (
    <div className="flex gap-3 pb-4 items-center">
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className="w-4 h-4 rounded-full bg-white ring-4 ring-white/20 z-10 flex-shrink-0" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-xs font-bold text-white bg-gray-800 border border-gray-600 px-2.5 py-1 rounded-full">
          HOJE
        </span>
        <div className="h-px flex-1 bg-white/20" />
      </div>
    </div>
  );
}

function MarcadorVoo({ date }: { date: Date }) {
  return (
    <div className="flex gap-3 pb-2 items-center">
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className="w-6 h-6 rounded-full bg-sky-500 ring-4 ring-sky-500/30 z-10 flex items-center justify-center">
          <Plane className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sky-400 text-xs font-semibold uppercase tracking-wider">
                Embarque
              </p>
              <p className="text-white font-bold text-base mt-0.5">
                {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <Plane className="w-6 h-6 text-sky-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MarcadorLiberacao({ label }: { label: string }) {
  return (
    <div className="flex gap-3 pb-4 items-center">
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/30 z-10" />
      </div>
      <div className="flex-1">
        <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-xs font-medium">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
