"use client";

import Link from "next/link";
import { useAppStore } from "@ipet/core";
import { Plane, Plus, Calendar, ChevronRight } from "lucide-react";
import { format, parse, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ViagensPage() {
  const { planosViagem, planosViagemPets, pets } = useAppStore();
  const hoje = new Date();

  const comDados = planosViagem.map((p) => {
    const petsDoPlano = planosViagemPets
      .filter((pvp) => pvp.planoViagemId === p.id)
      .map((pvp) => pets.find((pet) => pet.id === pvp.petId))
      .filter(Boolean) as typeof pets;
    const dataEmbarque = parse(p.dataEmbarque, "dd/MM/yyyy", new Date());
    const dias = differenceInDays(dataEmbarque, hoje);
    return { ...p, petsDoPlano, dataEmbarque, diasRestantes: dias };
  }).sort((a, b) => a.dataEmbarque.getTime() - b.dataEmbarque.getTime());

  const futuras = comDados.filter((p) => p.diasRestantes >= 0);
  const passadas = comDados.filter((p) => p.diasRestantes < 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Viagens</h2>
          <p className="text-navy/50 text-sm mt-0.5">{planosViagem.length} plano{planosViagem.length !== 1 ? "s" : ""} criado{planosViagem.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/planejar"
          className="flex items-center gap-1.5 bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors">
          <Plus size={16} /> Nova viagem
        </Link>
      </div>

      {planosViagem.length === 0 ? (
        <div className="bg-white rounded-xl border border-border py-16 flex flex-col items-center gap-3 text-center">
          <Plane size={40} className="text-navy/20" />
          <p className="font-semibold text-navy">Nenhuma viagem planejada</p>
          <p className="text-sm text-navy/50 max-w-xs">Use o Planejador para gerar o roadmap de compliance do seu pet.</p>
          <Link href="/planejar" className="mt-2 bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors">
            Planejar viagem
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {futuras.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-navy/50 uppercase tracking-wide mb-3">Próximas</h3>
              <div className="space-y-3">
                {futuras.map((p) => <ViagemCard key={p.id} plano={p} />)}
              </div>
            </section>
          )}
          {passadas.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-navy/50 uppercase tracking-wide mb-3">Histórico</h3>
              <div className="space-y-3 opacity-70">
                {passadas.map((p) => <ViagemCard key={p.id} plano={p} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ViagemCard({ plano }: { plano: ReturnType<typeof useAppStore.getState>["planosViagem"][number] & {
  petsDoPlano: ReturnType<typeof useAppStore.getState>["pets"];
  dataEmbarque: Date;
  diasRestantes: number;
}}) {
  const badge = plano.diasRestantes < 0
    ? { label: "Realizada", cls: "bg-surface text-navy/40" }
    : plano.diasRestantes === 0
    ? { label: "Hoje!", cls: "bg-red-100 text-red-700" }
    : plano.diasRestantes <= 7
    ? { label: `${plano.diasRestantes}d`, cls: "bg-red-100 text-red-700" }
    : plano.diasRestantes <= 30
    ? { label: `${plano.diasRestantes}d`, cls: "bg-orange-100 text-orange-700" }
    : { label: `${plano.diasRestantes}d`, cls: "bg-teal-light text-teal" };

  return (
    <Link href={`/viagens/${plano.id}`}
      className="bg-white rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow block">
      <div className="w-12 h-12 bg-teal-light rounded-xl flex items-center justify-center shrink-0">
        <Plane size={20} className="text-teal" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-navy capitalize">{plano.destino.replace(/_/g, " ").toLowerCase()}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-navy/50 flex items-center gap-1">
            <Calendar size={11} />
            {format(plano.dataEmbarque, "d MMM yyyy", { locale: ptBR })}
          </span>
          {plano.petsDoPlano.map((pet) => (
            <span key={pet.id} className="text-xs bg-surface text-navy/60 px-2 py-0.5 rounded-full">{pet.nome}</span>
          ))}
          {plano.isPremium && (
            <span className="text-xs bg-ipet-orange/10 text-ipet-orange px-2 py-0.5 rounded-full">Premium</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
        <ChevronRight size={16} className="text-navy/30" />
      </div>
    </Link>
  );
}
