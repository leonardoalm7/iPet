"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SUGESTOES_DESTINO } from "@ipet/core";
import type { SugestaoDestino, TipoViagem } from "@ipet/core";
import {
  Search,
  Globe2,
  ArrowRight,
  Star,
  Calendar,
  Waves,
  Mountain,
  Building2,
  Trees,
  Tent,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const TIPO_META: Record<TipoViagem, { label: string; Icon: typeof Waves }> = {
  PRAIA: { label: "Praia", Icon: Waves },
  SERRA: { label: "Serra", Icon: Mountain },
  CIDADE: { label: "Cidade", Icon: Building2 },
  CAMPO: { label: "Campo", Icon: Trees },
  AVENTURA: { label: "Aventura", Icon: Tent },
  CULTURAL: { label: "Cultural", Icon: Sparkles },
};

const TIPOS_VIAGEM: TipoViagem[] = [
  "PRAIA",
  "SERRA",
  "CIDADE",
  "CAMPO",
  "AVENTURA",
  "CULTURAL",
];

export default function DestinosPage() {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoViagem | null>(null);
  const [paisFiltro, setPaisFiltro] =
    useState<"TODOS" | "BRASIL" | "INTERNACIONAL">("TODOS");

  const sugestoes = SUGESTOES_DESTINO.filter((s) => {
    const matchBusca =
      busca === "" ||
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      s.pais.toLowerCase().includes(busca.toLowerCase());
    const matchPais =
      paisFiltro === "TODOS" ||
      (paisFiltro === "BRASIL" && s.pais === "Brasil") ||
      (paisFiltro === "INTERNACIONAL" && s.pais !== "Brasil");
    const matchTipo = tipoFiltro === null || s.tiposViagem.includes(tipoFiltro);
    return matchBusca && matchPais && matchTipo;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8 pb-8"
    >
      <header>
        <p className="kicker text-terracotta">Curadoria iPet</p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
          Destinos pet-friendly
        </h1>
        <p className="text-[13px] text-muted mt-2.5 max-w-xl">
          {SUGESTOES_DESTINO.length} cidades selecionadas com infraestrutura
          comprovada para viagens com animais.
        </p>
      </header>

      <div className="editorial-rule" />

      <section className="space-y-5">
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
            placeholder="Buscar destino ou país…"
            className="w-full pl-11 pr-4 py-3.5 bg-paper border border-border rounded-2xl text-[14px] text-ink placeholder:text-faint focus:outline-none focus:border-ink transition-colors focus-ring"
          />
        </div>

        <div>
          <p className="kicker text-muted mb-3">Região</p>
          <div className="flex flex-wrap gap-2">
            {(["TODOS", "BRASIL", "INTERNACIONAL"] as const).map((f) => {
              const isActive = paisFiltro === f;
              const label =
                f === "TODOS"
                  ? "Todos"
                  : f === "BRASIL"
                  ? "Brasil"
                  : "Internacional";
              return (
                <button
                  key={f}
                  onClick={() => setPaisFiltro(f)}
                  className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
                    isActive
                      ? "bg-ink text-bone"
                      : "bg-paper text-ink/70 border border-border hover:border-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="kicker text-muted mb-3">Tipo de viagem</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTipoFiltro(null)}
              className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
                tipoFiltro === null
                  ? "bg-ink text-bone"
                  : "bg-paper text-ink/70 border border-border hover:border-ink"
              }`}
            >
              Todos os tipos
            </button>
            {TIPOS_VIAGEM.map((t) => {
              const { label, Icon } = TIPO_META[t];
              const isActive = tipoFiltro === t;
              return (
                <button
                  key={t}
                  onClick={() => setTipoFiltro(isActive ? null : t)}
                  className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-ink text-bone"
                      : "bg-paper text-ink/70 border border-border hover:border-ink"
                  }`}
                >
                  <Icon size={12} strokeWidth={1.5} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {sugestoes.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl py-16 text-center bg-paper">
          <Globe2
            size={28}
            strokeWidth={1.25}
            className="text-faint mx-auto mb-3"
          />
          <p className="text-[14px] text-muted">
            Nenhum destino encontrado para os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sugestoes.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <DestinoCard s={s} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function DestinoCard({ s }: { s: SugestaoDestino }) {
  const router = useRouter();
  const tiposVisiveis = s.tiposViagem.slice(0, 3);
  return (
    <article className="group bg-paper rounded-2xl border border-border overflow-hidden flex flex-col hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all">
      <div className="relative px-5 pt-5 pb-4">
        {s.destacado && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-terracotta-deep bg-terracotta-soft px-2 py-0.5 rounded-full">
            <Star size={9} strokeWidth={1.75} /> Top
          </span>
        )}
        <p className="text-[11px] font-mono text-faint tracking-widest uppercase flex items-center gap-1.5">
          <span className="text-base leading-none">{s.bandeira}</span>
          {s.pais}
        </p>
        <p className="font-display text-[19px] text-ink leading-tight tracking-tight mt-1.5">
          {s.nome}
        </p>
        <p className="text-[12px] text-muted mt-2 leading-relaxed line-clamp-2">
          {s.descricaoCurta}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tiposVisiveis.map((t) => {
            const { label, Icon } = TIPO_META[t];
            return (
              <span
                key={t}
                className="text-[10px] bg-bone-deep text-ink/65 px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <Icon size={10} strokeWidth={1.5} />
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {s.dicas && s.dicas.length > 0 && (
        <div className="px-5 pb-3 border-t border-border pt-3 space-y-1.5">
          {s.dicas.slice(0, 2).map((d, i) => (
            <p
              key={i}
              className="text-[11px] text-ink/55 flex items-start gap-2 leading-relaxed"
            >
              <span className="font-mono text-faint shrink-0">—</span>
              {d}
            </p>
          ))}
        </div>
      )}

      <div className="px-5 pb-5 pt-3 mt-auto border-t border-border flex items-center justify-between gap-2">
        {s.melhorEpoca && (
          <p className="text-[10px] text-muted flex items-center gap-1.5 truncate font-mono">
            <Calendar size={10} strokeWidth={1.5} />
            {s.melhorEpoca}
          </p>
        )}
        {s.destinoCompliance ? (
          <Link
            href={`/regras/${s.destinoCompliance.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink hover:text-sage transition-colors shrink-0"
          >
            Ver regras
            <ArrowRight
              size={12}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ) : (
          <button
            onClick={() => router.push("/planejar")}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink hover:text-sage transition-colors shrink-0"
          >
            Planejar
            <ArrowRight
              size={12}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        )}
      </div>
    </article>
  );
}
