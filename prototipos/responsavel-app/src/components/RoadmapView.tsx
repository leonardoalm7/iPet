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
    iconColor: "text-teal",
    borderColor: "border-teal/20",
    bgColor: "bg-teal-light",
    badge: "Concluído",
    badgeColor: "bg-teal-light text-teal",
  },
  PENDENTE: {
    icon: Clock,
    iconColor: "text-ipet-orange",
    borderColor: "border-ipet-orange/20",
    bgColor: "bg-orange-light",
    badge: "Pendente",
    badgeColor: "bg-orange-light text-ipet-orange",
  },
  URGENTE: {
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
    badge: "Urgente",
    badgeColor: "bg-amber-100 text-amber-600",
  },
  CRITICO: {
    icon: Zap,
    iconColor: "text-red-500",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
    badge: "Ação Necessária",
    badgeColor: "bg-red-100 text-red-500",
  },
  VENCIDA: {
    icon: XCircle,
    iconColor: "text-red-500",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
    badge: "Vencida",
    badgeColor: "bg-red-100 text-red-500",
  },
  BLOQUEADA: {
    icon: Lock,
    iconColor: "text-gray-400",
    borderColor: "border-border",
    bgColor: "bg-surface",
    badge: "Bloqueada",
    badgeColor: "bg-surface text-gray-400",
  },
  NAO_APLICAVEL: {
    icon: CheckCircle2,
    iconColor: "text-gray-400",
    borderColor: "border-border",
    bgColor: "bg-transparent",
    badge: "N/A",
    badgeColor: "bg-surface text-gray-400",
  },
};

const OVERALL_CONFIG: Record<
  StatusCompliance,
  { label: string; subLabel: string; bg: string; border: string; text: string }
> = {
  APTO: {
    label: "Apto para embarcar!",
    subLabel: "Todos os requisitos estão completos.",
    bg: "bg-teal-light",
    border: "border-teal/20",
    text: "text-teal",
  },
  PENDENTE: {
    label: "Em andamento",
    subLabel: "Há tarefas a concluir, mas você está no prazo.",
    bg: "bg-orange-light",
    border: "border-ipet-orange/20",
    text: "text-ipet-orange",
  },
  URGENTE: {
    label: "Atenção necessária",
    subLabel: "Algumas tarefas estão com prazo curto.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
  },
  CRITICO: {
    label: "Situação crítica",
    subLabel: "Prazos se encerrando. Ação imediata necessária.",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-500",
  },
  INAPTO: {
    label: "Inapto para esta data",
    subLabel: "Não é possível embarcar nesta data com a documentação atual.",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-500",
  },
};

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
      <motion.div
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        className={`rounded-2xl border px-4 py-4 ${overall.bg} ${overall.border}`}
      >
        <p className={`font-bold text-base ${overall.text}`}>{overall.label}</p>
        <p className="text-sm text-gray-400 mt-0.5">{overall.subLabel}</p>
        {roadmap.dataLiberacao && roadmap.statusGeral !== "APTO" && (
          <p className="text-xs text-gray-400 mt-2">
            Data mais cedo possível para embarcar:{" "}
            <span className="text-navy font-medium">{roadmap.dataLiberacao}</span>
          </p>
        )}
      </motion.div>

      <div className="space-y-2">
        {roadmap.tarefas.map((tarefa, idx) => (
          <TarefaCard key={tarefa.id} tarefa={tarefa} index={idx} pet={pet} />
        ))}
      </div>
    </div>
  );
}

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
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3.5 text-left"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-navy">{tarefa.titulo}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>
              {cfg.badge}
            </span>
          </div>
          {tarefa.prazo && tarefa.status !== "CONCLUIDA" && (
            <p className="text-xs text-gray-400 mt-0.5">
              Prazo: {tarefa.prazo}
              {tarefa.diasParaPrazo !== null && tarefa.diasParaPrazo >= 0 && (
                <span className={`ml-1 font-medium ${tarefa.diasParaPrazo <= 7 ? "text-ipet-orange" : ""}`}>
                  ({tarefa.diasParaPrazo} {tarefa.diasParaPrazo === 1 ? "dia" : "dias"})
                </span>
              )}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <p className="text-xs text-gray-400 leading-relaxed">{tarefa.descricao}</p>
              {tarefa.nota && (
                <p className="text-xs text-gray-500 leading-relaxed bg-surface rounded-xl px-3 py-2.5">
                  {tarefa.nota}
                </p>
              )}
              {tarefa.precisaClinica && tarefa.status !== "CONCLUIDA" && (
                <button className="flex items-center gap-2 text-xs text-teal font-medium py-2">
                  <MapPin className="w-4 h-4" />
                  Ver clínicas credenciadas próximas
                </button>
              )}
              {tarefa.bloqueadaPor.length > 0 && (
                <p className="text-xs text-gray-400">
                  Aguardando:{" "}
                  {tarefa.bloqueadaPor.map((id) => (
                    <span key={id} className="text-gray-500 font-medium">{id} </span>
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
