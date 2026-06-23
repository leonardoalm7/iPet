"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore, calcularRoadmap, calcularRoadmapMultiLeg } from "@ipet/core";
import { REGRAS_DESTINO, COMPANHIAS_AEREAS } from "@ipet/core";
import type { Pet } from "@ipet/core";
import { RoadmapView } from "@/components/shared/RoadmapView";
import { RoadmapTimeline } from "@/components/shared/RoadmapTimeline";
import { CustoEstimado } from "@/components/shared/CustoEstimado";
import { differenceInDays, format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  AlertTriangle,
  Plane,
  MapPin,
  Trash2,
  List,
  GitCommitHorizontal,
  ChevronRight,
  CalendarCheck,
  Stethoscope,
  Sparkles,
  Lock,
  Dog,
  Cat,
  PawPrint,
} from "lucide-react";
import { motion } from "framer-motion";

function parseBR(s: string) {
  return parse(s, "dd/MM/yyyy", new Date());
}

function PetGlyph({ pet, className = "" }: { pet: Pet; className?: string }) {
  const Icon = pet.especie === "CAO" ? Dog : pet.especie === "GATO" ? Cat : PawPrint;
  return <Icon strokeWidth={1.5} className={className} />;
}

type ViewMode = "lista" | "timeline";

const STATUS_PALETTE: Record<string, { pill: string; label: string }> = {
  APTO:     { pill: "bg-sage-soft text-sage-deep",          label: "Apto" },
  PENDENTE: { pill: "bg-terracotta-soft text-terracotta-deep", label: "Pendente" },
  URGENTE:  { pill: "bg-terracotta-soft text-terracotta-deep", label: "Urgente" },
  CRITICO:  { pill: "bg-[#FBEBE8] text-[#8C3329]",          label: "Crítico" },
  INAPTO:   { pill: "bg-[#FBEBE8] text-[#8C3329]",          label: "Inapto" },
};

