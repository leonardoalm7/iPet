"use client";

import Link from "next/link";
import { useAppStore, useAuthStore } from "@ipet/core";
import type { Pet } from "@ipet/core";
import {
  PawPrint,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Map,
  BookOpen,
  Plane,
  Dog,
  Cat,
  Calendar,
  Sparkles,
} from "lucide-react";
import { format, parse, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

function PetGlyph({ pet, className = "" }: { pet: Pet; className?: string }) {
  const Icon = pet.especie === "CAO" ? Dog : pet.especie === "GATO" ? Cat : PawPrint;
  return <Icon strokeWidth={1.5} className={className} />;
}

export default function HomePage() {
  const perfil = useAuthStore((s) => s.perfil);
  const { pets, planosViagem, planosViagemPets } = useAppStore();

  const nome = perfil?.nomeCompleto?.split(" ")[0] ?? "Tutor";

  const hoje = new Date();
  const viagensAtivas = planosViagem
    .filter((p) => {
      const d = parse(p.dataEmbarque, "dd/MM/yyyy", new Date());
      return differenceInDays(d, hoje) >= 0;
    })
    .sort((a, b) => {
      const da = parse(a.dataEmbarque, "dd/MM/yyyy", new Date());
      const db = parse(b.dataEmbarque, "dd/MM/yyyy", new Date());
      return da.getTime() - db.getTime();
    });

  const compliancePending = pets.filter((p) => !p.vacina || !p.microchip).length;
  const docsCount = pets.reduce((acc) => acc, 0); // placeholder

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-12 pb-8"
    >
      {/* ───────── Saudação editorial ───────── */}
      <motion.section variants={fadeUp}>
        <p className="kicker text-terracotta">
          {format(hoje, "EEEE · dd 'de' MMMM", { locale: ptBR })}
        </p>
        <h1 className="font-display text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.04] font-light tracking-tight text-ink mt-3">
          Olá, <em className="font-display-soft italic text-sage">{nome}</em>.
        </h1>
        <p className="text-muted text-[15px] mt-3 max-w-xl leading-relaxed">
          Acompanhe seus pets, planeje viagens internacionais e mantenha
          documentos em conformidade — tudo em um só lugar.
        </p>
      </motion.section>

      {/* ───────── Resumo ───────── */}
      <motion.section
        variants={fadeUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          kicker="Cadastrados"
          value={pets.length}
          label="pets"
          Icon={PawPrint}
          href="/passaportes"
        />
        <StatCard
          kicker="Em rota"
          value={viagensAtivas.length}
          label="viagens"
          Icon={Plane}
          href="/viagens"
        />
        <StatCard
          kicker="Atenção"
          value={compliancePending}
          label="itens pendentes"
          Icon={AlertTriangle}
          href="/passaportes"
          tone={compliancePending > 0 ? "warn" : undefined}
        />
        <StatCard
          kicker="Biblioteca"
          value={70}
          label="países cobertos"
          Icon={BookOpen}
          href="/regras"
        />
      </motion.section>

      {/* ───────── Pets ───────── */}
      <motion.section variants={fadeUp}>
        <SectionHead
          kicker="Quem voa"
          title="Seus pets"
          link={{ href: "/passaportes", label: "Ver todos" }}
        />
        {pets.length === 0 ? (
          <EmptyState
            Icon={PawPrint}
            title="Nenhum pet cadastrado"
            desc="Comece adicionando o primeiro companheiro de viagem."
            action={{ label: "Adicionar pet", href: "/pets/novo" }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
            <Link
              href="/pets/novo"
              className="group border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2.5 py-10 text-muted hover:border-ink hover:text-ink transition-all bg-paper/40 hover:bg-paper"
            >
              <Plus
                size={22}
                strokeWidth={1.5}
                className="transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:rotate-90"
              />
              <span className="text-[13px] font-medium">Novo pet</span>
            </Link>
          </div>
        )}
      </motion.section>

      {/* ───────── Próximas viagens ───────── */}
      {viagensAtivas.length > 0 && (
        <motion.section variants={fadeUp}>
          <SectionHead
            kicker="No horizonte"
            title="Próximas viagens"
            link={{ href: "/viagens", label: "Ver todas" }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {viagensAtivas.slice(0, 4).map((plano) => {
              const petsDoPlano = planosViagemPets
                .filter((pvp) => pvp.planoViagemId === plano.id)
                .map((pvp) => pets.find((p) => p.id === pvp.petId))
                .filter(Boolean) as Pet[];
              const dataEmbarque = parse(
                plano.dataEmbarque,
                "dd/MM/yyyy",
                new Date()
              );
              const diasRestantes = differenceInDays(dataEmbarque, hoje);
              const urgencia =
                diasRestantes <= 7
                  ? "bg-[#FBEBE8] text-[#8C3329]"
                  : diasRestantes <= 30
                  ? "bg-terracotta-soft text-terracotta-deep"
                  : "bg-sage-soft text-sage-deep";
              return (
                <Link
                  key={plano.id}
                  href={`/viagens/${plano.id}`}
                  className="group bg-paper rounded-2xl border border-border p-6 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="kicker text-muted mb-1.5">Destino</p>
                      <p className="font-display text-xl text-ink leading-tight tracking-tight capitalize truncate">
                        {plano.destino.replace(/_/g, " ").toLowerCase()}
                      </p>
                      <p className="text-[12px] text-muted mt-1.5 flex items-center gap-1.5">
                        <Calendar size={11} strokeWidth={1.5} />
                        <span className="font-mono">
                          {format(dataEmbarque, "dd MMM yyyy", { locale: ptBR })}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full ${urgencia}`}
                    >
                      {diasRestantes === 0 ? "Hoje" : `${diasRestantes}d`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border">
                    {petsDoPlano.map((p) => (
                      <span
                        key={p.id}
                        className="text-[11px] bg-bone-deep text-ink/70 px-2.5 py-1 rounded-full flex items-center gap-1.5"
                      >
                        <PetGlyph pet={p} className="w-3 h-3" />
                        {p.nome}
                      </span>
                    ))}
                    {plano.isPremium && (
                      <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-terracotta-deep bg-terracotta-soft px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={10} strokeWidth={1.5} /> Premium
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ───────── CTAs ───────── */}
      <motion.section
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <QuickAction
          Icon={Map}
          title="Planejar nova viagem"
          desc="Gere o roadmap de compliance para qualquer destino."
          href="/planejar"
          variant="ink"
        />
        <QuickAction
          Icon={BookOpen}
          title="Regras por país"
          desc="Consulte requisitos sanitários de mais de 70 destinos."
          href="/regras"
          variant="paper"
        />
      </motion.section>
    </motion.div>
  );
}

// ─────────────────────────── COMPONENTS ───────────────────────────

function SectionHead({
  kicker,
  title,
  link,
}: {
  kicker: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <header className="flex items-end justify-between mb-5 gap-4 flex-wrap">
      <div>
        <p className="kicker text-terracotta">{kicker}</p>
        <h2 className="font-display text-2xl text-ink tracking-tight mt-1.5">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-[13px] text-ink/70 hover:text-ink link-underline flex items-center gap-1.5"
        >
          {link.label} <ArrowRight size={13} strokeWidth={1.5} />
        </Link>
      )}
    </header>
  );
}

function StatCard({
  kicker,
  value,
  label,
  Icon,
  href,
  tone,
}: {
  kicker: string;
  value: number | string;
  label: string;
  Icon: typeof PawPrint;
  href: string;
  tone?: "warn";
}) {
  return (
    <Link
      href={href}
      className="group bg-paper rounded-2xl border border-border p-5 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all"
    >
      <div className="flex items-start justify-between">
        <p className="kicker text-muted">{kicker}</p>
        <Icon
          size={15}
          strokeWidth={1.5}
          className={`${
            tone === "warn" ? "text-terracotta" : "text-ink/35"
          } group-hover:text-ink transition-colors`}
        />
      </div>
      <p
        className={`font-display text-4xl leading-none tracking-tight mt-4 ${
          tone === "warn" ? "text-terracotta-deep" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted mt-2">{label}</p>
    </Link>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  const microchipOk = !!pet.microchip;
  const vacinaOk = !!pet.vacina;
  return (
    <Link
      href={`/passaporte/${pet.id}`}
      className="group bg-paper rounded-2xl border border-border p-5 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-full bg-bone-deep flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-bone transition-colors">
          <PetGlyph pet={pet} className="w-5 h-5 text-ink/70 group-hover:text-bone" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg text-ink truncate leading-tight">
            {pet.nome}
          </p>
          <p className="text-[11px] text-muted mt-0.5 truncate">{pet.raca}</p>
        </div>
      </div>
      <dl className="space-y-2 text-[12px]">
        <Stat label="Peso" value={`${pet.peso} kg`} mono />
        <Stat
          label="Microchip"
          value={
            microchipOk ? (
              <span className="text-status-ok flex items-center gap-1">
                <CheckCircle2 size={11} strokeWidth={1.75} /> Registrado
              </span>
            ) : (
              <span className="text-faint">—</span>
            )
          }
        />
        <Stat
          label="Vacina"
          value={
            vacinaOk ? (
              <span className="text-status-ok flex items-center gap-1">
                <CheckCircle2 size={11} strokeWidth={1.75} /> OK
              </span>
            ) : (
              <span className="text-terracotta-deep flex items-center gap-1">
                <AlertTriangle size={11} strokeWidth={1.75} /> Pendente
              </span>
            )
          }
        />
      </dl>
    </Link>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`text-ink/85 ${mono ? "font-mono text-[11px]" : "font-medium"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyState({
  Icon,
  title,
  desc,
  action,
}: {
  Icon: typeof PawPrint;
  title: string;
  desc: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="bg-paper rounded-2xl border border-dashed border-border py-16 flex flex-col items-center gap-3 text-center px-6">
      <Icon size={26} strokeWidth={1.25} className="text-faint" />
      <p className="font-display text-xl text-ink mt-1 tracking-tight">{title}</p>
      <p className="text-[13px] text-muted max-w-xs">{desc}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-3 inline-flex items-center gap-2 bg-ink text-bone text-[13px] px-5 py-2.5 rounded-full hover:bg-sage transition-colors"
        >
          <Plus size={14} strokeWidth={1.75} /> {action.label}
        </Link>
      )}
    </div>
  );
}

function QuickAction({
  Icon,
  title,
  desc,
  href,
  variant,
}: {
  Icon: typeof Map;
  title: string;
  desc: string;
  href: string;
  variant: "ink" | "paper";
}) {
  const isInk = variant === "ink";
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all border ${
        isInk
          ? "bg-ink text-bone border-ink hover:border-ink"
          : "bg-paper text-ink border-border hover:border-ink hover:shadow-[var(--shadow-soft)]"
      }`}
    >
      {isInk && (
        <>
          <div aria-hidden className="absolute inset-0 paper-grain opacity-50 pointer-events-none" />
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(201,123,78,0.22) 0%, transparent 60%)",
            }}
          />
        </>
      )}
      <div className="relative flex items-start gap-5">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            isInk ? "bg-bone/8 ring-1 ring-bone/15" : "bg-sage-soft"
          }`}
        >
          <Icon
            size={18}
            strokeWidth={1.5}
            className={isInk ? "text-bone" : "text-sage-deep"}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-display text-xl tracking-tight ${
              isInk ? "text-bone" : "text-ink"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-[13px] mt-1.5 leading-relaxed ${
              isInk ? "text-bone/65" : "text-muted"
            }`}
          >
            {desc}
          </p>
        </div>
        <ArrowRight
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 mt-1 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1 ${
            isInk ? "text-bone/65" : "text-ink/45"
          }`}
        />
      </div>
    </Link>
  );
}
