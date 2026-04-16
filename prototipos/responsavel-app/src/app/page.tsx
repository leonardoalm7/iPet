"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Pet } from "@/domain/types";
import Link from "next/link";
import { PlusCircle, Plane, BookOpen, Settings } from "lucide-react";
import { PetCardHome } from "@/components/PetCardHome";
import { BottomNav } from "@/components/BottomNav";

export default function HomePage() {
  const router = useRouter();
  const { pets, responsavel, setResponsavel } = useAppStore();

  // Bootstrap: cria um responsável local na primeira vez
  useEffect(() => {
    if (!responsavel) {
      setResponsavel({
        id: "local-user",
        nome: "Responsável",
        email: "",
        criadoEm: new Date().toISOString(),
      });
    }
  }, [responsavel, setResponsavel]);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-gray-400">Bem-vindo ao</p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              ✈️ <span className="text-sky-400">iPet</span>
            </h1>
          </div>
          <Link
            href="/configuracoes"
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-1">Smart Pet Pass</p>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 px-5 space-y-4">
        {pets.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-200">
                Meus Pets
              </h2>
              <span className="text-xs text-gray-500">{pets.length} pet{pets.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3">
              {pets.map((pet) => (
                <PetCardHome key={pet.id} pet={pet} />
              ))}
            </div>
            {/* CTA adicionar mais */}
            <Link
              href="/pets/novo"
              className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-gray-700 rounded-2xl text-gray-500 text-sm hover:border-sky-600 hover:text-sky-400 transition-colors mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar outro pet
            </Link>
          </>
        )}
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-8 text-center px-4">
      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6 text-5xl">
        🐾
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Cadastre seu primeiro pet
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-8">
        Comece adicionando as informações do seu pet para gerar o passaporte
        digital e planejar sua viagem com segurança.
      </p>
      <Link
        href="/pets/novo"
        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        Cadastrar pet
      </Link>
    </div>
  );
}
