"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Destino } from "@/domain/types";
import { DESTINOS_LISTA, getDestinosAgrupados } from "@/data/destinations";
import { COMPANHIAS_AEREAS } from "@/data/airlines";
import { calcularRoadmap } from "@/services/travel-roadmap";
import { ArrowLeft, Plane, ChevronRight, BookmarkPlus, Check, List, GitCommitHorizontal, Search } from "lucide-react";
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
        <p className="text-gray-400">Pet não encontrado.</p>
      </div>
    );
  }

  function gerarRoadmap() {
    if (!dataEmbarque) return;
    const result = calcularRoadmap(pet!, destino, dataEmbarque, "preview");
    setRoadmap(result);
    setSalvo(false);
    track("destino_selecionado", { destino });
    track("roadmap_gerado", { destino, qtdTarefas: result.tarefas.length });
  }

  function salvarViagem() {
    if (!roadmap || salvo) return;
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
    <div className="flex flex-col min-h-screen pb-8 bg-white">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-navy">
            {roadmap ? "Roadmap de Compliance" : "Selecione o Destino"}
          </h1>
          <p className="text-xs text-gray-400">{pet.nome.split(" ")[0]}</p>
        </div>
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
            <div className="bg-white border border-border rounded-2xl p-4 mb-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Roadmap de Compliance</p>
              <p className="text-navy font-semibold">
                Viagem para {destinoInfo?.bandeira} {destinoInfo?.nome} em {dataEmbarque}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-surface border border-border rounded-2xl p-1 mb-4">
              <button
                onClick={() => setViewMode("lista")}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "lista"
                    ? "bg-white text-navy shadow-sm"
                    : "text-gray-400 hover:text-gray-400"
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "timeline"
                    ? "bg-white text-navy shadow-sm"
                    : "text-gray-400 hover:text-gray-400"
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

            <button
              onClick={salvarViagem}
              disabled={salvo}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors mt-4 ${
                salvo
                  ? "bg-teal-light border border-teal/20 text-teal"
                  : "bg-navy hover:bg-navy-light text-white"
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
              className="w-full py-3 border border-border rounded-2xl text-gray-400 text-sm hover:border-navy/30 hover:text-navy transition-colors mt-2"
            >
              Alterar destino / data
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

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
  const [busca, setBusca] = useState("");
  const [regiaoAtiva, setRegiaoAtiva] = useState<string | null>(null);
  const grupos = useMemo(() => getDestinosAgrupados(), []);
  const buscaLower = busca.toLowerCase().trim();
  const gruposFiltrados = useMemo(() => {
    let result = grupos;
    if (buscaLower) {
      result = result
        .map((g) => ({ ...g, destinos: g.destinos.filter((d) => d.nome.toLowerCase().includes(buscaLower)) }))
        .filter((g) => g.destinos.length > 0);
    }
    if (regiaoAtiva) {
      result = result.filter((g) => g.regiao === regiaoAtiva);
    }
    return result;
  }, [grupos, buscaLower, regiaoAtiva]);

  const regioes = grupos.map((g) => g.regiao);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Para onde você vai viajar?
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar destino..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
        <button
          onClick={() => setRegiaoAtiva(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !regiaoAtiva ? "bg-navy text-white border-navy" : "bg-white text-gray-500 border-border hover:border-navy/30"
          }`}
        >
          Todas
        </button>
        {regioes.map((r) => (
          <button
            key={r}
            onClick={() => setRegiaoAtiva(regiaoAtiva === r ? null : r)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              regiaoAtiva === r ? "bg-navy text-white border-navy" : "bg-white text-gray-500 border-border hover:border-navy/30"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {gruposFiltrados.map((grupo) => (
          <div key={grupo.regiao}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {grupo.regiao}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {grupo.destinos.map((d) => (
                <button
                  key={d.destino}
                  onClick={() => setDestino(d.destino)}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                    destino === d.destino
                      ? "border-navy bg-navy/5 shadow-sm"
                      : "border-border bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="text-xl mb-0.5">{d.bandeira}</div>
                  <div className={`text-xs font-medium leading-tight ${destino === d.destino ? "text-navy" : "text-gray-400"}`}>
                    {d.nome}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {gruposFiltrados.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">Nenhum destino encontrado</p>
        )}
      </div>

      <DateInput
        label="Data prevista de embarque"
        value={dataEmbarque}
        onChange={setDataEmbarque}
      />

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1.5">
          Companhia aérea (opcional)
        </label>
        <select
          value={companhiaId}
          onChange={(e) => setCompanhiaId(e.target.value)}
          className="w-full bg-surface border border-border text-navy rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
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
        className="flex items-center justify-center gap-2 w-full bg-navy hover:bg-navy-light disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-4 rounded-2xl transition-colors"
      >
        Próximo
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function AirlineInfo({ id }: { id: string }) {
  const cia = COMPANHIAS_AEREAS.find((c) => c.id === id);
  if (!cia) return null;
  return (
    <div className="mt-2 bg-surface border border-border rounded-xl p-3 text-xs space-y-1.5">
      <p className="font-medium text-navy">{cia.nome}</p>
      <div className="grid grid-cols-2 gap-1 text-gray-400">
        <span>Cabine: até {cia.pesoMaxCabine}kg</span>
        <span>Porão: até {cia.pesoMaxPorао}kg</span>
        <span>Caixa: {cia.dimensoesMaxCabine.comprimento}×{cia.dimensoesMaxCabine.largura}×{cia.dimensoesMaxCabine.altura}cm</span>
        <span>Braqui cabine: {cia.braquicefalicoCabine ? "✅" : "❌"} · porão: {cia.braquicefalicoPorao ? "✅" : "❌"}</span>
      </div>
      <p className="text-gray-400 leading-relaxed">{cia.anotacoes}</p>
    </div>
  );
}
