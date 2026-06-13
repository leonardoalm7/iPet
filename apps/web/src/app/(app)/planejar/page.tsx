"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, calcularRoadmap, calcularRoadmapMultiLeg } from "@ipet/core";
import { REGRAS_DESTINO, getDestinosAgrupados } from "@ipet/core";
import type { Destino, Pet, TrechoViagem } from "@ipet/core";
import { addDays, addMonths, differenceInDays, format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, ArrowLeft, Check, PawPrint, MapPin, CalendarDays, Plus, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// helpers
function formatBR(d: Date) { return format(d, "dd/MM/yyyy"); }
function parseBR(s: string) { return parse(s, "dd/MM/yyyy", new Date()); }
function formatInput(d: Date) { return format(d, "yyyy-MM-dd"); }
function fromInput(s: string) { return parse(s, "yyyy-MM-dd", new Date()); }

type Passo = "pet" | "destino" | "quando" | "resultado";

export default function PlanejarPage() {
  const router = useRouter();
  const { pets, criarPlanoViagem } = useAppStore();
  const [passo, setPasso] = useState<Passo>("pet");
  const [petIds, setPetIds] = useState<string[]>([]);
  const [trechos, setTrechos] = useState<{ destino: Destino | ""; dataInput: string }[]>([
    { destino: "", dataInput: "" },
  ]);
  const [escala, setEscala] = useState(false);

  const petsSelecionados = petIds.map((id) => pets.find((p) => p.id === id)).filter(Boolean) as Pet[];
  const destinoFinal = trechos[trechos.length - 1]?.destino as Destino | "";
  const dataEmbarque = trechos[0]?.dataInput ? fromInput(trechos[0].dataInput) : null;

  // Resultado
  const roadmaps = useMemo(() => {
    if (passo !== "resultado" || petsSelecionados.length === 0 || !destinoFinal || !trechos[0].dataInput) return null;
    const trechosValidos = trechos
      .filter((t) => t.destino && t.dataInput)
      .map((t) => ({ destino: t.destino as Destino, dataEmbarque: formatBR(fromInput(t.dataInput)) }));

    return petsSelecionados.map((pet) => ({
      pet,
      roadmap: trechosValidos.length > 1
        ? calcularRoadmapMultiLeg(pet, trechosValidos, "preview")
        : calcularRoadmap(pet, destinoFinal, formatBR(fromInput(trechos[0].dataInput)), "preview"),
    }));
  }, [passo, petsSelecionados, destinoFinal, trechos]);

  function podeAvancar() {
    if (passo === "pet") return petIds.length > 0;
    if (passo === "destino") return trechos.every((t) => t.destino !== "");
    if (passo === "quando") return trechos.every((t) => t.dataInput !== "");
    return false;
  }

  function avancar() {
    const ordem: Passo[] = ["pet", "destino", "quando", "resultado"];
    const idx = ordem.indexOf(passo);
    if (idx < 3) setPasso(ordem[idx + 1]);
  }

  function voltar() {
    const ordem: Passo[] = ["pet", "destino", "quando", "resultado"];
    const idx = ordem.indexOf(passo);
    if (idx > 0) setPasso(ordem[idx - 1]);
    else router.back();
  }

  function confirmar() {
    const trechosValidos = trechos
      .filter((t) => t.destino && t.dataInput)
      .map((t) => ({ destino: t.destino as Destino, dataEmbarque: formatBR(fromInput(t.dataInput)) }));
    const plano = criarPlanoViagem({
      destino: trechosValidos[trechosValidos.length - 1].destino,
      dataEmbarque: trechosValidos[0].dataEmbarque,
      trechos: trechosValidos,
      petIds,
    });
    router.push(`/viagens/${plano.id}`);
  }

  const PASSOS = [
    { id: "pet", label: "Pet" },
    { id: "destino", label: "Destino" },
    { id: "quando", label: "Quando" },
    { id: "resultado", label: "Resultado" },
  ];
  const passoIdx = PASSOS.findIndex((p) => p.id === passo);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={voltar} className="p-2 rounded-lg hover:bg-surface text-navy/60 hover:text-navy transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-navy">Planejar Viagem</h2>
          <p className="text-sm text-navy/50">Passo {passoIdx + 1} de {PASSOS.length}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center bg-white rounded-xl border border-border p-4 gap-2">
        {PASSOS.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              i < passoIdx ? "bg-teal text-white" : i === passoIdx ? "bg-navy text-white" : "bg-surface text-navy/30"
            }`}>
              {i < passoIdx ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === passoIdx ? "text-navy" : "text-navy/40"}`}>{p.label}</span>
            {i < PASSOS.length - 1 && <div className={`flex-1 h-px ${i < passoIdx ? "bg-teal" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={passo} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 0, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
          <div className="bg-white rounded-xl border border-border p-6">
            {passo === "pet" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy flex items-center gap-2"><PawPrint size={20} className="text-teal" /> Selecione o(s) pet(s)</h3>
                {pets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-navy/50 text-sm mb-3">Nenhum pet cadastrado ainda.</p>
                    <Link href="/pets/novo" className="bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors">
                      Cadastrar pet
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pets.map((pet) => {
                      const sel = petIds.includes(pet.id);
                      return (
                        <button key={pet.id} onClick={() => setPetIds(sel ? petIds.filter((id) => id !== pet.id) : [...petIds, pet.id])}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${sel ? "border-teal bg-teal-light shadow-sm" : "border-border hover:border-teal/50"}`}>
                          <span className="text-3xl">{pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy">{pet.nome}</p>
                            <p className="text-xs text-navy/50">{pet.raca} · {pet.peso} kg</p>
                          </div>
                          {sel && <Check size={18} className="text-teal shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {passo === "destino" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2"><MapPin size={20} className="text-teal" /> Destino</h3>
                  <button onClick={() => setEscala(!escala)}
                    className="text-xs text-teal font-medium hover:underline">
                    {escala ? "Remover escala" : "+ Adicionar escala"}
                  </button>
                </div>
                <div className="space-y-3">
                  {trechos.map((trecho, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-navy/50 mb-1 block">
                          {i === 0 && trechos.length > 1 ? "Escala 1" : i === trechos.length - 1 && trechos.length > 1 ? "Destino final" : "Destino"}
                        </label>
                        <select value={trecho.destino}
                          onChange={(e) => setTrechos(trechos.map((t, j) => j === i ? { ...t, destino: e.target.value as Destino } : t))}
                          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal">
                          <option value="">Selecione...</option>
                          {getDestinosAgrupados().map((grupo) => (
                            <optgroup key={grupo.regiao} label={grupo.regiao}>
                              {grupo.destinos.map((d) => {
                                const r = REGRAS_DESTINO[d.destino];
                                return <option key={d.destino} value={d.destino}>{r?.bandeira} {r?.nome ?? d.destino}</option>;
                              })}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      {trechos.length > 1 && i < trechos.length - 1 && (
                        <button onClick={() => setTrechos(trechos.filter((_, j) => j !== i))}
                          className="mt-5 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                  {escala && trechos.length < 4 && (
                    <button onClick={() => setTrechos([...trechos.slice(0, -1), { destino: "", dataInput: "" }, trechos[trechos.length - 1]])}
                      className="flex items-center gap-2 text-sm text-teal font-medium hover:underline">
                      <Plus size={15} /> Adicionar parada intermediária
                    </button>
                  )}
                </div>
              </div>
            )}

            {passo === "quando" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy flex items-center gap-2"><CalendarDays size={20} className="text-teal" /> Data de embarque</h3>
                <div className="space-y-3">
                  {trechos.map((trecho, i) => {
                    const regras = trecho.destino ? REGRAS_DESTINO[trecho.destino as Destino] : null;
                    return (
                      <div key={i}>
                        <label className="text-xs font-medium text-navy/50 mb-1 block">
                          {trechos.length > 1 ? (i === 0 ? "Saída (primeiro trecho)" : `Trecho ${i + 1} — ${regras?.nome ?? trecho.destino}`) : "Data de embarque"}
                        </label>
                        <input type="date" value={trecho.dataInput}
                          min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                          onChange={(e) => setTrechos(trechos.map((t, j) => j === i ? { ...t, dataInput: e.target.value } : t))}
                          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {passo === "resultado" && roadmaps && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-navy">Prévia do Roadmap</h3>
                {roadmaps.map(({ pet, roadmap }) => {
                  const statusColor: Record<string, string> = {
                    APTO: "text-green-700 bg-green-50", PENDENTE: "text-yellow-700 bg-yellow-50",
                    URGENTE: "text-orange-700 bg-orange-50", CRITICO: "text-red-700 bg-red-50", INAPTO: "text-red-800 bg-red-100",
                  };
                  return (
                    <div key={pet.id} className="border border-border rounded-xl overflow-hidden">
                      <div className="bg-surface px-4 py-3 flex items-center justify-between">
                        <p className="font-semibold text-navy">{pet.nome}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[roadmap.statusGeral] ?? "bg-surface text-navy"}`}>
                          {roadmap.statusGeral}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        {roadmap.tarefas.slice(0, 4).map((t) => (
                          <div key={t.id} className="flex items-center gap-3 text-sm">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              t.status === "CONCLUIDA" ? "bg-green-500" : t.status === "PENDENTE" ? "bg-yellow-400" : t.status === "URGENTE" ? "bg-orange-500" : t.status === "CRITICO" ? "bg-red-500" : "bg-navy/20"
                            }`} />
                            <span className="flex-1 text-navy/70">{t.titulo}</span>
                            {t.prazo && <span className="text-xs text-navy/40 shrink-0">{t.prazo}</span>}
                          </div>
                        ))}
                        {roadmap.tarefas.length > 4 && (
                          <p className="text-xs text-navy/40 pl-5">+{roadmap.tarefas.length - 4} tarefas</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="bg-teal-light border border-teal/20 rounded-xl px-4 py-3 text-sm text-teal-darker">
                  💡 Salve o plano para ver o roadmap completo com prazos e custos estimados.
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 justify-end">
        <button onClick={voltar}
          className="px-5 py-2.5 rounded-lg border border-border text-navy/70 hover:bg-surface text-sm font-medium transition-colors">
          Voltar
        </button>
        {passo !== "resultado" ? (
          <button onClick={avancar} disabled={!podeAvancar()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-light disabled:opacity-40 transition-colors">
            Continuar <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={confirmar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal-dark transition-colors">
            <Check size={16} /> Salvar plano
          </button>
        )}
      </div>
    </div>
  );
}
