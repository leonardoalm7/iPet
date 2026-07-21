"use client";

import { use, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  useAppStore,
  REGRAS_DESTINO,
  COMPANHIAS_AEREAS,
  isBraquicefalico,
  parseBR,
  verificarCompanhia,
} from "@ipet/core";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plane,
  Phone,
  ShieldCheck,
  Info,
  Lock,
  FileText,
  Package,
  PawPrint,
  Briefcase,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

type Categoria = "DOCUMENTACAO" | "CAIXA" | "PET" | "AEROPORTO" | "CONFORTO";

interface ItemChecklist {
  id: string;
  categoria: Categoria;
  titulo: string;
  detalhe: string;
  obrigatorio: boolean;
  dica?: string;
  alerta?: boolean;
}

const CATEGORIA_META: Record<
  Categoria,
  { label: string; Icon: typeof FileText }
> = {
  DOCUMENTACAO: { label: "Documentação", Icon: FileText },
  CAIXA: { label: "Caixa de transporte", Icon: Package },
  PET: { label: "Preparação do pet", Icon: PawPrint },
  AEROPORTO: { label: "No aeroporto", Icon: Plane },
  CONFORTO: { label: "Itens de conforto", Icon: Briefcase },
};

const CATEGORIA_ORDEM: Categoria[] = [
  "DOCUMENTACAO",
  "CAIXA",
  "PET",
  "AEROPORTO",
  "CONFORTO",
];

