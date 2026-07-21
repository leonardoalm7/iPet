"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check, AlertTriangle, Ban, ChevronDown, X } from "lucide-react";
import type { Especie } from "@ipet/core";
import {
  RACAS_CATALOGADAS,
  RACA_SRD,
  RACA_OUTRO,
  buscarRacas,
  resolverRaca,
  type RacaCatalogada,
} from "@ipet/core/data/racas";

interface Props {
  valor: string;
  onChange: (raca: string) => void;
  especie: Especie;
  label?: string;
  required?: boolean;
}

export function RacaCombobox({ valor, onChange, especie, label = "Raça", required }: Props) {
  const [aberto, setAberto] = useState(false);
  const [query, setQuery] = useState("");
  const [modoOutro, setModoOutro] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve o valor atual contra o catálogo (match exato ou alias)
  const valorResolvido = useMemo(() => resolverRaca(valor, especie), [valor, especie]);
  const valorCustom = valor && !valorResolvido && valor !== RACA_SRD;

  // Sincroniza: se trocar a espécie, e a raça atual for de outra espécie, limpa
  useEffect(() => {
    if (valorResolvido && especie !== "OUTRO" && valorResolvido.especie !== especie) {
      onChange("");
      setModoOutro(false);
    }
  }, [especie, valorResolvido, onChange]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [aberto]);

  const resultados = useMemo(() => buscarRacas(query, especie), [query, especie]);

  // Lista final exibida: resultados + SRD + Outro
  const itens: Array<RacaCatalogada | "SRD" | "OUTRO"> = useMemo(() => {
    const base: Array<RacaCatalogada | "SRD" | "OUTRO"> = [...resultados];
    base.push("SRD");
    base.push("OUTRO");
    return base;
  }, [resultados]);

  useEffect(() => {
    setHighlight(0);
  }, [query, aberto]);

  function abrir() {
    setAberto(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function selecionarRaca(r: RacaCatalogada) {
    onChange(r.nome);
    setAberto(false);
    setModoOutro(false);
    setQuery("");
  }

  function selecionarSRD() {
    onChange(RACA_SRD);
    setAberto(false);
    setModoOutro(false);
    setQuery("");
  }

  function ativarModoOutro() {
    setModoOutro(true);
    setAberto(false);
    if (resolverRaca(valor, especie)) onChange("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!aberto) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, itens.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = itens[highlight];
      if (item === "SRD") selecionarSRD();
      else if (item === "OUTRO") ativarModoOutro();
      else if (item) selecionarRaca(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setAberto(false);
    }
  }

  const labelClasses = "block text-sm font-medium text-gray-500 mb-1.5";
  const baseFieldClasses =
    "w-full bg-surface border text-navy rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors";
  const borderClasses = valorCustom
    ? "border-amber-300 focus:ring-amber-300/30 focus:border-amber-400"
    : "border-border focus:ring-navy/20 focus:border-navy";

  // ─── Modo Outro: input livre ──────────────────────────────
  if (modoOutro) {
    return (
      <div ref={rootRef}>
        <label className={labelClasses}>
          {label} {required && "*"}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite a raça"
            className={`${baseFieldClasses} ${borderClasses} pr-10`}
          />
          <button
            type="button"
            onClick={() => {
              setModoOutro(false);
              if (!resolverRaca(valor, especie)) onChange("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Voltar para lista"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {valorCustom && (
          <p className="mt-1.5 text-xs text-amber-600 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Raça personalizada — compliance pode não detectar restrições automáticas.</span>
          </p>
        )}
      </div>
    );
  }

  // ─── Modo fechado: trigger ────────────────────────────────
  if (!aberto) {
    return (
      <div ref={rootRef}>
        <label className={labelClasses}>
          {label} {required && "*"}
        </label>
        <button
          type="button"
          onClick={abrir}
          className={`${baseFieldClasses} ${borderClasses} flex items-center justify-between text-left`}
        >
          <span className={valor ? "text-navy" : "text-gray-400"}>
            {valor || "Selecione a raça"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        </button>

        {valorResolvido && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {valorResolvido.braquicefalico && <BadgeBraquicefalico />}
            {valorResolvido.perigosa && <BadgePerigosa />}
          </div>
        )}
        {valorCustom && (
          <p className="mt-1.5 text-xs text-amber-600 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Raça personalizada — compliance pode não detectar restrições.</span>
          </p>
        )}
      </div>
    );
  }

  // ─── Modo aberto: search + lista ──────────────────────────
  return (
    <div ref={rootRef}>
      <label className={labelClasses}>
        {label} {required && "*"}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Buscar raça..."
          className={`${baseFieldClasses} ${borderClasses} pl-10 pr-10`}
        />
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border bg-white shadow-sm">
        {resultados.length === 0 && (
          <div className="px-4 py-3 text-xs text-gray-400">
            Nenhuma raça encontrada. Use &quot;Outro&quot; para digitar manualmente.
          </div>
        )}
        {resultados.map((r, idx) => {
          const ativo = idx === highlight;
          const selecionado = valorResolvido?.nome === r.nome;
          return (
            <button
              key={r.nome}
              type="button"
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => selecionarRaca(r)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-3 ${
                ativo ? "bg-navy/5" : ""
              } ${selecionado ? "text-navy font-medium" : "text-gray-700"}`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate">{r.nome}</span>
                {selecionado && <Check className="w-3.5 h-3.5 text-navy flex-shrink-0" />}
              </span>
              <span className="flex gap-1 flex-shrink-0">
                {r.braquicefalico && <BadgeBraquicefalico compact />}
                {r.perigosa && <BadgePerigosa compact />}
              </span>
            </button>
          );
        })}
        {/* Separador + escape hatches */}
        <div className="border-t border-border">
          <button
            type="button"
            onMouseEnter={() => setHighlight(resultados.length)}
            onClick={selecionarSRD}
            className={`w-full px-4 py-2.5 text-left text-sm text-gray-600 ${
              highlight === resultados.length ? "bg-navy/5" : ""
            }`}
          >
            {RACA_SRD}
          </button>
          <button
            type="button"
            onMouseEnter={() => setHighlight(resultados.length + 1)}
            onClick={ativarModoOutro}
            className={`w-full px-4 py-2.5 text-left text-sm text-gray-600 ${
              highlight === resultados.length + 1 ? "bg-navy/5" : ""
            }`}
          >
            {RACA_OUTRO}... <span className="text-xs text-gray-400">(digitar manualmente)</span>
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-gray-400">
        {RACAS_CATALOGADAS.length} raças catalogadas
      </p>
    </div>
  );
}

function BadgeBraquicefalico({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200"
      title="Raça braquicefálica — restrições de transporte aéreo"
    >
      <AlertTriangle className="w-3 h-3" />
      {!compact && "Braquicefálico"}
    </span>
  );
}

function BadgePerigosa({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-medium border border-rose-200"
      title="Raça classificada como perigosa em alguns destinos"
    >
      <Ban className="w-3 h-3" />
      {!compact && "Perigosa"}
    </span>
  );
}
