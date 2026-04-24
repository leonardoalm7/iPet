"use client";

import { use, useMemo, useState, useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import { REGRAS_DESTINO } from "@/data/destinations";
import { COMPANHIAS_AEREAS } from "@/data/airlines";
import { isBraquicefalico } from "@/data/braquicefalicos";
import { parseBR } from "@/services/travel-roadmap";
import { track } from "@/services/analytics";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plane,
  Clock,
  Phone,
  ChevronRight,
  ShieldCheck,
  Info,
  Lock,
} from "lucide-react";

interface ItemChecklist {
  id: string;
  categoria: string;
  titulo: string;
  detalhe: string;
  obrigatorio: boolean;
  dica?: string;
}

function gerarChecklist(
  pet: ReturnType<typeof useAppStore.getState>["pets"][number],
  plano: ReturnType<typeof useAppStore.getState>["planosViagem"][number]
): ItemChecklist[] {
  const regras = REGRAS_DESTINO[plano.destino];
  const cia = plano.companhiaAereaId
    ? COMPANHIAS_AEREAS.find((c) => c.id === plano.companhiaAereaId)
    : null;
  const braqui = isBraquicefalico(pet.raca);
  const internacional = plano.destino !== "BRASIL";
  const items: ItemChecklist[] = [];

  // ── Documentação ──────────────────────────────────────────
  items.push({
    id: "doc-vacina",
    categoria: "📋 Documentação",
    titulo: "Carteira de vacinação original",
    detalhe: "Vacina antirrábica válida com mínimo 21 dias de carência",
    obrigatorio: true,
    dica: "Leve a original + uma cópia. Foto no celular como backup.",
  });

  if (regras.exigeMicrochip) {
    items.push({
      id: "doc-microchip",
      categoria: "📋 Documentação",
      titulo: "Certificado do microchip",
      detalhe: `Microchip ISO 11784/11785 — ${pet.microchip || "não registrado"}`,
      obrigatorio: true,
    });
  }

  if (regras.exigeSorologia) {
    items.push({
      id: "doc-sorologia",
      categoria: "📋 Documentação",
      titulo: "Resultado da sorologia antirrábica",
      detalhe: `Titulação ≥ 0.5 UI/mL com carência de ${regras.diasCarenciaSorologia} dias`,
      obrigatorio: true,
    });
  }

  if (regras.exigeCVI) {
    items.push({
      id: "doc-cvi",
      categoria: "📋 Documentação",
      titulo: "CVI — Certificado Veterinário Internacional",
      detalhe: `Emitido entre ${regras.diasAntesCVI} e 2 dias antes do embarque`,
      obrigatorio: true,
      dica: "Documento emitido por vet habilitado MAPA e endossado pela VIGIAGRO.",
    });
  }

  if (internacional) {
    items.push({
      id: "doc-passaporte-tutor",
      categoria: "📋 Documentação",
      titulo: "Passaporte do tutor (válido)",
      detalhe: "Verifique validade mínima de 6 meses para a maioria dos destinos",
      obrigatorio: true,
    });
  }

  items.push({
    id: "doc-atestado",
    categoria: "📋 Documentação",
    titulo: "Atestado de saúde veterinário",
    detalhe: "Emitido em até 10 dias antes do embarque",
    obrigatorio: !internacional,
    dica: "Algumas companhias exigem mesmo para voos domésticos.",
  });

  // ── Caixa de transporte ───────────────────────────────────
  items.push({
    id: "caixa-aprovada",
    categoria: "📦 Caixa de Transporte",
    titulo: "Caixa de transporte aprovada (IATA)",
    detalhe: cia
      ? `${cia.nome}: máx ${cia.dimensoesMaxCabine.comprimento}×${cia.dimensoesMaxCabine.largura}×${cia.dimensoesMaxCabine.altura}cm`
      : "Verifique dimensões máximas da sua companhia",
    obrigatorio: true,
    dica: "A caixa deve permitir que o pet fique em pé, se vire e se deite.",
  });

  items.push({
    id: "caixa-identificacao",
    categoria: "📦 Caixa de Transporte",
    titulo: "Identificação na caixa",
    detalhe: "Nome do pet, nome do tutor, telefone e destino",
    obrigatorio: true,
  });

  items.push({
    id: "caixa-absorvente",
    categoria: "📦 Caixa de Transporte",
    titulo: "Tapete absorvente dentro da caixa",
    detalhe: "Para conforto e higiene durante o voo",
    obrigatorio: false,
  });

  // ── Pet ───────────────────────────────────────────────────
  items.push({
    id: "pet-jejum",
    categoria: "🐾 Preparação do Pet",
    titulo: "Jejum alimentar (2-3h antes)",
    detalhe: "Evita enjoo durante o voo. Água liberada até 1h antes.",
    obrigatorio: false,
    dica: "Filhotes e pets com condições médicas: consulte o veterinário.",
  });

  items.push({
    id: "pet-passeio",
    categoria: "🐾 Preparação do Pet",
    titulo: "Passeio antes do aeroporto",
    detalhe: "Permita que o pet faça as necessidades antes de entrar na caixa",
    obrigatorio: false,
  });

  if (braqui) {
    items.push({
      id: "pet-braqui",
      categoria: "🐾 Preparação do Pet",
      titulo: "⚠️ Atenção: raça braquicefálica",
      detalhe: `${pet.raca} tem risco respiratório elevado — evite calor e estresse`,
      obrigatorio: true,
      dica: "Mantenha a caixa ventilada. Informe a companhia no check-in.",
    });
  }

  // ── No aeroporto ──────────────────────────────────────────
  items.push({
    id: "aero-antecedencia",
    categoria: "✈️ No Aeroporto",
    titulo: "Chegar com 3h de antecedência (internacional) ou 2h (doméstico)",
    detalhe: internacional
      ? "Check-in de animais demora mais — antecipe-se"
      : "Chegue cedo para o check-in com pet",
    obrigatorio: true,
  });

  items.push({
    id: "aero-checkin",
    categoria: "✈️ No Aeroporto",
    titulo: "Check-in no balcão (não no totem)",
    detalhe: "Animais exigem check-in presencial com documentos",
    obrigatorio: true,
    dica: "Informe que está viajando com animal de estimação.",
  });

  items.push({
    id: "aero-taxa",
    categoria: "✈️ No Aeroporto",
    titulo: "Pagar taxa de embarque do pet",
    detalhe: cia ? `${cia.nome} — verifique o valor no site ou balcão` : "Valor varia por companhia e rota",
    obrigatorio: true,
  });

  if (internacional) {
    items.push({
      id: "aero-vigiagro",
      categoria: "✈️ No Aeroporto",
      titulo: "Passar pela VIGIAGRO / fiscalização sanitária",
      detalhe: "Apresentar CVI e documentos sanitários para endosso",
      obrigatorio: true,
      dica: "O posto VIGIAGRO fica antes da área de embarque. Localize-o ao chegar.",
    });
  }

  items.push({
    id: "aero-seguranca",
    categoria: "✈️ No Aeroporto",
    titulo: "Raio-X: pet sai da caixa (cabine)",
    detalhe: "Na inspeção de segurança, retire o pet da caixa e passe a caixa no raio-X",
    obrigatorio: pet.peso <= (cia?.pesoMaxCabine ?? 10),
    dica: "Use coleira e guia curta. Tenha cuidado em ambientes barulhentos.",
  });

  // ── Itens de conforto ─────────────────────────────────────
  items.push({
    id: "conforto-agua",
    categoria: "🎒 Itens de Conforto",
    titulo: "Água e potinho portátil",
    detalhe: "Para hidratar o pet durante conexões ou espera",
    obrigatorio: false,
  });

  items.push({
    id: "conforto-petisco",
    categoria: "🎒 Itens de Conforto",
    titulo: "Petiscos e ração (porção pequena)",
    detalhe: "Para voos longos ou conexões — embalar separado",
    obrigatorio: false,
  });

  items.push({
    id: "conforto-brinquedo",
    categoria: "🎒 Itens de Conforto",
    titulo: "Brinquedo ou item familiar",
    detalhe: "Algo com o cheiro do tutor para reduzir ansiedade",
    obrigatorio: false,
  });

  items.push({
    id: "conforto-saco",
    categoria: "🎒 Itens de Conforto",
    titulo: "Sacos plásticos e lenços",
    detalhe: "Para limpeza de emergência",
    obrigatorio: false,
  });

  return items;
}

