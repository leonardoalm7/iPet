"use client";

import { useState } from "react";
import { CLINICAS_CREDENCIADAS } from "@ipet/core";
import { ClinicasMap } from "@/components/shared/ClinicasMap";
import { MapPin, List, Map, Phone, Navigation } from "lucide-react";

type View = "mapa" | "lista";

export default function ClinicasPage() {
  const [view, setView] = useState<View>("lista");
  const [busca, setBusca] = useState("");

  const filtradas = CLINICAS_CREDENCIADAS.filter((c) =>
    busca === "" ||
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cidade.toLowerCase().includes(busca.toLowerCase()) ||
    c.estado?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <MapPin size={22} className="text-teal" /> Clínicas Parceiras
          </h2>
          <p className="text-navy/50 text-sm mt-0.5">{CLINICAS_CREDENCIADAS.length} clínicas credenciadas pelo iPet</p>
        </div>
        <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
          <button onClick={() => setView("lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "lista" ? "bg-white shadow-sm text-navy" : "text-navy/50"}`}>
            <List size={13} /> Lista
          </button>
          <button onClick={() => setView("mapa")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "mapa" ? "bg-white shadow-sm text-navy" : "text-navy/50"}`}>
            <Map size={13} /> Mapa
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
        <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cidade ou nome..."
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
      </div>

      {view === "mapa" ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden h-[500px]">
          <ClinicasMap clinicas={filtradas} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.length === 0 && (
            <div className="col-span-full py-12 text-center text-navy/40 text-sm">Nenhuma clínica encontrada.</div>
          )}
          {filtradas.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-border p-4 space-y-3">
              <div>
                <p className="font-semibold text-navy">{c.nome}</p>
                <p className="text-sm text-navy/50">{c.cidade}{c.estado ? `, ${c.estado}` : ""}</p>
              </div>
              {c.especialidades && (
                <div className="flex flex-wrap gap-1">
                  {c.especialidades.slice(0, 3).map((e) => (
                    <span key={e} className="text-xs bg-teal-light text-teal px-2 py-0.5 rounded-full">{e}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {c.telefone && (
                  <a href={`tel:${c.telefone}`}
                    className="flex items-center gap-1.5 text-xs text-navy/60 bg-surface px-3 py-1.5 rounded-lg hover:bg-navy/10 transition-colors">
                    <Phone size={12} /> Ligar
                  </a>
                )}
                {c.endereco && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(c.nome + " " + c.cidade)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-teal bg-teal-light px-3 py-1.5 rounded-lg hover:bg-teal/20 transition-colors">
                    <Navigation size={12} /> Ver no mapa
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
