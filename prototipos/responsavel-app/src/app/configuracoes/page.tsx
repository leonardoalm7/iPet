"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { ArrowLeft, Trash2, Info } from "lucide-react";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { pets, planosViagem, documentos } = useAppStore();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Configurações</h1>
      </header>

      <main className="px-5 space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-300">Dados locais</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-sky-400">{pets.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Pets</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-sky-400">{planosViagem.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Viagens</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-sky-400">{documentos.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Docs</p>
            </div>
          </div>
        </div>

        <div className="bg-sky-900/20 border border-sky-800/30 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-sky-300 leading-relaxed space-y-1">
            <p className="font-medium text-sky-200">Versão Beta — iPet Pet Pass</p>
            <p>Os dados são armazenados localmente neste dispositivo.</p>
            <p>Autenticação por blockchain Polygon será ativada em breve.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
