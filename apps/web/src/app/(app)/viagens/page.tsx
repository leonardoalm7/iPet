"use client";

import Link from "next/link";
import { useAppStore } from "@ipet/core";
import type { Pet } from "@ipet/core";
import {
  Plane,
  Plus,
  Calendar,
  ChevronRight,
  Dog,
  Cat,
  PawPrint,
  Sparkles,
} from "lucide-react";
import { format, parse, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

function PetGlyph({ pet, className = "" }: { pet: Pet; className?: string }) {
  const Icon = pet.especie === "CAO" ? Dog : pet.especie === "GATO" ? Cat : PawPrint;
  return <Icon strokeWidth={1.5} className={className} />;
}

export default function ViagensPage() {
  const { planosViagem, planosViagemPets, pets } = useAppStore();
  const hoje = new Date();

  const comDados = planosViagem
    .map((p) => {
      const petsDoPlano = planosViagemPets
        .filter((pvp) => pvp.planoViagemId === p.id)
        .map((pvp) => pets.find((pet) => pet.id === pvp.petId))
        .filter(Boolean) as Pet[];
      const dataEmbarqueDate = parse(p.dataEmbarque, "dd/MM/yyyy", new Date());
      const dias = differenceInDays(dataEmbarqueDate, hoje);
      return { ...p, petsDoPlano, dataEmbarqueDate, diasRestantes: dias };
    })
    .sort((a, b) => a.dataEmbarqueDate.getTime() - b.dataEmbarqueDate.getTime());

  const futuras = comDados.filter((p) => p.diasRestantes >= 0);
  const passadas = comDados.filter((p) => p.diasRestantes < 0).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10 pb-8"
    >
      {/* Header editorial */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker text-terracotta">Suas jornadas</p>
          <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
            Viagens
          </h1>
          <p className="text-[13px] text-muted mt-2.5">
            {planosViagem.length} plano{planosViagem.length !== 1 ? "s" : ""} criado{planosViagem.length !== 1 ? "s" : ""} ·{" "}
            {futuras.length} próxima{futuras.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/planejar"
          className="group inline-flex items-center gap-2 bg-ink text-bone text-[13px] font-medium px-5 py-3 rounded-full hover:bg-sage transition-colors"
        >
          <Plus
            size={14}
            strokeWidth={1.75}
            className="transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:rotate-90"
          />
          Nova viagem
        </Link>
      </header>

      <div className="editorial-rule" />

      {planosViagem.length === 0 ? (
        <div className="bg-paper rounded-2xl border border-dashed border-border py-20 flex flex-col items-center gap-3 text-center px-8">
          <Plane size={28} strokeWidth={1.25} className="text-faint" />
          <p className="font-display text-2xl text-ink mt-1 tracking-tight">
            Nenhuma viagem planejada.
          </p>
          <p className="text-[13px] text-muted max-w-sm">
            Use o planejador para gerar o roadmap de compliance do seu pet, com
            prazos, vacinas e custos por destino.
          </p>
          <Link
            href="/planejar"
            className="mt-3 inline-flex items-center gap-2 bg-ink text-bone text-[13px] px-5 py-2.5 rounded-full hover:bg-sage transition-colors"
          >
            <Plus size={14} strokeWidth={1.75} /> Planejar viagem
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {futuras.length > 0 && (
            <ViagensSection title="Próximas" planos={futuras} />
          )}
          {passadas.length > 0 && (
            <ViagensSection title="Histórico" planos={passadas} muted />
          )}
        </div>
      )}
    </motion.div>
  );
}

function ViagensSection({
  title,
  planos,
  muted,
}: {
  title: string;
  planos: any[];
  muted?: boolean;
}) {
  return (
    <section>
      <p className="kicker text-muted mb-5">{title}</p>
      <div className={`space-y-3 ${muted ? "opacity-70" : ""}`}>
        {planos.map((p) => (
          <ViagemCard key={p.id} plano={p} />
        ))}
      </div>
    </section>
  );
}

function ViagemCard({ plano }: { plano: any }) {
  const badge =
    plano.diasRestantes < 0
      ? { label: "Realizada", cls: "bg-bone-deep text-muted" }
      : plano.diasRestantes === 0
      ? { label: "Hoje", cls: "bg-[#FBEBE8] text-[#8C3329]" }
      : plano.diasRestantes <= 7
      ? { label: `${plano.diasRestantes}d`, cls: "bg-[#FBEBE8] text-[#8C3329]" }
      : plano.diasRestantes <= 30
      ? { label: `${plano.diasRestantes}d`, cls: "bg-terracotta-soft text-terracotta-deep" }
      : { label: `${plano.diasRestantes}d`, cls: "bg-sage-soft text-sage-deep" };

  return (
    <Link
      href={`/viagens/${plano.id}`}
      className="group bg-paper rounded-2xl border border-border p-6 flex items-center gap-5 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all"
    >
      <div className="w-12 h-12 bg-bone-deep rounded-full flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-bone transition-colors">
        <Plane size={18} strokeWidth={1.5} className="text-ink/70 group-hover:text-bone transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="kicker text-muted mb-1">Destino</p>
        <p className="font-display text-xl text-ink leading-tight tracking-tight capitalize truncate">
          {plano.destino.replace(/_/g, " ").toLowerCase()}
        </p>
        <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
          <span className="text-[11px] text-muted flex items-center gap-1.5 font-mono">
            <Calendar size={11} strokeWidth={1.5} />
            {format(plano.dataEmbarqueDate, "dd MMM yyyy", { locale: ptBR })}
          </span>
          {plano.petsDoPlano.map((pet: Pet) => (
            <span
              key={pet.id}
              className="text-[11px] bg-bone-deep text-ink/70 px-2 py-0.5 rounded-full flex items-center gap-1.5"
            >
              <PetGlyph pet={pet} className="w-3 h-3" />
              {pet.nome}
            </span>
          ))}
          {plano.isPremium && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta-deep bg-terracotta-soft px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={10} strokeWidth={1.5} /> Premium
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span
          className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full ${badge.cls}`}
        >
          {badge.label}
        </span>
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="text-faint group-hover:text-ink group-hover:translate-x-1 transition-all"
        />
      </div>
    </Link>
  );
}
