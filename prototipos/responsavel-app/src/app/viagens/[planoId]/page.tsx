"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { calcularRoadmap, parseBR } from "@/services/travel-roadmap";
import { REGRAS_DESTINO } from "@/data/destinations";
import { CustoEstimado } from "@/components/CustoEstimado";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Plane,
  MapPin,
  FileText,
  Home as HomeIcon,
  Award,
  CalendarCheck,
  Stethoscope,
  Syringe,
  ScanLine,
  Building2,
  Trash2,
} from "lucide-react";

// ─── Tipos internos ───────────────────────────────────────────
type EstadoEstagio =
  | "CONCLUIDO"
  | "EM_ANDAMENTO"
  | "NAO_INICIADO"
  | "BLOQUEADO"
  | "ATENCAO";

interface Estagio {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  estado: EstadoEstagio;
  progresso?: { feito: number; total: number }; // para estágio 3
  ctaLabel?: string;
  ctaHref?: string;
  bloqueioMotivo?: string;
  servicoiPet?: { label: string; href: string; icon: string };
}

interface ProximaAcao {
  titulo: string;
  subtitulo: string;
  prazo?: string;
  urgente?: boolean;
  ctaPrimario: { label: string; href: string };
  ctaSecundario?: { label: string; href: string };
}

// ─── Helpers ──────────────────────────────────────────────────

