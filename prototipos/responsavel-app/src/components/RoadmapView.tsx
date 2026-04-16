"use client";

import { Pet, RoadmapCompliance, TarefaRoadmap, StatusCompliance } from "@/domain/types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------------------------------------------------------
// Configurações visuais por status
// --------------------------------------------------------
const STATUS_CONFIG: Record<
  TarefaRoadmap["status"],
  {
    icon: React.ElementType;
    iconColor: string;
    borderColor: string;
    bgColor: string;
    badge: string;
    badgeColor: string;
  }
> = {
  CONCLUIDA: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-800/40",
    bgColor: "bg-emerald-900/10",
    badge: "Concluída",
    badgeColor: "bg-emerald-900/40 text-emerald-400",
  },
  PENDENTE: {
    icon: Clock,
    iconColor: "text-sky-400",
    borderColor: "border-sky-800/40",
    bgColor: "bg-sky-900/10",
    badge: "Pendente",
    badgeColor: "bg-sky-900/40 text-sky-400",
  },
  URGENTE: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    borderColor: "border-amber-600/50",
    bgColor: "bg-amber-900/15",
    badge: "Urgente",
    badgeColor: "bg-amber-900/50 text-amber-300",
  },
  CRITICO: {
    icon: Zap,
    iconColor: "text-orange-400",
    borderColor: "border-orange-600/50",
    bgColor: "bg-orange-900/15",
    badge: "Crítico",
    badgeColor: "bg-orange-900/50 text-orange-300",
  },
  VENCIDA: {
    icon: XCircle,
    iconColor: "text-red-400",
    borderColor: "border-red-800/40",
    bgColor: "bg-red-900/10",
    badge: "Vencida",
    badgeColor: "bg-red-900/40 text-red-400",
  },
  BLOQUEADA: {
    icon: Lock,
    iconColor: "text-gray-500",
    borderColor: "border-gray-700",
    bgColor: "bg-gray-900/30",
    badge: "Bloqueada",
    badgeColor: "bg-gray-800 text-gray-500",
  },
  NAO_APLICAVEL: {
    icon: CheckCircle2,
    iconColor: "text-gray-600",
    borderColor: "border-gray-800",
    bgColor: "bg-transparent",
    badge: "N/A",
    badgeColor: "bg-gray-800 text-gray-600",
  },
};

const OVERALL_CONFIG: Record<
  StatusCompliance,
  { label: string; subLabel: string; bg: string; border: string; text: string }
> = {
  APTO: {
    label: "✅ Apto para embarcar!",
    subLabel: "Todos os requisitos estão completos.",
    bg: "bg-emerald-900/20",
    border: "border-emerald-700/40",
    text: "text-emerald-400",
  },
  PENDENTE: {
    label: "⏳ Em andamento",
    subLabel: "Há tarefas a concluir, mas você está no prazo.",
    bg: "bg-sky-900/20",
    border: "border-sky-700/40",
    text: "text-sky-400",
  },
  URGENTE: {
    label: "⚠️ Atenção necessária",
    subLabel: "Algumas tarefas estão com prazo curto.",
    bg: "bg-amber-900/20",
    border: "border-amber-700/40",
    text: "text-amber-400",
  },
  CRITICO: {
    label: "🚨 Situação crítica",
    subLabel: "Prazos se encerrando. Ação imediata necessária.",
    bg: "bg-orange-900/20",
    border: "border-orange-700/40",
    text: "text-orange-400",
  },
  INAPTO: {
    label: "❌ Inapto para esta data",
    subLabel: "Não é possível embarcar nesta data com a documentação atual.",
    bg: "bg-red-900/20",
    border: "border-red-700/40",
    text: "text-red-400",
  },
};

// --------------------------------------------------------
// Componente principal
// --------------------------------------------------------
export function RoadmapView({
  roadmap,
  pet,
}: {
  roadmap: RoadmapCompliance;
  pet: Pet;
}) {
  const overall = OVERALL_CONFIG[roadmap.statusGeral];

  return (
    <div className="space-y-4">
      {/* Banner de status geral */}
      <motion.div
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        className={`rounded-2xl border px-4 py-4 ${overall.bg} ${overall.border}`}
      >
        <p className={`font-bold text-base ${overall.text}`}>{overall.label}</p>
        <p className="text-sm text-gray-400 mt-0.5">{overall.subLabel}</p>
        {roadmap.dataLiberacao && roadmap.statusGeral !== "APTO" && (
          <p className="text-xs text-gray-500 mt-2">
            Data mais cedo possível para embarcar:{" "}
            <span className="text-gray-300 font-medium">{roadmap.dataLiberacao}</span>
          </p>
        )}
      </motion.div>

      {/* Lista de tarefas */}
      <div className="space-y-2">
        {roadmap.tarefas.map((tarefa, idx) => (
          <TarefaCard key={tarefa.id} tarefa={tarefa} index={idx} pet={pet} />
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------
// Card de tarefa individual
// --------------------------------------------------------
function TarefaCard({
  tarefa,
  index,
  pet,
}: {
  tarefa: TarefaRoadmap;
  index: number;
  pet: Pet;
}) {
  const [expanded, setExpanded] = useState(
    tarefa.status === "URGENTE" || tarefa.status === "CRITICO"
  );
  const cfg = STATUS_CONFIG[tarefa.status];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border ${cfg.borderColor} ${cfg.bgColor} overflow-hidden`}
    >
      {/* Cabeçalho */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3.5 text-left"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-100">{tarefa.titulo}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>
              {STATUS_CONFIG[tarefa.status].badge}
            </span>
          </div>
          {tarefa.prazo && tarefa.status !== "CONCLUIDA" && (
            <p className="text-xs text-gray-500 mt-0.5">
              Prazo: {tarefa.prazo}
              {tarefa.diasParaPrazo !== null && tarefa.diasParaPrazo >= 0 && (
                <span className={`ml-1 ${tarefa.diasParaPrazo <= 7 ? "text-amber-400" : ""}`}>
                  ({tarefa.diasParaPrazo} {tarefa.diasParaPrazo === 1 ? "dia" : "dias"})
                </span>
              )}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
        )}
      </button>

      {/* Detalhes expandidos */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-800/50 pt-3">
              <p className="text-xs text-gray-400 leading-relaxed">{tarefa.descricao}</p>
              {tarefa.nota && (
                <p className="text-xs text-gray-300 leading-relaxed bg-gray-800/40 rounded-xl px-3 py-2.5">
                  {tarefa.nota}
                </p>
              )}
              {tarefa.precisaClinica && tarefa.status !== "CONCLUIDA" && (
                <button className="flex items-center gap-2 text-xs text-sky-400 py-2">
                  <MapPin className="w-4 h-4" />
                  Ver clínicas credenciadas próximas
                </button>
              )}
              {tarefa.bloqueadaPor.length > 0 && (
                <p className="text-xs text-gray-500">
                  Aguardando:{" "}
                  {tarefa.bloqueadaPor.map((id) => (
                    <span key={id} className="text-gray-400 font-medium">{id} </span>
                  ))}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
