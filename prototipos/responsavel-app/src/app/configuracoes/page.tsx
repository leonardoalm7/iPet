"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { ArrowLeft, Trash2, Info, BarChart3 } from "lucide-react";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { pets, planosViagem, documentos } = useAppStore();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <h1 className="text-lg font-semibold text-navy">Configurações</h1>
      </header>

      <main className="px-5 space-y-4">
        <div className="bg-white border border-border rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-400">Dados locais</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface rounded-xl p-3 border border-border">
              <p className="text-2xl font-bold text-navy">{pets.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pets</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border">
              <p className="text-2xl font-bold text-navy">{planosViagem.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Viagens</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border">
              <p className="text-2xl font-bold text-navy">{documentos.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Docs</p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/metricas"
          className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 active:bg-surface"
        >
          <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-navy" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-navy">Métricas BML</p>
            <p className="text-xs text-gray-400">Funil, destinos, companhias</p>
          </div>
        </Link>

        <div className="bg-navy/5 border border-navy/10 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-navy/60 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-navy/60 leading-relaxed space-y-1">
            <p className="font-medium text-navy">Versão Beta — iPet Pass</p>
            <p>Os dados são armazenados localmente neste dispositivo.</p>
            <p>Autenticação por blockchain Polygon será ativada em breve.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
