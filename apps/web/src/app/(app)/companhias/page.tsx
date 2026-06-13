"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@ipet/core";
import { COMPANHIAS_AEREAS } from "@ipet/core";
import { verificarTodasCompanhias, type VeredictoCia } from "@ipet/core/services/airline-checker";
import { Plane, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info } from "lucide-react";

const VEREDICTO_CONFIG: Record<VeredictoCia, { label: string; sub: string; cls: string; iconCls: string; Icon: React.ElementType }> = {
  PODE_CABINE: { label: "Cabine liberada", sub: "Pode viajar na cabine", cls: "border-emerald-200 bg-emerald-50/30", iconCls: "text-emerald-600", Icon: CheckCircle2 },
  PODE_PORAO: { label: "Porão liberado", sub: "Somente no porão", cls: "border-blue-200 bg-blue-50/30", iconCls: "text-blue-600", Icon: CheckCircle2 },
  RESTRICAO: { label: "Restrições", sub: "Veja as condições", cls: "border-orange-200 bg-orange-50/30", iconCls: "text-orange-500", Icon: AlertTriangle },
  NAO_ACEITO: { label: "Não aceito", sub: "Pet não pode embarcar", cls: "border-red-200 bg-red-50/30", iconCls: "text-red-500", Icon: XCircle },
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <Plane size={22} className="text-teal" /> Companhias Aéreas
        </h2>
        <p className="text-navy/50 text-sm mt-0.5">Verificação de regras por pet e companhia</p>
      </div>

      {/* Seletor de pet */}
      {pets.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-navy/60 mb-2">Verificar para qual pet?</p>
          <div className="flex flex-wrap gap-2">
            {pets.map((p) => (
              <button key={p.id} onClick={() => setPetId(p.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  petId === p.id ? "bg-navy text-white" : "bg-surface text-navy/60 hover:bg-navy/10"
                }`}>
                {p.nome} ({p.peso} kg)
              </button>
            ))}
          </div>
        </div>
      )}

      {!pet ? (
        <div className="bg-white rounded-xl border border-border py-12 text-center">
          <Plane size={36} className="text-navy/20 mx-auto mb-3" />
          <p className="text-navy/50 text-sm">Cadastre um pet para verificar as companhias aéreas.</p>
        </div>
      ) : resultados ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {resultados.map((r) => {
            const cfg = VEREDICTO_CONFIG[r.veredicto];
            const aberto = expandido === r.companhia.id;
            return (
              <div key={r.companhia.id}
                className={`bg-white rounded-xl border ${cfg.cls} overflow-hidden`}>
                <button
                  className="w-full flex items-center gap-4 p-4 text-left"
                  onClick={() => setExpandido(aberto ? null : r.companhia.id)}>
                  <cfg.Icon size={22} className={`shrink-0 ${cfg.iconCls}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy">{r.companhia.nome}</p>
                    <p className="text-xs text-navy/50">{cfg.sub}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.iconCls} bg-white/80`}>{r.companhia.codigo}</span>
                    {aberto ? <ChevronUp size={16} className="text-navy/40" /> : <ChevronDown size={16} className="text-navy/40" />}
                  </div>
                </button>
                {aberto && (
                  <div className="px-4 pb-4 border-t border-black/5 pt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <Stat label="Peso cabine" value={`${r.companhia.pesoMaxCabine} kg`} />
                      <Stat label="Peso porão" value={`${r.companhia.pesoMaxPorão} kg`} />
                      <Stat label="Braquicefálico cabine" value={r.companhia.braquicefalicoCabine ? "✓" : "✗"} />
                      <Stat label="Braquicefálico porão" value={r.companhia.braquicefalicoPorao ? "✓" : "✗"} />
                    </div>
                    {r.companhia.anotacoes && (
                      <div className="flex items-start gap-2 bg-surface rounded-lg px-3 py-2">
                        <Info size={13} className="text-navy/40 mt-0.5 shrink-0" />
                        <p className="text-xs text-navy/60">{r.companhia.anotacoes}</p>
                      </div>
                    )}
                    {r.motivos.length > 0 && (
                      <ul className="text-xs text-red-600 space-y-1">
                        {r.motivos.map((m, i) => <li key={i} className="flex items-start gap-1">• {m}</li>)}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg px-3 py-2">
      <p className="text-xs text-navy/40">{label}</p>
      <p className="text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
