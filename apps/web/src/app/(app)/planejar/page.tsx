"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, calcularRoadmap, calcularRoadmapMultiLeg } from "@ipet/core";
import { REGRAS_DESTINO, getDestinosAgrupados } from "@ipet/core";
import type { Destino, Pet } from "@ipet/core";
import { addDays, format, parse } from "date-fns";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Dog,
  Cat,
  PawPrint,
  Search,
  MapPin,
  CalendarDays,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function formatBR(d: Date) { return format(d, "dd/MM/yyyy"); }
function fromInput(s: string) { return parse(s, "yyyy-MM-dd", new Date()); }

type Passo = "pet" | "destino" | "quando" | "resultado";

const PASSOS: { id: Passo; label: string; sub: string }[] = [
  { id: "pet", label: "Pet", sub: "Quem voa" },
  { id: "destino", label: "Destino", sub: "Para onde" },
  { id: "quando", label: "Quando", sub: "Data de embarque" },
  { id: "resultado", label: "Roadmap", sub: "Prévia" },
];

const STATUS_PALETTE: Record<string, { dot: string; pill: string; label: string }> = {
  APTO:     { dot: "bg-status-ok",   pill: "bg-sage-soft text-sage-deep",          label: "Apto" },
  PENDENTE: { dot: "bg-status-warn", pill: "bg-terracotta-soft text-terracotta-deep", label: "Pendente" },
  URGENTE:  { dot: "bg-status-warn", pill: "bg-terracotta-soft text-terracotta-deep", label: "Urgente" },
  CRITICO:  { dot: "bg-status-crit", pill: "bg-[#FBEBE8] text-[#8C3329]",          label: "Crítico" },
  INAPTO:   { dot: "bg-status-crit", pill: "bg-[#FBEBE8] text-[#8C3329]",          label: "Inapto" },
};

function PetGlyph({ pet, className = "" }: { pet: Pet; className?: string }) {
  const Icon = pet.especie === "CAO" ? Dog : pet.especie === "GATO" ? Cat : PawPrint;
  return <Icon strokeWidth={1.5} className={className} />;
}

