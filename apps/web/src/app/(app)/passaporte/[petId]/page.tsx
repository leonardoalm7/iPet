"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@ipet/core";
import { PassaporteQR } from "@/components/shared/PassaporteQR";
import {
  ArrowLeft, Plus, FileText, CheckCircle2, AlertTriangle,
  Trash2, Edit3, Upload, ChevronRight,
} from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PassaportePetPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = use(params);
  const router = useRouter();
  const { pets, documentos, removerDocumento, removerPet } = useAppStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<"resumo" | "documentos" | "qr">("resumo");

  const pet = pets.find((p) => p.id === petId);
  const docs = documentos.filter((d) => d.petId === petId);

  if (!pet) return (
    <div className="text-center py-16">
      <p className="text-navy/50">Pet não encontrado.</p>
      <Link href="/passaportes" className="text-teal text-sm mt-2 hover:underline">Ver passaportes</Link>
    </div>
  );

  const especieEmoji = pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾";
  const itens = [
    { label: "Microchip", ok: !!pet.microchip, valor: pet.microchip },
    { label: "Vacina antirrábica", ok: !!pet.vacina, valor: pet.vacina?.data },
    { label: "Sorologia", ok: !!pet.sorologia, valor: pet.sorologia?.data },
  ];
  const score = itens.filter((i) => i.ok).length;

  function handleDeletePet() {
    removerPet(petId);
    router.replace("/passaportes");
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface text-navy/60 hover:text-navy transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-navy">{pet.nome}</h2>
          <p className="text-sm text-navy/50">{pet.raca} · {pet.peso} kg</p>
        </div>
        <Link href={`/pets/${petId}/editar`}
          className="p-2 text-navy/60 hover:text-navy hover:bg-surface rounded-lg transition-colors">
          <Edit3 size={18} />
        </Link>
        <button onClick={() => setConfirmDelete(true)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Card hero */}
      <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-5">
          <span className="text-5xl">{especieEmoji}</span>
          <div>
            <p className="font-bold text-2xl">{pet.nome}</p>
            <p className="text-white/60 text-sm">{pet.raca} · {pet.tipoPet === "CAO_GUIA" ? "Cão-guia" : "Estimação"}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-bold text-teal-light">{Math.round((score / 3) * 100)}%</p>
            <p className="text-xs text-white/40">passaporte</p>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full">
          <div className="h-full bg-teal-light rounded-full transition-all" style={{ width: `${Math.round((score / 3) * 100)}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {itens.map(({ label, ok, valor }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                {ok ? <CheckCircle2 size={13} className="text-teal-light" /> : <AlertTriangle size={13} className="text-orange-300" />}
                <p className="text-xs text-white/60">{label}</p>
              </div>
              <p className="text-sm font-semibold text-white">{valor ?? (ok ? "OK" : "Pendente")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl p-1">
        {(["resumo", "documentos", "qr"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-white shadow-sm text-navy" : "text-navy/50 hover:text-navy"
            }`}>
            {t === "qr" ? "QR Code" : t === "resumo" ? "Resumo" : "Documentos"}
          </button>
        ))}
      </div>

      {tab === "resumo" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard title="Identificação">
            <Row label="Espécie" value={pet.especie === "CAO" ? "Cão" : pet.especie === "GATO" ? "Gato" : "Outro"} />
            <Row label="Raça" value={pet.raca} />
            <Row label="Nascimento" value={pet.dataNascimento} />
            <Row label="Peso" value={`${pet.peso} kg`} />
            <Row label="Microchip" value={pet.microchip ?? "Não implantado"} />
          </InfoCard>
          <InfoCard title="Saúde">
            <Row label="Vacina antirrábica" value={pet.vacina ? `${pet.vacina.data}${pet.vacina.nomeComercial ? ` — ${pet.vacina.nomeComercial}` : ""}` : "Não registrada"} ok={pet.vacina?.valida} />
            <Row label="Sorologia" value={pet.sorologia ? `${pet.sorologia.data} — ${pet.sorologia.valor}` : "Não realizada"} ok={!!pet.sorologia} />
          </InfoCard>
          <div className="sm:col-span-2">
            <Link href="/planejar"
              className="flex items-center gap-3 bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <span className="text-2xl">✈️</span>
              <div>
                <p className="font-semibold text-navy">Planejar viagem com {pet.nome}</p>
                <p className="text-sm text-navy/50">Gerar roadmap de compliance para um destino</p>
              </div>
              <ChevronRight size={18} className="text-navy/30 ml-auto" />
            </Link>
          </div>
        </div>
      )}

      {tab === "documentos" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/passaporte/${petId}/upload`}
              className="flex items-center gap-2 bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors">
              <Upload size={15} /> Enviar documento
            </Link>
          </div>
          {docs.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-border py-12 text-center">
              <FileText size={32} className="text-navy/20 mx-auto mb-3" />
              <p className="text-navy/50 text-sm">Nenhum documento enviado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {docs.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl border border-border p-4 flex items-start gap-3">
                  <FileText size={20} className="text-teal shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy text-sm truncate">{doc.titulo}</p>
                    <p className="text-xs text-navy/50">{doc.tipo} · {doc.dataDocumento}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      doc.statusAutenticacao === "VERIFICADO" ? "bg-green-100 text-green-700" :
                      doc.statusAutenticacao === "REJEITADO" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{doc.statusAutenticacao}</span>
                  </div>
                  <button onClick={() => removerDocumento(doc.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "qr" && (
        <div className="flex justify-center">
          <PassaporteQR petId={petId} />
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-navy text-lg mb-2">Excluir {pet.nome}?</h3>
            <p className="text-sm text-navy/60 mb-5">Todos os dados e documentos do pet serão removidos.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-surface transition-colors">
                Cancelar
              </button>
              <button onClick={handleDeletePet}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <p className="px-5 py-3 font-semibold text-navy border-b border-border text-sm">{title}</p>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-navy/50 shrink-0">{label}</span>
      <span className={`font-medium text-right ${ok === false ? "text-orange-500" : ok ? "text-green-600" : "text-navy/70"}`}>{value}</span>
    </div>
  );
}