function calcularEstagios(
  pet: ReturnType<typeof useAppStore.getState>["pets"][number],
  plano: ReturnType<typeof useAppStore.getState>["planosViagem"][number]
): { estagios: Estagio[]; progresso: number; proximaAcao: ProximaAcao } {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataEmbarque = parseBR(plano.dataEmbarque);
  const diasRestantes = differenceInDays(dataEmbarque, hoje);

  const regras = REGRAS_DESTINO[plano.destino];
  const roadmap = calcularRoadmap(pet, plano.destino, plano.dataEmbarque, plano.id);

  // ── Estagio 1: Pet cadastrado ──────────────────────────────
  const temMicrochipValido = !!(pet.microchip && pet.microchip.length === 15);
  const perfilCompleto = !!(
    pet.nome && pet.especie && pet.raca && pet.peso > 0 && pet.dataNascimento
  );
  const estagio1Concluido = perfilCompleto && (regras.exigeMicrochip ? temMicrochipValido : true);

  // ── Estagio 2: Destino definido ────────────────────────────
  // Sempre concluído — estamos dentro de um plano de viagem

  // ── Estagio 3: Documentação sanitária ─────────────────────
  const tarefasDocs = roadmap.tarefas.filter((t) => t.id !== "cvi");
  const docsConcluidos = tarefasDocs.filter((t) => t.concluida).length;
  const docsTotal = tarefasDocs.length;
  let estadoDoc: EstadoEstagio =
    docsConcluidos === docsTotal
      ? "CONCLUIDO"
      : docsConcluidos > 0
      ? "EM_ANDAMENTO"
      : "NAO_INICIADO";
  const temTarefaUrgente = tarefasDocs.some(
    (t) => t.status === "CRITICO" || t.status === "URGENTE"
  );
  if (estadoDoc !== "CONCLUIDO" && temTarefaUrgente) estadoDoc = "ATENCAO";

  // ── Estagio 4: Passagem comprada ───────────────────────────
  const temCompanhia = !!plano.companhiaAereaId;
  // companhia selecionada = "em andamento"; sem companhia = não iniciado
  const estado4: EstadoEstagio = temCompanhia ? "EM_ANDAMENTO" : "NAO_INICIADO";

  // ── Estagio 5: Hospedagem (opcional) ──────────────────────
  const estado5: EstadoEstagio = "NAO_INICIADO";

  // ── Estagio 6: CVI ────────────────────────────────────────
  const diasAntesCVI = regras.diasAntesCVI || 10;
  const diasParaJanelaCVI = diasRestantes - diasAntesCVI;
  const dentroJanelaCVI = diasRestantes <= diasAntesCVI && diasRestantes >= 2;
  const tarefaCVI = roadmap.tarefas.find((t) => t.id === "cvi");
  let estado6: EstadoEstagio;
  let bloqueioMotivoCVI: string | undefined;
  if (tarefaCVI?.concluida) {
    estado6 = "CONCLUIDO";
  } else if (diasRestantes < 2) {
    estado6 = "ATENCAO"; // prazo crítico
  } else if (dentroJanelaCVI) {
    estado6 = "EM_ANDAMENTO"; // janela aberta, pode emitir
  } else {
    estado6 = "BLOQUEADO";
    bloqueioMotivoCVI = `Disponível em ${diasParaJanelaCVI} dia${diasParaJanelaCVI !== 1 ? "s" : ""}`;
  }

  // ── Estagio 7: Pronto para embarcar ───────────────────────
  const estado7: EstadoEstagio =
    estagio1Concluido &&
    estadoDoc === "CONCLUIDO" &&
    estado6 === "CONCLUIDO"
      ? "CONCLUIDO"
      : "NAO_INICIADO";

  // ── Progresso geral ────────────────────────────────────────
  // 7 estágios, cada um vale ~14.3%. Estágio 3 é fracionado.
  const pesoEstagio = 100 / 7;
  let progressoTotal = 0;
  if (estagio1Concluido) progressoTotal += pesoEstagio;
  progressoTotal += pesoEstagio; // estágio 2 sempre concluído
  progressoTotal += pesoEstagio * (docsTotal > 0 ? docsConcluidos / docsTotal : 0);
  // Estágios 4 e 5 não têm estado CONCLUIDO ainda (sem campo de confirmação de compra/reserva)
  // Progresso parcial: companhia selecionada = 50% do peso do estágio
  if (temCompanhia) progressoTotal += pesoEstagio * 0.5;
  if (estado6 === "CONCLUIDO") progressoTotal += pesoEstagio;
  if (estado7 === "CONCLUIDO") progressoTotal += pesoEstagio;

  // ── Estágios ────────────────────────────────────────────────
  const estagios: Estagio[] = [
    {
      id: "pet",
      numero: 1,
      titulo: "Pet cadastrado",
      descricao: perfilCompleto
        ? temMicrochipValido
          ? `Microchip: ${pet.microchip}`
          : "Perfil completo. Microchip necessário para viagens internacionais."
        : "Complete o perfil do pet para continuar.",
      estado: estagio1Concluido
        ? "CONCLUIDO"
        : !perfilCompleto
        ? "EM_ANDAMENTO"
        : "ATENCAO",
      ctaLabel: estagio1Concluido ? undefined : "Completar perfil",
      ctaHref: estagio1Concluido ? undefined : `/pets/${pet.id}/editar`,
      servicoiPet:
        !temMicrochipValido && regras.exigeMicrochip
          ? {
              label: "Agendar implante de microchip",
              href: `/pets/${pet.id}/editar`,
              icon: "📡",
            }
          : undefined,
    },
    {
      id: "destino",
      numero: 2,
      titulo: "Destino e data definidos",
      descricao: `${regras.bandeira} ${regras.nome} · Embarque: ${plano.dataEmbarque}`,
      estado: "CONCLUIDO",
    },
    {
      id: "documentacao",
      numero: 3,
      titulo: "Documentação sanitária",
      descricao:
        estadoDoc === "CONCLUIDO"
          ? "Todos os documentos em ordem."
          : `${docsConcluidos} de ${docsTotal} ${docsTotal === 1 ? "item concluído" : "itens concluídos"}`,
      estado: estadoDoc,
      progresso: { feito: docsConcluidos, total: docsTotal },
      ctaLabel: estadoDoc !== "CONCLUIDO" ? "Ver roadmap completo" : undefined,
      ctaHref: estadoDoc !== "CONCLUIDO" ? `/viagem/${pet.id}` : undefined,
      servicoiPet: tarefasDocs.some((t) => !t.concluida && t.precisaClinica)
        ? {
            label: "Agendar com clínica parceira",
            href: `/viagem/${pet.id}`,
            icon: "🏥",
          }
        : undefined,
    },
    {
      id: "passagem",
      numero: 4,
      titulo: "Passagem aérea",
      descricao: temCompanhia
        ? "Companhia selecionada. Adicione o número do voo quando comprar."
        : "Compre a passagem ou registre a companhia aérea.",
      estado: estado4,
      ctaLabel: "Buscar voos",
      ctaHref: `/viagem/${pet.id}`,
      servicoiPet: {
        label: "Buscar voos que aceitam pets",
        href: `/viagem/${pet.id}`,
        icon: "✈️",
      },
    },
    {
      id: "hospedagem",
      numero: 5,
      titulo: "Hospedagem (opcional)",
      descricao: "Reserve um hotel pet-friendly no destino.",
      estado: estado5,
      ctaLabel: "Ver hotéis pet-friendly",
      ctaHref: "/",
      servicoiPet: {
        label: "Hotéis pet-friendly no destino",
        href: "/",
        icon: "🏨",
      },
    },
    {
      id: "cvi",
      numero: 6,
      titulo: "CVI emitido",
      descricao:
        estado6 === "BLOQUEADO"
          ? `Janela de emissão: ${diasAntesCVI} a 2 dias antes do embarque`
          : estado6 === "EM_ANDAMENTO"
          ? "Janela aberta! Emita agora com veterinário credenciado MAPA."
          : estado6 === "CONCLUIDO"
          ? "Certificado Veterinário Internacional emitido."
          : "Emita com urgência — prazo crítico.",
      estado: estado6,
      bloqueioMotivo: bloqueioMotivoCVI,
      ctaLabel: estado6 === "EM_ANDAMENTO" ? "Agendar emissão do CVI" : undefined,
      ctaHref: estado6 === "EM_ANDAMENTO" ? `/viagem/${pet.id}` : undefined,
      servicoiPet:
        estado6 === "EM_ANDAMENTO"
          ? {
              label: "iPet agenda o CVI por você",
              href: `/viagem/${pet.id}`,
              icon: "📋",
            }
          : undefined,
    },
    {
      id: "pronto",
      numero: 7,
      titulo: "Pronto para embarcar!",
      descricao:
        estado7 === "CONCLUIDO"
          ? "Tudo certo — aproveite a viagem! 🎉"
          : "Complete todos os estágios anteriores.",
      estado: estado7,
    },
  ];

  // ── Próxima ação ───────────────────────────────────────────
  let proximaAcao: ProximaAcao;

  if (estado7 === "CONCLUIDO") {
    proximaAcao = {
      titulo: "Tudo pronto para o embarque!",
      subtitulo: `${pet.nome.split(" ")[0]} está com toda a documentação em ordem. Boa viagem! 🎉`,
      ctaPrimario: { label: "Ver checklist de embarque", href: `/passaporte/${pet.id}` },
    };
  } else if (!estagio1Concluido) {
    proximaAcao = {
      titulo: "Complete o perfil do pet",
      subtitulo: !temMicrochipValido && perfilCompleto
        ? "Microchip ISO obrigatório para este destino. Implante antes de qualquer vacina."
        : "Adicione os dados completos do pet para começar o roadmap.",
      ctaPrimario: { label: "Completar perfil", href: `/pets/${pet.id}/editar` },
      ctaSecundario: !temMicrochipValido
        ? { label: "Agendar implante", href: `/pets/${pet.id}/editar` }
        : undefined,
    };
  } else if (estadoDoc !== "CONCLUIDO") {
    // Próxima tarefa do roadmap
    const proximaTarefa = tarefasDocs.find((t) => !t.concluida);
    const urgente = proximaTarefa?.status === "CRITICO" || proximaTarefa?.status === "URGENTE";
    proximaAcao = {
      titulo: proximaTarefa ? proximaTarefa.titulo : "Completar documentação",
      subtitulo: proximaTarefa?.nota ?? "Confira o roadmap completo.",
      prazo: proximaTarefa?.prazo
        ? `Prazo: ${proximaTarefa.prazo}`
        : undefined,
      urgente,
      ctaPrimario: { label: "Ver roadmap detalhado", href: `/viagem/${pet.id}` },
      ctaSecundario: proximaTarefa?.precisaClinica
        ? { label: "Agendar com clínica", href: `/viagem/${pet.id}` }
        : undefined,
    };
  } else if (estado4 === "NAO_INICIADO" || estado4 === "EM_ANDAMENTO") {
    proximaAcao = {
      titulo: "Compre a passagem aérea",
      subtitulo: "Confirme a companhia e o número do voo para garantir compliance com as regras do transportador.",
      ctaPrimario: { label: "Ver companhias que aceitam pets", href: `/viagem/${pet.id}` },
    };
  } else if (estado6 === "BLOQUEADO") {
    proximaAcao = {
      titulo: "Aguardando janela do CVI",
      subtitulo: `O Certificado Veterinário Internacional só pode ser emitido entre ${diasAntesCVI} e 2 dias antes do embarque.`,
      prazo: bloqueioMotivoCVI,
      ctaPrimario: { label: "Ver documentação preparatória", href: `/viagem/${pet.id}` },
    };
  } else if (estado6 === "EM_ANDAMENTO") {
    proximaAcao = {
      titulo: "Emita o CVI agora",
      subtitulo: "Janela aberta! Procure um veterinário credenciado pelo MAPA para emitir o Certificado Veterinário Internacional.",
      urgente: true,
      ctaPrimario: { label: "Agendar emissão do CVI", href: `/viagem/${pet.id}` },
    };
  } else {
    proximaAcao = {
      titulo: "Continue sua jornada",
      subtitulo: "Confira os estágios pendentes acima.",
      ctaPrimario: { label: "Ver roadmap", href: `/viagem/${pet.id}` },
    };
  }

  return {
    estagios,
    progresso: Math.round(Math.min(progressoTotal, 100)),
    proximaAcao,
  };
}

