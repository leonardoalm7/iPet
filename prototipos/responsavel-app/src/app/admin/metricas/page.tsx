"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getAll,
  getContagemPorEvento,
  getFunil,
  getSessoes,
  getByEvento,
  limparEventos,
} from "@/services/analytics";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Trash2,
  TrendingDown,
  Plane,
  MapPin,
  ScanLine,
  Sparkles,
} from "lucide-react";

const ETAPA_LABELS: Record<string, string> = {
  pet_cadastrado: "Pet cadastrado",
  destino_selecionado: "Destino selecionado",
  roadmap_gerado: "Roadmap gerado",
  companhia_verificada: "Cia aérea verificada",
  tarefa_concluida: "Tarefa concluída",
  documento_uploaded: "Documento enviado",
};

export default function MetricasPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const dados = useMemo(() => {
    const _key = refreshKey;
    const todos = getAll();
    const contagem = getContagemPorEvento();
    const funil = getFunil();
    const sessoes = getSessoes();

    const destinos = getByEvento("destino_selecionado");
    const rankingDestinos = rankear(destinos.map((e) => e.props.destino));

    const cias = getByEvento("companhia_verificada");
    const rankingCias = rankear(cias.map((e) => e.props.companhiaId));

    const veredictos = getByEvento("companhia_verificada");
    const contagemVeredictos = rankear(veredictos.map((e) => e.props.veredicto));

    // OCR Vacina
    const vacinaIniciado = getByEvento("ocr_vacina_iniciado");
    const vacinaSucesso = getByEvento("ocr_vacina_sucesso");
    const vacinaFalha = getByEvento("ocr_vacina_falha");
    const vacinaAceito = getByEvento("ocr_vacina_aceito");
    const confMediaVacina = vacinaSucesso.length > 0
      ? vacinaSucesso.reduce((s, e) => s + e.props.confidenceMedia, 0) / vacinaSucesso.length
      : 0;
    const topFalhasVacina = rankear(vacinaFalha.map((e) => e.props.motivo)).slice(0, 3);

    // OCR Microchip
    const chipIniciado = getByEvento("ocr_microchip_iniciado");
    const chipSucesso = getByEvento("ocr_microchip_sucesso");
    const chipFalha = getByEvento("ocr_microchip_falha");
    const chipAceito = getByEvento("ocr_microchip_aceito");
    const confMediaChip = chipSucesso.length > 0
      ? chipSucesso.reduce((s, e) => s + e.props.confidence, 0) / chipSucesso.length
      : 0;
    const topFalhasChip = rankear(chipFalha.map((e) => e.props.motivo)).slice(0, 3);

    // iPet Services CTR
    const serviceViews = getByEvento("service_card_view");
    const serviceClicks = getByEvento("service_cta_click");
    const ctrServices = serviceViews.length > 0
      ? Math.round((serviceClicks.length / serviceViews.length) * 100)
      : 0;
    const topEtapasServices = rankear(serviceViews.map((e) => e.props.etapa)).slice(0, 5);

    const primeiro = todos.length > 0 ? todos[0].timestamp : null;
    const ultimo = todos.length > 0 ? todos[todos.length - 1].timestamp : null;

    return {
      totalEventos: todos.length,
      totalSessoes: sessoes.length,
      contagem,
      funil,
      rankingDestinos,
      rankingCias,
      contagemVeredictos,
      ocrVacina: {
        iniciado: vacinaIniciado.length,
        sucesso: vacinaSucesso.length,
        aceito: vacinaAceito.length,
        falha: vacinaFalha.length,
        confidenceMedia: confMediaVacina,
        topFalhas: topFalhasVacina,
      },
      ocrChip: {
        iniciado: chipIniciado.length,
        sucesso: chipSucesso.length,
        aceito: chipAceito.length,
        falha: chipFalha.length,
        confidenceMedia: confMediaChip,
        topFalhas: topFalhasChip,
      },
      services: {
        views: serviceViews.length,
        clicks: serviceClicks.length,
        ctr: ctrServices,
        topEtapas: topEtapasServices,
      },
      primeiro,
      ultimo,
    };
  }, [refreshKey]);

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  function handleLimpar() {
    if (confirm("Limpar todos os eventos de analytics? Esta ação não pode ser desfeita.")) {
      limparEventos();
      setRefreshKey((k) => k + 1);
    }
  }

  const maxFunil = Math.max(...dados.funil.map((f) => f.total), 1);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-navy">Métricas BML</h1>
          <p className="text-xs text-gray-400">Build-Measure-Learn</p>
        </div>
        <button
          onClick={handleLimpar}
          className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"
          title="Limpar eventos"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </header>

      <main className="flex-1 px-5 pb-10 space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<BarChart3 className="w-4 h-4" />} valor={dados.totalEventos} label="Eventos" />
          <StatCard icon={<Users className="w-4 h-4" />} valor={dados.totalSessoes} label="Sessões" />
          <StatCard
            icon={<TrendingDown className="w-4 h-4" />}
            valor={dados.funil.length > 0 && dados.funil[0].total > 0
              ? `${Math.round((dados.funil[dados.funil.length - 1].total / dados.funil[0].total) * 100)}%`
              : "—"}
            label="Conversão"
          />
        </div>

        {/* Período */}
        {dados.primeiro && (
          <p className="text-xs text-gray-400 text-center">
            {formatDate(dados.primeiro)} → {formatDate(dados.ultimo!)}
          </p>
        )}

        {/* Funil */}
        <section className="bg-white border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-teal" />
            Funil de conversão
          </h2>
          {dados.funil.every((f) => f.total === 0) ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhum evento registrado ainda. Use o app para gerar dados.
            </p>
          ) : (
            <div className="space-y-2">
              {dados.funil.map((etapa, i) => {
                const pct = maxFunil > 0 ? (etapa.total / maxFunil) * 100 : 0;
                const dropoff =
                  i > 0 && dados.funil[i - 1].total > 0
                    ? Math.round((1 - etapa.total / dados.funil[i - 1].total) * 100)
                    : null;

                return (
                  <div key={etapa.etapa}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-400">
                        {ETAPA_LABELS[etapa.etapa] || etapa.etapa}
                      </span>
                      <span className="font-medium text-navy">
                        {etapa.total}
                        {dropoff !== null && dropoff > 0 && (
                          <span className="text-red-400 ml-1 text-[10px]">
                            -{dropoff}%
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-5 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Rankings lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          <RankingCard
            icon={<MapPin className="w-4 h-4 text-teal" />}
            titulo="Top destinos"
            items={dados.rankingDestinos.slice(0, 5)}
          />
          <RankingCard
            icon={<Plane className="w-4 h-4 text-teal" />}
            titulo="Top cias aéreas"
            items={dados.rankingCias.slice(0, 5)}
          />
        </div>

        {/* Veredictos */}
        {dados.contagemVeredictos.length > 0 && (
          <section className="bg-white border border-border rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-navy mb-3">Veredictos cias aéreas</h2>
            <div className="flex gap-2 flex-wrap">
              {dados.contagemVeredictos.map(({ item, count }) => (
                <span
                  key={item}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    item === "PODE_CABINE"
                      ? "bg-emerald-50 text-emerald-700"
                      : item === "PODE_PORAO"
                        ? "bg-amber-50 text-amber-700"
                        : item === "NAO_ACEITO"
                          ? "bg-red-50 text-red-600"
                          : "bg-surface text-gray-400"
                  }`}
                >
                  {item}: {count}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* OCR Carteira de Vacinação */}
        <OcrCard
          titulo="OCR · Carteira de vacinação"
          dados={dados.ocrVacina}
        />

        {/* OCR Microchip */}
        <OcrCard
          titulo="OCR · Certificado de microchip"
          dados={dados.ocrChip}
        />

        {/* iPet Services CTR */}
        <section className="bg-white border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal" />
            iPet Services · CTR
          </h2>
          {dados.services.views === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              Nenhuma impressão de service card ainda.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <MiniStat label="Views" valor={dados.services.views} />
                <MiniStat label="Clicks" valor={dados.services.clicks} />
                <MiniStat label="CTR" valor={`${dados.services.ctr}%`} />
              </div>
              {dados.services.topEtapas.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase text-gray-400 tracking-wide mb-1">
                    Views por etapa do roadmap
                  </p>
                  {dados.services.topEtapas.map(({ item, count }) => (
                    <div key={item} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate">{item}</span>
                      <span className="font-mono text-navy">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Todos os eventos (debug) */}
        <section className="bg-white border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-navy mb-3">Contagem por evento</h2>
          <div className="space-y-1">
            {Object.entries(dados.contagem)
              .sort(([, a], [, b]) => b - a)
              .map(([evento, count]) => (
                <div key={evento} className="flex justify-between text-xs">
                  <span className="text-gray-400">{evento}</span>
                  <span className="font-mono text-navy">{count}</span>
                </div>
              ))}
            {Object.keys(dados.contagem).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">Sem dados</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// ── Componentes auxiliares ──────────────────────────────────

function StatCard({
  icon,
  valor,
  label,
}: {
  icon: React.ReactNode;
  valor: number | string;
  label: string;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-3 text-center">
      <div className="flex justify-center text-teal mb-1">{icon}</div>
      <p className="text-xl font-bold text-navy">{valor}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function RankingCard({
  icon,
  titulo,
  items,
}: {
  icon: React.ReactNode;
  titulo: string;
  items: { item: string; count: number }[];
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4">
      <h2 className="text-sm font-semibold text-navy mb-2 flex items-center gap-1.5">
        {icon}
        {titulo}
      </h2>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">Sem dados</p>
      ) : (
        <div className="space-y-1">
          {items.map(({ item, count }, i) => (
            <div key={item} className="flex justify-between text-xs">
              <span className="text-gray-600 truncate">
                <span className="text-gray-300 mr-1">{i + 1}.</span>
                {item}
              </span>
              <span className="font-mono text-navy ml-1">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface OcrStats {
  iniciado: number;
  sucesso: number;
  aceito: number;
  falha: number;
  confidenceMedia: number;
  topFalhas: { item: string; count: number }[];
}

function OcrCard({ titulo, dados }: { titulo: string; dados: OcrStats }) {
  const taxaSucesso = dados.iniciado > 0 ? Math.round((dados.sucesso / dados.iniciado) * 100) : 0;
  const taxaAceitacao = dados.sucesso > 0 ? Math.round((dados.aceito / dados.sucesso) * 100) : 0;

  return (
    <section className="bg-white border border-border rounded-2xl p-4">
      <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
        <ScanLine className="w-4 h-4 text-teal" />
        {titulo}
      </h2>
      {dados.iniciado === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">
          Nenhuma tentativa de OCR ainda.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <MiniStat label="Tentativas" valor={dados.iniciado} />
            <MiniStat label="Sucesso" valor={`${taxaSucesso}%`} />
            <MiniStat label="Aceito" valor={`${taxaAceitacao}%`} />
            <MiniStat
              label="Conf. média"
              valor={dados.sucesso > 0 ? `${Math.round(dados.confidenceMedia * 100)}%` : "—"}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-400 mb-2">
            <span>Iniciado: <span className="text-navy font-medium">{dados.iniciado}</span></span>
            <span>Sucesso: <span className="text-navy font-medium">{dados.sucesso}</span></span>
            <span>Falha: <span className="text-red-400 font-medium">{dados.falha}</span></span>
          </div>
          {dados.topFalhas.length > 0 && (
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-[11px] uppercase text-gray-400 tracking-wide mb-1">
                Top motivos de falha
              </p>
              <div className="space-y-1">
                {dados.topFalhas.map(({ item, count }) => (
                  <div key={item} className="flex justify-between text-xs gap-2">
                    <span className="text-gray-600 truncate">{item}</span>
                    <span className="font-mono text-red-400 flex-shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function MiniStat({ label, valor }: { label: string; valor: number | string }) {
  return (
    <div className="bg-surface rounded-lg p-2 text-center">
      <p className="text-base font-bold text-navy leading-tight">{valor}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function rankear(values: string[]): { item: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const v of values) map[v] = (map[v] || 0) + 1;
  return Object.entries(map)
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
