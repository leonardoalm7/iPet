"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { calcularRoadmap, parseBR } from "@/services/travel-roadmap";
import { REGRAS_DESTINO } from "@/data/destinations";
import { differenceInDays } from "date-fns";
import { BottomNav } from "@/components/BottomNav";
import {
  Plane,
  PlusCircle,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// ─── Cálculo do progresso resumido ────────────────────────────

function calcularProgressoPlano(
  pet: ReturnType<typeof useAppStore.getState>["pets"][number],
  plano: ReturnType<typeof useAppStore.getState>["planosViagem"][number]
): { porcentagem: number; estado: "ok" | "urgente" | "atencao" | "pendente" } {
  const regras = REGRAS_DESTINO[plano.destino];
  const roadmap = calcularRoadmap(pet, plano.destino, plano.dataEmbarque, plano.id);
  const tarefasDocs = roadmap.tarefas.filter((t) => t.id !== "cvi");
  const docsConcluidos = tarefasDocs.filter((t) => t.concluida).length;
  const docsTotal = tarefasDocs.length;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataEmbarque = parseBR(plano.dataEmbarque);
  const diasRestantes = differenceInDays(dataEmbarque, hoje);

  const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);
  const estagio1 = !!(
    pet.nome && pet.especie && pet.raca && pet.peso > 0
  ) && (regras.exigeMicrochip ? temMicrochip : true);
  const estagio2 = true;
  const estagio3 = docsTotal > 0 ? docsConcluidos / docsTotal : 0;

  const peso = 100 / 7;
  let pct = 0;
  if (estagio1) pct += peso;
  pct += peso; // estagio 2
  pct += peso * estagio3;

  const porcentagem = Math.round(Math.min(pct, 100));

  const temUrgente = tarefasDocs.some(
    (t) => t.status === "CRITICO" || t.status === "URGENTE" || t.status === "VENCIDA"
  );
  const estado =
    porcentagem === 100
      ? "ok"
      : temUrgente || diasRestantes < 30
      ? "urgente"
      : diasRestantes < 60
      ? "atencao"
      : "pendente";

  return { porcentagem, estado };
}

// ─── Página principal ─────────────────────────────────────────

export default function ViagensPage() {
  const { planosViagem, pets } = useAppStore();

  const planosComPet = useMemo(
    () =>
      planosViagem
        .map((plano) => {
          const pet = pets.find((p) => p.id === plano.petId);
          if (!pet) return null;
          const { porcentagem, estado } = calcularProgressoPlano(pet, plano);
          return { plano, pet, porcentagem, estado };
        })
        .filter(Boolean) as {
        plano: (typeof planosViagem)[number];
        pet: (typeof pets)[number];
        porcentagem: number;
        estado: "ok" | "urgente" | "atencao" | "pendente";
      }[],
    [planosViagem, pets]
  );

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Plane className="w-6 h-6 text-sky-400" />
          <h1 className="text-2xl font-bold text-white">Viagens</h1>
        </div>
        <p className="text-gray-400 text-sm">
          {planosComPet.length > 0
            ? `${planosComPet.length} viagem${planosComPet.length !== 1 ? " planejada" : " planejada"}`
            : "Seus planos de viagem com pets"}
        </p>
      </header>

      <main className="flex-1 px-5 space-y-3">
        {planosComPet.length === 0 ? (
          <EmptyState petId={pets[0]?.id} />
        ) : (
          <>
            {planosComPet.map(({ plano, pet, porcentagem, estado }, i) => {
              const regras = REGRAS_DESTINO[plano.destino];
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);
              const dataEmbarque = parseBR(plano.dataEmbarque);
              const diasRestantes = differenceInDays(dataEmbarque, hoje);

              const corBarra =
                estado === "ok"
                  ? "bg-emerald-500"
                  : estado === "urgente"
                  ? "bg-orange-500"
                  : estado === "atencao"
                  ? "bg-amber-500"
                  : "bg-sky-500";

              const badgeEstado =
                estado === "ok" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : estado === "urgente" ? (
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                ) : (
                  <Clock className="w-4 h-4 text-sky-400" />
                );

              return (
                <motion.div
                  key={plano.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/viagens/${plano.id}`}
                    className="block bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors"
                  >
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                        {regras.bandeira}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm leading-snug">
                          {regras.nome}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {pet.nome.split(" ")[0]} · Embarque: {plano.dataEmbarque}
                        </p>
                        <p className="text-xs text-gray-500">
                          {diasRestantes > 0
                            ? `${diasRestantes} dias restantes`
                            : diasRestantes === 0
                            ? "Embarque hoje!"
                            : "Viagem encerrada"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {badgeEstado}
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] text-gray-500">Progresso</p>
                        <p className="text-[11px] font-semibold text-gray-400">
                          {porcentagem}%
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${porcentagem}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 + 0.2 }}
                          className={`h-full rounded-full ${corBarra}`}
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Planejar nova viagem */}
            {pets.length > 0 && (
              <Link
                href={`/viagem/${pets[0].id}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 border border-dashed border-gray-700 rounded-2xl text-gray-500 text-sm hover:border-sky-600 hover:text-sky-400 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Planejar nova viagem
              </Link>
            )}
          </>
        )}
      </main>

      <BottomNav active="viagens" />
    </div>
  );
}

function EmptyState({ petId }: { petId?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-5 text-4xl">
        ✈️
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">
        Nenhuma viagem planejada
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-[260px]">
        Planeje a viagem do seu pet e receba um roadmap completo de documentação
        com prazos.
      </p>
      {petId && (
        <Link
          href={`/viagem/${petId}`}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Planejar viagem
        </Link>
      )}
    </div>
  );
}
