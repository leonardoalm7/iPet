"use client";

import { useRouter } from "next/navigation";
import { SugestaoDestino, TipoViagem } from "@/domain/types";
import { SUGESTOES_DESTINO } from "@/data/travel-suggestions";
import { useState } from "react";

const TIPO_LABEL: Record<TipoViagem, string> = {
  PRAIA: "🏖️ Praia",
  SERRA: "⛰️ Serra",
  CIDADE: "🏙️ Cidade",
  CAMPO: "🌾 Campo",
  AVENTURA: "🧗 Aventura",
  CULTURAL: "🎭 Cultural",
};

const FILTROS: { label: string; value: "TODOS" | "BRASIL" | "INTERNACIONAL" }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "🇧🇷 Brasil", value: "BRASIL" },
  { label: "✈️ Internacional", value: "INTERNACIONAL" },
];

export function SugestoesDestinos() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<"TODOS" | "BRASIL" | "INTERNACIONAL">("TODOS");

  const sugestoes =
    filtro === "BRASIL"
      ? SUGESTOES_DESTINO.filter((s) => s.pais === "Brasil")
      : filtro === "INTERNACIONAL"
      ? SUGESTOES_DESTINO.filter((s) => s.pais !== "Brasil")
      : SUGESTOES_DESTINO;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-navy">
          Destinos pet-friendly
        </h2>
        <button
          onClick={() => router.push("/destinos")}
          className="text-xs text-teal hover:text-teal"
        >
          Ver todos
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filtro === f.value
                ? "bg-teal text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards horizontais */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-5 px-5">
        {sugestoes.map((s) => (
          <DestinoCard key={s.id} sugestao={s} />
        ))}
      </div>
    </section>
  );
}

function DestinoCard({ sugestao: s }: { sugestao: SugestaoDestino }) {
  return (
    <div className="flex-shrink-0 w-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200/50 hover:border-teal/30 transition-colors">
      {/* Imagem / emoji cover */}
      <div className="h-20 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl relative">
        {s.imagemEmoji}
        <span className="absolute top-2 right-2 text-lg">{s.bandeira}</span>
        {s.destacado && (
          <span className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            TOP
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-navy text-xs font-semibold leading-tight line-clamp-1">{s.nome}</p>
        <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2 leading-tight">
          {s.descricaoCurta}
        </p>

        {/* Tags de tipo */}
        <div className="flex flex-wrap gap-1 mt-2">
          {s.tiposViagem.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full"
            >
              {TIPO_LABEL[t]}
            </span>
          ))}
        </div>

        {/* Link para compliance */}
        {s.destinoCompliance && (
          <p className="text-[10px] text-teal mt-2">Ver documentação →</p>
        )}
      </div>
    </div>
  );
}
