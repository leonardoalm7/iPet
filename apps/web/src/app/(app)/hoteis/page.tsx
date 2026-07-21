import { HOTEIS_PET } from "@ipet/core";
import { Hotel, Star } from "lucide-react";

export default function HoteisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <Hotel size={22} className="text-teal" /> Hotéis Pet-Friendly
        </h2>
        <p className="text-navy/50 text-sm mt-0.5">{HOTEIS_PET.length} acomodações verificadas pelo iPet</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HOTEIS_PET.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-teal-light to-surface p-5 flex items-center gap-3">
              <span className="text-4xl">{hotel.imagemEmoji}</span>
              <div className="min-w-0">
                <p className="font-semibold text-navy truncate">{hotel.nome}</p>
                <p className="text-sm text-navy/50">{hotel.cidade}{hotel.estado ? `, ${hotel.estado}` : ""}</p>
              </div>
              {hotel.verificado && (
                <span className="ml-auto shrink-0 text-xs bg-teal text-white px-2 py-0.5 rounded-full">✓ iPet</span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-surface text-navy/60 px-2 py-0.5 rounded-full capitalize">{hotel.tipo.replace(/_/g, " ").toLowerCase()}</span>
                {hotel.especiesAceitas.map((e) => (
                  <span key={e} className="text-xs bg-teal-light text-teal px-2 py-0.5 rounded-full">{e === "CAO" ? "🐕 Cão" : e === "GATO" ? "🐈 Gato" : "🐾"}</span>
                ))}
              </div>
              <p className="text-sm text-navy/60">{hotel.descricaoCurta}</p>
              <div className="flex items-center justify-between">
                {hotel.avaliacao && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-navy">
                    <Star size={14} className="text-ipet-orange fill-ipet-orange" /> {hotel.avaliacao.toFixed(1)}
                  </span>
                )}
                {hotel.precoApartir && (
                  <span className="text-sm font-semibold text-teal">{hotel.precoApartir}</span>
                )}
                {hotel.site && (
                  <a href={hotel.site} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-teal hover:underline">Ver site →</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
