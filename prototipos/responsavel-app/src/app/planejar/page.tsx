"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { calcularRoadmap, parseBR, formatBR } from "@/services/travel-roadmap";
import { DESTINOS_LISTA, REGRAS_DESTINO, getDestinosAgrupados } from "@/data/destinations";
import { Destino, Pet } from "@/domain/types";
import { CustoEstimado } from "@/components/CustoEstimado";
import { track } from "@/services/analytics";
import {
  addDays,
  addMonths,
  differenceInDays,
  format,
  startOfMonth,
  endOfMonth,
  setDate,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  PawPrint,
  MapPin,
  CalendarDays,
  Syringe,
  ScanLine,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────

type Passo = "pet" | "destino" | "quando" | "resultado";

interface EstadoSaude {
  temMicrochip: boolean;
  temVacina: boolean;
  temSorologia: boolean;
}

interface Diagnostico {
  podeViajar: boolean; // dentro do prazo escolhido
  dataLiberacaoReal: Date; // data mais cedo possível
  diasAteMeta: number; // diferença entre meta e hoje
  diasAteLibera: number; // diferença entre liberação e hoje
  atrasoMeses: number; // meses que vai precisar adiar (se podeViajar=false)
  tarefasCriticas: string[]; // o que precisa fazer AGORA
  alertas: string[]; // avisos importantes
  progresso: { feito: number; total: number };
}

// ─── Cálculo do diagnóstico ───────────────────────────────────

function calcularDiagnostico(
  pet: Pet,
  destino: Destino,
  metaDate: Date
): Diagnostico {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diasAteMeta = differenceInDays(metaDate, hoje);

  // Calcula roadmap usando a data meta
  const dataEmbarqueStr = formatBR(metaDate);
  const roadmap = calcularRoadmap(pet, destino, dataEmbarqueStr, "preview");
  const regras = REGRAS_DESTINO[destino];

  // Data de liberação real (a mais restritiva)
  let dataLiberacao = addDays(hoje, regras.diasCarenciaVacina);

  if (pet.vacina?.valida) {
    const dv = parseBR(pet.vacina.data);
    const candidata = addDays(dv, regras.diasCarenciaVacina);
    if (candidata > dataLiberacao) dataLiberacao = candidata;
  }

  if (regras.exigeSorologia) {
    if (pet.sorologia?.status === "OK") {
      const ds = parseBR(pet.sorologia.data);
      const candidata = addDays(ds, regras.diasCarenciaSorologia);
      if (candidata > dataLiberacao) dataLiberacao = candidata;
    } else {
      // Sem sorologia: precisa fazer hoje → carência a partir de hoje
      const candidata = addDays(hoje, regras.diasCarenciaSorologia);
      if (candidata > dataLiberacao) dataLiberacao = candidata;
    }
  }

  // Se não tem vacina → tem que vacinar hoje → carência começa hoje
  if (!pet.vacina?.valida) {
    const candidata = addDays(hoje, regras.diasCarenciaVacina);
    if (candidata > dataLiberacao) dataLiberacao = candidata;
  }

  // Se não tem microchip e o destino exige → add ~7 dias para implantar
  if (regras.exigeMicrochip && !(pet.microchip && pet.microchip.length === 15)) {
    // Microchip precisa ser antes da vacina; não altera a data de liberação
    // diretamente, mas bloqueia a vacinação
  }

  // Adiciona janela mínima do CVI (2 dias antes do embarque)
  const dataEmbarqueMinimo = addDays(dataLiberacao, 2);

  const diasAteLibera = differenceInDays(dataEmbarqueMinimo, hoje);
  const podeViajar = diasAteMeta >= diasAteLibera;
  const atrasoMeses = podeViajar
    ? 0
    : Math.ceil((diasAteLibera - diasAteMeta) / 30);

  // Tarefas críticas (o que fazer primeiro)
  const tarefasCriticas: string[] = [];
  const alertas: string[] = [];

  const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);

  if (regras.exigeMicrochip && !temMicrochip) {
    tarefasCriticas.push("Implante o microchip ISO antes de qualquer vacina");
  }
  if (!pet.vacina?.valida) {
    tarefasCriticas.push("Vacine contra raiva imediatamente");
  }
  if (regras.exigeSorologia && pet.sorologia?.status !== "OK") {
    const label =
      regras.diasCarenciaSorologia >= 180
        ? `Sorologia antirrábica — carência de ${regras.diasCarenciaSorologia} dias (comece AGORA)`
        : `Sorologia antirrábica — carência de ${regras.diasCarenciaSorologia} dias`;
    tarefasCriticas.push(label);
  }
  if (regras.exigePermissaoImportacao) {
    alertas.push("Permissão de importação necessária — solicite com 6 meses de antecedência");
  }
  if (!podeViajar) {
    alertas.push(
      `Data escolhida não é viável. Embarque mais cedo possível: ${format(dataEmbarqueMinimo, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
    );
  }

  const tarefasDocs = roadmap.tarefas.filter((t) => t.id !== "cvi");
  const feito = tarefasDocs.filter((t) => t.concluida).length;

  return {
    podeViajar,
    dataLiberacaoReal: dataEmbarqueMinimo,
    diasAteMeta,
    diasAteLibera,
    atrasoMeses,
    tarefasCriticas,
    alertas,
    progresso: { feito, total: tarefasDocs.length },
  };
}

// ─── Gerador de meses ─────────────────────────────────────────

function gerarMeses(quantidade = 24) {
  const hoje = new Date();
  return Array.from({ length: quantidade }, (_, i) => {
    const d = addMonths(hoje, i + 1);
    return {
      label: format(d, "MMM yyyy", { locale: ptBR }),
      labelLongo: format(d, "MMMM 'de' yyyy", { locale: ptBR }),
      date: startOfMonth(d),
      key: format(d, "yyyy-MM"),
    };
  });
}

// ─── Componente principal ─────────────────────────────────────

export default function PlanejarPage() {
  const router = useRouter();
  const { pets, planosViagem, criarPlanoViagem } = useAppStore();

  const [passo, setPasso] = useState<Passo>(pets.length === 1 ? "destino" : "pet");
  const [petId, setPetId] = useState<string>(pets[0]?.id ?? "");
  const [destino, setDestino] = useState<Destino | null>(null);
  const [metaDate, setMetaDate] = useState<Date | null>(null);
  const [salvando, setSalvando] = useState(false);

  const pet = pets.find((p) => p.id === petId);
  const meses = useMemo(() => gerarMeses(24), []);

  const diagnostico = useMemo(() => {
    if (!pet || !destino || !metaDate) return null;
    return calcularDiagnostico(pet, destino, metaDate);
  }, [pet, destino, metaDate]);

  function voltar() {
    if (passo === "destino") {
      if (pets.length > 1) setPasso("pet");
      else router.back();
    } else if (passo === "quando") setPasso("destino");
    else if (passo === "resultado") setPasso("quando");
    else router.back();
  }

  function avancarParaDestino(id: string) {
    setPetId(id);
    setPasso("destino");
  }

  function avancarParaQuando(d: Destino) {
    setDestino(d);
    setPasso("quando");
  }

  function avancarParaResultado(date: Date) {
    setMetaDate(date);
    setPasso("resultado");
  }

  function salvarEContinuar() {
    if (!pet || !destino || !metaDate || salvando) return;
    setSalvando(true);

    const dataEmbarqueStr = formatBR(metaDate);

    // Evita duplicata
    const jaExiste = planosViagem.some(
      (p) => p.petId === pet.id && p.destino === destino && p.dataEmbarque === dataEmbarqueStr
    );

    let planoId: string;
    if (jaExiste) {
      planoId = planosViagem.find(
        (p) => p.petId === pet.id && p.destino === destino && p.dataEmbarque === dataEmbarqueStr
      )!.id;
    } else {
      const novoPlano = criarPlanoViagem({ petId: pet.id, destino, dataEmbarque: dataEmbarqueStr });
      planoId = novoPlano.id;
    }

    track("destino_selecionado", { destino });
    const preview = calcularRoadmap(pet, destino, dataEmbarqueStr, "preview");
    track("roadmap_gerado", { destino, qtdTarefas: preview.tarefas.length });
    router.push(`/viagens/${planoId}`);
  }

  const passoAtual =
    passo === "pet" ? 0 :
    passo === "destino" ? 1 :
    passo === "quando" ? 2 : 3;

  const totalPassos = pets.length > 1 ? 4 : 3;
  const progresso = ((passoAtual + (pets.length > 1 ? 0 : 1)) / totalPassos) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={voltar}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-navy">Por onde começo?</h1>
            <p className="text-xs text-gray-400">
              {passo === "pet" && "Selecione o pet"}
              {passo === "destino" && "Escolha o destino"}
              {passo === "quando" && "Quando você quer viajar?"}
              {passo === "resultado" && "Seu diagnóstico"}
            </p>
          </div>
          <span className="text-xs text-gray-400">
            {passoAtual + (pets.length > 1 ? 0 : 1)}/{totalPassos}
          </span>
        </div>

        {/* Barra de progresso dos passos */}
        <div className="h-1 bg-surface rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-teal rounded-full"
          />
        </div>
      </header>

      {/* ── Conteúdo ───────────────────────────────────────────── */}
      <main className="flex-1 px-5 pb-10">
        <AnimatePresence mode="wait">
          {passo === "pet" && (
            <PassoPet
              key="pet"
              pets={pets}
              petIdAtual={petId}
              onSelecionar={avancarParaDestino}
            />
          )}
          {passo === "destino" && (
            <PassoDestino
              key="destino"
              destinoAtual={destino}
              onSelecionar={avancarParaQuando}
            />
          )}
          {passo === "quando" && (
            <PassoQuando
              key="quando"
              meses={meses}
              metaDateAtual={metaDate}
              onSelecionar={avancarParaResultado}
            />
          )}
          {passo === "resultado" && diagnostico && pet && destino && metaDate && (
            <PassoResultado
              key="resultado"
              pet={pet}
              destino={destino}
              metaDate={metaDate}
              diagnostico={diagnostico}
              onSalvar={salvarEContinuar}
              onVoltar={() => setPasso("quando")}
              salvando={salvando}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Passo 1: Seleção de pet ──────────────────────────────────

function PassoPet({
  pets,
  petIdAtual,
  onSelecionar,
}: {
  pets: Pet[];
  petIdAtual: string;
  onSelecionar: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-4 space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold text-navy mb-1">Qual pet vai viajar?</h2>
        <p className="text-gray-500 text-sm">
          O diagnóstico usa os dados de saúde do pet.
        </p>
      </div>

      <div className="space-y-2">
        {pets.map((pet) => (
          <button
            key={pet.id}
            onClick={() => onSelecionar(pet.id)}
            className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              petIdAtual === pet.id
                ? "border-teal bg-teal/10"
                : "border-border bg-white hover:border-border"
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
              {pet.especie === "CAO" ? "🐶" : pet.especie === "GATO" ? "🐱" : "🐾"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy text-sm">{pet.nome}</p>
              <p className="text-xs text-gray-400">
                {pet.raca} · {pet.peso}kg
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {pet.vacina?.valida && (
                <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Vacina ✓
                </span>
              )}
              {pet.microchip && pet.microchip.length === 15 && (
                <span className="text-[10px] text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                  Chip ✓
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/pets/novo")}
        className="flex items-center justify-center gap-2 w-full py-3.5 border border-dashed border-border rounded-2xl text-gray-400 text-sm hover:border-teal hover:text-teal transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        Adicionar novo pet
      </button>
    </motion.div>
  );
}

// ─── Passo 2: Destino ─────────────────────────────────────────

function PassoDestino({
  destinoAtual,
  onSelecionar,
}: {
  destinoAtual: Destino | null;
  onSelecionar: (d: Destino) => void;
}) {
  const [selecionado, setSelecionado] = useState<Destino | null>(destinoAtual);
  const [busca, setBusca] = useState("");
  const grupos = useMemo(() => getDestinosAgrupados(), []);

  const buscaLower = busca.toLowerCase().trim();
  const gruposFiltrados = useMemo(() => {
    if (!buscaLower) return grupos;
    return grupos
      .map((g) => ({
        ...g,
        destinos: g.destinos.filter((d) =>
          d.nome.toLowerCase().includes(buscaLower),
        ),
      }))
      .filter((g) => g.destinos.length > 0);
  }, [grupos, buscaLower]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-4 space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold text-navy mb-1">Para onde você quer ir?</h2>
        <p className="text-gray-500 text-sm">
          {DESTINOS_LISTA.length} destinos com regras mapeadas.
        </p>
      </div>

      <input
        type="text"
        placeholder="Buscar destino..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-teal"
      />

      <div className="space-y-5">
        {gruposFiltrados.map((grupo) => (
          <div key={grupo.regiao}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {grupo.regiao}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {grupo.destinos.map((d) => (
                <button
                  key={d.destino}
                  onClick={() => {
                    setSelecionado(d.destino as Destino);
                    setTimeout(() => onSelecionar(d.destino as Destino), 200);
                  }}
                  className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                    selecionado === d.destino
                      ? "border-teal bg-teal/10 scale-[0.97]"
                      : "border-border bg-white/50 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{d.bandeira}</div>
                  <div className={`text-xs font-medium leading-tight ${selecionado === d.destino ? "text-teal" : "text-navy"}`}>
                    {d.nome}
                  </div>
                  <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                    {d.exigeSorologia && (
                      <span className="text-[8px] bg-orange-100 text-ipet-orange px-1 py-0.5 rounded-full">
                        Soro
                      </span>
                    )}
                    {d.exigePermissaoImportacao && (
                      <span className="text-[8px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded-full">
                        Perm
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {gruposFiltrados.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum destino encontrado para &ldquo;{busca}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Passo 3: Quando ──────────────────────────────────────────

function PassoQuando({
  meses,
  metaDateAtual,
  onSelecionar,
}: {
  meses: ReturnType<typeof gerarMeses>;
  metaDateAtual: Date | null;
  onSelecionar: (date: Date) => void;
}) {
  const [selecionado, setSelecionado] = useState<string | null>(
    metaDateAtual ? format(metaDateAtual, "yyyy-MM") : null
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-4 space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold text-navy mb-1">Quando você quer viajar?</h2>
        <p className="text-gray-500 text-sm">
          Vamos calcular se a data é viável e o que você precisa fazer.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {meses.map((mes) => (
          <button
            key={mes.key}
            onClick={() => {
              setSelecionado(mes.key);
              // Usa o último dia do mês como data-alvo (mais generoso)
              const ultimoDia = endOfMonth(mes.date);
              setTimeout(() => onSelecionar(ultimoDia), 200);
            }}
            className={`py-3 px-2 rounded-2xl border text-center transition-all ${
              selecionado === mes.key
                ? "border-teal bg-teal/10 scale-[0.97]"
                : "border-border bg-white/60 hover:border-border"
            }`}
          >
            <p className={`text-sm font-semibold capitalize ${
              selecionado === mes.key ? "text-teal" : "text-gray-400"
            }`}>
              {mes.label.split(" ")[0]}
            </p>
            <p className="text-[11px] text-gray-400">{mes.label.split(" ")[1]}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Passo 4: Resultado ───────────────────────────────────────

function PassoResultado({
  pet,
  destino,
  metaDate,
  diagnostico,
  onSalvar,
  onVoltar,
  salvando,
}: {
  pet: Pet;
  destino: Destino;
  metaDate: Date;
  diagnostico: Diagnostico;
  onSalvar: () => void;
  onVoltar: () => void;
  salvando: boolean;
}) {
  const regras = REGRAS_DESTINO[destino];
  const mesLabel = format(metaDate, "MMMM 'de' yyyy", { locale: ptBR });
  const dataLiberacaoLabel = format(
    diagnostico.dataLiberacaoReal,
    "d 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );

  const tom =
    !diagnostico.podeViajar
      ? { cor: "orange", bg: "bg-orange-50", border: "border-orange-200" }
      : diagnostico.tarefasCriticas.length > 0
      ? { cor: "teal", bg: "bg-teal/5", border: "border-teal/20" }
      : { cor: "emerald", bg: "bg-emerald-50", border: "border-emerald-200" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="pt-4 space-y-4"
    >
      {/* Card de diagnóstico principal */}
      <div className={`rounded-2xl border p-5 ${tom.bg} ${tom.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{regras.bandeira}</span>
          <div>
            <p className="text-xs text-gray-400 capitalize">{mesLabel}</p>
            <p className="text-base font-bold text-navy">
              {pet.nome.split(" ")[0]} → {regras.nome}
            </p>
          </div>
        </div>

        {/* Veredicto */}
        {diagnostico.podeViajar ? (
          <div className="flex items-start gap-2.5 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-300 font-semibold text-sm">
                {diagnostico.tarefasCriticas.length === 0
                  ? "Tudo pronto! Você pode embarcar."
                  : "Viável — mas você precisa agir já."}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Você tem {diagnostico.diasAteMeta} dias.
                Data mínima de embarque: {dataLiberacaoLabel}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 mb-4">
            <AlertTriangle className="w-5 h-5 text-ipet-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-ipet-orange font-semibold text-sm">
                Data inviável — adie ~{diagnostico.atrasoMeses}{" "}
                {diagnostico.atrasoMeses === 1 ? "mês" : "meses"}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Embarque mais cedo possível: {dataLiberacaoLabel}.
              </p>
            </div>
          </div>
        )}

        {/* Linha do tempo compacta */}
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
            O que fazer primeiro
          </p>
          {diagnostico.tarefasCriticas.length === 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-300">
                {diagnostico.progresso.feito}/{diagnostico.progresso.total} documentos já em ordem
              </p>
            </div>
          ) : (
            diagnostico.tarefasCriticas.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-snug">{t}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alertas adicionais */}
      {diagnostico.alertas.map((a, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 bg-yellow-50 border border-yellow-200 rounded-2xl p-3.5"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-300 text-xs leading-relaxed">{a}</p>
        </div>
      ))}

      {/* Contador de dias */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-navy">{diagnostico.diasAteMeta}</p>
          <p className="text-xs text-gray-400 mt-0.5">dias até sua meta</p>
        </div>
        <div className={`rounded-2xl p-4 text-center border ${
          diagnostico.podeViajar
            ? "bg-emerald-50 border-emerald-200"
            : "bg-orange-50 border-orange-200"
        }`}>
          <p className={`text-2xl font-bold ${
            diagnostico.podeViajar ? "text-emerald-600" : "text-ipet-orange"
          }`}>
            {diagnostico.diasAteLibera}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">dias mínimos necessários</p>
        </div>
      </div>

      {/* Estimativa de custo */}
      <CustoEstimado pet={pet} destino={destino} compacto />

      {/* CTAs */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onSalvar}
          disabled={salvando}
          className="flex items-center justify-center gap-2 w-full bg-navy hover:bg-navy-light disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-4 rounded-2xl transition-colors"
        >
          {salvando ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Montando seu roadmap...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Montar meu roadmap completo
            </>
          )}
        </button>

        <button
          onClick={onVoltar}
          className="w-full py-3 border border-border rounded-2xl text-gray-500 text-sm hover:border-gray-600 transition-colors"
        >
          Tentar outra data
        </button>
      </div>
    </motion.div>
  );
}
