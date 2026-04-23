"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { COMPANHIAS_AEREAS } from "@/data/airlines";
import {
  verificarTodasCompanhias,
  VeredictoCia,
  ResultadoVerificacao,
} from "@/services/airline-checker";
import { BottomNav } from "@/components/BottomNav";
import { track } from "@/services/analytics";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Info,
  Armchair,
  Package,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const VEREDICTO_CONFIG: Record<
  VeredictoCia,
  {
    label: string;
    sublabel: string;
    icon: React.ElementType;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    cardBorder: string;
    cardBg: string;
  }
> = {
  PODE_CABINE: {
    label: "Pode embarcar",
    sublabel: "Cabine",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-600",
    badgeText: "text-white",
    cardBorder: "border-emerald-200",
    cardBg: "bg-emerald-50/50",
  },
  PODE_PORAO: {
    label: "Pode embarcar",
    sublabel: "Porão",
    icon: CheckCircle2,
    iconColor: "text-teal",
    badgeBg: "bg-teal",
    badgeText: "text-white",
    cardBorder: "border-teal/30",
    cardBg: "bg-teal/5",
  },
  RESTRICAO: {
    label: "Com restrições",
    sublabel: "Porão",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-500",
    badgeText: "text-white",
    cardBorder: "border-amber-200",
    cardBg: "bg-amber-50/50",
  },
  NAO_ACEITO: {
    label: "Não aceito",
    sublabel: "",
    icon: XCircle,
    iconColor: "text-red-500",
    badgeBg: "bg-red-500",
    badgeText: "text-white",
    cardBorder: "border-red-200",
    cardBg: "bg-red-50/50",
  },
};

type ModoView = "lista" | "comparar";

