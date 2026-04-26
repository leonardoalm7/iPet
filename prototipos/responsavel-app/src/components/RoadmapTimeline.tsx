"use client";

import { RoadmapCompliance, TarefaRoadmap, StatusTarefa, Destino } from "@/domain/types";
import { ServicoCard } from "@/components/ServicoCard";
import { parseBR, formatBR } from "@/services/travel-roadmap";
import {
  differenceInDays,
  format,
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
  Info,
} from "lucide-react";

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
    dot: "bg-teal",
    ring: "ring-teal/30",
    badge: "bg-teal-light border border-teal/20",
    badgeText: "text-teal",
    icon: CheckCircle2,
    iconColor: "text-teal",
    cardBorder: "border-teal/20",
    cardBg: "bg-teal-light",
  },
  PENDENTE: {
    dot: "bg-ipet-orange",
    ring: "ring-ipet-orange/30",
    badge: "bg-orange-light border border-ipet-orange/20",
    badgeText: "text-ipet-orange",
    icon: Clock,
    iconColor: "text-ipet-orange",
    cardBorder: "border-ipet-orange/20",
    cardBg: "bg-orange-light",
  },
  URGENTE: {
    dot: "bg-amber-500",
    ring: "ring-amber-500/40",
    badge: "bg-amber-100 border border-amber-200",
    badgeText: "text-amber-700",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    cardBorder: "border-amber-200",
    cardBg: "bg-amber-50",
  },
  CRITICO: {
    dot: "bg-red-500",
    ring: "ring-red-500/50",
    badge: "bg-red-100 border border-red-200",
    badgeText: "text-red-600",
    icon: Zap,
    iconColor: "text-red-500",
    cardBorder: "border-red-200",
    cardBg: "bg-red-50",
  },
  VENCIDA: {
    dot: "bg-red-500",
    ring: "ring-red-500/40",
    badge: "bg-red-100 border border-red-200",
    badgeText: "text-red-600",
    icon: XCircle,
    iconColor: "text-red-500",
    cardBorder: "border-red-200",
    cardBg: "bg-red-50",
  },
  BLOQUEADA: {
    dot: "bg-gray-300",
    ring: "ring-gray-300/20",
    badge: "bg-surface border border-border",
    badgeText: "text-gray-400",
    icon: Lock,
    iconColor: "text-gray-400",
    cardBorder: "border-border",
    cardBg: "bg-surface",
  },
  NAO_APLICAVEL: {
    dot: "bg-gray-200",
    ring: "ring-gray-300/20",
    badge: "bg-surface border border-border",
    badgeText: "text-gray-400",
    icon: CheckCircle2,
    iconColor: "text-gray-400",
    cardBorder: "border-border",
    cardBg: "bg-transparent",
  },
};

const STATUS_LABEL: Record<StatusTarefa, string> = {
  CONCLUIDA: "Concluído",
  PENDENTE: "Pendente",
  URGENTE: "Urgente",
  CRITICO: "Ação Necessária",
  VENCIDA: "Vencida",
  BLOQUEADA: "Bloqueada",
  NAO_APLICAVEL: "N/A",
};

type TimelineItem =
  | { kind: "tarefa"; tarefa: TarefaRoadmap; date: Date }
  | { kind: "hoje"; date: Date }
  | { kind: "voo"; date: Date }
  | { kind: "liberacao"; date: Date; label: string };

