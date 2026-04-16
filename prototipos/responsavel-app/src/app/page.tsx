"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import Link from "next/link";
import { PlusCircle, Settings } from "lucide-react";
import { PetCardHome } from "@/components/PetCardHome";
import { BottomNav } from "@/components/BottomNav";
import { SugestoesDestinos } from "@/components/SugestoesDestinos";
import { HoteisPetSection } from "@/components/HoteisPetSection";

export default function HomePage() {
  const { pets, responsavel, setResponsavel } = useAppStore();

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

  const temPets = pets.length > 0;

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

      <main className="flex-1 px-5 space-y-8">
        {/* ── Meus Pets ────────────────────────────────────────────── */}
        {!temPets ? (
          <EmptyState />
        ) : (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-200">Meus Pets</h2>
              <span className="text-xs text-gray-500">
                {pets.length} pet{pets.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {pets.map((pet) => (
                <PetCardHome key={pet.id} pet={pet} />
              ))}
            </div>
            <Link
              href="/pets/novo"
              className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-gray-700 rounded-2xl text-gray-500 text-sm hover:border-sky-600 hover:text-sky-400 transition-colors mt-3"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar outro pet
            </Link>
          </section>
        )}

        {/* ── Banner de destaque (apenas sem pets cadastrados) ─────── */}
        {!temPets && (
          <div className="bg-gradient-to-r from-sky-900/60 to-indigo-900/60 border border-sky-700/30 rounded-2xl p-4">
            <p className="text-xs text-sky-300 font-medium mb-1">✨ Smart Pet Pass</p>
            <p className="text-white text-sm font-semibold">
              Viaje com seu pet com segurança e zero surpresas
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Passaporte digital, motor de compliance e roteiro de documentos por destino.
            </p>
          </div>
        )}

        {/* ── Dicas rápidas ─────────────────────────────────────────── */}
        <DicasRapidas />

        {/* ── Sugestões de destinos ─────────────────────────────────── */}
        <SugestoesDestinos />

        {/* ── Hotéis pet ───────────────────────────────────────────── */}
        <HoteisPetSection />
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-5 text-4xl">
        🐾
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Cadastre seu primeiro pet
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
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

const DICAS = [
  {
    emoji: "💉",
    titulo: "Vacina antirrábica",
    texto: "Obrigatória para todos os destinos. Validade de 1 ano, carência de 21 dias.",
  },
  {
    emoji: "🔖",
    titulo: "Microchip ISO",
    texto: "Exigido pela UE, UK, Japão e Austrália. Deve ser implantado antes da vacina.",
  },
  {
    emoji: "📋",
    titulo: "CVI — Certificado Veterinário Internacional",
    texto: "Emitir 2 a 10 dias antes do embarque com veterinário credenciado pelo MAPA.",
  },
  {
    emoji: "⏱️",
    titulo: "Sorologia — planeje com antecedência",
    texto: "UE exige 90 dias de espera. Japão e Austrália exigem 180 dias. Comece cedo!",
  },
];

function DicasRapidas() {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-200 mb-3">
        Dicas essenciais de viagem
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
        {DICAS.map((d, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-52 bg-gray-800 rounded-2xl p-3.5 border border-gray-700/40"
          >
            <span className="text-2xl">{d.emoji}</span>
            <p className="text-white text-xs font-semibold mt-2 mb-1">{d.titulo}</p>
            <p className="text-gray-400 text-[11px] leading-relaxed">{d.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
