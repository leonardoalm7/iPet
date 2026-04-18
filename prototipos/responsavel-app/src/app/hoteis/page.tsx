"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star, MapPin, CheckCircle2, Search } from "lucide-react";
import { HotelPet, TipoHotelPet } from "@/domain/types";
import { HOTEIS_PET } from "@/data/hotels";
import { BottomNav } from "@/components/BottomNav";

type Aba = "DEIXAR" | "VIAJAR";

const TIPO_LABEL: Record<TipoHotelPet, string> = {
  PETHOTEL: "Hotel Pet",
  PETHOTEL_DAY: "Day Care",
  PETHOTEL_VET: "Hotel + Vet",
  PETFRIENDLY: "Pet-Friendly",
};

const TIPO_COLOR: Record<TipoHotelPet, string> = {
  PETHOTEL: "bg-purple-600 text-white",
  PETHOTEL_DAY: "bg-blue-600 text-white",
  PETHOTEL_VET: "bg-green-600 text-white",
  PETFRIENDLY: "bg-amber-500 text-white",
};

const TIPO_ICON: Record<TipoHotelPet, string> = {
  PETHOTEL: "🏨",
  PETHOTEL_DAY: "🎾",
  PETHOTEL_VET: "🏥",
  PETFRIENDLY: "🌍",
};

export default function HoteisPage() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("DEIXAR");
  const [busca, setBusca] = useState("");

  const hoteisFiltrados = HOTEIS_PET.filter((h) => {
    const isAba =
      aba === "DEIXAR"
        ? h.tipo !== "PETFRIENDLY"
        : h.tipo === "PETFRIENDLY";
    const matchBusca =
      busca === "" ||
      h.nome.toLowerCase().includes(busca.toLowerCase()) ||
      h.cidade.toLowerCase().includes(busca.toLowerCase());
    return isAba && matchBusca;
  });

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-navy">Hospedagem para Pets</h1>
            <p className="text-xs text-gray-500">
              {aba === "DEIXAR" ? "Pet hotels e day care" : "Hotéis que aceitam seu pet"}
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-4">
          <button
            onClick={() => setAba("DEIXAR")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              aba === "DEIXAR" ? "bg-white text-navy" : "text-gray-500"
            }`}
          >
            🏠 Deixar na origem
          </button>
          <button
            onClick={() => setAba("VIAJAR")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              aba === "VIAJAR" ? "bg-white text-navy" : "text-gray-500"
            }`}
          >
            ✈️ Viajar junto
          </button>
        </div>

        {/* Descrição da aba */}
        <div className="bg-gray-100/50 rounded-xl p-3 mb-4 border border-gray-200/30">
          {aba === "DEIXAR" ? (
            <p className="text-xs text-gray-600">
              <span className="text-navy font-medium">Vai viajar sem o seu pet?</span>{" "}
              Encontre pet hotels, creches e hospedagens com acompanhamento veterinário para
              deixá-lo confortável e seguro enquanto você viaja.
            </p>
          ) : (
            <p className="text-xs text-gray-600">
              <span className="text-navy font-medium">Vai viajar com seu pet?</span>{" "}
              Aqui estão hotéis, pousadas e hospedagens que recebem animais de estimação com
              carinho — no Brasil e no mundo.
            </p>
          )}
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-gray-100 text-navy text-sm rounded-xl pl-9 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-teal placeholder-gray-500"
          />
        </div>
      </header>

      {/* Lista */}
      <main className="flex-1 px-5 space-y-3">
        {hoteisFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-gray-500 text-sm">Nenhum resultado encontrado</p>
          </div>
        ) : (
          hoteisFiltrados.map((h) => <HotelCard key={h.id} hotel={h} />)
        )}

        {/* CTA parceiro */}
        <div className="bg-gray-100/50 rounded-2xl border border-dashed border-gray-600 p-5 text-center mt-4">
          <p className="text-2xl mb-2">🤝</p>
          <p className="text-navy text-sm font-semibold mb-1">Torne-se parceiro iPet</p>
          <p className="text-gray-500 text-xs mb-3">
            É dono de pet hotel, pousada ou hospedagem pet-friendly? Cadastre seu negócio e
            apareça para milhares de tutores.
          </p>
          <button className="bg-teal-darker hover:bg-teal text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Quero ser parceiro
          </button>
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function HotelCard({ hotel: h }: { hotel: HotelPet }) {
  return (
    <div className="bg-gray-100 rounded-2xl border border-gray-200/50 overflow-hidden">
      {/* Topo */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {h.imagemEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-navy text-sm font-semibold leading-tight">{h.nome}</p>
            {h.verificado && (
              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${TIPO_COLOR[h.tipo]}`}>
              {TIPO_ICON[h.tipo]} {TIPO_LABEL[h.tipo]}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <p className="text-gray-500 text-xs">
              {h.cidade}{h.estado ? `, ${h.estado}` : ""} {h.bandeira}
            </p>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="px-4 pb-3">
        <p className="text-gray-600 text-xs leading-relaxed">{h.descricaoCurta}</p>
      </div>

      {/* Serviços */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {h.servicos.slice(0, 4).map((s, i) => (
          <span key={i} className="text-[10px] bg-gray-200 text-gray-500 px-2 py-1 rounded-lg flex items-center gap-1">
            <span className="text-teal">✓</span> {s}
          </span>
        ))}
        {h.servicos.length > 4 && (
          <span className="text-[10px] text-gray-400 px-2 py-1">
            +{h.servicos.length - 4} serviços
          </span>
        )}
      </div>

      {/* Espécies aceitas */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <p className="text-[10px] text-gray-400">Aceita:</p>
        {h.especiesAceitas.includes("CAO") && <span className="text-base">🐕</span>}
        {h.especiesAceitas.includes("GATO") && <span className="text-base">🐈</span>}
        {h.especiesAceitas.includes("OUTRO") && <span className="text-base">🐾</span>}
        {h.pesoMaxKg && (
          <span className="text-[10px] text-gray-400 ml-auto">até {h.pesoMaxKg}kg</span>
        )}
      </div>

      {/* Rodapé */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div>
          {h.precoApartir && (
            <p className="text-navy text-sm font-bold">{h.precoApartir}</p>
          )}
          {h.avaliacao && (
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(h.avaliacao!) ? "text-amber-600 fill-amber-400" : "text-gray-400"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">{h.avaliacao}</span>
            </div>
          )}
        </div>
        <button className="bg-teal-darker hover:bg-teal text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
