"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@ipet/core";
import { COMPANHIAS_AEREAS } from "@ipet/core";
import {
  verificarTodasCompanhias,
  type VeredictoCia,
} from "@ipet/core/services/airline-checker";
import type { Pet } from "@ipet/core";
import {
  Plane,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Info,
  Check,
  X as XIcon,
  Dog,
  Cat,
  PawPrint,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function PetGlyph({ pet, className = "" }: { pet: Pet; className?: string }) {
  const Icon = pet.especie === "CAO" ? Dog : pet.especie === "GATO" ? Cat : PawPrint;
  return <Icon strokeWidth={1.5} className={className} />;
}

const VEREDICTO_CONFIG: Record<
  VeredictoCia,
  { label: string; sub: string; pillCls: string; iconCls: string; Icon: typeof CheckCircle2 }
> = {
  PODE_CABINE: {
    label: "Cabine liberada",
    sub: "Pode viajar na cabine",
    pillCls: "bg-sage-soft text-sage-deep",
    iconCls: "text-sage",
    Icon: CheckCircle2,
  },
  PODE_PORAO: {
    label: "Porão liberado",
    sub: "Somente no porão",
    pillCls: "bg-[#E8EEF2] text-[#3A5868]",
    iconCls: "text-[#4A6B7C]",
    Icon: CheckCircle2,
  },
  RESTRICAO: {
    label: "Restrições",
    sub: "Veja as condições",
    pillCls: "bg-terracotta-soft text-terracotta-deep",
    iconCls: "text-terracotta",
    Icon: AlertTriangle,
  },
  NAO_ACEITO: {
    label: "Não aceito",
    sub: "Pet não pode embarcar",
    pillCls: "bg-[#FBEBE8] text-[#8C3329]",
    iconCls: "text-status-crit",
    Icon: XCircle,
  },
};

export default function CompanhiasPage() {
  const pets = useAppStore((s) => s.pets);
  const [petId, setPetId] = useState<string>(pets[0]?.id ?? "");
  const [expandido, setExpandido] = useState<string | null>(null);

  const pet = pets.find((p) => p.id === petId);
  const resultados = useMemo(() => {
    if (!pet) return null;
    return verificarTodasCompanhias(pet, COMPANHIAS_AEREAS);
  }, [pet]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8 pb-8"
    >
      <header>
        <p className="kicker text-terracotta">Verificação de embarque</p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
          Companhias aéreas
        </h1>
        <p className="text-[13px] text-muted mt-2.5 max-w-xl">
          Regras por pet e companhia — peso máximo, braquicefálicos, restrições por raça.
        </p>
      </header>

      <div className="editorial-rule" />

      {/* Pet selector */}
      {pets.length > 0 && (
        <section>
          <p className="kicker text-muted mb-3">Verificar para qual pet</p>
          <div className="flex flex-wrap gap-2">
            {pets.map((p) => {
              const isActive = petId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPetId(p.id)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-ink text-bone"
                      : "bg-paper text-ink/70 border border-border hover:border-ink"
                  }`}
                >
                  <PetGlyph pet={p} className="w-3.5 h-3.5" />
                  {p.nome}
                  <span className="font-mono text-[10px] opacity-60">{p.peso}kg</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {!pet ? (
        <div className="border border-dashed border-border rounded-2xl py-16 text-center bg-paper">
          <Plane size={28} strokeWidth={1.25} className="text-faint mx-auto mb-3" />
          <p className="text-[14px] text-muted">
            Cadastre um pet para verificar as companhias aéreas.
          </p>
        </div>
      ) : resultados ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {resultados.map((r) => {
            const cfg = VEREDICTO_CONFIG[r.veredicto];
            const aberto = expandido === r.companhia.id;
            const Icon = cfg.Icon;
            return (
              <article
                key={r.companhia.id}
                className="bg-paper rounded-2xl border border-border overflow-hidden hover:border-ink/40 transition-colors"
              >
                <button
                  className="w-full flex items-center gap-4 p-5 text-left"
                  onClick={() => setExpandido(aberto ? null : r.companhia.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-bone-deep flex items-center justify-center shrink-0">
                    <Icon size={16} strokeWidth={1.5} className={cfg.iconCls} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-[17px] text-ink leading-tight tracking-tight">
                        {r.companhia.nome}
                      </p>
                      <span className="text-[10px] font-mono tracking-widest text-faint">
                        {r.companhia.codigo}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.pillCls}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-muted">{cfg.sub}</span>
                    </div>
                  </div>
                  <ChevronDown
                    size={15}
                    strokeWidth={1.5}
                    className={`text-muted shrink-0 transition-transform duration-300 ${
                      aberto ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {aberto && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <DataStat
                            label="Peso cabine"
                            value={`${r.companhia.pesoMaxCabine} kg`}
                          />
                          <DataStat
                            label="Peso porão"
                            value={`${r.companhia.pesoMaxPorao} kg`}
                          />
                          <DataStat
                            label="Braquicef. cabine"
                            value={r.companhia.braquicefalicoCabine}
                            bool
                          />
                          <DataStat
                            label="Braquicef. porão"
                            value={r.companhia.braquicefalicoPorao}
                            bool
                          />
                        </div>
                        {r.companhia.anotacoes && (
                          <div className="flex items-start gap-2 bg-bone-deep rounded-xl px-3 py-2.5">
                            <Info
                              size={12}
                              strokeWidth={1.5}
                              className="text-muted mt-0.5 shrink-0"
                            />
                            <p className="text-[12px] text-ink/75 leading-relaxed">
                              {r.companhia.anotacoes}
                            </p>
                          </div>
                        )}
                        {r.motivos.length > 0 && (
                          <ul className="space-y-1.5">
                            {r.motivos.map((m, i) => (
                              <li
                                key={i}
                                className="text-[12px] text-status-crit flex items-start gap-2"
                              >
                                <span className="font-mono text-faint shrink-0">→</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
}

function DataStat({
  label,
  value,
  bool,
}: {
  label: string;
  value: string | boolean;
  bool?: boolean;
}) {
  return (
    <div className="bg-bone-deep rounded-xl px-3 py-2.5">
      <p className="kicker text-muted text-[10px]">{label}</p>
      {bool ? (
        <p className="text-[13px] font-medium mt-1 flex items-center gap-1">
          {value ? (
            <>
              <Check size={13} strokeWidth={2} className="text-sage" /> Sim
            </>
          ) : (
            <>
              <XIcon size={13} strokeWidth={2} className="text-status-crit" /> Não
            </>
          )}
        </p>
      ) : (
        <p className="text-[14px] font-mono text-ink mt-1">{value}</p>
      )}
    </div>
  );
}