export default function PlanejarPage() {
  const router = useRouter();
  const { pets, criarPlanoViagem } = useAppStore();
  const [passo, setPasso] = useState<Passo>("pet");
  const [petIds, setPetIds] = useState<string[]>([]);
  const [trechos, setTrechos] = useState<{ destino: Destino | ""; dataInput: string }[]>([
    { destino: "", dataInput: "" },
  ]);
  const [escala, setEscala] = useState(false);

  const petsSelecionados = petIds
    .map((id) => pets.find((p) => p.id === id))
    .filter(Boolean) as Pet[];
  const destinoFinal = trechos[trechos.length - 1]?.destino as Destino | "";

  const roadmaps = useMemo(() => {
    if (passo !== "resultado" || petsSelecionados.length === 0 || !destinoFinal || !trechos[0].dataInput)
      return null;
    const trechosValidos = trechos
      .filter((t) => t.destino && t.dataInput)
      .map((t) => ({
        destino: t.destino as Destino,
        dataEmbarque: formatBR(fromInput(t.dataInput)),
      }));

    return petsSelecionados.map((pet) => ({
      pet,
      roadmap:
        trechosValidos.length > 1
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
      .map((t) => ({
        destino: t.destino as Destino,
        dataEmbarque: formatBR(fromInput(t.dataInput)),
      }));
    const plano = criarPlanoViagem({
      destino: trechosValidos[trechosValidos.length - 1].destino,
      dataEmbarque: trechosValidos[0].dataEmbarque,
      trechos: trechosValidos,
      petIds,
    });
    router.push(`/viagens/${plano.id}`);
  }

  const passoIdx = PASSOS.findIndex((p) => p.id === passo);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* ────────── Editorial header ────────── */}
      <div className="flex items-start justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={voltar}
            className="w-10 h-10 rounded-full border border-border hover:border-ink hover:bg-paper transition-colors flex items-center justify-center text-ink/60 hover:text-ink focus-ring"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <div>
            <p className="kicker text-terracotta">Novo plano de viagem</p>
            <h1 className="font-display text-3xl sm:text-4xl text-ink leading-none tracking-tight mt-1.5">
              Planejar{" "}
              <em className="font-display-soft italic text-sage">viagem</em>
            </h1>
          </div>
        </div>
      </div>

      {/* ────────── Editorial stepper ────────── */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10 pb-8 border-b border-border">
        {PASSOS.map((p, i) => {
          const done = i < passoIdx;
          const active = i === passoIdx;
          return (
            <div key={p.id} className="relative">
              <div
                className={`text-[10px] font-mono tracking-widest mb-2 transition-colors ${
                  active ? "text-ink" : done ? "text-sage" : "text-faint"
                }`}
              >
                {String(i + 1).padStart(2, "0")} —{" "}
                {done ? <Check size={11} strokeWidth={2} className="inline -mt-0.5" /> : null}
              </div>
              <div
                className={`text-sm font-medium transition-colors ${
                  active ? "text-ink" : done ? "text-ink/70" : "text-faint"
                }`}
              >
                {p.label}
              </div>
              <div className="text-[11px] text-muted hidden sm:block mt-0.5">{p.sub}</div>
              <div className="absolute top-0 left-0 right-0 -mt-px h-px overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-[var(--ease-editorial)] ${
                    done ? "w-full bg-sage" : active ? "w-1/2 bg-ink" : "w-0 bg-transparent"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ────────── Steps ────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={passo}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {passo === "pet" && (
            <PetStep
              pets={pets}
              petIds={petIds}
              onToggle={(id) =>
                setPetIds(petIds.includes(id) ? petIds.filter((x) => x !== id) : [...petIds, id])
              }
            />
          )}

          {passo === "destino" && (
            <DestinoStep
              trechos={trechos}
              setTrechos={setTrechos}
              escala={escala}
              setEscala={setEscala}
            />
          )}

          {passo === "quando" && (
            <QuandoStep trechos={trechos} setTrechos={setTrechos} />
          )}

          {passo === "resultado" && roadmaps && (
            <ResultadoStep roadmaps={roadmaps} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ────────── Navigation ────────── */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
        <button
          onClick={voltar}
          className="text-sm text-muted hover:text-ink transition-colors flex items-center gap-2 link-underline"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Voltar
        </button>

        {passo !== "resultado" ? (
          <button
            onClick={avancar}
            disabled={!podeAvancar()}
            className="group bg-ink text-bone px-6 py-3.5 rounded-full text-[13px] font-medium tracking-tight transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-sage enabled:active:scale-[0.98] flex items-center gap-2.5"
          >
            Continuar
            <ArrowRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform duration-500 ease-[var(--ease-editorial)] group-enabled:group-hover:translate-x-1"
            />
          </button>
        ) : (
          <button
            onClick={confirmar}
            className="group bg-sage text-bone px-6 py-3.5 rounded-full text-[13px] font-medium tracking-tight hover:bg-sage-deep transition-all active:scale-[0.98] flex items-center gap-2.5"
          >
            <Check size={14} strokeWidth={2} /> Salvar plano
          </button>
        )}
      </div>
    </div>
  );
}

// ────────── STEP: PET ──────────
function PetStep({
  pets,
  petIds,
  onToggle,
}: {
  pets: Pet[];
  petIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <section>
      <header className="mb-7">
        <p className="kicker text-muted">Quem voa</p>
        <h2 className="font-display text-2xl text-ink mt-2 tracking-tight">
          Selecione o pet (ou pets).
        </h2>
        <p className="text-sm text-muted mt-1.5">
          Você pode levar mais de um — cada um terá seu próprio roadmap.
        </p>
      </header>

      {pets.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-paper">
          <PawPrint
            size={28}
            strokeWidth={1.25}
            className="text-faint mx-auto mb-4"
          />
          <p className="text-sm text-muted mb-5">Nenhum pet cadastrado ainda.</p>
          <Link
            href="/pets/novo"
            className="inline-flex items-center gap-2 bg-ink text-bone text-[13px] px-5 py-2.5 rounded-full hover:bg-sage transition-colors"
          >
            <Plus size={14} strokeWidth={1.75} /> Cadastrar pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pets.map((pet) => {
            const sel = petIds.includes(pet.id);
            return (
              <button
                key={pet.id}
                onClick={() => onToggle(pet.id)}
                className={`group relative text-left p-5 rounded-2xl border bg-paper transition-all overflow-hidden ${
                  sel
                    ? "border-ink shadow-[var(--shadow-lift)]"
                    : "border-border hover:border-ink/40 hover:shadow-[var(--shadow-soft)]"
                }`}
              >
                {sel && (
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-sage" />
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      sel ? "bg-ink text-bone" : "bg-bone-deep text-ink/70"
                    }`}
                  >
                    <PetGlyph pet={pet} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg text-ink leading-tight">
                      {pet.nome}
                    </p>
                    <p className="text-[12px] text-muted mt-1">
                      {pet.raca} · {pet.peso} kg
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      sel ? "bg-sage border-sage" : "border-border"
                    }`}
                  >
                    {sel && <Check size={11} strokeWidth={2.5} className="text-bone" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ────────── STEP: DESTINO ──────────
function DestinoStep({
  trechos,
  setTrechos,
  escala,
  setEscala,
}: {
  trechos: { destino: Destino | ""; dataInput: string }[];
  setTrechos: (t: { destino: Destino | ""; dataInput: string }[]) => void;
  escala: boolean;
  setEscala: (b: boolean) => void;
}) {
  return (
    <section>
      <header className="mb-7 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker text-muted">Para onde</p>
          <h2 className="font-display text-2xl text-ink mt-2 tracking-tight">
            Escolha o destino.
          </h2>
          <p className="text-sm text-muted mt-1.5">
            Cada país tem regras próprias de vacina, sorologia e prazo.
          </p>
        </div>
        <button
          onClick={() => setEscala(!escala)}
          className="text-[12px] text-ink/70 hover:text-ink link-underline flex items-center gap-1.5"
        >
          {escala ? (
            <>
              <X size={12} strokeWidth={1.75} /> Remover escala
            </>
          ) : (
            <>
              <Plus size={12} strokeWidth={1.75} /> Adicionar escala
            </>
          )}
        </button>
      </header>

      <div className="space-y-4">
        {trechos.map((trecho, i) => {
          const label =
            trechos.length === 1
              ? "Destino"
              : i === 0
              ? "Escala 1"
              : i === trechos.length - 1
              ? "Destino final"
              : `Escala ${i + 1}`;
          return (
            <div key={i} className="flex items-start gap-2">
              <DestinoCombobox
                label={label}
                index={i + 1}
                value={trecho.destino}
                onChange={(d) =>
                  setTrechos(
                    trechos.map((t, j) => (j === i ? { ...t, destino: d } : t))
                  )
                }
              />
              {trechos.length > 1 && i < trechos.length - 1 && (
                <button
                  onClick={() => setTrechos(trechos.filter((_, j) => j !== i))}
                  className="mt-9 p-2 text-status-crit/80 hover:bg-[#FBEBE8] rounded-full transition-colors"
                  aria-label="Remover escala"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              )}
            </div>
          );
        })}
        {escala && trechos.length < 4 && (
          <button
            onClick={() =>
              setTrechos([
                ...trechos.slice(0, -1),
                { destino: "", dataInput: "" },
                trechos[trechos.length - 1],
              ])
            }
            className="text-[12px] text-sage hover:text-sage-deep link-underline flex items-center gap-1.5"
          >
            <Plus size={12} strokeWidth={1.75} /> Adicionar parada intermediária
          </button>
        )}
      </div>
    </section>
  );
}

function DestinoCombobox({
  label,
  index,
  value,
  onChange,
}: {
  label: string;
  index: number;
  value: Destino | "";
  onChange: (d: Destino | "") => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const grupos = useMemo(() => {
    const todos = getDestinosAgrupados();
    if (!query.trim()) return todos;
    const q = query.toLowerCase();
    return todos
      .map((g) => ({
        ...g,
        destinos: g.destinos.filter((d) => {
          const r = REGRAS_DESTINO[d.destino];
          return (
            r?.nome.toLowerCase().includes(q) || d.destino.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((g) => g.destinos.length > 0);
  }, [query]);

  const selected = value ? REGRAS_DESTINO[value] : null;

  return (
    <div ref={ref} className="relative flex-1">
      <label className="kicker text-muted block mb-2">
        <span className="font-mono text-[10px] tracking-widest mr-2 text-faint">
          {String(index).padStart(2, "0")}
        </span>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-paper border rounded-2xl px-5 py-4 text-left transition-colors focus-ring ${
          open ? "border-ink" : "border-border hover:border-ink/40"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selected ? (
            <>
              <span className="text-xl shrink-0" aria-hidden>
                {selected.bandeira}
              </span>
              <span className="font-display text-lg text-ink truncate">
                {selected.nome}
              </span>
            </>
          ) : (
            <>
              <MapPin size={18} strokeWidth={1.5} className="text-faint shrink-0" />
              <span className="text-muted text-[15px]">Pesquise ou selecione…</span>
            </>
          )}
        </div>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`text-muted shrink-0 ml-3 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-30 left-0 right-0 mt-2 bg-paper border border-border rounded-2xl shadow-[var(--shadow-deep)] overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Search size={14} strokeWidth={1.5} className="text-faint" />
              <input
                autoFocus
                placeholder="Buscar país…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 text-[14px] text-ink placeholder:text-faint focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-faint hover:text-ink"
                >
                  <X size={12} strokeWidth={1.75} />
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {grupos.length === 0 && (
                <p className="text-[13px] text-muted py-8 text-center">
                  Nenhum destino encontrado.
                </p>
              )}
              {grupos.map((g) => (
                <div key={g.regiao}>
                  <p className="kicker text-faint px-4 pt-3 pb-1.5">{g.regiao}</p>
                  {g.destinos.map((d) => {
                    const r = REGRAS_DESTINO[d.destino];
                    if (!r) return null;
                    const isSelected = value === d.destino;
                    return (
                      <button
                        key={d.destino}
                        onClick={() => {
                          onChange(d.destino);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSelected ? "bg-sage-soft" : "hover:bg-bone-deep"
                        }`}
                      >
                        <span className="text-lg" aria-hidden>{r.bandeira}</span>
                        <span className="text-[14px] text-ink flex-1">{r.nome}</span>
                        {isSelected && (
                          <Check size={13} strokeWidth={2} className="text-sage" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────── STEP: QUANDO ──────────
function QuandoStep({
  trechos,
  setTrechos,
}: {
  trechos: { destino: Destino | ""; dataInput: string }[];
  setTrechos: (t: { destino: Destino | ""; dataInput: string }[]) => void;
}) {
  return (
    <section>
      <header className="mb-7">
        <p className="kicker text-muted">Data de embarque</p>
        <h2 className="font-display text-2xl text-ink mt-2 tracking-tight">
          Quando vocês viajam?
        </h2>
        <p className="text-sm text-muted mt-1.5">
          A partir dessa data calculamos prazos de vacina, sorologia e exames.
        </p>
      </header>

      <div className="space-y-4">
        {trechos.map((trecho, i) => {
          const regras = trecho.destino ? REGRAS_DESTINO[trecho.destino] : null;
          return (
            <div
              key={i}
              className="bg-paper border border-border rounded-2xl p-5"
            >
              <label className="kicker text-muted block mb-3">
                <span className="font-mono text-[10px] tracking-widest mr-2 text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {trechos.length > 1
                  ? i === 0
                    ? "Saída — primeiro trecho"
                    : `Trecho ${i + 1}`
                  : "Embarque"}
              </label>
              {regras && (
                <div className="flex items-center gap-2 mb-4 text-[13px] text-ink/70">
                  <span aria-hidden className="text-base">{regras.bandeira}</span>
                  <span className="font-display italic">{regras.nome}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <CalendarDays size={16} strokeWidth={1.5} className="text-faint" />
                <input
                  type="date"
                  value={trecho.dataInput}
                  min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                  onChange={(e) =>
                    setTrechos(
                      trechos.map((t, j) =>
                        j === i ? { ...t, dataInput: e.target.value } : t
                      )
                    )
                  }
                  className="flex-1 bg-transparent border-0 border-b border-border focus:border-ink py-2 text-[16px] text-ink focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ────────── STEP: RESULTADO ──────────
function ResultadoStep({
  roadmaps,
}: {
  roadmaps: { pet: Pet; roadmap: any }[];
}) {
  return (
    <section>
      <header className="mb-7">
        <p className="kicker text-terracotta">Prévia do roadmap</p>
        <h2 className="font-display text-2xl text-ink mt-2 tracking-tight">
          O caminho até o embarque.
        </h2>
        <p className="text-sm text-muted mt-1.5">
          Salve o plano para ver tarefas com prazos, custos estimados e alertas.
        </p>
      </header>

      <div className="space-y-5">
        {roadmaps.map(({ pet, roadmap }) => {
          const status =
            STATUS_PALETTE[roadmap.statusGeral] ?? STATUS_PALETTE.PENDENTE;
          return (
            <article
              key={pet.id}
              className="bg-paper border border-border rounded-2xl overflow-hidden"
            >
              <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-bone-deep flex items-center justify-center">
                    <PetGlyph pet={pet} className="w-4 h-4 text-ink/70" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-ink leading-tight">
                      {pet.nome}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {pet.raca}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full ${status.pill}`}
                >
                  {status.label}
                </span>
              </header>
              <ol className="relative p-6 space-y-3">
                <span
                  aria-hidden
                  className="absolute left-[28px] top-7 bottom-7 w-px bg-border"
                />
                {roadmap.tarefas.slice(0, 5).map((t: any) => {
                  const dot =
                    STATUS_PALETTE[t.status]?.dot ?? "bg-ink/20";
                  return (
                    <li
                      key={t.id}
                      className="relative flex items-start gap-4 pl-1"
                    >
                      <span
                        className={`relative z-10 mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ring-4 ring-paper ${dot}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-ink/85 leading-snug">
                          {t.titulo}
                        </p>
                        {t.prazo && (
                          <p className="text-[11px] text-muted mt-0.5 font-mono">
                            {t.prazo}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
                {roadmap.tarefas.length > 5 && (
                  <li className="text-[11px] text-faint pl-9 italic">
                    + {roadmap.tarefas.length - 5} outras tarefas
                  </li>
                )}
              </ol>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 bg-sage-soft border border-sage/15 rounded-2xl px-5 py-4">
        <Sparkles
          size={16}
          strokeWidth={1.5}
          className="text-sage-deep shrink-0 mt-0.5"
        />
        <p className="text-[13px] text-sage-deep leading-relaxed">
          Salve o plano para acompanhar o passo-a-passo com prazos exatos,
          custos estimados e alertas automáticos por destino.
        </p>
      </div>
    </section>
  );
}
