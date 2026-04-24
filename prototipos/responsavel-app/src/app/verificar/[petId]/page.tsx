"use client";

import { use } from "react";
import { useAppStore } from "@/store/app-store";
import { parseBR } from "@/services/travel-roadmap";
import { differenceInYears, differenceInMonths } from "date-fns";
import { isBraquicefalico } from "@/data/braquicefalicos";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Calendar,
  Weight,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VerificarPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = use(params);
  const pet = useAppStore((s) => s.pets.find((p) => p.id === petId));
  const documentos = useAppStore((s) => s.documentos).filter(
    (d) => d.petId === petId
  );

  if (!pet) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-navy mb-2">
          Passaporte não encontrado
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Este QR Code pode estar desatualizado ou o pet foi removido.
        </p>
        <Link
          href="/"
          className="text-teal text-sm font-medium"
        >
          Ir para o iPet
        </Link>
      </div>
    );
  }

  const temVacina = !!pet.vacina?.valida;
  const temSorologia = pet.sorologia?.status === "OK";
  const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);
  const braqui = isBraquicefalico(pet.raca);

  const idadePet = (() => {
    const nascimento = parseBR(pet.dataNascimento);
    const anos = differenceInYears(new Date(), nascimento);
    if (anos > 0) return `${anos} ano${anos > 1 ? "s" : ""}`;
    const meses = differenceInMonths(new Date(), nascimento);
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  })();

  const totalChecks = 3;
  const passedChecks = [temVacina, temSorologia, temMicrochip].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-b from-teal/15 to-cream px-5 pt-14 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-teal" />
            <h1 className="text-lg font-bold text-navy">iPet Pass — Verificação</h1>
          </div>

          {/* Card de identidade */}
          <div className="bg-white border border-border rounded-3xl p-5 shadow-sm mx-auto max-w-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-teal/20 flex items-center justify-center text-3xl flex-shrink-0">
                {pet.foto ? (
                  <img
                    src={pet.foto}
                    alt={pet.nome}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾"
                )}
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-navy">{pet.nome}</h2>
                <p className="text-sm text-gray-400">{pet.raca}</p>
                {pet.tipoPet === "CAO_GUIA" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                    🦮 Cão-guia
                  </span>
                )}
              </div>
            </div>

            {/* Grid de dados */}
            <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-100 pt-4">
              <DataField
                icon={<Calendar className="w-3.5 h-3.5 text-teal" />}
                label="Nascimento"
                value={pet.dataNascimento}
              />
              <DataField
                icon={<Weight className="w-3.5 h-3.5 text-teal" />}
                label="Peso"
                value={`${pet.peso} kg`}
              />
              <DataField
                icon={<Cpu className="w-3.5 h-3.5 text-teal" />}
                label="Microchip"
                value={pet.microchip ? pet.microchip.match(/.{1,3}/g)?.join(" ") ?? "" : "Não implantado"}
              />
              <DataField
                icon={<ShieldCheck className="w-3.5 h-3.5 text-teal" />}
                label="Idade"
                value={idadePet}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status de compliance */}
      <div className="px-5 space-y-4 pb-10">
        {/* Barra de progresso */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-navy">
              Status do passaporte
            </p>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                passedChecks === totalChecks
                  ? "bg-emerald-100 text-emerald-700"
                  : passedChecks >= 2
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {passedChecks}/{totalChecks}
            </span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(passedChecks / totalChecks) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`h-full rounded-full ${
                passedChecks === totalChecks
                  ? "bg-emerald-500"
                  : passedChecks >= 2
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            />
          </div>
        </motion.div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <VerificacaoItem
            ok={temMicrochip}
            label="Microchip ISO 11784/11785"
            detail={temMicrochip ? `Chip: ${pet.microchip}` : "Não registrado"}
          />
          <VerificacaoItem
            ok={temVacina}
            label="Vacina Antirrábica"
            detail={
              temVacina
                ? `Vacinado em ${pet.vacina?.data}${pet.vacina?.nomeComercial ? ` (${pet.vacina.nomeComercial})` : ""}`
                : "Não registrada"
            }
          />
          <VerificacaoItem
            ok={temSorologia}
            label="Sorologia Antirrábica"
            detail={
              temSorologia
                ? `${pet.sorologia?.data} · ${pet.sorologia?.valor}`
                : "Pendente"
            }
          />
        </motion.div>

        {/* Alertas */}
        {braqui && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>{pet.raca}</strong> é raça braquicefálica — restrições
              aplicáveis no transporte em porão na maioria das companhias aéreas.
            </p>
          </motion.div>
        )}

        {/* Documentos */}
        {documentos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm font-semibold text-navy mb-2">
              Documentos registrados ({documentos.length})
            </p>
            <div className="space-y-2">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy truncate">{doc.titulo}</p>
                    <p className="text-[10px] text-gray-400">
                      {doc.dataDocumento}
                      {doc.hashDocumento && ` · SHA: ${doc.hashDocumento.slice(0, 12)}…`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-gray-400">
            Verificado via iPet Pass · {new Date().toLocaleDateString("pt-BR")}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Confirme a autenticidade diretamente com o responsável
          </p>
        </div>
      </div>
    </div>
  );
}

function DataField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[9px] text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-navy font-medium">{value}</p>
      </div>
    </div>
  );
}

function VerificacaoItem({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
        ok
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${ok ? "text-emerald-700" : "text-red-600"}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500 truncate">{detail}</p>
      </div>
    </div>
  );
}
