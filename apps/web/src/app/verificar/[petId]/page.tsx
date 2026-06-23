"use client";

import { use } from "react";
import Link from "next/link";
import { useAppStore, parseBR, isBraquicefalico } from "@ipet/core";
import { differenceInYears, differenceInMonths } from "date-fns";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Calendar,
  Weight,
  AlertTriangle,
  PawPrint,
  Dog,
  Cat,
  ArrowRight,
  Fingerprint,
  Syringe,
  Microscope,
  FileCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export default function VerificarPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = use(params);
  const pet = useAppStore((s) => s.pets.find((p) => p.id === petId));
  const documentos = useAppStore((s) => s.documentos).filter(
    (d) => d.petId === petId,
  );

  if (!pet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-bone"
      >
        <div className="w-14 h-14 rounded-full bg-[#FBEBE8] flex items-center justify-center mb-5">
          <XCircle size={22} strokeWidth={1.5} className="text-status-crit" />
        </div>
        <p className="kicker text-terracotta">Pet Pass</p>
        <h1 className="font-display text-[26px] text-ink mt-3 tracking-tight">
          Passaporte não encontrado
        </h1>
        <p className="text-[13px] text-muted mt-3 max-w-sm leading-relaxed">
          Este QR Code pode estar desatualizado, ou o pet foi removido pelo
          tutor.
        </p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 mt-7 bg-ink text-bone px-6 py-3 rounded-full text-[13px] font-medium hover:bg-sage transition-colors"
        >
          Ir para o iPet
          <ArrowRight
            size={14}
            strokeWidth={1.75}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </motion.div>
    );
  }

  const temVacina = !!pet.vacina?.valida;
  const temSorologia = pet.sorologia?.status === "OK";
  const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);
  const braqui = isBraquicefalico(pet.raca);
  const Glyph =
    pet.especie === "CAO" ? Dog : pet.especie === "GATO" ? Cat : PawPrint;

  const idadePet = (() => {
    const nascimento = parseBR(pet.dataNascimento);
    const anos = differenceInYears(new Date(), nascimento);
    if (anos > 0) return `${anos} ano${anos > 1 ? "s" : ""}`;
    const meses = differenceInMonths(new Date(), nascimento);
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  })();

  const totalChecks = 3;
  const passedChecks = [temVacina, temSorologia, temMicrochip].filter(
    Boolean,
  ).length;
  const status =
    passedChecks === totalChecks
      ? { label: "Apto", cls: "bg-sage-soft text-sage-deep" }
      : passedChecks >= 2
      ? { label: "Pendente", cls: "bg-terracotta-soft text-terracotta-deep" }
      : { label: "Inapto", cls: "bg-[#FBEBE8] text-[#8C3329]" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-bone"
    >
      {/* Hero — ink panel */}
      <section className="relative overflow-hidden bg-ink text-bone">
        <div aria-hidden className="absolute inset-0 paper-grain opacity-70" />
        <div
          aria-hidden
          className="absolute -top-24 -right-16 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(63,92,76,0.35) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-6 pt-12 pb-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-full bg-bone/8 ring-1 ring-bone/15 flex items-center justify-center">
              <ShieldCheck size={13} strokeWidth={1.75} className="text-bone" />
            </div>
            <p className="kicker text-terracotta/85">
              iPet Pass · Verificação pública
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-bone/8 ring-1 ring-bone/15 flex items-center justify-center shrink-0 overflow-hidden">
              {pet.foto ? (
                <img
                  src={pet.foto}
                  alt={pet.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Glyph size={32} strokeWidth={1.5} className="text-bone" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-tight text-bone">
                {pet.nome}
              </h1>
              <p className="text-[13px] text-bone/60 mt-2 truncate">
                {pet.raca}
              </p>
              {pet.tipoPet === "CAO_GUIA" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-terracotta bg-bone/8 ring-1 ring-bone/15 px-2 py-0.5 rounded-full mt-2">
                  Cão-guia
                </span>
              )}
            </div>
            <span
              className={`ml-auto shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full ${status.cls}`}
            >
              {status.label} {passedChecks}/{totalChecks}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-bone/15">
            <DataField
              Icon={Calendar}
              label="Nascimento"
              value={pet.dataNascimento}
            />
            <DataField Icon={Weight} label="Peso" value={`${pet.peso} kg`} mono />
            <DataField
              Icon={Cpu}
              label="Microchip"
              value={
                pet.microchip
                  ? pet.microchip.match(/.{1,3}/g)?.join(" ") ?? ""
                  : "Não implantado"
              }
              mono
            />
            <DataField Icon={ShieldCheck} label="Idade" value={idadePet} />
          </div>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8 pb-16">
        {/* Score */}
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-paper rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="kicker text-muted">Score sanitário</p>
              <p className="font-display text-[22px] text-ink mt-1 tracking-tight">
                {passedChecks}
                <span className="font-mono text-[14px] text-muted">
                  /{totalChecks}
                </span>{" "}
                <span className="font-mono text-[11px] text-muted">verificados</span>
              </p>
            </div>
            <span
              className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full ${status.cls}`}
            >
              {Math.round((passedChecks / totalChecks) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-bone-deep rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(passedChecks / totalChecks) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${
                passedChecks === totalChecks
                  ? "bg-sage"
                  : passedChecks >= 2
                  ? "bg-terracotta"
                  : "bg-status-crit"
              }`}
            />
          </div>
        </motion.article>

        {/* Verificações */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <p className="kicker text-muted mb-3">Verificações</p>
          <div className="space-y-2">
            <VerificacaoItem
              Icon={Fingerprint}
              ok={temMicrochip}
              label="Microchip ISO 11784/11785"
              detail={
                temMicrochip ? `Chip ${pet.microchip}` : "Não registrado"
              }
            />
            <VerificacaoItem
              Icon={Syringe}
              ok={temVacina}
              label="Vacina antirrábica"
              detail={
                temVacina
                  ? `Aplicada em ${pet.vacina?.data}${
                      pet.vacina?.nomeComercial
                        ? ` · ${pet.vacina.nomeComercial}`
                        : ""
                    }`
                  : "Não registrada"
              }
            />
            <VerificacaoItem
              Icon={Microscope}
              ok={temSorologia}
              label="Sorologia antirrábica"
              detail={
                temSorologia
                  ? `${pet.sorologia?.data} · ${pet.sorologia?.valor}`
                  : "Pendente"
              }
            />
          </div>
        </motion.div>

        {braqui && (
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-terracotta-soft/40 border border-terracotta-soft rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle
              size={14}
              strokeWidth={1.5}
              className="text-terracotta shrink-0 mt-0.5"
            />
            <p className="text-[12px] text-terracotta-deep leading-relaxed">
              <strong className="text-ink">{pet.raca}</strong> é raça
              braquicefálica — restrições aplicáveis no transporte em porão na
              maioria das companhias aéreas.
            </p>
          </motion.article>
        )}

        {documentos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="kicker text-muted mb-3">
              Documentos registrados ({documentos.length})
            </p>
            <div className="space-y-2">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 bg-paper border border-border rounded-2xl px-4 py-3"
                >
                  <FileCheck
                    size={14}
                    strokeWidth={1.5}
                    className="text-sage shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-ink truncate">
                      {doc.titulo}
                    </p>
                    <p className="text-[10px] font-mono text-muted mt-0.5">
                      {doc.dataDocumento}
                      {doc.hashDocumento &&
                        ` · ${doc.hashDocumento.slice(0, 12)}…`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="pt-6 border-t border-border text-center space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-faint">
            Verificado via iPet Pass ·{" "}
            {new Date().toLocaleDateString("pt-BR")}
          </p>
          <p className="text-[11px] text-muted">
            Confirme a autenticidade diretamente com o responsável.
          </p>
        </div>
      </main>
    </motion.div>
  );
}

function DataField({
  Icon,
  label,
  value,
  mono,
}: {
  Icon: typeof Calendar;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="kicker text-bone/40 flex items-center gap-1.5">
        <Icon size={10} strokeWidth={1.5} /> {label}
      </p>
      <p
        className={`text-bone text-[13px] mt-1 ${
          mono ? "font-mono text-[12px]" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function VerificacaoItem({
  Icon,
  ok,
  label,
  detail,
}: {
  Icon: typeof Syringe;
  ok: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 border ${
        ok
          ? "bg-sage-soft border-sage/20"
          : "bg-[#FBEBE8] border-[#F2C8C0]"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          ok ? "bg-bone/40" : "bg-bone/40"
        }`}
      >
        <Icon
          size={14}
          strokeWidth={1.5}
          className={ok ? "text-sage-deep" : "text-status-crit"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-[13px] font-medium ${
              ok ? "text-sage-deep" : "text-status-crit"
            }`}
          >
            {label}
          </p>
          {ok ? (
            <CheckCircle2
              size={13}
              strokeWidth={1.5}
              className="text-sage-deep shrink-0"
            />
          ) : (
            <XCircle
              size={13}
              strokeWidth={1.5}
              className="text-status-crit shrink-0"
            />
          )}
        </div>
        <p className="text-[11px] text-ink/60 truncate mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
