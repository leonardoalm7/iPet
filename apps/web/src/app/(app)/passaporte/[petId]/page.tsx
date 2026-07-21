"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@ipet/core";
import { PassaporteQRMini } from "@/components/shared/PassaporteQR";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Upload,
  ChevronRight,
  Dog,
  Cat,
  PawPrint,
  Plane,
  Syringe,
  Microscope,
  Fingerprint,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Pet } from "@ipet/core";

function PetGlyph({ pet, className = "" }: { pet: Pet; className?: string }) {
  const Icon = pet.especie === "CAO" ? Dog : pet.especie === "GATO" ? Cat : PawPrint;
  return <Icon strokeWidth={1.25} className={className} />;
}

const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function PassaportePetPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = use(params);
  const router = useRouter();
  const { pets, documentos, removerDocumento, removerPet } = useAppStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<"resumo" | "documentos" | "qr">("resumo");

  const pet = pets.find((p) => p.id === petId);
  const docs = documentos.filter((d) => d.petId === petId);

  if (!pet)
    return (
      <div className="text-center py-24">
        <p className="text-muted">Pet não encontrado.</p>
        <Link href="/passaportes" className="text-sage link-underline text-sm mt-2 inline-block">
          Ver passaportes
        </Link>
      </div>
    );

  const itens: { label: string; ok: boolean; valor?: string; Icon: typeof Syringe }[] = [
    { label: "Microchip", ok: !!pet.microchip, valor: pet.microchip, Icon: Fingerprint },
    { label: "Vacina antirrábica", ok: !!pet.vacina, valor: pet.vacina?.data, Icon: Syringe },
    { label: "Sorologia", ok: !!pet.sorologia, valor: pet.sorologia?.data, Icon: Microscope },
  ];
  const score = itens.filter((i) => i.ok).length;
  const pct = Math.round((score / itens.length) * 100);

  function handleDeletePet() {
    removerPet(petId);
    router.replace("/passaportes");
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* ────────── Top nav row ────────── */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full border border-border hover:border-ink hover:bg-paper transition-colors flex items-center justify-center text-ink/60 hover:text-ink focus-ring"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <Link
            href={`/pets/${petId}/editar`}
            className="px-4 py-2 rounded-full text-[12px] text-ink/70 hover:text-ink hover:bg-paper border border-transparent hover:border-border transition-colors flex items-center gap-1.5"
          >
            <Edit3 size={13} strokeWidth={1.5} /> Editar
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-full text-[12px] text-status-crit/80 hover:text-status-crit hover:bg-[#FBEBE8] transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={13} strokeWidth={1.5} /> Excluir
          </button>
        </div>
      </div>

      {/* ────────── Editorial passport hero ────────── */}
      <motion.section
        variants={itemVariants}
        custom={0}
        initial="initial"
        animate="animate"
        className="relative overflow-hidden rounded-3xl bg-ink text-bone"
      >
        <div aria-hidden className="absolute inset-0 paper-grain opacity-90" />
        <div
          aria-hidden
          className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(63,92,76,0.45) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 w-[360px] h-[360px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,123,78,0.18) 0%, transparent 65%)",
          }}
        />

        <div className="relative p-8 sm:p-10 lg:p-12">
          {/* Passport header */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="kicker text-terracotta/85">Pet Pass — Caderneta digital</p>
              <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.02] font-light tracking-tight mt-3">
                {pet.nome}
              </h1>
              <p className="text-bone/55 text-[13px] mt-2.5 flex items-center gap-2">
                <span className="font-display italic">{pet.raca}</span>
                <span className="w-1 h-1 bg-bone/30 rounded-full" />
                <span>{pet.peso} kg</span>
                <span className="w-1 h-1 bg-bone/30 rounded-full" />
                <span>{pet.tipoPet === "CAO_GUIA" ? "Cão-guia" : "Estimação"}</span>
              </p>
            </div>

            {/* Circular score */}
            <div className="relative">
              <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="rgba(247,244,238,0.12)"
                  strokeWidth="2"
                  fill="none"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="#C97B4E"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={314}
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * pct) / 100 }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl leading-none">{pct}%</span>
                <span className="kicker text-bone/45 mt-1">Caderneta</span>
              </div>
            </div>
          </div>

          {/* Decorative rule */}
          <div className="my-8 h-px bg-bone/10" />

          {/* Compliance items as ficha técnica */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {itens.map(({ label, ok, valor, Icon }) => (
              <div
                key={label}
                className="border border-bone/12 rounded-2xl px-4 py-3.5 bg-bone/5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={15} strokeWidth={1.5} className="text-bone/55" />
                  {ok ? (
                    <CheckCircle2 size={13} strokeWidth={1.75} className="text-sage-mist" />
                  ) : (
                    <AlertTriangle size={13} strokeWidth={1.75} className="text-terracotta" />
                  )}
                </div>
                <p className="kicker text-bone/50 mb-1">{label}</p>
                <p className="text-[13px] text-bone font-mono truncate">
                  {valor ?? (ok ? "Registrado" : "Pendente")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ────────── Tabs ────────── */}
      <div className="mt-10 border-b border-border flex items-center gap-1">
        {(["resumo", "documentos", "qr"] as const).map((t) => {
          const active = tab === t;
          const label = t === "qr" ? "QR Code" : t === "resumo" ? "Resumo" : "Documentos";
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-5 py-3 text-[13px] font-medium transition-colors ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {label}
              {active && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ────────── RESUMO ────────── */}
      {tab === "resumo" && (
        <motion.div
          variants={itemVariants}
          custom={1}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8"
        >
          <FichaCard title="Identificação" Icon={PawPrint}>
            <Row
              label="Espécie"
              value={pet.especie === "CAO" ? "Cão" : pet.especie === "GATO" ? "Gato" : "Outro"}
            />
            <Row label="Raça" value={pet.raca} />
            <Row label="Nascimento" value={pet.dataNascimento} mono />
            <Row label="Peso" value={`${pet.peso} kg`} mono />
            <Row
              label="Microchip"
              value={pet.microchip ?? "Não implantado"}
              mono
            />
          </FichaCard>
          <FichaCard title="Saúde" Icon={Syringe}>
            <Row
              label="Vacina antirrábica"
              value={
                pet.vacina
                  ? `${pet.vacina.data}${
                      pet.vacina.nomeComercial ? ` · ${pet.vacina.nomeComercial}` : ""
                    }`
                  : "Não registrada"
              }
              ok={pet.vacina?.valida}
            />
            <Row
              label="Sorologia"
              value={
                pet.sorologia
                  ? `${pet.sorologia.data} · ${pet.sorologia.valor}`
                  : "Não realizada"
              }
              ok={!!pet.sorologia}
            />
          </FichaCard>

          <Link
            href="/planejar"
            className="group lg:col-span-2 flex items-center gap-5 bg-paper border border-border rounded-2xl p-6 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
              <Plane size={20} strokeWidth={1.5} className="text-sage-deep" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="kicker text-terracotta">Próximo passo</p>
              <p className="font-display text-xl text-ink mt-1 tracking-tight">
                Planejar viagem com {pet.nome}
              </p>
              <p className="text-[13px] text-muted mt-1">
                Gere um roadmap de compliance personalizado por destino.
              </p>
            </div>
            <ChevronRight
              size={18}
              strokeWidth={1.5}
              className="text-faint group-hover:text-ink group-hover:translate-x-1 transition-all shrink-0"
            />
          </Link>
        </motion.div>
      )}

      {/* ────────── DOCUMENTOS ────────── */}
      {tab === "documentos" && (
        <motion.div
          variants={itemVariants}
          custom={1}
          initial="initial"
          animate="animate"
          className="mt-8 space-y-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted">
              {docs.length === 0
                ? "Nenhum documento enviado ainda."
                : `${docs.length} documento${docs.length > 1 ? "s" : ""} registrado${
                    docs.length > 1 ? "s" : ""
                  }.`}
            </p>
            <Link
              href={`/passaporte/${petId}/upload`}
              className="inline-flex items-center gap-2 bg-ink text-bone text-[12px] px-4 py-2.5 rounded-full hover:bg-sage transition-colors"
            >
              <Upload size={13} strokeWidth={1.75} /> Enviar documento
            </Link>
          </div>

          {docs.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl py-16 text-center bg-paper">
              <FileText
                size={28}
                strokeWidth={1.25}
                className="text-faint mx-auto mb-4"
              />
              <p className="text-[14px] text-muted">
                Anexe vacinas, exames e atestados para validação.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {docs.map((doc) => {
                const tone =
                  doc.statusAutenticacao === "VERIFICADO"
                    ? "bg-sage-soft text-sage-deep"
                    : doc.statusAutenticacao === "REJEITADO"
                    ? "bg-[#FBEBE8] text-[#8C3329]"
                    : "bg-terracotta-soft text-terracotta-deep";
                return (
                  <article
                    key={doc.id}
                    className="bg-paper rounded-2xl border border-border p-5 flex items-start gap-4 group hover:border-ink/30 hover:shadow-[var(--shadow-soft)] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-bone-deep flex items-center justify-center shrink-0">
                      <FileText
                        size={16}
                        strokeWidth={1.5}
                        className="text-ink/65"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-[15px] text-ink truncate leading-tight">
                        {doc.titulo}
                      </p>
                      <p className="text-[11px] text-muted mt-1 font-mono">
                        {doc.tipo} · {doc.dataDocumento}
                      </p>
                      <span
                        className={`mt-2 inline-block text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full ${tone}`}
                      >
                        {doc.statusAutenticacao}
                      </span>
                    </div>
                    <button
                      onClick={() => removerDocumento(doc.id)}
                      className="p-2 text-status-crit/60 hover:text-status-crit hover:bg-[#FBEBE8] rounded-full opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      aria-label="Remover documento"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ────────── QR ────────── */}
      {tab === "qr" && (
        <motion.div
          variants={itemVariants}
          custom={1}
          initial="initial"
          animate="animate"
          className="mt-12 flex flex-col items-center text-center"
        >
          <p className="kicker text-terracotta">Selo de autenticidade</p>
          <h3 className="font-display text-2xl text-ink mt-2 tracking-tight">
            Pet Pass de {pet.nome}
          </h3>
          <p className="text-[13px] text-muted mt-2 max-w-sm">
            Apresente este QR no embarque — agente valida o passaporte digital
            em segundos.
          </p>
          <div className="mt-8 relative p-1.5 bg-paper border border-border rounded-3xl shadow-[var(--shadow-lift)]">
            <div className="bg-bone rounded-[20px] p-6">
              <PassaporteQRMini
                pet={pet}
                temVacina={!!pet.vacina}
                temSorologia={!!pet.sorologia}
                temMicrochip={!!pet.microchip}
              />
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ink text-bone text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full">
              Pet Pass · {pet.id.slice(0, 6)}
            </div>
          </div>
        </motion.div>
      )}

      {/* ────────── Confirm delete modal ────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
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
              Excluir {pet.nome}?
            </h3>
            <p className="text-[14px] text-muted leading-relaxed mb-7">
              Esta ação remove todos os dados, documentos e histórico do pet.
              Não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-border py-3 rounded-full text-[13px] font-medium text-ink hover:bg-bone-deep transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePet}
                className="flex-1 bg-status-crit text-bone py-3 rounded-full text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ────────── Sub-components ──────────
function FichaCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: typeof PawPrint;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-paper rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
        <Icon size={14} strokeWidth={1.5} className="text-sage" />
        <p className="kicker text-ink">{title}</p>
      </header>
      <div className="px-6 py-5 space-y-3">{children}</div>
    </article>
  );
}

function Row({
  label,
  value,
  ok,
  mono,
}: {
  label: string;
  value: string;
  ok?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[13px] py-1">
      <span className="text-muted shrink-0">{label}</span>
      <span
        className={`text-right ${
          ok === false
            ? "text-terracotta-deep"
            : ok
            ? "text-status-ok"
            : "text-ink/85"
        } ${mono ? "font-mono text-[12px]" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