function gerarChecklist(
  pet: ReturnType<typeof useAppStore.getState>["pets"][number],
  plano: ReturnType<typeof useAppStore.getState>["planosViagem"][number],
  vaiNaCabine: boolean,
): ItemChecklist[] {
  const regras = REGRAS_DESTINO[plano.destino];
  const cia = plano.companhiaAereaId
    ? COMPANHIAS_AEREAS.find((c) => c.id === plano.companhiaAereaId)
    : null;
  const braqui = isBraquicefalico(pet.raca);
  const internacional = plano.destino !== "BRASIL";
  const items: ItemChecklist[] = [];

  items.push({
    id: "doc-vacina",
    categoria: "DOCUMENTACAO",
    titulo: "Carteira de vacinação original",
    detalhe: "Vacina antirrábica válida com mínimo 21 dias de carência",
    obrigatorio: true,
    dica: "Leve a original + uma cópia. Foto no celular como backup.",
  });
  if (regras.exigeMicrochip) {
    items.push({
      id: "doc-microchip",
      categoria: "DOCUMENTACAO",
      titulo: "Certificado do microchip",
      detalhe: `Microchip ISO 11784/11785 — ${pet.microchip || "não registrado"}`,
      obrigatorio: true,
    });
  }
  if (regras.exigeSorologia) {
    items.push({
      id: "doc-sorologia",
      categoria: "DOCUMENTACAO",
      titulo: "Resultado da sorologia antirrábica",
      detalhe: `Titulação ≥ 0.5 UI/mL com carência de ${regras.diasCarenciaSorologia} dias`,
      obrigatorio: true,
    });
  }
  if (regras.exigeCVI) {
    items.push({
      id: "doc-cvi",
      categoria: "DOCUMENTACAO",
      titulo: "CVI — Certificado Veterinário Internacional",
      detalhe: `Emitido entre ${regras.diasAntesCVI} e 2 dias antes do embarque`,
      obrigatorio: true,
      dica: "Documento emitido por vet habilitado MAPA e endossado pela VIGIAGRO.",
    });
  }
  if (internacional) {
    items.push({
      id: "doc-passaporte-tutor",
      categoria: "DOCUMENTACAO",
      titulo: "Passaporte do tutor (válido)",
      detalhe: "Verifique validade mínima de 6 meses para a maioria dos destinos",
      obrigatorio: true,
    });
  }
  items.push({
    id: "doc-atestado",
    categoria: "DOCUMENTACAO",
    titulo: "Atestado de saúde veterinário",
    detalhe: "Emitido em até 10 dias antes do embarque",
    obrigatorio: !internacional,
    dica: "Algumas companhias exigem mesmo para voos domésticos.",
  });

  items.push({
    id: "caixa-aprovada",
    categoria: "CAIXA",
    titulo: "Caixa de transporte aprovada (IATA)",
    detalhe: cia
      ? `${cia.nome}: máx ${cia.dimensoesMaxCabine.comprimento}×${cia.dimensoesMaxCabine.largura}×${cia.dimensoesMaxCabine.altura}cm`
      : "Verifique dimensões máximas da sua companhia",
    obrigatorio: true,
    dica: "A caixa deve permitir que o pet fique em pé, se vire e se deite.",
  });
  items.push({
    id: "caixa-identificacao",
    categoria: "CAIXA",
    titulo: "Identificação na caixa",
    detalhe: "Nome do pet, nome do tutor, telefone e destino",
    obrigatorio: true,
  });
  items.push({
    id: "caixa-absorvente",
    categoria: "CAIXA",
    titulo: "Tapete absorvente dentro da caixa",
    detalhe: "Para conforto e higiene durante o voo",
    obrigatorio: false,
  });

  items.push({
    id: "pet-jejum",
    categoria: "PET",
    titulo: "Jejum alimentar (2-3h antes)",
    detalhe: "Evita enjoo durante o voo. Água liberada até 1h antes.",
    obrigatorio: false,
    dica: "Filhotes e pets com condições médicas: consulte o veterinário.",
  });
  items.push({
    id: "pet-passeio",
    categoria: "PET",
    titulo: "Passeio antes do aeroporto",
    detalhe: "Permita que o pet faça as necessidades antes de entrar na caixa",
    obrigatorio: false,
  });
  if (braqui) {
    items.push({
      id: "pet-braqui",
      categoria: "PET",
      titulo: "Atenção: raça braquicefálica",
      detalhe: `${pet.raca} tem risco respiratório elevado — evite calor e estresse`,
      obrigatorio: true,
      alerta: true,
      dica: "Mantenha a caixa ventilada. Informe a companhia no check-in.",
    });
  }

  items.push({
    id: "aero-antecedencia",
    categoria: "AEROPORTO",
    titulo: internacional
      ? "Chegar com 3h de antecedência"
      : "Chegar com 2h de antecedência",
    detalhe: internacional
      ? "Check-in de animais demora mais — antecipe-se"
      : "Chegue cedo para o check-in com pet",
    obrigatorio: true,
  });
  items.push({
    id: "aero-checkin",
    categoria: "AEROPORTO",
    titulo: "Check-in no balcão (não no totem)",
    detalhe: "Animais exigem check-in presencial com documentos",
    obrigatorio: true,
    dica: "Informe que está viajando com animal de estimação.",
  });
  items.push({
    id: "aero-taxa",
    categoria: "AEROPORTO",
    titulo: "Pagar taxa de embarque do pet",
    detalhe: cia
      ? `${cia.nome} — verifique o valor no site ou balcão`
      : "Valor varia por companhia e rota",
    obrigatorio: true,
  });
  if (internacional) {
    items.push({
      id: "aero-vigiagro",
      categoria: "AEROPORTO",
      titulo: "Passar pela VIGIAGRO / fiscalização sanitária",
      detalhe: "Apresentar CVI e documentos sanitários para endosso",
      obrigatorio: true,
      dica: "O posto VIGIAGRO fica antes da área de embarque.",
    });
  }
  if (vaiNaCabine) {
    items.push({
      id: "aero-seguranca",
      categoria: "AEROPORTO",
      titulo: "Raio-X: pet sai da caixa",
      detalhe: "Na inspeção, retire o pet da caixa e passe a caixa no raio-X",
      obrigatorio: true,
      dica: "Use coleira e guia curta. Cuidado com ambientes barulhentos.",
    });
  } else {
    items.push({
      id: "aero-porao-entrega",
      categoria: "AEROPORTO",
      titulo: "Entregar pet na guarda de bagagem",
      detalhe: "Dirigir-se ao balcão de despacho de bagagem/oversized",
      obrigatorio: true,
      dica: "O pet será mantido em temperatura controlada no porão.",
    });
    items.push({
      id: "aero-porao-iata",
      categoria: "AEROPORTO",
      titulo: "Caixa rígida IATA obrigatória (porão)",
      detalhe: "Caixa mole/soft não é aceita. Confirmar modelo aprovado",
      obrigatorio: true,
    });
  }

  items.push({
    id: "conforto-agua",
    categoria: "CONFORTO",
    titulo: "Água e potinho portátil",
    detalhe: "Para hidratar o pet durante conexões ou espera",
    obrigatorio: false,
  });
  items.push({
    id: "conforto-petisco",
    categoria: "CONFORTO",
    titulo: "Petiscos e ração (porção pequena)",
    detalhe: "Para voos longos ou conexões — embalar separado",
    obrigatorio: false,
  });
  items.push({
    id: "conforto-brinquedo",
    categoria: "CONFORTO",
    titulo: "Brinquedo ou item familiar",
    detalhe: "Algo com o cheiro do tutor para reduzir ansiedade",
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
  const plano = useAppStore((s) =>
    s.planosViagem.find((p) => p.id === planoId),
  );
  const pet = useAppStore((s) =>
    plano ? s.pets.find((p) => p.id === s.getPrimeiroPetIdDoPlano(plano.id)) : undefined,
  );

  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const toggleItem = useCallback((id: string) => {
    setMarcados((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const vaiNaCabine = useMemo(() => {
    if (!pet || !plano) return true;
    const cia = plano.companhiaAereaId
      ? COMPANHIAS_AEREAS.find((c) => c.id === plano.companhiaAereaId)
      : null;
    if (!cia) return pet.peso <= 10;
    return verificarCompanhia(pet, cia).cabine;
  }, [pet, plano]);

  const checklist = useMemo(
    () => (pet && plano ? gerarChecklist(pet, plano, vaiNaCabine) : []),
    [pet, plano, vaiNaCabine],
  );

  const categorias = useMemo(() => {
    const map = new Map<Categoria, ItemChecklist[]>();
    for (const item of checklist) {
      const lista = map.get(item.categoria) ?? [];
      lista.push(item);
      map.set(item.categoria, lista);
    }
    return CATEGORIA_ORDEM.flatMap((cat) => {
      const items = map.get(cat);
      return items ? [[cat, items] as const] : [];
    });
  }, [checklist]);

  const totalObrigatorios = checklist.filter((i) => i.obrigatorio).length;
  const marcadosObrigatorios = checklist.filter(
    (i) => i.obrigatorio && marcados[i.id],
  ).length;
  const totalMarcados = Object.values(marcados).filter(Boolean).length;
  const progresso =
    totalObrigatorios > 0
      ? Math.round((marcadosObrigatorios / totalObrigatorios) * 100)
      : 0;

  if (!plano || !pet) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted text-[13px]">Viagem não encontrada.</p>
      </div>
    );
  }

  if (!plano.isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md mx-auto"
      >
        <article className="relative overflow-hidden rounded-3xl bg-ink text-bone p-10 text-center">
          <div aria-hidden className="absolute inset-0 paper-grain opacity-70" />
          <div
            aria-hidden
            className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,123,78,0.35) 0%, transparent 60%)",
            }}
          />
          <div className="relative space-y-5">
            <div className="inline-flex w-14 h-14 rounded-full bg-bone/10 ring-1 ring-bone/15 items-center justify-center">
              <Lock size={20} strokeWidth={1.5} className="text-bone" />
            </div>
            <div>
              <p className="kicker text-terracotta/85">Premium</p>
              <h1 className="font-display text-[28px] leading-tight text-bone tracking-tight mt-2">
                Checklist do{" "}
                <span className="font-display-soft italic">embarque</span>.
              </h1>
              <p className="text-[13px] text-bone/60 mt-3 leading-relaxed">
                O passo a passo do dia do voo, com itens obrigatórios e dicas
                de aeroporto, faz parte do iPet Travel Plan.
              </p>
            </div>
            <Link
              href={`/checkout/${plano.id}`}
              className="group inline-flex items-center gap-2 bg-bone text-ink py-3 px-6 rounded-full text-[13px] font-semibold hover:bg-terracotta hover:text-bone transition-colors"
            >
              Desbloquear por R$ 99
              <ArrowRight
                size={14}
                strokeWidth={1.75}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </article>
      </motion.div>
    );
  }

  const regras = REGRAS_DESTINO[plano.destino];
  const dataEmbarque = parseBR(plano.dataEmbarque);
  const diasRestantes = differenceInDays(dataEmbarque, new Date());
  const dataFormatada = format(dataEmbarque, "d 'de' MMMM", { locale: ptBR });

  const diasBadge =
    diasRestantes < 0
      ? { label: "Passou", cls: "bg-bone-deep text-muted" }
      : diasRestantes === 0
      ? { label: "Hoje", cls: "bg-[#FBEBE8] text-[#8C3329]" }
      : diasRestantes <= 7
      ? { label: `${diasRestantes}d`, cls: "bg-[#FBEBE8] text-[#8C3329]" }
      : { label: `${diasRestantes}d`, cls: "bg-terracotta-soft text-terracotta-deep" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl mx-auto space-y-8 pb-8"
    >
      <div>
        <Link
          href={`/viagens/${planoId}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors mb-5"
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Voltar à viagem
        </Link>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="kicker text-terracotta flex items-center gap-2">
              <span className="text-base">{regras.bandeira}</span>{" "}
              Embarque · {pet.nome.split(" ")[0]}
            </p>
            <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
              Dia do voo
            </h1>
            <p className="text-[13px] text-muted mt-2.5 font-mono">
              {dataFormatada} · {regras.nome}
            </p>
          </div>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full ${diasBadge.cls}`}
          >
            {diasBadge.label}
          </span>
        </div>
      </div>

      <div className="editorial-rule" />

      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`rounded-2xl border p-5 ${
          vaiNaCabine
            ? "bg-sage-soft border-sage/20"
            : "bg-[#E8EEF2] border-[#C8D5DE]"
        }`}
      >
        <p className="kicker text-muted">Modo de transporte</p>
        <div className="mt-1.5 flex items-center gap-3">
          <Plane
            size={20}
            strokeWidth={1.5}
            className={vaiNaCabine ? "text-sage-deep" : "text-[#3A5868]"}
          />
          <div>
            <p className="font-display text-[18px] text-ink leading-tight tracking-tight">
              {vaiNaCabine ? "Cabine" : "Porão"}
            </p>
            <p className="text-[12px] text-muted mt-0.5">
              {vaiNaCabine
                ? "Pet viaja com você — respeite peso e dimensões"
                : "Guarda de bagagem do avião — caixa rígida IATA obrigatória"}
            </p>
          </div>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-paper rounded-2xl border border-border p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="kicker text-muted">Itens obrigatórios</p>
            <p className="font-display text-[20px] text-ink mt-1 tracking-tight">
              <span className="font-mono text-base">
                {marcadosObrigatorios}/{totalObrigatorios}
              </span>
            </p>
          </div>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full ${
              progresso === 100
                ? "bg-sage-soft text-sage-deep"
                : progresso >= 50
                ? "bg-terracotta-soft text-terracotta-deep"
                : "bg-bone-deep text-muted"
            }`}
          >
            {progresso}%
          </span>
        </div>
        <div className="h-1.5 bg-bone-deep rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${
              progresso === 100 ? "bg-sage" : "bg-terracotta"
            }`}
          />
        </div>
        <p className="text-[11px] text-faint mt-2.5 font-mono">
          {totalMarcados} de {checklist.length} marcados (incluindo opcionais)
        </p>
      </motion.article>

      <AnimatePresence>
        {progresso === 100 && (
          <motion.article
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-sage-soft border border-sage/20 rounded-2xl p-5 flex items-center gap-3"
          >
            <ShieldCheck size={18} strokeWidth={1.5} className="text-sage-deep" />
            <div>
              <p className="font-display text-[16px] text-sage-deep tracking-tight">
                Pronto para embarcar
              </p>
              <p className="text-[12px] text-ink/65 mt-0.5">
                {pet.nome.split(" ")[0]} está com tudo em ordem. Boa viagem.
              </p>
            </div>
          </motion.article>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categorias.map(([cat, items], catIdx) => {
          const { label, Icon } = CATEGORIA_META[cat];
          return (
            <motion.section
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + catIdx * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={13} strokeWidth={1.5} className="text-muted" />
                <p className="kicker text-muted">{label}</p>
              </div>
              <div className="space-y-2">
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
          );
        })}
      </div>

      <div className="bg-paper rounded-2xl border border-border p-5">
        <div className="flex items-start gap-2.5">
          <Info size={13} strokeWidth={1.5} className="text-terracotta mt-0.5 shrink-0" />
          <div className="text-[12px] text-ink/70 leading-relaxed space-y-1.5">
            <p>
              <span className="font-medium text-ink">Dica iPet · </span>
              Fotografe todos os documentos antes de sair. Em caso de perda, a
              versão digital agiliza o atendimento.
            </p>
            <p className="text-muted">
              Em caso de dúvida, ligue para a companhia aérea ou procure o
              posto VIGIAGRO.
            </p>
          </div>
        </div>
      </div>

      <article className="bg-paper rounded-2xl border border-border p-6">
        <p className="kicker text-muted mb-4">Contatos úteis</p>
        <div className="divide-y divide-border">
          <ContatoRow label="VIGIAGRO — Vigilância Agropecuária" tel="(61) 3218-2574" />
          <ContatoRow label="ANAC — Agência Nacional de Aviação" tel="163" />
          <ContatoRow label="MAPA — Ministério da Agricultura" tel="0800-704-1995" />
        </div>
      </article>
    </motion.div>
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
      className={`rounded-2xl border p-4 transition-colors ${
        checked
          ? "bg-sage-soft border-sage/20"
          : item.alerta
          ? "bg-terracotta-soft/40 border-terracotta-soft"
          : "bg-paper border-border hover:border-ink/30"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-start gap-3 w-full text-left"
      >
        {checked ? (
          <CheckCircle2
            size={18}
            strokeWidth={1.5}
            className="text-sage-deep shrink-0 mt-0.5"
          />
        ) : item.alerta ? (
          <AlertTriangle
            size={18}
            strokeWidth={1.5}
            className="text-terracotta shrink-0 mt-0.5"
          />
        ) : (
          <Circle
            size={18}
            strokeWidth={1.25}
            className={`shrink-0 mt-0.5 ${
              item.obrigatorio ? "text-ink/35" : "text-faint"
            }`}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`text-[13px] font-medium ${
                checked ? "text-sage-deep line-through" : "text-ink"
              }`}
            >
              {item.titulo}
            </p>
            {item.obrigatorio && !checked && (
              <span className="text-[9px] font-mono uppercase tracking-widest text-status-crit bg-[#FBEBE8] px-1.5 py-0.5 rounded-full">
                Obrigatório
              </span>
            )}
            {!item.obrigatorio && (
              <span className="text-[9px] font-mono uppercase tracking-widest text-faint">
                Opcional
              </span>
            )}
          </div>
          <p className="text-[12px] mt-1 text-muted leading-relaxed">
            {item.detalhe}
          </p>
        </div>
      </button>
      {item.dica && (
        <>
          <button
            onClick={() => setShowDica(!showDica)}
            className="flex items-center gap-1.5 text-[11px] text-ink/70 hover:text-ink mt-3 ml-7 transition-colors"
          >
            <Info size={11} strokeWidth={1.5} />
            {showDica ? "Ocultar dica" : "Ver dica"}
          </button>
          <AnimatePresence>
            {showDica && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] text-ink/70 bg-bone-deep rounded-lg px-3 py-2 ml-7 mt-2 leading-relaxed"
              >
                {item.dica}
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
    <div className="flex items-center justify-between py-3 text-[12px]">
      <span className="text-ink/65">{label}</span>
      <a
        href={`tel:${tel.replace(/\D/g, "")}`}
        className="flex items-center gap-1.5 text-ink hover:text-sage transition-colors font-mono"
      >
        <Phone size={11} strokeWidth={1.75} />
        {tel}
      </a>
    </div>
  );
}