export default function CompanhiasPage() {
  const { pets, planosViagem } = useAppStore();
  const [petSelecionadoId, setPetSelecionadoId] = useState<string>(
    pets[0]?.id ?? ""
  );
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [modo, setModo] = useState<ModoView>("lista");
  const [comparando, setComparando] = useState<Set<string>>(new Set());
  const [filtroVeredicto, setFiltroVeredicto] = useState<VeredictoCia | "TODOS">("TODOS");

  const pet = pets.find((p) => p.id === petSelecionadoId);

  const resultados = useMemo(() => {
    if (!pet) return [];
    return verificarTodasCompanhias(pet, COMPANHIAS_AEREAS);
  }, [pet]);

  const resultadosFiltrados = useMemo(() => {
    if (filtroVeredicto === "TODOS") return resultados;
    return resultados.filter((r) => r.veredicto === filtroVeredicto);
  }, [resultados, filtroVeredicto]);

  const resumo = useMemo(() => {
    const cabine = resultados.filter((r) => r.veredicto === "PODE_CABINE").length;
    const porao = resultados.filter(
      (r) => r.veredicto === "PODE_PORAO" || r.veredicto === "RESTRICAO"
    ).length;
    const nao = resultados.filter((r) => r.veredicto === "NAO_ACEITO").length;
    return { cabine, porao, nao };
  }, [resultados]);

  const selecionadosParaComparar = useMemo(
    () => resultados.filter((r) => comparando.has(r.companhia.id)),
    [resultados, comparando]
  );

  function toggleComparar(id: string) {
    setComparando((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-teal text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Início
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Plane className="w-6 h-6 text-teal" />
          <h1 className="text-2xl font-bold text-navy">Companhias Aéreas</h1>
        </div>
        <p className="text-gray-500 text-sm">
          {COMPANHIAS_AEREAS.length} companhias mapeadas
        </p>
      </header>

      <main className="flex-1 px-5 space-y-4">
        {/* Seletor de pet */}
        {pets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPetSelecionadoId(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  p.id === petSelecionadoId
                    ? "bg-teal text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <span>
                  {p.especie === "CAO" ? "🐕" : p.especie === "GATO" ? "🐈" : "🐾"}
                </span>
                {p.nome.split(" ")[0]}
              </button>
            ))}
          </div>
        )}

        {!pet ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Nenhum pet cadastrado.</p>
            <Link href="/pets/novo" className="text-teal text-sm mt-2 inline-block">
              Cadastrar pet
            </Link>
          </div>
        ) : (
          <>
            {/* Card do pet */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                  {pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-navy">{pet.nome}</p>
                  <p className="text-xs text-gray-500">
                    {pet.raca} · {pet.peso}kg
                  </p>
                </div>
              </div>

              {/* Resumo rápido */}
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <ResumoChip
                  count={resumo.cabine}
                  label="Cabine"
                  color="bg-emerald-600"
                />
                <ResumoChip
                  count={resumo.porao}
                  label="Porão"
                  color="bg-teal"
                />
                <ResumoChip
                  count={resumo.nao}
                  label="Não aceito"
                  color="bg-red-500"
                />
              </div>
            </div>

            {/* Toggle Lista / Comparar + Filtros */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-xl p-0.5 flex-shrink-0">
                <button
                  onClick={() => setModo("lista")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    modo === "lista" ? "bg-white text-navy shadow-sm" : "text-gray-500"
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setModo("comparar")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    modo === "comparar" ? "bg-white text-navy shadow-sm" : "text-gray-500"
                  }`}
                >
                  Comparar
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                {(["TODOS", "PODE_CABINE", "PODE_PORAO", "NAO_ACEITO"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroVeredicto(f)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                      filtroVeredicto === f
                        ? "bg-teal text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {f === "TODOS" ? "Todas" : f === "PODE_CABINE" ? "Cabine" : f === "PODE_PORAO" ? "Porão" : "Recusadas"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cão-guia banner */}
            {pet.tipoPet === "CAO_GUIA" && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Cão-guia — embarque garantido
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Lei 11.126/2005: embarque obrigatório em cabine, gratuito, sem
                    caixa e sem limite de peso. A companhia não pode recusar.
                  </p>
                </div>
              </div>
            )}

            {/* Modo comparação: tabela side-by-side */}
            {modo === "comparar" && (
              <>
                {comparando.size === 0 && (
                  <div className="bg-teal/5 border border-teal/20 rounded-2xl p-4 text-center">
                    <p className="text-sm text-teal font-medium">Selecione até 4 companhias para comparar</p>
                    <p className="text-xs text-gray-400 mt-1">Toque nas companhias abaixo</p>
                  </div>
                )}

                {selecionadosParaComparar.length >= 2 && (
                  <ComparacaoTable resultados={selecionadosParaComparar} pet={pet} />
                )}
              </>
            )}

            {/* Lista de companhias */}
            <div className="space-y-2">
              {resultadosFiltrados.map((resultado, i) => (
                <div key={resultado.companhia.id} className="relative">
                  {modo === "comparar" && (
                    <button
                      onClick={() => toggleComparar(resultado.companhia.id)}
                      className={`absolute -left-1 top-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        comparando.has(resultado.companhia.id)
                          ? "bg-teal border-teal text-white"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {comparando.has(resultado.companhia.id) && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <div className={modo === "comparar" ? "ml-7" : ""}>
                    <CiaCard
                      resultado={resultado}
                      index={i}
                      expandido={expandidoId === resultado.companhia.id}
                      onToggle={() => {
                        if (modo === "comparar") {
                          toggleComparar(resultado.companhia.id);
                          return;
                        }
                        const isExpanding = expandidoId !== resultado.companhia.id;
                        setExpandidoId(isExpanding ? resultado.companhia.id : null);
                        if (isExpanding) {
                          track("companhia_verificada", {
                            companhiaId: resultado.companhia.id,
                            veredicto: resultado.veredicto,
                          });
                        }
                      }}
                      pet={pet}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 bg-teal/5 border border-teal/20 rounded-2xl p-3.5">
              <Info className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Dados baseados nas regras oficiais de cada companhia. Sempre
                confirme diretamente com a cia aérea no momento da reserva —
                regras podem variar por rota e aeronave.
              </p>
            </div>

            {/* ESA info */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700">
                  Animal de suporte emocional (ESA)
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  No Brasil, animais de suporte emocional são tratados como pets
                  comuns para fins de transporte aéreo (STJ, 2023). Apenas
                  cães-guia têm direito legal a embarque especial.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav active="viagens" />
    </div>
  );
}

function ResumoChip({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-5 h-5 rounded-full ${color} text-white text-[10px] font-bold flex items-center justify-center`}
      >
        {count}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function CiaCard({
  resultado,
  index,
  expandido,
  onToggle,
  pet,
}: {
  resultado: ResultadoVerificacao;
  index: number;
  expandido: boolean;
  onToggle: () => void;
  pet: { peso: number };
}) {
  const cfg = VEREDICTO_CONFIG[resultado.veredicto];
  const Icon = cfg.icon;
  const cia = resultado.companhia;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div
        className={`bg-white border ${cfg.cardBorder} rounded-2xl overflow-hidden`}
      >
        {/* Header clicável */}
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full p-4 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-navy flex-shrink-0">
            {cia.codigo}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-navy">{cia.nome}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}
              >
                {cfg.label}
              </span>
              {cfg.sublabel && (
                <span className="text-[10px] text-gray-400">{cfg.sublabel}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
            {expandido ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* Detalhes */}
        <AnimatePresence>
          {expandido && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {/* Grid de specs */}
                <div className="grid grid-cols-2 gap-2">
                  <SpecItem
                    icon={<Armchair className="w-3.5 h-3.5" />}
                    label="Cabine"
                    value={
                      cia.pesoMaxCabine > 0
                        ? `Até ${cia.pesoMaxCabine}kg`
                        : "Não aceita"
                    }
                    ok={resultado.cabine}
                    petPeso={pet.peso}
                    limite={cia.pesoMaxCabine}
                  />
                  <SpecItem
                    icon={<Package className="w-3.5 h-3.5" />}
                    label="Porão"
                    value={
                      cia.pesoMaxPorао > 0
                        ? `Até ${cia.pesoMaxPorао}kg`
                        : "Não aceita"
                    }
                    ok={resultado.porao}
                    petPeso={pet.peso}
                    limite={cia.pesoMaxPorао}
                  />
                </div>

                {/* Dimensões */}
                {cia.pesoMaxCabine > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">
                      Caixa cabine:
                    </span>{" "}
                    {cia.dimensoesMaxCabine.comprimento}×
                    {cia.dimensoesMaxCabine.largura}×
                    {cia.dimensoesMaxCabine.altura}cm
                  </div>
                )}

                {/* Braquicefálico */}
                <div className="text-xs space-y-1">
                  <span className="text-gray-600 font-medium">
                    Braquicefálicos:
                  </span>
                  <div className="flex items-center gap-3 ml-1">
                    <span className={cia.braquicefalicoCabine ? "text-emerald-600" : "text-red-500"}>
                      {cia.braquicefalicoCabine ? "✅" : "❌"} Cabine
                    </span>
                    {cia.pesoMaxPorао > 0 && (
                      <span className={cia.braquicefalicoPorao ? "text-emerald-600" : "text-red-500"}>
                        {cia.braquicefalicoPorao ? "✅" : "❌"} Porão
                      </span>
                    )}
                  </div>
                </div>

                {/* Raças perigosas */}
                {cia.racasPerigosasBanidas && (
                  <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                    🚫 Raças perigosas banidas (Pit Bull, Rottweiler, Fila, etc.)
                  </div>
                )}

                {/* Idade mínima */}
                {cia.idadeMinimaAnimal > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">
                      Idade mínima:
                    </span>{" "}
                    {cia.idadeMinimaAnimal} semanas
                  </div>
                )}

                {/* Motivos de restrição */}
                {resultado.motivos.length > 0 && (
                  <div className="space-y-1">
                    {resultado.motivos.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2"
                      >
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Alertas */}
                {resultado.alertas.length > 0 && (
                  <div className="space-y-1">
                    {resultado.alertas.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SpecItem({
  icon,
  label,
  value,
  ok,
  petPeso,
  limite,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok: boolean;
  petPeso: number;
  limite: number;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border ${
        ok
          ? "bg-emerald-50 border-emerald-200"
          : limite > 0
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div
        className={`${ok ? "text-emerald-600" : limite > 0 ? "text-red-500" : "text-gray-400"}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500">{label}</p>
        <p
          className={`text-xs font-semibold ${
            ok ? "text-emerald-700" : limite > 0 ? "text-red-600" : "text-gray-400"
          }`}
        >
          {value}
        </p>
        {limite > 0 && (
          <p className="text-[9px] text-gray-400">
            Seu pet: {petPeso}kg
          </p>
        )}
      </div>
    </div>
  );
}

// ── Tabela de comparação side-by-side ───────────────────────

function ComparacaoTable({
  resultados,
  pet,
}: {
  resultados: ResultadoVerificacao[];
  pet: { peso: number; raca: string };
}) {
  const rows: {
    label: string;
    render: (r: ResultadoVerificacao) => React.ReactNode;
  }[] = [
    {
      label: "Veredicto",
      render: (r) => {
        const cfg = VEREDICTO_CONFIG[r.veredicto];
        return (
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      label: "Cabine",
      render: (r) => (
        <span className={r.cabine ? "text-emerald-600 font-medium" : "text-red-500"}>
          {r.companhia.pesoMaxCabine > 0
            ? `${r.cabine ? "OK" : "Não"} — ${r.companhia.pesoMaxCabine}kg`
            : "Não aceita"}
        </span>
      ),
    },
    {
      label: "Porão",
      render: (r) => (
        <span className={r.porao ? "text-emerald-600 font-medium" : "text-red-500"}>
          {r.companhia.pesoMaxPorао > 0
            ? `${r.porao ? "OK" : "Não"} — ${r.companhia.pesoMaxPorао}kg`
            : "Não aceita"}
        </span>
      ),
    },
    {
      label: "Caixa cabine",
      render: (r) => {
        const d = r.companhia.dimensoesMaxCabine;
        return d.comprimento > 0
          ? <span>{d.comprimento}x{d.largura}x{d.altura}cm</span>
          : <span className="text-gray-400">—</span>;
      },
    },
    {
      label: "Braquicef. cabine",
      render: (r) => (
        <span className={r.companhia.braquicefalicoCabine ? "text-emerald-600" : "text-red-500"}>
          {r.companhia.braquicefalicoCabine ? "Aceita" : "Bane"}
        </span>
      ),
    },
    {
      label: "Braquicef. porão",
      render: (r) => (
        <span className={r.companhia.braquicefalicoPorao ? "text-emerald-600" : "text-red-500"}>
          {r.companhia.braquicefalicoPorao ? "Aceita" : "Bane"}
        </span>
      ),
    },
    {
      label: "Raças perigosas",
      render: (r) => (
        <span className={r.companhia.racasPerigosasBanidas ? "text-red-500" : "text-emerald-600"}>
          {r.companhia.racasPerigosasBanidas ? "Banidas" : "Aceita"}
        </span>
      ),
    },
    {
      label: "Idade mínima",
      render: (r) => <span>{r.companhia.idadeMinimaAnimal} sem.</span>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 text-gray-400 font-medium sticky left-0 bg-white min-w-[100px]">
                {pet.peso}kg · {pet.raca}
              </th>
              {resultados.map((r) => {
                const cfg = VEREDICTO_CONFIG[r.veredicto];
                return (
                  <th
                    key={r.companhia.id}
                    className={`text-center py-3 px-3 min-w-[100px] ${cfg.cardBg}`}
                  >
                    <div className="font-bold text-navy text-sm">{r.companhia.codigo}</div>
                    <div className="text-[10px] text-gray-500 font-normal truncate max-w-[90px]">
                      {r.companhia.nome}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}
              >
                <td className="py-2.5 px-3 text-gray-500 font-medium sticky left-0 bg-inherit">
                  {row.label}
                </td>
                {resultados.map((r) => (
                  <td key={r.companhia.id} className="py-2.5 px-3 text-center">
                    {row.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
