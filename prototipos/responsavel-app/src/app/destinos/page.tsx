"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { SugestaoDestino, TipoViagem } from "@/domain/types";
import { SUGESTOES_DESTINO } from "@/data/travel-suggestions";
import { BottomNav } from "@/components/BottomNav";

const TIPO_LABEL: Record<TipoViagem, string> = {
  PRAIA: "🏖️ Praia",
  SERRA: "⛰️ Serra",
  CIDADE: "🏙️ Cidade",
  CAMPO: "🌾 Campo",
  AVENTURA: "🧗 Aventura",
  CULTURAL: "🎭 Cultural",
};

const TIPOS_VIAGEM: TipoViagem[] = ["PRAIA", "SERRA", "CIDADE", "CAMPO", "AVENTURA", "CULTURAL"];

export default function DestinosPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoViagem | null>(null);
  const [paisFiltro, setPaisFiltro] = useState<"TODOS" | "BRASIL" | "INTERNACIONAL">("TODOS");

  const sugestoes = SUGESTOES_DESTINO.filter((s) => {
    const matchBusca =
      busca === "" ||
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      s.pais.toLowerCase().includes(busca.toLowerCase());
    const matchPais =
      paisFiltro === "TODOS" ||
      (paisFiltro === "BRASIL" && s.pais === "Brasil") ||
      (paisFiltro === "INTERNACIONAL" && s.pais !== "Brasil");
    const matchTipo =
      tipoFiltro === null || s.tiposViagem.includes(tipoFiltro);
    return matchBusca && matchPais && matchTipo;
  });

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Destinos Pet-Friendly</h1>
            <p className="text-xs text-gray-400">{sugestoes.length} destinos disponíveis</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar destino..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 border border-gray-700 focus:outline-none focus:border-sky-600 placeholder-gray-500"
          />
        </div>

        {/* Filtro país */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {(["TODOS", "BRASIL", "INTERNACIONAL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPaisFiltro(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                paisFiltro === f
                  ? "bg-sky-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {f === "TODOS" ? "Todos" : f === "BRASIL" ? "🇧🇷 Brasil" : "✈️ Internacional"}
            </button>
          ))}
        </div>

        {/* Filtro tipo */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setTipoFiltro(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tipoFiltro === null
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Todos os tipos
          </button>
          {TIPOS_VIAGEM.map((t) => (
            <button
              key={t}
              onClick={() => setTipoFiltro(tipoFiltro === t ? null : t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tipoFiltro === t
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {TIPO_LABEL[t]}
            </button>
          ))}
        </div>
      </header>

      {/* Lista */}
      <main className="flex-1 px-5 space-y-3">
        {sugestoes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🌍</p>
            <p className="text-gray-400 text-sm">Nenhum destino encontrado</p>
          </div>
        ) : (
          sugestoes.map((s) => <DestinoCard key={s.id} sugestao={s} />)
        )}
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function DestinoCard({ sugestao: s }: { sugestao: SugestaoDestino }) {
  const router = useRouter();

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {/* Emoji */}
        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 relative">
          {s.imagemEmoji}
          <span className="absolute -bottom-1 -right-1 text-sm">{s.bandeira}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-white text-sm font-semibold">{s.nome}</p>
              <p className="text-gray-400 text-xs">{s.pais}</p>
            </div>
            {s.destacado && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-700/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                ⭐ TOP
              </span>
            )}
          </div>

          <p className="text-gray-300 text-xs mt-1.5 leading-relaxed line-clamp-2">
            {s.descricaoCurta}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {s.tiposViagem.map((t) => (
              <span
                key={t}
                className="text-[9px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full"
              >
                {TIPO_LABEL[t]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dicas */}
      <div className="px-4 pb-3 space-y-1">
        {s.dicas.slice(0, 2).map((d, i) => (
          <p key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
            <span className="text-sky-500 mt-0.5 flex-shrink-0">•</span>
            {d}
          </p>
        ))}
      </div>

      {/* Rodapé */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {s.melhorEpoca && (
          <p className="text-[10px] text-gray-500">
            🗓️ {s.melhorEpoca}
          </p>
        )}
        {s.destinoCompliance && (
          <button
            onClick={() => {/* TODO: navegar para viagem com destino pré-selecionado */}}
            className="text-[11px] text-sky-400 border border-sky-700/50 rounded-lg px-3 py-1.5 hover:bg-sky-900/20"
          >
            Ver documentação →
          </button>
        )}
      </div>
    </div>
  );
}
