"use client";

import { useAppStore } from "@/store/app-store";
import { PetCardHome } from "@/components/PetCardHome";
import { BottomNav } from "@/components/BottomNav";
import { BookOpen, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function PassaportesPage() {
  const pets = useAppStore((s) => s.pets);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-sky-400" />
          <h1 className="text-2xl font-bold text-white">Passaportes</h1>
        </div>
        <p className="text-gray-400 text-sm">Documentação digital dos seus pets</p>
      </header>

      <main className="flex-1 px-5 space-y-3">
        {pets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">Nenhum pet cadastrado.</p>
            <Link href="/pets/novo" className="text-sky-400 text-sm mt-2 inline-block">
              Cadastrar pet
            </Link>
          </div>
        ) : (
          pets.map((pet) => <PetCardHome key={pet.id} pet={pet} />)
        )}
      </main>

      <BottomNav active="passaportes" />
    </div>
  );
}
