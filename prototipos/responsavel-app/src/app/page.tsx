"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import Link from "next/link";
import { Pet } from "@/domain/types";
import { PlusCircle, Settings, ChevronRight, AlertTriangle, Plane, Stethoscope } from "lucide-react";
import { PetCardHome } from "@/components/PetCardHome";
import { BottomNav } from "@/components/BottomNav";
import { SugestoesDestinos } from "@/components/SugestoesDestinos";
import { HoteisPetSection } from "@/components/HoteisPetSection";
import { calcularRoadmap, parseBR } from "@/services/travel-roadmap";
import { REGRAS_DESTINO } from "@/data/destinations";
import { differenceInDays } from "date-fns";
import { motion } from "framer-motion";

export default function HomePage() {
  const { pets, responsavel, planosViagem, setResponsavel, getPrimeiroPetIdDoPlano } = useAppStore();

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

  const viagensAtivas = planosViagem
    .map((plano) => {
      const pet = pets.find((p) => p.id === getPrimeiroPetIdDoPlano(plano.id));
      if (!pet) return null;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const diasRestantes = differenceInDays(parseBR(plano.dataEmbarque), hoje);
      return { plano, pet, diasRestantes };
    })
    .filter((v) => v !== null && v.diasRestantes >= 0)
    .sort((a, b) => a!.diasRestantes - b!.diasRestantes) as { plano: typeof planosViagem[number]; pet: typeof pets[number]; diasRestantes: number }[];

  const proximaViagem = viagensAtivas[0] ?? null;

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-white">
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-gray-400">Bem-vindo ao</p>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <span className="text-teal">iPet</span> Pass
            </h1>
          </div>
          <Link
            href="/configuracoes"
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 space-y-6">
        {viagensAtivas.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-navy">
                {viagensAtivas.length === 1 ? "Viagem ativa" : "Viagens ativas"}
              </h2>
              <span className="text-xs text-gray-400">
                {viagensAtivas.length} viage{viagensAtivas.length !== 1 ? "ns" : "m"}
              </span>
            </div>
            <div className={viagensAtivas.length > 1
              ? "flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5"
              : ""
            }>
              {viagensAtivas.map((v) => (
                <div key={v.plano.id} className={viagensAtivas.length > 1 ? "flex-shrink-0 w-[85%]" : ""}>
                  <JourneyHubBanner
                    planoId={v.plano.id}
                    petNome={v.pet.nome}
                    destino={REGRAS_DESTINO[v.plano.destino]}
                    diasRestantes={v.diasRestantes}
                    dataEmbarque={v.plano.dataEmbarque}
                    isPremium={v.plano.isPremium}
                    roadmap={calcularRoadmap(
                      v.pet,
                      v.plano.destino,
                      v.plano.dataEmbarque,
                      v.plano.id,
                      { isPremium: v.plano.isPremium }
                    )}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

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
              className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-border rounded-2xl text-gray-400 text-sm hover:border-navy hover:text-navy transition-colors mt-3"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar outro pet
            </Link>
          </section>
        )}

        {temPets && viagensAtivas.length === 0 && (
          <Link
            href="/planejar"
            className="flex items-center gap-4 bg-navy/5 border border-navy/10 rounded-2xl p-4 hover:bg-navy/10 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-navy" />
            </div>
            <div className="flex-1">
              <p className="text-navy font-semibold text-sm">Planejar uma viagem</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Por onde começo? Descubra em 3 passos.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        )}

        {temPets && (
          <CompanhiasCard pets={pets} />
        )}

        <Link
          href="/clinicas"
          className="flex items-center gap-4 bg-white border border-border rounded-2xl p-4 hover:border-navy/30 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-teal" />
          </div>
          <div className="flex-1">
            <p className="text-navy font-semibold text-sm">Clínicas veterinárias</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Vets habilitados MAPA, labs de sorologia e mais
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        {!temPets && (
          <div className="bg-navy/5 border border-navy/10 rounded-2xl p-5">
            <p className="text-xs text-teal font-semibold mb-1 uppercase tracking-wider">iPet Pass</p>
            <p className="text-navy text-sm font-semibold">
              Viaje com seu pet com segurança e zero surpresas
            </p>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              Passaporte digital, motor de compliance e roteiro de documentos por destino.
            </p>
          </div>
        )}

        <DicasRapidas />
        <SugestoesDestinos />
        <HoteisPetSection />
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-5 text-4xl border border-border">
        🐾
      </div>
      <h2 className="text-xl font-semibold text-navy mb-2">
        Cadastre seu primeiro pet
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        Comece adicionando as informações do seu pet para gerar o passaporte
        digital e planejar sua viagem com segurança.
      </p>
      <Link
        href="/pets/novo"
        className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        Cadastrar pet
      </Link>
    </div>
  );
}

const DICAS = [
  {
    icon: "💉",
    titulo: "Vacina antirrábica",
    texto: "Obrigatória para todos os destinos. Validade de 1 ano, carência de 21 dias.",
  },
  {
    icon: "🔖",
    titulo: "Microchip ISO",
    texto: "Exigido pela UE, UK, Japão e Austrália. Deve ser implantado antes da vacina.",
  },
  {
    icon: "📋",
    titulo: "CVI",
    texto: "Emitir 2 a 10 dias antes do embarque com veterinário credenciado pelo MAPA.",
  },
  {
    icon: "⏱️",
    titulo: "Sorologia",
    texto: "UE exige 90 dias de espera. Japão e Austrália exigem 180 dias. Comece cedo!",
  },
];

interface JourneyHubBannerProps {
  planoId: string;
  petNome: string;
  destino: { bandeira: string; nome: string };
  diasRestantes: number;
  dataEmbarque: string;
  isPremium: boolean;
  roadmap: ReturnType<typeof calcularRoadmap>;
}

function JourneyHubBanner({
  planoId,
  petNome,
  destino,
  diasRestantes,
  isPremium,
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
            ? "bg-orange-light border-ipet-orange/20"
            : "bg-navy/5 border-navy/10"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Viagem ativa</p>
              {!isPremium && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-navy/10 text-navy">
                  FREE
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-navy">
              {petNome.split(" ")[0]} → {destino.bandeira} {destino.nome}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Embarque{" "}
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] text-gray-400">
              Documentação: {concluidas}/{total}
            </p>
            <p className="text-[11px] font-semibold text-navy">{progresso}%</p>
          </div>
          <div className="h-1.5 bg-white rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.6 }}
              className={`h-full rounded-full ${temUrgente ? "bg-ipet-orange" : "bg-navy"}`}
            />
          </div>
        </div>

        {temUrgente && (
          <p className="text-xs text-ipet-orange mt-2 font-medium">
            Há tarefas urgentes — toque para ver a jornada
          </p>
        )}
      </Link>
    </motion.div>
  );
}

function CompanhiasCard({ pets }: { pets: Pet[] }) {
  const primeiroPet = pets[0];
  const href = pets.length === 1 && primeiroPet ? `/companhias?petId=${primeiroPet.id}` : "/companhias";
  const subtexto = pets.length === 1 && primeiroPet
    ? `${primeiroPet.nome}: ver quais cias aceitam`
    : "Quais aceitam meu pet na cabine ou porão?";

  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white border border-border rounded-2xl p-4 hover:border-navy/30 transition-colors"
    >
      <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
        <Plane className="w-5 h-5 text-teal" />
      </div>
      <div className="flex-1">
        <p className="text-navy font-semibold text-sm">Companhias aéreas</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {subtexto}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}

function DicasRapidas() {
  return (
    <section>
      <h2 className="text-base font-semibold text-navy mb-3">
        Dicas essenciais
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
        {DICAS.map((d, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-52 bg-white rounded-2xl p-4 border border-border"
          >
            <span className="text-2xl">{d.icon}</span>
            <p className="text-navy text-xs font-semibold mt-2 mb-1">{d.titulo}</p>
            <p className="text-gray-400 text-[11px] leading-relaxed">{d.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
