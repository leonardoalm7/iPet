"use client";

import { useState } from "react";
import { CLINICAS_CREDENCIADAS } from "@ipet/core";
import { ClinicasMap } from "@/components/shared/ClinicasMap";
import { MapPin, List, Map, Phone, Navigation, Search, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

type View = "mapa" | "lista";

export default function ClinicasPage() {
  const [view, setView] = useState<View>("lista");
  const [busca, setBusca] = useState("");

  const filtradas = CLINICAS_CREDENCIADAS.filter(
    (c) =>
      busca === "" ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.cidade.toLowerCase().includes(busca.toLowerCase()) ||
      c.estado?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8 pb-8"
    >
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker text-terracotta">Rede credenciada</p>
          <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
            Clínicas parceiras
          </h1>
          <p className="text-[13px] text-muted mt-2.5">
            {CLINICAS_CREDENCIADAS.length} unidades credenciadas pelo iPet, com vets habilitados para emissão de documentos.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-bone-deep rounded-full p-1">
          <button
            onClick={() => setView("lista")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
              view === "lista" ? "bg-paper text-ink shadow-[var(--shadow-hairline)]" : "text-muted hover:text-ink"
            }`}
          >
            <List size={13} strokeWidth={1.5} /> Lista
          </button>
          <button
            onClick={() => setView("mapa")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
              view === "mapa" ? "bg-paper text-ink shadow-[var(--shadow-hairline)]" : "text-muted hover:text-ink"
            }`}
          >
            <Map size={13} strokeWidth={1.5} /> Mapa
          </button>
        </div>
      </header>

      <div className="editorial-rule" />

      <div className="relative">
        <Search
          size={15}
          strokeWidth={1.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
        />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cidade, estado ou nome…"
          className="w-full pl-11 pr-4 py-3.5 bg-paper border border-border rounded-2xl text-[14px] text-ink placeholder:text-faint focus:outline-none focus:border-ink transition-colors focus-ring"
        />
      </div>

      {view === "mapa" ? (
        <div className="bg-paper rounded-2xl border border-border overflow-hidden h-[560px]">
          <ClinicasMap clinicas={filtradas} userLat={null} userLng={null} />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl py-16 text-center bg-paper">
          <Stethoscope size={26} strokeWidth={1.25} className="text-faint mx-auto mb-3" />
          <p className="text-[14px] text-muted">Nenhuma clínica encontrada para "{busca}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((c) => (
            <article
              key={c.id}
              className="group bg-paper rounded-2xl border border-border p-6 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
                  <Stethoscope size={16} strokeWidth={1.5} className="text-sage-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[17px] text-ink leading-tight tracking-tight">
                    {c.nome}
                  </p>
                  <p className="text-[11px] text-muted mt-1 flex items-center gap-1.5">
                    <MapPin size={10} strokeWidth={1.5} />
                    {c.cidade}{c.estado ? `, ${c.estado}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {c.telefone && (
                  <a
                    href={`tel:${c.telefone}`}
                    className="flex items-center gap-1.5 text-[11px] text-ink/70 hover:text-ink bg-bone-deep hover:bg-ink hover:text-bone px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Phone size={11} strokeWidth={1.75} /> Ligar
                  </a>
                )}
                {c.endereco && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(c.nome + " " + c.cidade)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-sage-deep bg-sage-soft hover:bg-sage hover:text-bone px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Navigation size={11} strokeWidth={1.75} /> No mapa
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