export default function PlanoDetalhe({
  params,
}: {
  params: Promise<{ planoId: string }>;
}) {
  const { planoId } = use(params);
  const router = useRouter();
  const { planosViagem, planosViagemPets, pets, removerPlanoViagem } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const plano = planosViagem.find((p) => p.id === planoId);
  const petIds = planosViagemPets
    .filter((pvp) => pvp.planoViagemId === planoId)
    .map((pvp) => pvp.petId);
  const petsDoPlano = petIds
    .map((id) => pets.find((p) => p.id === id))
    .filter(Boolean) as Pet[];
  const [petAtivo, setPetAtivo] = useState<string>(petIds[0] ?? "");
  const pet = pets.find((p) => p.id === petAtivo);

  const roadmap = useMemo(() => {
    if (!plano || !pet) return null;
    if (plano.trechos && plano.trechos.length > 1) {
      return calcularRoadmapMultiLeg(pet, plano.trechos, planoId);
    }
    return calcularRoadmap(pet, plano.destino, plano.dataEmbarque, planoId);
  }, [plano, pet, planoId]);

  if (!plano) {
    return (
      <div className="text-center py-24">
        <p className="text-muted">Viagem não encontrada.</p>
        <Link href="/viagens" className="text-sage link-underline text-sm mt-2 inline-block">
          Ver viagens
        </Link>
      </div>
    );
  }

  const dataEmbarque = parseBR(plano.dataEmbarque);
  const diasRestantes = differenceInDays(dataEmbarque, new Date());
  const companhia = plano.companhiaAereaId
    ? COMPANHIAS_AEREAS?.find((c) => c.id === plano.companhiaAereaId)
    : null;
  const regras = REGRAS_DESTINO[plano.destino];
  const statusInfo =
    roadmap && (STATUS_PALETTE[roadmap.statusGeral] ?? STATUS_PALETTE.PENDENTE);

  function handleDelete() {
    removerPlanoViagem(planoId);
    router.push("/viagens");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pb-16"
    >
      {/* ───────── Top nav ───────── */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full border border-border hover:border-ink hover:bg-paper transition-colors flex items-center justify-center text-ink/60 hover:text-ink focus-ring"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          {plano.isPremium && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta-deep bg-terracotta-soft px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles size={11} strokeWidth={1.5} /> Premium
            </span>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-full text-[12px] text-status-crit/80 hover:text-status-crit hover:bg-[#FBEBE8] transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={13} strokeWidth={1.5} /> Excluir
          </button>
        </div>
      </div>

      {/* ───────── Editorial hero ───────── */}
      <header className="mb-10">
        <p className="kicker text-terracotta">{regras?.bandeira} Destino internacional</p>
        <h1 className="font-display text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.02] font-light tracking-tight text-ink mt-3 capitalize">
          {plano.destino.replace(/_/g, " ").toLowerCase()}
        </h1>
        <div className="flex items-center gap-3 mt-4 text-[13px] text-muted">
          <span className="font-mono">
            {format(dataEmbarque, "dd MMMM yyyy", { locale: ptBR })}
          </span>
          <span className="w-1 h-1 bg-faint rounded-full" />
          <span>
            {diasRestantes >= 0
              ? `${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} restantes`
              : "Viagem realizada"}
          </span>
        </div>
      </header>

      {/* ───────── Pet selector ───────── */}
      {petsDoPlano.length > 1 && (
        <div className="mb-8">
          <p className="kicker text-muted mb-3">Pet em foco</p>
          <div className="flex gap-2 flex-wrap">
            {petsDoPlano.map((p) => {
              const isActive = petAtivo === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPetAtivo(p.id)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-ink text-bone"
                      : "bg-paper text-ink/70 border border-border hover:border-ink"
                  }`}
                >
                  <PetGlyph pet={p} className="w-3.5 h-3.5" />
                  {p.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* ───────── Main: Roadmap ───────── */}
        <div className="space-y-5">
          {roadmap && statusInfo ? (
            <>
              <div className="flex items-center justify-between bg-paper rounded-2xl border border-border px-6 py-4">
                <div>
                  <p className="kicker text-muted">Status geral</p>
                  <span
                    className={`mt-2 inline-flex items-center text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full ${statusInfo.pill}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-bone-deep rounded-full p-1">
                  <button
                    onClick={() => setViewMode("lista")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                      viewMode === "lista"
                        ? "bg-paper text-ink shadow-[var(--shadow-hairline)]"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <List size={12} strokeWidth={1.75} /> Lista
                  </button>
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                      viewMode === "timeline"
                        ? "bg-paper text-ink shadow-[var(--shadow-hairline)]"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <GitCommitHorizontal size={12} strokeWidth={1.75} /> Timeline
                  </button>
                </div>
              </div>

              {viewMode === "lista" ? (
                <RoadmapView roadmap={roadmap} pet={pet!} isPremium={plano.isPremium} />
              ) : (
                <RoadmapTimeline roadmap={roadmap} isPremium={plano.isPremium} />
              )}

              {!plano.isPremium && (
                <Link
                  href={`/embarque/${planoId}`}
                  className="group relative overflow-hidden block bg-ink text-bone rounded-2xl px-6 py-5"
                >
                  <div aria-hidden className="absolute inset-0 paper-grain opacity-60 pointer-events-none" />
                  <div
                    aria-hidden
                    className="absolute -top-16 -right-16 w-[280px] h-[280px] rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(201,123,78,0.32) 0%, transparent 60%)",
                    }}
                  />
                  <div className="relative flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-bone/8 ring-1 ring-bone/15 flex items-center justify-center shrink-0">
                      <Lock size={16} strokeWidth={1.5} className="text-bone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="kicker text-terracotta">Premium · R$ 99</p>
                      <p className="font-display text-lg leading-tight mt-1 tracking-tight">
                        Desbloqueie datas e prazos completos
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className="text-bone/70 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              )}
            </>
          ) : (
            <div className="bg-paper rounded-2xl border border-border p-12 text-center">
              <p className="text-muted">Pet não encontrado no plano.</p>
            </div>
          )}
        </div>

        {/* ───────── Sidebar ───────── */}
        <aside className="space-y-4">
          {/* Destino */}
          <FichaCard title="Destino" Icon={MapPin}>
            <Row label="Microchip" value={regras?.exigeMicrochip ? "Obrigatório" : "—"} />
            <Row
              label="Vacina antirrábica"
              value={
                regras?.exigeVacina
                  ? `Obrig. · ${regras.diasCarenciaVacina}d`
                  : "—"
              }
            />
            <Row
              label="Sorologia"
              value={
                regras?.exigeSorologia
                  ? `Obrig. · ${regras.diasCarenciaSorologia}d`
                  : "Não exigida"
              }
            />
            <Row
              label="CVI"
              value={
                regras?.exigeCVI
                  ? `Obrig. · ${regras.diasAntesCVI}d antes`
                  : "—"
              }
            />
            {regras?.observacoes && (
              <p className="text-[11px] text-muted bg-bone-deep rounded-lg p-3 mt-3 leading-relaxed">
                {regras.observacoes}
              </p>
            )}
          </FichaCard>

          {/* Companhia aérea */}
          {companhia ? (
            <FichaCard title={companhia.nome} Icon={Plane}>
              <Row label="Cabine" value={`até ${companhia.pesoMaxCabine} kg`} mono />
              <Row label="Porão" value={`até ${companhia.pesoMaxPorao} kg`} mono />
            </FichaCard>
          ) : (
            <Link
              href="/companhias"
              className="group bg-paper rounded-2xl border border-dashed border-border p-5 flex items-center gap-3 hover:border-ink transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-bone-deep flex items-center justify-center shrink-0">
                <Plane size={16} strokeWidth={1.5} className="text-ink/55" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink">Escolher companhia</p>
                <p className="text-[11px] text-muted mt-0.5">Verificar regras para seu pet</p>
              </div>
              <ChevronRight
                size={14}
                strokeWidth={1.5}
                className="text-faint group-hover:text-ink group-hover:translate-x-0.5 transition-all"
              />
            </Link>
          )}

          {pet && <CustoEstimado pet={pet} destino={plano.destino} />}

          {/* CTAs */}
          <SideLink
            href="/clinicas"
            Icon={Stethoscope}
            title="Clínicas parceiras"
            desc="Agendar consultas e exames"
          />
          <SideLink
            href="/ferramentas/calculadora-quarentena"
            Icon={CalendarCheck}
            title="Calculadora de quarentena"
            desc="Calcular carência da sorologia"
          />
        </aside>
      </div>

      {/* ───────── Confirm delete ───────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-paper rounded-3xl p-8 max-w-sm w-full shadow-[var(--shadow-deep)] border border-border"
          >
            <div className="w-12 h-12 rounded-full bg-[#FBEBE8] flex items-center justify-center mb-5">
              <AlertTriangle
                size={20}
                strokeWidth={1.5}
                className="text-status-crit"
              />
            </div>
            <h3 className="font-display text-2xl text-ink tracking-tight mb-2">
              Excluir viagem?
            </h3>
            <p className="text-[14px] text-muted leading-relaxed mb-7">
              Esta ação não pode ser desfeita. O roadmap e o histórico serão
              perdidos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-border py-3 rounded-full text-[13px] font-medium text-ink hover:bg-bone-deep transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-status-crit text-bone py-3 rounded-full text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function FichaCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-paper rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
        <Icon size={13} strokeWidth={1.5} className="text-sage" />
        <p className="kicker text-ink">{title}</p>
      </header>
      <div className="px-5 py-4 space-y-2.5">{children}</div>
    </article>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px] py-0.5">
      <span className="text-muted shrink-0">{label}</span>
      <span
        className={`text-right text-ink/85 ${
          mono ? "font-mono text-[11px]" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SideLink({
  href,
  Icon,
  title,
  desc,
}: {
  href: string;
  Icon: typeof Stethoscope;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 bg-paper rounded-2xl border border-border px-5 py-4 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all"
    >
      <div className="w-9 h-9 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
        <Icon size={15} strokeWidth={1.5} className="text-sage-deep" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink">{title}</p>
        <p className="text-[11px] text-muted mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight
        size={14}
        strokeWidth={1.5}
        className="text-faint group-hover:text-ink group-hover:translate-x-0.5 transition-all"
      />
    </Link>
  );
}
