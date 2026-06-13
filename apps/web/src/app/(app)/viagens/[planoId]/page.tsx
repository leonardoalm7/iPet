"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore, calcularRoadmap, calcularRoadmapMultiLeg } from "@ipet/core";
import { REGRAS_DESTINO, COMPANHIAS_AEREAS } from "@ipet/core";
import { RoadmapView } from "@/components/shared/RoadmapView";
import { RoadmapTimeline } from "@/components/shared/RoadmapTimeline";
import { CustoEstimado } from "@/components/shared/CustoEstimado";
import { differenceInDays, format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Plane, MapPin,
  FileText, Trash2, List, GitCommitHorizontal, ChevronRight,
  CalendarCheck, Stethoscope,
} from "lucide-react";

// Helper: parse date string dd/MM/yyyy
function parseBR(s: string) {
  return parse(s, "dd/MM/yyyy", new Date());
}

type ViewMode = "lista" | "timeline";

export default function PlanoDetalhe({ params }: { params: Promise<{ planoId: string }> }) {
  const { planoId } = use(params);
  const router = useRouter();
  const { planosViagem, planosViagemPets, pets, removerPlanoViagem } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const plano = planosViagem.find((p) => p.id === planoId);
  const petIds = planosViagemPets.filter((pvp) => pvp.planoViagemId === planoId).map((pvp) => pvp.petId);
  const petsDoPlano = petIds.map((id) => pets.find((p) => p.id === id)).filter(Boolean) as typeof pets;
  const [petAtivo, setPetAtivo] = useState<string>(petIds[0] ?? "");
  const pet = pets.find((p) => p.id === petAtivo);

  const roadmap = useMemo(() => {
    if (!plano || !pet) return null;
    if (plano.trechos && plano.trechos.length > 1) {
      return calcularRoadmapMultiLeg(pet, plano.trechos, planoId);
    }
    return calcularRoadmap(pet, plano.destino, plano.dataEmbarque, planoId);
  }, [plano, pet, planoId]);

  if (!plano) {
    return (
      <div className="text-center py-16">
        <p className="text-navy/50">Viagem não encontrada.</p>
        <Link href="/viagens" className="text-teal text-sm mt-2 hover:underline">Ver viagens</Link>
      </div>
    );
  }

  const dataEmbarque = parseBR(plano.dataEmbarque);
  const diasRestantes = differenceInDays(dataEmbarque, new Date());
  const companhia = plano.companhiaAereaId ? COMPANHIAS_AEREAS?.find((c) => c.id === plano.companhiaAereaId) : null;
  const regras = REGRAS_DESTINO[plano.destino];

  function handleDelete() {
    removerPlanoViagem(planoId);
    router.push("/viagens");
  }

  const statusColor: Record<string, string> = {
    APTO: "text-green-600 bg-green-50",
    PENDENTE: "text-yellow-700 bg-yellow-50",
    URGENTE: "text-orange-700 bg-orange-50",
    CRITICO: "text-red-700 bg-red-50",
    INAPTO: "text-red-800 bg-red-100",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface text-navy/60 hover:text-navy transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-navy capitalize truncate">{plano.destino.replace(/_/g, " ").toLowerCase()}</h2>
          <p className="text-sm text-navy/50">
            {format(dataEmbarque, "d 'de' MMMM yyyy", { locale: ptBR })}
            {diasRestantes >= 0 ? ` · ${diasRestantes} dias` : " · realizada"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {plano.isPremium && <span className="text-xs bg-ipet-orange/10 text-ipet-orange font-semibold px-2 py-1 rounded-full">Premium</span>}
          <button onClick={() => setConfirmDelete(true)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Seletor de pet (se multi-pet) */}
      {petsDoPlano.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {petsDoPlano.map((p) => (
            <button key={p.id} onClick={() => setPetAtivo(p.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                petAtivo === p.id ? "bg-navy text-white" : "bg-surface text-navy/60 hover:bg-navy/10"
              }`}>
              {p.nome}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main: roadmap */}
        <div className="xl:col-span-2 space-y-4">
          {roadmap ? (
            <>
              <div className="flex items-center justify-between bg-white rounded-xl border border-border px-5 py-4">
                <div>
                  <p className="text-sm text-navy/50">Status geral</p>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor[roadmap.statusGeral] ?? "bg-surface text-navy"}`}>
                    {roadmap.statusGeral}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
                  <button onClick={() => setViewMode("lista")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "lista" ? "bg-white shadow-sm text-navy" : "text-navy/50"}`}>
                    <List size={13} /> Lista
                  </button>
                  <button onClick={() => setViewMode("timeline")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "timeline" ? "bg-white shadow-sm text-navy" : "text-navy/50"}`}>
                    <GitCommitHorizontal size={13} /> Timeline
                  </button>
                </div>
              </div>

              {viewMode === "lista"
                ? <RoadmapView roadmap={roadmap} isPremium={plano.isPremium} />
                : <RoadmapTimeline roadmap={roadmap} isPremium={plano.isPremium} />
              }

              {!plano.isPremium && (
                <Link href={`/embarque/${planoId}`}
                  className="block w-full bg-gradient-to-r from-ipet-orange to-amber-500 text-white rounded-xl px-5 py-4 text-center font-semibold hover:opacity-90 transition-opacity">
                  🔓 Desbloquear datas e prazos completos — R$ 99
                </Link>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-border p-8 text-center">
              <p className="text-navy/50">Pet não encontrado no plano.</p>
            </div>
          )}
        </div>

        {/* Sidebar: detalhes */}
        <div className="space-y-4">
          {/* Info do destino */}
          <div className="bg-white rounded-xl border border-border p-5 space-y-3">
            <h4 className="font-semibold text-navy flex items-center gap-2"><MapPin size={16} className="text-teal" /> Destino</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy/50">Microchip</span>
                <span className="font-medium text-navy">{regras?.exigeMicrochip ? "Obrigatório" : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">Vacina antirrábica</span>
                <span className="font-medium text-navy">{regras?.exigeVacina ? `Obrig. (${regras.diasCarenciaVacina}d)` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">Sorologia</span>
                <span className="font-medium text-navy">{regras?.exigeSorologia ? `Obrig. (${regras.diasCarenciaSorologia}d)` : "Não exigida"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">CVI</span>
                <span className="font-medium text-navy">{regras?.exigeCVI ? `Obrig. (${regras.diasAntesCVI}d antes)` : "—"}</span>
              </div>
            </div>
            {regras?.observacoes && (
              <p className="text-xs text-navy/50 bg-surface rounded-lg p-2">{regras.observacoes}</p>
            )}
          </div>

          {/* Companhia aérea */}
          {companhia ? (
            <div className="bg-white rounded-xl border border-border p-5">
              <h4 className="font-semibold text-navy mb-3 flex items-center gap-2"><Plane size={16} className="text-teal" /> {companhia.nome}</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy/50">Cabine</span>
                  <span className="font-medium text-navy">até {companhia.pesoMaxCabine} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/50">Porão</span>
                  <span className="font-medium text-navy">até {companhia.pesoMaxPorão} kg</span>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/companhias"
              className="bg-white rounded-xl border border-dashed border-border p-5 flex items-center gap-3 hover:border-teal transition-colors block">
              <Plane size={20} className="text-navy/30" />
              <div>
                <p className="text-sm font-medium text-navy/70">Escolher companhia aérea</p>
                <p className="text-xs text-navy/40">Verificar regras para seu pet</p>
              </div>
              <ChevronRight size={16} className="text-navy/30 ml-auto" />
            </Link>
          )}

          {/* Custo estimado */}
          {pet && (
            <CustoEstimado pet={pet} destino={plano.destino} isPremium={plano.isPremium} />
          )}

          {/* CTAs */}
          <div className="space-y-2">
            <Link href="/clinicas"
              className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3 hover:shadow-sm transition-shadow">
              <Stethoscope size={18} className="text-teal" />
              <div className="flex-1">
                <p className="text-sm font-medium text-navy">Clínicas parceiras</p>
                <p className="text-xs text-navy/40">Agendar consultas e exames</p>
              </div>
              <ChevronRight size={14} className="text-navy/30" />
            </Link>
            <Link href="/ferramentas/calculadora-quarentena"
              className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3 hover:shadow-sm transition-shadow">
              <CalendarCheck size={18} className="text-teal" />
              <div className="flex-1">
                <p className="text-sm font-medium text-navy">Calculadora de quarentena</p>
                <p className="text-xs text-navy/40">Calcular carência da sorologia</p>
              </div>
              <ChevronRight size={14} className="text-navy/30" />
            </Link>
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-navy text-lg mb-2">Excluir viagem?</h3>
            <p className="text-sm text-navy/60 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-border py-2.5 rounded-xl text-sm font-medium text-navy hover:bg-surface transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
