"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Destino } from "@/domain/types";
import { ServicoClinica } from "@/data/clinicas-credenciadas";
import { getCustoPorTarefaId, formatBRL } from "@/services/cost-estimator";
import { track } from "@/services/analytics";
import { MapPin, ArrowRight } from "lucide-react";

const TAREFA_TO_SERVICO: Record<string, ServicoClinica> = {
  microchip: "MICROCHIP",
  vacina: "VACINA_ANTIRRABICA",
  sorologia: "SOROLOGIA",
  cvi: "CVI",
};

export function tarefaIdToServico(tarefaId: string): ServicoClinica | null {
  return TAREFA_TO_SERVICO[tarefaId] ?? null;
}

export function ServicoCard({
  tarefaId,
  destino,
}: {
  tarefaId: string;
  destino: Destino;
}) {
  const servico = tarefaIdToServico(tarefaId);
  const custo = servico ? getCustoPorTarefaId(destino, tarefaId) : null;

  useEffect(() => {
    if (!servico) return;
    track("service_card_view", { etapa: servico, destino });
  }, [servico, destino]);

  if (!servico) return null;

  const handleClick = () => {
    track("service_cta_click", { etapa: servico, destino });
  };

  const custoLabel = custo
    ? custo.minBRL === custo.maxBRL
      ? formatBRL(custo.minBRL)
      : `${formatBRL(custo.minBRL)} – ${formatBRL(custo.maxBRL)}`
    : null;

  return (
    <div className="bg-white border border-teal/20 rounded-xl p-3 mt-2">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-teal" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-navy">
            Faça este passo com uma clínica credenciada
          </p>
          {custoLabel && (
            <p className="text-[11px] text-gray-500 mt-0.5">
              Custo estimado: <span className="text-navy font-medium">{custoLabel}</span>
            </p>
          )}
          <Link
            href={`/clinicas?servico=${servico}`}
            onClick={handleClick}
            className="inline-flex items-center gap-1 text-xs text-teal font-semibold mt-2 hover:underline"
          >
            Ver clínicas próximas
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
