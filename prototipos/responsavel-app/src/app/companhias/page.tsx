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

export default function CompanhiasPage() {
  const { pets, planosViagem } = useAppStore();
  const [petSelecionadoId, setPetSelecionadoId] = useState<string>(
    pets[0]?.id ?? ""
  );
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const pet = pets.find((p) => p.id === petSelecionadoId);

  const resultados = useMemo(() => {
    if (!pet) return [];
    return verificarTodasCompanhias(pet, COMPANHIAS_AEREAS);
  }, [pet]);

  const resumo = useMemo(() => {
    const cabine = resultados.filter((r) => r.veredicto === "PODE_CABINE").length;
    const porao = resultados.filter(
      (r) => r.veredicto === "PODE_PORAO" || r.veredicto === "RESTRICAO"
    ).length;
    const nao = resultados.filter((r) => r.veredicto === "NAO_ACEITO").length;
    return { cabine, porao, nao };
  }, [resultados]);

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
          Quais companhias aceitam seu pet?
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

            {/* Lista de companhias */}
            <div className="space-y-2">
              {resultados.map((resultado, i) => (
                <CiaCard
                  key={resultado.companhia.id}
                  resultado={resultado}
                  index={i}
                  expandido={expandidoId === resultado.companhia.id}
                  onToggle={() =>
                    setExpandidoId(
                      expandidoId === resultado.companhia.id
                        ? null
                        : resultado.companhia.id
                    )
                  }
                  pet={pet}
                />
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
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 font-medium">
                    Braquicefálicos:
                  </span>
                  {cia.racasBraquisefálicasPermitidas ? (
                    <span className="text-emerald-600 font-medium">
                      ✅ Aceitos
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">
                      ❌ Não aceitos
                    </span>
                  )}
                </div>

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