// ─── Ícones por estágio ────────────────────────────────────────
const ICONES_ESTAGIO = [
  <ScanLine key={1} className="w-4 h-4" />,
  <MapPin key={2} className="w-4 h-4" />,
  <Syringe key={3} className="w-4 h-4" />,
  <Plane key={4} className="w-4 h-4" />,
  <Building2 key={5} className="w-4 h-4" />,
  <FileText key={6} className="w-4 h-4" />,
  <Award key={7} className="w-4 h-4" />,
];

// ─── Componente principal ─────────────────────────────────────

export default function JourneyHubPage({
  params,
}: {
  params: Promise<{ planoId: string }>;
}) {
  const { planoId } = use(params);
  const router = useRouter();
  const plano = useAppStore((s) => s.planosViagem.find((p) => p.id === planoId));
  const pet = useAppStore((s) => s.pets.find((p) => p.id === plano?.petId));
  const removerPlanoViagem = useAppStore((s) => s.removerPlanoViagem);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  function excluirViagem() {
    removerPlanoViagem(planoId);
    router.replace("/viagens");
  }

  const { estagios, progresso, proximaAcao } = useMemo(() => {
    if (!pet || !plano) return { estagios: [], progresso: 0, proximaAcao: null as unknown as ProximaAcao };
    return calcularEstagios(pet, plano);
  }, [pet, plano]);

  if (!plano || !pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Viagem não encontrada.</p>
      </div>
    );
  }

  const regras = REGRAS_DESTINO[plano.destino];
  const dataEmbarque = parseBR(plano.dataEmbarque);
  const diasRestantes = differenceInDays(dataEmbarque, new Date());
  const dataFormatada = format(dataEmbarque, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex flex-col min-h-screen pb-10">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-5">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Identidade da viagem */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {pet.nome.split(" ")[0]} → {regras.bandeira} {regras.nome}
            </p>
            <h1 className="text-xl font-bold text-navy mt-0.5">Jornada da Viagem</h1>
          </div>
          <div className="bg-gray-100 rounded-2xl px-3 py-2 text-right">
            <p className="text-xs text-gray-400">Embarque</p>
            <p className="text-sm font-semibold text-teal">
              {diasRestantes > 0 ? `em ${diasRestantes}d` : diasRestantes === 0 ? "hoje!" : "passou"}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-1">✈️ {dataFormatada}</p>
      </header>

      <main className="px-5 space-y-5 flex-1">
        {/* ── Barra de progresso ─────────────────────────────────── */}
        <ProgressCard progresso={progresso} />

        {/* ── Próxima ação ───────────────────────────────────────── */}
        {proximaAcao && <ProximaAcaoCard acao={proximaAcao} />}

        {/* ── Estágios ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
            Sua Jornada
          </h2>
          <div className="space-y-2">
            {estagios.map((estagio, idx) => (
              <EstagioCard
                key={estagio.id}
                estagio={estagio}
                icone={ICONES_ESTAGIO[idx]}
                petId={pet.id}
              />
            ))}
          </div>
        </section>

        {/* ── Estimativa de custo ────────────────────────────────── */}
        <CustoEstimado pet={pet} destino={plano.destino} compacto />

        {/* ── Link para o passaporte ─────────────────────────────── */}
        <Link
          href={`/passaporte/${pet.id}`}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-4"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-navy">Passaporte do Pet</p>
            <p className="text-xs text-gray-500">Documentos, vacinas e histórico de saúde</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        {/* ── Excluir viagem ─────────────────────────────────────── */}
        {!confirmandoExclusao ? (
          <button
            onClick={() => setConfirmandoExclusao(true)}
            className="flex items-center justify-center gap-2 w-full py-3 text-gray-400 hover:text-red-500 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir esta viagem
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm text-red-500 font-medium text-center">
              Excluir viagem para {regras.bandeira} {regras.nome}?
            </p>
            <p className="text-xs text-gray-400 text-center">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={excluirViagem}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setConfirmandoExclusao(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────

function ProgressCard({ progresso }: { progresso: number }) {
  const cor =
    progresso >= 80 ? "from-emerald-500 to-teal-400" :
    progresso >= 40 ? "from-teal-dark to-teal-dark" :
    "from-orange-500 to-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">Progresso da jornada</p>
        <p className={`text-sm font-bold bg-gradient-to-r ${cor} bg-clip-text text-transparent`}>
          {progresso}%
        </p>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progresso}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${cor}`}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {progresso < 100
          ? `${100 - progresso}% restante para estar pronto para embarcar`
          : "Pronto para o embarque! 🎉"}
      </p>
    </motion.div>
  );
}

function ProximaAcaoCard({ acao }: { acao: ProximaAcao }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`rounded-2xl p-4 border ${
        acao.urgente
          ? "bg-orange-50 border-orange-200"
          : "bg-teal/5 border-teal/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <CalendarCheck
          className={`w-4 h-4 ${acao.urgente ? "text-ipet-orange" : "text-teal"}`}
        />
        <p className={`text-xs font-semibold uppercase tracking-wider ${
          acao.urgente ? "text-ipet-orange" : "text-teal"
        }`}>
          {acao.urgente ? "Ação urgente" : "Próxima ação"}
        </p>
        {acao.prazo && (
          <span className="ml-auto text-xs text-gray-400">{acao.prazo}</span>
        )}
      </div>

      <p className="text-navy font-semibold text-sm mb-0.5">{acao.titulo}</p>
      <p className="text-gray-500 text-xs leading-relaxed mb-3">{acao.subtitulo}</p>

      <div className="flex gap-2">
        <Link
          href={acao.ctaPrimario.href}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            acao.urgente
              ? "bg-ipet-orange hover:bg-orange-400 text-white"
              : "bg-teal hover:bg-teal-dark text-white"
          }`}
        >
          {acao.ctaPrimario.label}
          <ChevronRight className="w-4 h-4" />
        </Link>
        {acao.ctaSecundario && (
          <Link
            href={acao.ctaSecundario.href}
            className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-600 transition-colors"
          >
            {acao.ctaSecundario.label}
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function EstagioCard({
  estagio,
  icone,
  petId,
}: {
  estagio: Estagio;
  icone: React.ReactNode;
  petId: string;
}) {
  const config = {
    CONCLUIDO: {
      bg: "bg-emerald-950/30 border-emerald-800/40",
      iconBg: "bg-emerald-900/50",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-300",
      badge: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
    EM_ANDAMENTO: {
      bg: "bg-teal/5 border-teal/20",
      iconBg: "bg-teal/10",
      iconColor: "text-teal",
      titleColor: "text-navy",
      badge: <Loader2 className="w-5 h-5 text-teal animate-spin" />,
    },
    NAO_INICIADO: {
      bg: "bg-white border-gray-200",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-400",
      titleColor: "text-gray-500",
      badge: <Circle className="w-5 h-5 text-gray-300" />,
    },
    BLOQUEADO: {
      bg: "bg-white/60 border-gray-200",
      iconBg: "bg-gray-100/60",
      iconColor: "text-gray-400",
      titleColor: "text-gray-400",
      badge: <Lock className="w-5 h-5 text-gray-400" />,
    },
    ATENCAO: {
      bg: "bg-orange-950/30 border-orange-800/40",
      iconBg: "bg-orange-900/40",
      iconColor: "text-ipet-orange",
      titleColor: "text-navy",
      badge: <AlertTriangle className="w-5 h-5 text-ipet-orange" />,
    },
  } as const;

  const c = config[estagio.estado];
  const isInteractive =
    estagio.ctaHref &&
    (estagio.estado === "EM_ANDAMENTO" || estagio.estado === "ATENCAO" || estagio.estado === "NAO_INICIADO");

  const inner = (
    <div className={`rounded-2xl border p-4 ${c.bg}`}>
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
          <span className={c.iconColor}>{icone}</span>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Etapa {estagio.numero}
            </p>
          </div>
          <p className={`text-sm font-semibold ${c.titleColor}`}>{estagio.titulo}</p>

          {/* Barra de progresso para estágio 3 */}
          {estagio.progresso && estagio.progresso.total > 0 && estagio.estado !== "CONCLUIDO" && (
            <div className="mt-2 mb-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">
                  {estagio.progresso.feito} / {estagio.progresso.total}
                </p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal transition-all duration-500"
                  style={{
                    width: `${(estagio.progresso.feito / estagio.progresso.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 leading-relaxed mt-1">{estagio.descricao}</p>

          {/* Motivo do bloqueio */}
          {estagio.bloqueioMotivo && (
            <p className="text-xs text-gray-400 mt-1">🔒 {estagio.bloqueioMotivo}</p>
          )}

          {/* Serviço iPet contextual */}
          {estagio.servicoiPet && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-1.5">
              <span className="text-sm">{estagio.servicoiPet.icon}</span>
              <span className="text-xs text-indigo-600 font-medium">
                {estagio.servicoiPet.label}
              </span>
            </div>
          )}
        </div>

        {/* Badge de status */}
        <div className="flex-shrink-0">{c.badge}</div>
      </div>

      {/* CTA inline */}
      {isInteractive && estagio.ctaHref && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <Link
            href={estagio.ctaHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between text-xs font-medium text-teal hover:text-teal transition-colors"
          >
            {estagio.ctaLabel ?? "Ver detalhes"}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: estagio.numero * 0.05 }}
    >
      {inner}
    </motion.div>
  );
}
