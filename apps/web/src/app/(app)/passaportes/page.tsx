"use client";

import Link from "next/link";
import { useAppStore } from "@ipet/core";
import { BookOpen, Plus, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { Metadata } from "next";

export default function PassaportesPage() {
  const pets = useAppStore((s) => s.pets);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Passaportes</h2>
          <p className="text-navy/50 text-sm mt-0.5">Documentação sanitária digital dos seus pets</p>
        </div>
        <Link href="/pets/novo"
          className="flex items-center gap-1.5 bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors">
          <Plus size={16} /> Novo Pet
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white rounded-xl border border-border py-16 flex flex-col items-center gap-3 text-center">
          <BookOpen size={40} className="text-navy/20" />
          <p className="font-semibold text-navy">Nenhum pet cadastrado</p>
          <p className="text-sm text-navy/50 max-w-xs">Adicione seu pet para gerar o passaporte sanitário digital.</p>
          <Link href="/pets/novo"
            className="mt-2 bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors">
            Adicionar pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => {
            const especieEmoji = pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾";
            const itens = [
              { label: "Microchip", ok: !!pet.microchip },
              { label: "Vacina antirrábica", ok: !!pet.vacina },
              { label: "Sorologia", ok: !!pet.sorologia },
            ];
            const score = itens.filter((i) => i.ok).length;
            const pct = Math.round((score / itens.length) * 100);

            return (
              <Link key={pet.id} href={`/passaporte/${pet.id}`}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow block">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{especieEmoji}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy text-lg leading-tight">{pet.nome}</p>
                    <p className="text-sm text-navy/50">{pet.raca}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-teal">{pct}%</p>
                    <p className="text-xs text-navy/40">completo</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-surface rounded-full mb-4">
                  <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>

                <div className="space-y-1.5">
                  {itens.map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      {ok
                        ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                        : <AlertTriangle size={15} className="text-orange-400 shrink-0" />}
                      <span className={ok ? "text-navy/70" : "text-navy/50"}>{label}</span>
                      {!ok && <span className="ml-auto text-xs text-orange-500 font-medium">Pendente</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-between text-xs text-navy/40">
                  <span>{pet.peso} kg</span>
                  <span>{pet.tipoPet === "CAO_GUIA" ? "Cão-guia" : "Estimação"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
