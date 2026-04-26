"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import {
  CLINICAS_CREDENCIADAS,
  ClinicaCredenciada,
  TipoClinica,
  ServicoClinica,
  TIPO_CLINICA_LABEL,
  TIPO_CLINICA_COLOR,
  SERVICO_LABEL,
  SERVICO_EMOJI,
} from "@/data/clinicas-credenciadas";
import { BottomNav } from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  ArrowLeft,
  Search,
  Filter,
  ShieldCheck,
  FlaskConical,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";

const SERVICOS_VALIDOS: ServicoClinica[] = [
  "VACINA_ANTIRRABICA",
  "MICROCHIP",
  "SOROLOGIA",
  "CVI",
  "ATESTADO_SAUDE",
  "CONSULTA_GERAL",
];

type Filtro = "TODOS" | TipoClinica;

const FILTROS: { value: Filtro; label: string; icon: React.ElementType }[] = [
  { value: "TODOS", label: "Todos", icon: Stethoscope },
  { value: "HABILITADO_MAPA", label: "CVI (MAPA)", icon: ShieldCheck },
  { value: "LAB_SOROLOGIA", label: "Sorologia", icon: FlaskConical },
  { value: "CLINICA_GERAL", label: "Clínica", icon: Stethoscope },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ClinicasPage() {
  const registrarEngajamento = useAppStore((s) => s.registrarEngajamento);
  const searchParams = useSearchParams();
  const servicoQueryRaw = searchParams.get("servico");
  const servicoQuery: ServicoClinica | null =
    servicoQueryRaw && SERVICOS_VALIDOS.includes(servicoQueryRaw as ServicoClinica)
      ? (servicoQueryRaw as ServicoClinica)
      : null;
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [busca, setBusca] = useState("");
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setGeoStatus("ok");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  const clinicasFiltradas = useMemo(() => {
    let lista = CLINICAS_CREDENCIADAS;

    if (servicoQuery) {
      lista = lista.filter((c) => c.servicos.includes(servicoQuery));
    }

    if (filtro !== "TODOS") {
      lista = lista.filter((c) => c.tipo.includes(filtro));
    }

    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          c.cidade.toLowerCase().includes(q) ||
          c.estado.toLowerCase().includes(q) ||
          c.servicos.some((s) => SERVICO_LABEL[s].toLowerCase().includes(q))
      );
    }

    if (userLat !== null && userLng !== null) {
      lista = [...lista].sort(
        (a, b) =>
          haversineKm(userLat, userLng, a.lat, a.lng) -
          haversineKm(userLat, userLng, b.lat, b.lng)
      );
    }

    return lista;
  }, [servicoQuery, filtro, busca, userLat, userLng]);

  const resumo = useMemo(() => {
    const mapa = CLINICAS_CREDENCIADAS.filter((c) => c.habilitadoMapa).length;
    const labs = CLINICAS_CREDENCIADAS.filter((c) => c.tipo.includes("LAB_SOROLOGIA")).length;
    const total = CLINICAS_CREDENCIADAS.length;
    return { mapa, labs, total };
  }, []);

  const handleLigar = useCallback(
    (clinica: ClinicaCredenciada) => {
      registrarEngajamento(clinica.id, "ligacao");
      window.open(`tel:${clinica.telefone.replace(/\D/g, "")}`, "_self");
    },
    [registrarEngajamento]
  );

  const handleNavegar = useCallback(
    (clinica: ClinicaCredenciada) => {
      registrarEngajamento(clinica.id, "navegacao");
      const q = encodeURIComponent(`${clinica.nome}, ${clinica.endereco}, ${clinica.cidade}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    },
    [registrarEngajamento]
  );

  const handleExpandir = useCallback(
    (clinica: ClinicaCredenciada) => {
      const novoId = expandidoId === clinica.id ? null : clinica.id;
      setExpandidoId(novoId);
      if (novoId) {
        registrarEngajamento(clinica.id, "clique");
      }
    },
    [expandidoId, registrarEngajamento]
  );

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-teal text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Início
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="w-6 h-6 text-teal" />
          <h1 className="text-2xl font-bold text-navy">Clínicas Veterinárias</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Encontre veterinários credenciados para a jornada do seu pet
        </p>
      </header>

      <main className="flex-1 px-5 space-y-4">
        {/* Pré-filtro por serviço (deep link do roadmap) */}
        {servicoQuery && (
          <div className="flex items-center justify-between bg-teal-light border border-teal/20 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{SERVICO_EMOJI[servicoQuery]}</span>
              <p className="text-xs text-navy">
                Filtrando clínicas que oferecem{" "}
                <span className="font-semibold">{SERVICO_LABEL[servicoQuery]}</span>
              </p>
            </div>
            <Link
              href="/clinicas"
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/60 flex-shrink-0"
              aria-label="Limpar filtro"
            >
              <X className="w-3.5 h-3.5 text-teal" />
            </Link>
          </div>
        )}

        {/* Resumo */}
        <div className="flex gap-3">
          <ResumoChip count={resumo.total} label="Clínicas" color="bg-teal" />
          <ResumoChip count={resumo.mapa} label="Habilitados CVI" color="bg-emerald-600" />
          <ResumoChip count={resumo.labs} label="Labs sorologia" color="bg-purple-600" />
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, cidade ou serviço..."
            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTROS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  filtro === f.value
                    ? "bg-teal text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Geolocalização status */}
        {geoStatus === "loading" && (
          <p className="text-xs text-gray-400 text-center">📍 Obtendo sua localização...</p>
        )}
        {geoStatus === "ok" && (
          <p className="text-xs text-teal text-center">📍 Ordenado por distância</p>
        )}
        {geoStatus === "denied" && (
          <p className="text-xs text-gray-400 text-center">📍 Localização indisponível — mostrando por estado</p>
        )}

        {/* Lista de clínicas */}
        <div className="space-y-2">
          {clinicasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">Nenhuma clínica encontrada.</p>
              <p className="text-gray-400 text-xs mt-1">Tente um filtro diferente.</p>
            </div>
          ) : (
            clinicasFiltradas.map((clinica, i) => (
              <ClinicaCard
                key={clinica.id}
                clinica={clinica}
                index={i}
                expandido={expandidoId === clinica.id}
                onToggle={() => handleExpandir(clinica)}
                onLigar={() => handleLigar(clinica)}
                onNavegar={() => handleNavegar(clinica)}
                distancia={
                  userLat !== null && userLng !== null
                    ? haversineKm(userLat, userLng, clinica.lat, clinica.lng)
                    : null
                }
              />
            ))
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 bg-teal/5 border border-teal/20 rounded-2xl p-3.5">
          <ShieldCheck className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 leading-relaxed">
            <p>
              <strong className="text-teal">Habilitado MAPA</strong> = veterinário
              autorizado a emitir o CVI (Certificado Veterinário Internacional),
              obrigatório para viagens internacionais.
            </p>
            <p className="mt-1">
              <strong className="text-purple-600">Lab Sorologia</strong> = laboratório
              credenciado OIE/WOAH para titulação antirrábica (exigida por UE, Japão,
              Austrália).
            </p>
          </div>
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function ResumoChip({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-5 h-5 rounded-full ${color} text-white text-[10px] font-bold flex items-center justify-center`}>
        {count}
      </span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function ClinicaCard({
  clinica,
  index,
  expandido,
  onToggle,
  onLigar,
  onNavegar,
  distancia,
}: {
  clinica: ClinicaCredenciada;
  index: number;
  expandido: boolean;
  onToggle: () => void;
  onLigar: () => void;
  onNavegar: () => void;
  distancia: number | null;
}) {
  const isLab = clinica.tipo.includes("LAB_SOROLOGIA");
  const isMapa = clinica.habilitadoMapa;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div
        className={`bg-white border rounded-2xl overflow-hidden ${
          isLab
            ? "border-purple-200"
            : isMapa
            ? "border-emerald-200"
            : "border-border"
        }`}
      >
        {/* Header clicável */}
        <button
          onClick={onToggle}
          className="flex items-start gap-3 w-full p-4 text-left"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
              isLab ? "bg-purple-100" : isMapa ? "bg-emerald-100" : "bg-gray-100"
            }`}
          >
            {isLab ? "🧪" : isMapa ? "🏥" : "🐾"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-navy truncate">{clinica.nome}</p>
              {clinica.verificada && (
                <ShieldCheck className="w-3.5 h-3.5 text-teal flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {clinica.cidade}, {clinica.estado}
              {distancia !== null && (
                <span className="text-teal ml-1">
                  · {distancia < 1 ? `${Math.round(distancia * 1000)}m` : `${distancia.toFixed(1)}km`}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {clinica.tipo.map((t) => (
                <span
                  key={t}
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${TIPO_CLINICA_COLOR[t]}`}
                >
                  {TIPO_CLINICA_LABEL[t]}
                </span>
              ))}
            </div>
          </div>
          {expandido ? (
            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
          )}
        </button>

        {/* Detalhes expandidos */}
        <AnimatePresence>
          {expandido && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {/* Endereço */}
                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                  <span>{clinica.endereco}</span>
                </div>

                {/* Serviços */}
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
                    Serviços
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {clinica.servicos.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg"
                      >
                        {SERVICO_EMOJI[s]} {SERVICO_LABEL[s]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Observações */}
                {clinica.observacoes && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                    {clinica.observacoes}
                  </p>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={onLigar}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-teal hover:bg-teal-dark text-white font-semibold py-2.5 rounded-xl transition-colors text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Ligar
                  </button>
                  <button
                    onClick={onNavegar}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-border hover:border-teal/50 text-navy font-semibold py-2.5 rounded-xl transition-colors text-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Como chegar
                  </button>
                  {clinica.site && (
                    <a
                      href={clinica.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 flex items-center justify-center border border-border hover:border-teal/50 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