export default function EmbarquePage({
  params,
}: {
  params: Promise<{ planoId: string }>;
}) {
  const { planoId } = use(params);
  const plano = useAppStore((s) => s.planosViagem.find((p) => p.id === planoId));
  const pet = useAppStore((s) => s.pets.find((p) => p.id === plano?.petId));

  const [marcados, setMarcados] = useState<Record<string, boolean>>({});

  const toggleItem = useCallback((id: string) => {
    setMarcados((prev) => {
      const wasChecked = prev[id];
      if (!wasChecked && plano) {
        track("tarefa_concluida", { tarefaId: id, destino: plano.destino });
      }
      return { ...prev, [id]: !wasChecked };
    });
  }, [plano]);

  const checklist = useMemo(() => {
    if (!pet || !plano) return [];
    return gerarChecklist(pet, plano);
  }, [pet, plano]);

  const categorias = useMemo(() => {
    const map = new Map<string, ItemChecklist[]>();
    for (const item of checklist) {
      const lista = map.get(item.categoria) ?? [];
      lista.push(item);
      map.set(item.categoria, lista);
    }
    return Array.from(map.entries());
  }, [checklist]);

  const totalObrigatorios = checklist.filter((i) => i.obrigatorio).length;
  const marcadosObrigatorios = checklist.filter(
    (i) => i.obrigatorio && marcados[i.id]
  ).length;
  const totalMarcados = Object.values(marcados).filter(Boolean).length;
  const progresso =
    totalObrigatorios > 0
      ? Math.round((marcadosObrigatorios / totalObrigatorios) * 100)
      : 0;

  if (!plano || !pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Viagem não encontrada.</p>
      </div>
    );
  }

  if (!plano.isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center border border-border">
          <Lock className="w-7 h-7 text-gray-300" />
        </div>
        <h1 className="text-lg font-semibold text-navy">Checklist Premium</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          O checklist de embarque está disponível no iPet Travel Plan.
          Desbloqueie para ter acesso ao passo a passo completo do dia do voo.
        </p>
        <Link
          href={`/checkout/${plano.id}`}
          className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
        >
          <Lock className="w-4 h-4" />
          Desbloquear por R$ 99
        </Link>
        <button
          onClick={() => history.back()}
          className="text-gray-400 text-sm hover:text-navy transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  const regras = REGRAS_DESTINO[plano.destino];
  const dataEmbarque = parseBR(plano.dataEmbarque);
  const diasRestantes = differenceInDays(dataEmbarque, new Date());
  const dataFormatada = format(dataEmbarque, "d 'de' MMMM", { locale: ptBR });

  return (
    <div className="flex flex-col min-h-screen pb-10">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <Link
          href={`/viagens/${planoId}`}
          className="flex items-center gap-1 text-teal text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Jornada da Viagem
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plane className="w-6 h-6 text-teal" />
              <h1 className="text-2xl font-bold text-navy">Checklist de Embarque</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {pet.nome.split(" ")[0]} → {regras.bandeira} {regras.nome}
            </p>
          </div>
          <div className="bg-surface rounded-2xl px-3 py-2 text-right">
            <p className="text-xs text-gray-400">Embarque</p>
            <p className="text-sm font-semibold text-teal">
              {diasRestantes === 0
                ? "Hoje!"
                : diasRestantes > 0
                ? `em ${diasRestantes}d`
                : "Passou"}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-1">✈️ {dataFormatada}</p>
      </header>

      <main className="px-5 space-y-4 flex-1">
        {/* Barra de progresso */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-navy">
              Itens obrigatórios: {marcadosObrigatorios}/{totalObrigatorios}
            </p>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                progresso === 100
                  ? "bg-emerald-100 text-emerald-700"
                  : progresso >= 50
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {progresso}%
            </span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                progresso === 100 ? "bg-emerald-500" : "bg-teal"
              }`}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            {totalMarcados} de {checklist.length} itens marcados (incluindo opcionais)
          </p>
        </motion.div>

        {/* Pronto para embarcar */}
        <AnimatePresence>
          {progresso === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center"
            >
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-700">
                Todos os itens obrigatórios conferidos!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pet.nome.split(" ")[0]} está pronto para embarcar. Boa viagem! 🎉
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categorias + itens */}
        {categorias.map(([categoria, items], catIdx) => (
          <motion.section
            key={categoria}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.08 }}
          >
            <h2 className="text-sm font-semibold text-navy mb-2">{categoria}</h2>
            <div className="space-y-1.5">
              {items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  checked={!!marcados[item.id]}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </motion.section>
        ))}

        {/* Dica final */}
        <div className="flex items-start gap-2 bg-teal/5 border border-teal/20 rounded-2xl p-3.5">
          <Info className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 leading-relaxed">
            <p>
              <strong className="text-teal">Dica iPet:</strong> Tire foto de todos
              os documentos antes de sair de casa. Em caso de perda, a versão
              digital pode agilizar o atendimento.
            </p>
            <p className="mt-1">
              Em caso de dúvida no aeroporto, ligue para a companhia aérea ou
              procure o posto VIGIAGRO.
            </p>
          </div>
        </div>

        {/* Contatos úteis */}
        <div className="bg-white border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-navy mb-3">📞 Contatos úteis</p>
          <div className="space-y-2 text-xs">
            <ContatoRow label="VIGIAGRO (Vigilância Agropecuária)" tel="(61) 3218-2574" />
            <ContatoRow label="ANAC (Agência Nacional de Aviação)" tel="163" />
            <ContatoRow label="MAPA (Ministério da Agricultura)" tel="0800-704-1995" />
          </div>
        </div>
      </main>
    </div>
  );
}

function ChecklistItem({
  item,
  checked,
  onToggle,
}: {
  item: ItemChecklist;
  checked: boolean;
  onToggle: () => void;
}) {
  const [showDica, setShowDica] = useState(false);

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        checked
          ? "bg-emerald-50/50 border-emerald-200"
          : item.obrigatorio
          ? "bg-white border-border"
          : "bg-gray-50/50 border-gray-100"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-start gap-3 w-full text-left"
      >
        {checked ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Circle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              item.obrigatorio ? "text-gray-300" : "text-gray-200"
            }`}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-medium ${
                checked ? "text-emerald-700 line-through" : "text-navy"
              }`}
            >
              {item.titulo}
            </p>
            {item.obrigatorio && !checked && (
              <span className="text-[9px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                Obrigatório
              </span>
            )}
            {!item.obrigatorio && (
              <span className="text-[9px] text-gray-400">Opcional</span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${checked ? "text-gray-400" : "text-gray-400"}`}>
            {item.detalhe}
          </p>
        </div>
      </button>

      {item.dica && (
        <>
          <button
            onClick={() => setShowDica(!showDica)}
            className="flex items-center gap-1 text-[10px] text-teal mt-2 ml-8"
          >
            <Info className="w-3 h-3" />
            {showDica ? "Ocultar dica" : "Ver dica"}
          </button>
          <AnimatePresence>
            {showDica && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] text-teal bg-teal/5 rounded-lg px-3 py-2 ml-8 mt-1"
              >
                💡 {item.dica}
              </motion.p>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function ContatoRow({ label, tel }: { label: string; tel: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <a
        href={`tel:${tel.replace(/\D/g, "")}`}
        className="flex items-center gap-1 text-teal font-medium"
      >
        <Phone className="w-3 h-3" />
        {tel}
      </a>
    </div>
  );
}
