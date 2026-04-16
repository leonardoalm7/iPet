"use client";

import { useAppStore } from "@/store/app-store";
import { BottomNav } from "@/components/BottomNav";
import { Plane, PlusCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { REGRAS_DESTINO } from "@/data/destinations";

export default function ViagensPage() {
  const { planosViagem, pets } = useAppStore();

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Plane className="w-6 h-6 text-sky-400" />
          <h1 className="text-2xl font-bold text-white">Viagens</h1>
        </div>
        <p className="text-gray-400 text-sm">Seus planos de viagem com pets</p>
      </header>

      <main className="flex-1 px-5 space-y-3">
        {planosViagem.length === 0 ? (
          <div className="text-center py-16">
            <Plane className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma viagem planejada.</p>
            {pets.length > 0 && (
              <Link href={`/viagem/${pets[0].id}`} className="text-sky-400 text-sm mt-2 inline-block">
                Planejar viagem
              </Link>
            )}
          </div>
        ) : (
          planosViagem.map((plano) => {
            const pet = pets.find((p) => p.id === plano.petId);
            const destino = REGRAS_DESTINO[plano.destino];
            return (
              <Link
                key={plano.id}
                href={`/viagem/${plano.petId}`}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {destino.bandeira}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{destino.nome}</p>
                  <p className="text-xs text-gray-400">
                    {pet?.nome.split(" ")[0]} · Embarque: {plano.dataEmbarque}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Link>
            );
          })
        )}
      </main>

      <BottomNav active="viagens" />
    </div>
  );
}
