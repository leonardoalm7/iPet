"use client";

import { useRouter } from "next/navigation";
import { HotelPet, TipoHotelPet } from "@/domain/types";
import { PETHOTELS, HOTEIS_PETFRIENDLY } from "@/data/hotels";
import { useState } from "react";
import { Star, MapPin, CheckCircle2 } from "lucide-react";

type Aba = "DEIXAR" | "VIAJAR";

const TIPO_LABEL: Record<TipoHotelPet, string> = {
  PETHOTEL: "Hotel Pet",
  PETHOTEL_DAY: "Day Care",
  PETHOTEL_VET: "Hotel Vet",
  PETFRIENDLY: "Pet-Friendly",
};

const TIPO_COLOR: Record<TipoHotelPet, string> = {
  PETHOTEL: "bg-purple-500/20 text-purple-300",
  PETHOTEL_DAY: "bg-blue-500/20 text-blue-300",
  PETHOTEL_VET: "bg-green-500/20 text-green-300",
  PETFRIENDLY: "bg-amber-500/20 text-amber-300",
};

export function HoteisPetSection() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("DEIXAR");
  const hoteis = aba === "DEIXAR" ? PETHOTELS : HOTEIS_PETFRIENDLY;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-200">
          Hospedagem para seu pet
        </h2>
        <button
          onClick={() => router.push("/hoteis")}
          className="text-xs text-sky-400 hover:text-sky-300"
        >
          Ver todos
        </button>
      </div>

      {/* Abas */}
      <div className="flex bg-gray-800 rounded-xl p-1 mb-4 gap-1">
        <button
          onClick={() => setAba("DEIXAR")}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
            aba === "DEIXAR"
              ? "bg-gray-700 text-white shadow"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          🏠 Deixar na origem
        </button>
        <button
          onClick={() => setAba("VIAJAR")}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
            aba === "VIAJAR"
              ? "bg-gray-700 text-white shadow"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          ✈️ Viajar junto
        </button>
      </div>

      {/* Cards */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-5 px-5">
        {hoteis.map((h) => (
          <HotelCard key={h.id} hotel={h} />
        ))}
        {/* CTA parceiro */}
        <div className="flex-shrink-0 w-44 bg-gray-800/50 rounded-2xl border border-dashed border-gray-600 flex flex-col items-center justify-center p-4 gap-2 min-h-[160px]">
          <span className="text-2xl">🤝</span>
          <p className="text-gray-500 text-[11px] text-center">
            É dono de pet hotel? Torne-se parceiro iPet
          </p>
          <button className="text-[10px] text-sky-400 border border-sky-700 rounded-full px-3 py-1">
            Saiba mais
          </button>
        </div>
      </div>
    </section>
  );
}

function HotelCard({ hotel: h }: { hotel: HotelPet }) {
  return (
    <div className="flex-shrink-0 w-52 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="h-16 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-3xl relative">
        {h.imagemEmoji}
        <span className="absolute top-2 right-2 text-base">{h.bandeira}</span>
        {h.verificado && (
          <span className="absolute top-2 left-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          </span>
        )}
      </div>

      <div className="p-3">
        {/* Tipo badge */}
        <span
          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${TIPO_COLOR[h.tipo]}`}
        >
          {TIPO_LABEL[h.tipo]}
        </span>

        <p className="text-white text-xs font-semibold mt-1.5 line-clamp-1">{h.nome}</p>

        {/* Localização */}
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-2.5 h-2.5 text-gray-500" />
          <p className="text-gray-400 text-[10px]">
            {h.cidade}{h.estado ? `, ${h.estado}` : ""} {h.bandeira}
          </p>
        </div>

        {/* Serviços (primeiros 2) */}
        <div className="mt-2 space-y-0.5">
          {h.servicos.slice(0, 2).map((s, i) => (
            <p key={i} className="text-gray-400 text-[10px] flex items-start gap-1">
              <span className="text-sky-500 mt-px">✓</span>
              <span className="line-clamp-1">{s}</span>
            </p>
          ))}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between mt-3">
          {h.precoApartir && (
            <p className="text-xs text-white font-medium">{h.precoApartir}</p>
          )}
          {h.avaliacao && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] text-gray-300">{h.avaliacao}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
