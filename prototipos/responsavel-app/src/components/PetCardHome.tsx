"use client";

import Link from "next/link";
import { Pet } from "@/domain/types";
import { ChevronRight, Shield, AlertTriangle } from "lucide-react";

interface Props {
  pet: Pet;
}

export function PetCardHome({ pet }: Props) {
  const temVacina = !!pet.vacina?.valida;
  const temSorologia = pet.sorologia?.status === "OK";
  const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);

  const status = temVacina && temMicrochip ? "ok" : "pendente";

  return (
    <Link
      href={`/passaporte/${pet.id}`}
      className="flex items-center gap-4 bg-white border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform"
    >
      <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-border">
        {pet.foto ? (
          <img src={pet.foto} alt={pet.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-navy truncate">{pet.nome}</span>
          {status === "ok" ? (
            <Shield className="w-4 h-4 text-teal flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-ipet-orange flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">
          {pet.raca} · {pet.peso}kg
        </p>
        <div className="flex gap-2 mt-2">
          <Badge ok={temVacina} label="Vacina" />
          <Badge ok={temSorologia} label="Sorologia" />
          <Badge ok={temMicrochip} label="Chip" />
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </Link>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
        ok
          ? "bg-teal text-white"
          : "bg-surface text-gray-400 border border-border"
      }`}
    >
      {label}
    </span>
  );
}
