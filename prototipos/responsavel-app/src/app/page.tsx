"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import Link from "next/link";
import { PlusCircle, Settings, ChevronRight, AlertTriangle, Plane, Stethoscope } from "lucide-react";
import { PetCardHome } from "@/components/PetCardHome";
import { BottomNav } from "@/components/BottomNav";
import { SugestoesDestinos } from "@/components/SugestoesDestinos";
import { HoteisPetSection } from "@/components/HoteisPetSection";
import { calcularRoadmap, parseBRSafe } from "@/services/travel-roadmap";
import { REGRAS_DESTINO } from "@/data/destinations";
import { differenceInDays } from "date-fns";
import { motion } from "framer-motion";

export default function HomePage() {
  const { pets, responsavel, planosViagem, setResponsavel } = useAppStore();

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

  // Viagem mais próxima para o banner do Journey Hub
  const proximaViagem = planosViagem
    .map((plano) => {
      const pet = pets.find((p) => p.id === plano.petId);
      if (!pet) return null;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataEmbarque = parseBRSafe(plano.dataEmbarque);
      if (!dataEmbarque) return null;
      const diasRestantes = differenceInDays(dataEmbarque, hoje);
      return { plano, pet, diasRestantes };
    })
    .filter((v) => v !== null && v.diasRestantes >= 0)
    .sort((a, b) => a!.diasRestantes - b!.diasRestantes)[0] ?? null;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-gray-500">Bem-vindo ao</p>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              ✈️ <span className="text-teal">iPet</span>
            </h1>
          </div>
          <Link
            href="/configuracoes"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-1">Pet Pass</p>
      </header>

      <main className="flex-1 px-5 space-y-8">
        {/* ── Journey Hub Banner (viagem ativa) ─────────────────── */}
        {proximaViagem && REGRAS_DESTINO[proximaViagem.plano.destino] && (
          <JourneyHubBanner
            planoId={proximaViagem.plano.id}
            petNome={proximaViagem.pet.nome}
            destino={REGRAS_DESTINO[proximaViagem.plano.destino]}
            diasRestantes={proximaViagem.diasRestantes}
            dataEmbarque={proximaViagem.plano.dataEmbarque}
            roadmap={calcularRoadmap(
              proximaViagem.pet,
              proximaViagem.plano.destino,
              proximaViagem.plano.dataEmbarque,
              proximaViagem.plano.id
            )}
          />
        )}
        {/* ── Meus Pets ────────────────────────────────────────────── */}
        {!temPets ? (
          <EmptyState />
        ) : (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-navy">Meus Pets</h2>
              <span className="text-xs text-gray-400">
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
              className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm hover:border-teal hover:text-teal transition-colors mt-3"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar outro pet
            </Link>
          </section>
        )}

        {/* ── CTA Planejar viagem (tem pets mas sem viagem ativa) ─── */}
        {temPets && !proximaViagem && (
          <Link
            href="/planejar"
            className="flex items-center gap-4 bg-gradient-to-r from-teal/10 to-navy/5 border border-teal/20 rounded-2xl p-4 hover:border-teal/50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✈️</span>
            </div>
            <div className="flex-1">
              <p className="text-navy font-semibold text-sm">Planejar uma viagem</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Por onde começo? Descubra em 3 passos.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        )}

        {/* ── CTA Companhias aéreas ──────────────────────────────── */}
        {temPets && (
          <Link
            href="/companhias"
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-teal/40 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-teal" />
            </div>
            <div className="flex-1">
              <p className="text-navy font-semibold text-sm">Companhias aéreas</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Quais aceitam meu pet na cabine ou porão?
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        )}

        {/* ── CTA Clínicas veterinárias ────────────────────────────── */}
        <Link
          href="/clinicas"
          className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-teal/40 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-navy font-semibold text-sm">Clínicas veterinárias</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Vets habilitados MAPA, labs de sorologia e mais
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        {/* ── Banner de destaque (apenas sem pets cadastrados) ─────── */}
        {!temPets && (
          <div className="bg-gradient-to-r from-teal/10 to-navy/5 border border-teal/20 rounded-2xl p-4">
            <p className="text-xs text-teal font-medium mb-1">✨ Pet Pass</p>
            <p className="text-navy text-sm font-semibold">
              Viaje com seu pet com segurança e zero surpresas
            </p>
            <p className="text-gray-500 text-xs mt-1">
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
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5 text-4xl">
        🐾
      </div>
      <h2 className="text-xl font-semibold text-navy mb-2">
        Cadastre seu primeiro pet
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        Comece adicionando as informações do seu pet para gerar o passaporte
        digital e planejar sua viagem com segurança.
      </p>
      <Link
        href="/pets/novo"
        className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
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

// ─── Journey Hub Banner ────────────────────────────────────────

interface JourneyHubBannerProps {
  planoId: string;
  petNome: string;
  destino: { bandeira: string; nome: string };
  diasRestantes: number;
  dataEmbarque: string;
  roadmap: ReturnType<typeof calcularRoadmap>;
}

function JourneyHubBanner({
  planoId,
  petNome,
  destino,
  diasRestantes,
  dataEmbarque,
  roadmap,
}: JourneyHubBannerProps) {
  const tarefasDocs = roadmap.tarefas.filter((t) => t.id !== "cvi");
  const concluidas = tarefasDocs.filter((t) => t.concluida).length;
  const total = tarefasDocs.length;
  const temUrgente = tarefasDocs.some(
    (t) => t.status === "CRITICO" || t.status === "URGENTE" || t.status === "VENCIDA"
  );
  const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        href={`/viagens/${planoId}`}
        className={`block rounded-2xl border p-4 ${
          temUrgente
            ? "bg-orange-50 border-orange-200"
            : "bg-gradient-to-br from-teal/10 to-navy/5 border-teal/20"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Viagem ativa</p>
            <p className="text-sm font-semibold text-navy">
              {petNome.split(" ")[0]} → {destino.bandeira} {destino.nome}
            </p>
            <p className="text-xs text-gray-400">
              ✈️ Embarque{" "}
              {diasRestantes === 0
                ? "hoje!"
                : `em ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}`}{" "}
              · {dataEmbarque}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {temUrgente && <AlertTriangle className="w-4 h-4 text-ipet-orange" />}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Mini barra de progresso */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] text-gray-400">
              Documentação: {concluidas}/{total}
            </p>
            <p className="text-[11px] font-semibold text-gray-500">{progresso}%</p>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.6 }}
              className={`h-full rounded-full ${temUrgente ? "bg-ipet-orange" : "bg-teal"}`}
            />
          </div>
        </div>

        {temUrgente && (
          <p className="text-xs text-ipet-orange mt-2">
            ⚠️ Há tarefas urgentes — toque para ver a jornada
          </p>
        )}
      </Link>
    </motion.div>
  );
}

function DicasRapidas() {
  return (
    <section>
      <h2 className="text-base font-semibold text-navy mb-3">
        Dicas essenciais de viagem
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
        {DICAS.map((d, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-52 bg-gray-100 rounded-2xl p-3.5 border border-gray-200"
          >
            <span className="text-2xl">{d.emoji}</span>
            <p className="text-navy text-xs font-semibold mt-2 mb-1">{d.titulo}</p>
            <p className="text-gray-500 text-[11px] leading-relaxed">{d.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
