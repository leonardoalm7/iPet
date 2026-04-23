"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Destino } from "@/domain/types";
import { DESTINOS_LISTA } from "@/data/destinations";
import { COMPANHIAS_AEREAS } from "@/data/airlines";
import { calcularRoadmap } from "@/services/travel-roadmap";
import { ArrowLeft, Plane, Calendar, ChevronRight, BookmarkPlus, Check, List, GitCommitHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { RoadmapView } from "@/components/RoadmapView";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";
import { DateInput } from "@/components/DateInput";
import { track } from "@/services/analytics";

export default function ViagemPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = use(params);
  const router = useRouter();
  const pet = useAppStore((s) => s.pets.find((p) => p.id === petId));
  const criarPlano = useAppStore((s) => s.criarPlanoViagem);
  const planosExistentes = useAppStore((s) => s.planosViagem);

  const [destino, setDestino] = useState<Destino>("BRASIL");
  const [dataEmbarque, setDataEmbarque] = useState("");
  const [companhiaId, setCompanhiaId] = useState("");
  const [roadmap, setRoadmap] = useState<ReturnType<typeof calcularRoadmap> | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [viewMode, setViewMode] = useState<"lista" | "timeline">("lista");

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Pet não encontrado.</p>
      </div>
    );
  }

  function gerarRoadmap() {
    if (!dataEmbarque) return;
    // Roadmap é só cálculo — não persiste automaticamente.
    // Usa ID temporário; o plano só vai para o store se o usuário clicar em "Salvar".
    const result = calcularRoadmap(pet!, destino, dataEmbarque, "preview");
    setRoadmap(result);
    setSalvo(false);
    track("destino_selecionado", { destino });
    track("roadmap_gerado", { destino, qtdTarefas: result.tarefas.length });
  }

  function salvarViagem() {
    if (!roadmap || salvo) return;
    // Evita duplicata: verifica se já existe plano igual
    const duplicado = planosExistentes.some(
      (p) => p.petId === pet!.id && p.destino === destino && p.dataEmbarque === dataEmbarque
    );
    if (!duplicado) {
      criarPlano({ petId: pet!.id, destino, dataEmbarque, companhiaAereaId: companhiaId || undefined });
    }
    setSalvo(true);
  }

  const destinoInfo = DESTINOS_LISTA.find((d) => d.destino === destino);

  return (
    <div className="flex flex-col min-h-screen pb-8">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Planejar Viagem</h1>
          <p className="text-sm text-gray-500">{pet.nome.split(" ")[0]}</p>
        </div>
        <Plane className="w-5 h-5 text-teal" />
      </header>

      <main className="px-5 space-y-5">
        {!roadmap ? (
          <FormViagem
            destino={destino}
            setDestino={setDestino}
            dataEmbarque={dataEmbarque}
            setDataEmbarque={setDataEmbarque}
            companhiaId={companhiaId}
            setCompanhiaId={setCompanhiaId}
            onGerar={gerarRoadmap}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Destino</p>
                <p className="text-base font-semibold">
                  {destinoInfo?.bandeira} {destinoInfo?.nome}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Embarque</p>
                <p className="text-base font-semibold">{dataEmbarque}</p>
              </div>
            </div>

            {/* Toggle de visualização */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-4">
              <button
                onClick={() => setViewMode("lista")}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "lista"
                    ? "bg-gray-100 text-navy shadow"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "timeline"
                    ? "bg-gray-100 text-navy shadow"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                <GitCommitHorizontal className="w-4 h-4" />
                Linha do Tempo
              </button>
            </div>

            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === "lista" ? (
                <RoadmapView roadmap={roadmap} pet={pet} />
              ) : (
                <RoadmapTimeline roadmap={roadmap} />
              )}
            </motion.div>

            {/* Salvar viagem — só persiste quando o usuário decide */}
            <button
              onClick={salvarViagem}
              disabled={salvo}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                salvo
                  ? "bg-emerald-100 border border-emerald-200 text-emerald-600"
                  : "bg-teal hover:bg-teal-dark text-white"
              }`}
            >
              {salvo ? (
                <><Check className="w-4 h-4" /> Viagem salva</>
              ) : (
                <><BookmarkPlus className="w-4 h-4" /> Salvar esta viagem</>
              )}
            </button>

            <button
              onClick={() => { setRoadmap(null); setSalvo(false); }}
              className="w-full py-3 border border-gray-200 rounded-2xl text-gray-500 text-sm hover:border-gray-600 transition-colors"
            >
              Alterar destino / data
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// --------------------------------------------------------
// Formulário de seleção de destino + data
// --------------------------------------------------------
function FormViagem({
  destino,
  setDestino,
  dataEmbarque,
  setDataEmbarque,
  companhiaId,
  setCompanhiaId,
  onGerar,
}: {
  destino: Destino;
  setDestino: (d: Destino) => void;
  dataEmbarque: string;
  setDataEmbarque: (s: string) => void;
  companhiaId: string;
  setCompanhiaId: (s: string) => void;
  onGerar: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Destino */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-3">
          Para onde você vai viajar?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DESTINOS_LISTA.map((d) => (
            <button
              key={d.destino}
              onClick={() => setDestino(d.destino)}
              className={`py-3 px-3 rounded-2xl border text-left transition-colors ${
                destino === d.destino
                  ? "border-teal bg-teal/10"
                  : "border-gray-200 bg-white/50"
              }`}
            >
              <div className="text-2xl mb-1">{d.bandeira}</div>
              <div className={`text-sm font-medium ${destino === d.destino ? "text-teal" : "text-gray-600"}`}>
                {d.nome}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Data de embarque */}
      <DateInput
        label="📅 Data prevista de embarque"
        value={dataEmbarque}
        onChange={setDataEmbarque}
      />

      {/* Companhia aérea (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Companhia aérea (opcional)
        </label>
        <select
          value={companhiaId}
          onChange={(e) => setCompanhiaId(e.target.value)}
          className="w-full bg-gray-100 border border-gray-200 text-navy rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">Não sei ainda</option>
          {COMPANHIAS_AEREAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {companhiaId && (
          <AirlineInfo id={companhiaId} />
        )}
      </div>

      <button
        onClick={onGerar}
        disabled={!dataEmbarque}
        className="flex items-center justify-center gap-2 w-full bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-4 rounded-2xl transition-colors"
      >
        Ver o que preciso fazer
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function AirlineInfo({ id }: { id: string }) {
  const cia = COMPANHIAS_AEREAS.find((c) => c.id === id);
  if (!cia) return null;
  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
      <p className="font-medium text-navy">{cia.nome}</p>
      <div className="grid grid-cols-2 gap-1 text-gray-500">
        <span>Cabine: até {cia.pesoMaxCabine}kg</span>
        <span>Porão: até {cia.pesoMaxPorао}kg</span>
        <span>Caixa: {cia.dimensoesMaxCabine.comprimento}×{cia.dimensoesMaxCabine.largura}×{cia.dimensoesMaxCabine.altura}cm</span>
        <span>Braqui cabine: {cia.braquicefalicoCabine ? "✅" : "❌"} · porão: {cia.braquicefalicoPorao ? "✅" : "❌"}</span>
      </div>
      <p className="text-gray-400 leading-relaxed">{cia.anotacoes}</p>
    </div>
  );
}