export function RoadmapTimeline({ roadmap, isPremium = true }: { roadmap: RoadmapCompliance; isPremium?: boolean }) {
  const hoje = startOfDay(new Date());
  const dataVoo = parseBR(roadmap.dataEmbarque);
  const diasAteVoo = differenceInDays(dataVoo, hoje);

  if (!isPremium) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-3">
        <Lock className="w-8 h-8 text-gray-300 mx-auto" />
        <p className="text-navy font-semibold text-sm">
          Linha do Tempo disponível no plano Premium
        </p>
        <p className="text-gray-400 text-xs leading-relaxed">
          Desbloqueie o iPet Travel Plan para ver datas exatas, prazos e a
          linha do tempo interativa da sua viagem.
        </p>
      </div>
    );
  }

  const semPrazo = roadmap.tarefas.filter(
    (t) => !t.prazo && t.status !== "NAO_APLICAVEL"
  );
  const comPrazo = roadmap.tarefas
    .filter((t) => t.prazo && t.status !== "NAO_APLICAVEL")
    .map((t) => ({ kind: "tarefa" as const, tarefa: t, date: parseBR(t.prazo!) }));

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

  const itensOrdenados = itensBase.sort((a, b) => a.date.getTime() - b.date.getTime());
  const idxHoje = itensOrdenados.findIndex((i) => isAfter(i.date, hoje));
  const itensComHoje: TimelineItem[] = [
    ...itensOrdenados.slice(0, idxHoje === -1 ? itensOrdenados.length : idxHoje),
    { kind: "hoje", date: hoje },
    ...(idxHoje === -1 ? [] : itensOrdenados.slice(idxHoje)),
  ];

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

  const total = roadmap.tarefas.filter(
    (t) => t.status !== "NAO_APLICAVEL" && t.status !== "BLOQUEADA"
  ).length;
  const concluidas = roadmap.tarefas.filter((t) => t.status === "CONCLUIDA").length;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-0">
      <div className="bg-white rounded-2xl p-4 mb-5 border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-navy" />
            <span className="text-sm text-gray-500 font-medium">
              {diasAteVoo > 0
                ? `${diasAteVoo} dias para o embarque`
                : diasAteVoo === 0
                ? "Hoje é o dia do embarque!"
                : `Voo há ${Math.abs(diasAteVoo)} dias`}
            </span>
          </div>
          <span className="text-navy text-sm font-bold">{pct}%</span>
        </div>
        <div className="w-full bg-surface rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-2 rounded-full ${
              pct === 100
                ? "bg-teal"
                : pct >= 60
                ? "bg-navy"
                : pct >= 30
                ? "bg-ipet-orange"
                : "bg-red-500"
            }`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {concluidas} de {total} etapas concluídas
        </p>
      </div>

      {semPrazo.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 px-1 font-medium">
            Sem prazo definido
          </p>
          <div className="flex flex-col gap-2">
            {semPrazo.map((t) => (
              <TarefaCard key={t.id} tarefa={t} semPrazo />
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="flex flex-col gap-0">
          {grupos.map((grupo, gi) => (
            <div key={grupo.mesAno}>
              <div className="flex items-center gap-3 mb-3 mt-4 first:mt-0">
                <div className="w-10 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  {grupo.mesAno}
                </span>
                <div className="flex-1 h-px bg-border" />
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
                    destino={roadmap.destino}
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

function TarefaNode({
  tarefa,
  date,
  destino,
  isLast,
}: {
  tarefa: TarefaRoadmap;
  date: Date;
  destino: Destino;
  isLast: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const style = STATUS_STYLE[tarefa.status];
  const Icon = style.icon;
  const hoje = startOfDay(new Date());
  const dias = differenceInDays(date, hoje);

  return (
    <div className="flex gap-3 pb-4">
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div
          className={`w-4 h-4 rounded-full ring-4 ${style.dot} ${style.ring} z-10 flex-shrink-0 mt-1`}
        />
      </div>

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
                tarefa.status === "CONCLUIDA" ? "text-gray-400 line-through" : "text-navy"
              }`}>
                {tarefa.titulo}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge} ${style.badgeText}`}>
                {STATUS_LABEL[tarefa.status]}
              </span>
              {aberto ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                {format(date, "d 'de' MMM", { locale: ptBR })}
              </span>
            </div>
            {tarefa.status !== "CONCLUIDA" && (
              <span
                className={`text-xs font-medium ${
                  dias < 0
                    ? "text-red-500"
                    : dias <= 7
                    ? "text-ipet-orange"
                    : "text-gray-400"
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
                <div className="flex items-start gap-2 bg-white/60 rounded-xl p-2.5">
                  <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-xs leading-relaxed">{tarefa.nota}</p>
                </div>
              )}
              {tarefa.precisaClinica && tarefa.status !== "CONCLUIDA" && (
                <ServicoCard tarefaId={tarefa.id} destino={destino} />
              )}
              {tarefa.bloqueadaPor.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">
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
              tarefa.status === "CONCLUIDA" ? "text-gray-400 line-through" : "text-navy"
            }`}>
              {tarefa.titulo}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge} ${style.badgeText}`}>
              {STATUS_LABEL[tarefa.status]}
            </span>
            {aberto ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
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
              <div className="flex items-start gap-2 bg-white/60 rounded-xl p-2.5">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-xs leading-relaxed">{tarefa.nota}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MarcadorHoje() {
  return (
    <div className="flex gap-3 pb-4 items-center">
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className="w-4 h-4 rounded-full bg-navy ring-4 ring-navy/20 z-10 flex-shrink-0" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold text-navy bg-surface border border-border px-2.5 py-1 rounded-full">
          HOJE
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

function MarcadorVoo({ date }: { date: Date }) {
  return (
    <div className="flex gap-3 pb-2 items-center">
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className="w-6 h-6 rounded-full bg-navy ring-4 ring-navy/30 z-10 flex items-center justify-center">
          <Plane className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-navy/5 border border-navy/10 rounded-2xl p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy text-xs font-semibold uppercase tracking-wider">
                Embarque
              </p>
              <p className="text-navy font-bold text-base mt-0.5">
                {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <Plane className="w-6 h-6 text-navy/30" />
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
        <div className="w-4 h-4 rounded-full bg-teal ring-4 ring-teal/30 z-10" />
      </div>
      <div className="flex-1">
        <div className="bg-teal-light border border-teal/20 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0" />
            <p className="text-teal text-xs font-medium">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
