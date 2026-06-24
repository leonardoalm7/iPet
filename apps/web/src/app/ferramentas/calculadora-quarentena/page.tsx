"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PawPrint,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { getAllSlugs } from "@ipet/core/data/destination-slugs";
import { track } from "@ipet/core/services/analytics";

interface DestinoInfo {
  slug: string;
  nome: string;
  bandeira: string;
  exigeMicrochip: boolean;
  exigeVacina: boolean;
  diasCarenciaVacina: number;
  validadeVacinaAnos?: number;
  exigeSorologia: boolean;
  diasCarenciaSorologia: number;
  valorMinimoSorologia?: string;
  exigeCVI: boolean;
  diasAntesCVI: number;
  exigePermissaoImportacao: boolean;
}

interface EtapaCalc {
  nome: string;
  diasAntes: number;
  dataLimite: string;
  descricao: string;
}

interface Resultado {
  dataIdeal: string;
  diasNecessarios: number;
  diasAteEmbarque: number;
  temTempo: boolean;
  janelaRisco: string | null;
  etapas: EtapaCalc[];
}

const DESTINOS: DestinoInfo[] = [
  { slug: "brasil", nome: "Brasil", bandeira: "🇧🇷", exigeMicrochip: false, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: false, diasCarenciaSorologia: 0, exigeCVI: false, diasAntesCVI: 0, exigePermissaoImportacao: false },
  { slug: "argentina", nome: "Argentina", bandeira: "🇦🇷", exigeMicrochip: false, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: false, diasCarenciaSorologia: 0, exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "chile", nome: "Chile", bandeira: "🇨🇱", exigeMicrochip: false, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: false, diasCarenciaSorologia: 0, exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "uruguai", nome: "Uruguai", bandeira: "🇺🇾", exigeMicrochip: false, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: false, diasCarenciaSorologia: 0, exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "mexico", nome: "México", bandeira: "🇲🇽", exigeMicrochip: false, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: false, diasCarenciaSorologia: 0, exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "eua", nome: "Estados Unidos", bandeira: "🇺🇸", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: false, diasCarenciaSorologia: 0, exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "canada", nome: "Canadá", bandeira: "🇨🇦", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: false, diasCarenciaSorologia: 0, exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "portugal", nome: "Portugal", bandeira: "🇵🇹", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 90, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "espanha", nome: "Espanha", bandeira: "🇪🇸", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 90, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "franca", nome: "França", bandeira: "🇫🇷", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 90, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "alemanha", nome: "Alemanha", bandeira: "🇩🇪", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 90, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "italia", nome: "Itália", bandeira: "🇮🇹", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 90, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "holanda", nome: "Holanda", bandeira: "🇳🇱", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 90, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "reino-unido", nome: "Reino Unido", bandeira: "🇬🇧", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 90, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: false },
  { slug: "japao", nome: "Japão", bandeira: "🇯🇵", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 180, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: true },
  { slug: "australia", nome: "Austrália", bandeira: "🇦🇺", exigeMicrochip: true, exigeVacina: true, diasCarenciaVacina: 21, validadeVacinaAnos: 1, exigeSorologia: true, diasCarenciaSorologia: 180, valorMinimoSorologia: "≥0,5 UI/mL", exigeCVI: true, diasAntesCVI: 10, exigePermissaoImportacao: true },
];

function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

function calcular(destino: DestinoInfo, dataEmbarque: Date): Resultado {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const etapas: EtapaCalc[] = [];
  let maiorAntes = 0;

  if (destino.exigeMicrochip) {
    const dias = (destino.exigeSorologia
      ? destino.diasCarenciaSorologia
      : destino.diasCarenciaVacina) + 7;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Microchip ISO",
      diasAntes: dias,
      dataLimite: formatDate(subDays(dataEmbarque, dias)),
      descricao: "Implantar ANTES da vacina antirrábica",
    });
  }

  if (destino.exigeVacina) {
    const dias = destino.exigeSorologia
      ? destino.diasCarenciaSorologia + 7
      : destino.diasCarenciaVacina;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Vacina antirrábica",
      diasAntes: dias,
      dataLimite: formatDate(subDays(dataEmbarque, dias)),
      descricao: `Carência: ${destino.diasCarenciaVacina} dias${destino.validadeVacinaAnos ? ` · Validade: ${destino.validadeVacinaAnos} ano${destino.validadeVacinaAnos > 1 ? "s" : ""}` : ""}`,
    });
  }

  if (destino.exigeSorologia) {
    const dias = destino.diasCarenciaSorologia;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Sorologia antirrábica",
      diasAntes: dias,
      dataLimite: formatDate(subDays(dataEmbarque, dias)),
      descricao: `Carência: ${dias} dias · Resultado ${destino.valorMinimoSorologia ?? "≥0,5 UI/mL"}`,
    });
  }

  if (destino.exigeCVI) {
    etapas.push({
      nome: "CVI",
      diasAntes: destino.diasAntesCVI,
      dataLimite: `${formatDate(subDays(dataEmbarque, destino.diasAntesCVI))} a ${formatDate(subDays(dataEmbarque, 2))}`,
      descricao: "Emitir com veterinário credenciado pelo MAPA",
    });
  }

  if (destino.exigePermissaoImportacao) {
    const dias = 180;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Permissão de importação",
      diasAntes: dias,
      dataLimite: formatDate(subDays(dataEmbarque, dias)),
      descricao: "Solicitar ao órgão de controle animal do destino",
    });
  }

  etapas.sort((a, b) => b.diasAntes - a.diasAntes);

  const dataIdeal = subDays(dataEmbarque, maiorAntes);
  const diasAteEmbarque = diffDays(dataEmbarque, hoje);
  const temTempo = diasAteEmbarque >= maiorAntes;

  let janelaRisco: string | null = null;
  if (!temTempo) {
    const etapaCritica = etapas[0];
    janelaRisco = `Faltam ${diasAteEmbarque} dias para o embarque, mas ${etapaCritica.nome.toLowerCase()} exige ${etapaCritica.diasAntes} dias de antecedência. Considere adiar a viagem.`;
  } else if (diasAteEmbarque - maiorAntes <= 14) {
    janelaRisco = `Você está na janela limite. Comece os trâmites imediatamente para não perder os prazos.`;
  }

  return {
    dataIdeal: formatDate(dataIdeal),
    diasNecessarios: maiorAntes,
    diasAteEmbarque,
    temTempo,
    janelaRisco,
    etapas,
  };
}

export default function CalculadoraQuarentenaPage() {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [dataStr, setDataStr] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [destinoInfo, setDestinoInfo] = useState<DestinoInfo | null>(null);

  function handleCalcular() {
    const destino = DESTINOS.find((d) => d.slug === selectedSlug);
    if (!destino || !dataStr) return;

    const [year, month, day] = dataStr.split("-").map(Number);
    const dataEmbarque = new Date(year, month - 1, day);
    dataEmbarque.setHours(0, 0, 0, 0);

    const res = calcular(destino, dataEmbarque);
    setResultado(res);
    setDestinoInfo(destino);

    track("calculadora_usada", {
      destino: destino.slug,
      temTempo: res.temTempo,
    });
  }

  function handleCTA() {
    if (destinoInfo) {
      track("calculadora_cta_clicado", { destino: destinoInfo.slug });
    }
  }

  const hoje = new Date();
  const minDate = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border px-5 py-4">
        <nav className="flex items-center gap-2 text-xs text-gray-400 max-w-2xl mx-auto">
          <Link href="/regras" className="hover:text-navy transition-colors">
            Regras por destino
          </Link>
          <span>/</span>
          <span className="text-navy font-medium">Calculadora de quarentena</span>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center">
              <Calculator className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">
                Calculadora de quarentena pet
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Descubra quando começar os trâmites para sua viagem
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <label
              htmlFor="destino"
              className="block text-sm font-medium text-navy mb-1.5"
            >
              Para onde você vai?
            </label>
            <select
              id="destino"
              value={selectedSlug}
              onChange={(e) => {
                setSelectedSlug(e.target.value);
                setResultado(null);
              }}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-navy bg-white focus:outline-none focus:border-navy transition-colors"
            >
              <option value="">Selecione o destino</option>
              {DESTINOS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.bandeira} {d.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="data"
              className="block text-sm font-medium text-navy mb-1.5"
            >
              Data de embarque
            </label>
            <input
              id="data"
              type="date"
              value={dataStr}
              min={minDate}
              onChange={(e) => {
                setDataStr(e.target.value);
                setResultado(null);
              }}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-navy bg-white focus:outline-none focus:border-navy transition-colors"
            />
          </div>

          <button
            onClick={handleCalcular}
            disabled={!selectedSlug || !dataStr}
            className="w-full bg-navy hover:bg-navy-light disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Calcular prazos
          </button>
        </section>

        {resultado && destinoInfo && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div
              className={`rounded-2xl border p-5 ${
                resultado.temTempo
                  ? "bg-navy/5 border-navy/10"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {resultado.temTempo ? (
                  <CheckCircle2 className="w-6 h-6 text-teal flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {resultado.temTempo
                      ? "Você ainda tem tempo!"
                      : "Prazo insuficiente"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {destinoInfo.bandeira} {destinoInfo.nome} exige{" "}
                    <strong>{resultado.diasNecessarios} dias</strong> de
                    antecedência. Você tem{" "}
                    <strong>{resultado.diasAteEmbarque} dias</strong> até o
                    embarque.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-4 h-4 text-teal" />
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Data ideal para começar
                </p>
              </div>
              <p className="text-2xl font-bold text-navy">
                {resultado.dataIdeal}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {resultado.diasNecessarios} dias antes do embarque em{" "}
                {formatDate(new Date(dataStr + "T00:00:00"))}
              </p>
            </div>

            {resultado.janelaRisco && (
              <div className="bg-orange-light border border-ipet-orange/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-ipet-orange flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {resultado.janelaRisco}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-navy mb-3">
                Etapas necessárias
              </h2>
              <div className="space-y-2">
                {resultado.etapas.map((etapa) => (
                  <div
                    key={etapa.nome}
                    className="flex items-start gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="w-1 h-full min-h-[40px] rounded-full bg-navy/20 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-navy">
                          {etapa.nome}
                        </p>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {etapa.diasAntes}d antes
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {etapa.descricao}
                      </p>
                      <p className="text-xs text-teal font-medium mt-1">
                        Até {etapa.dataLimite}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy/5 border border-navy/10 rounded-2xl p-6 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-navy mx-auto" />
              <h2 className="text-lg font-bold text-navy">
                Quer o roadmap completo com datas exatas?
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                O iPet Pass gera um checklist personalizado para seu pet, com
                alertas de prazo, sugestão de clínicas e acompanhamento até o
                embarque.
              </p>
              <Link
                href="/auth/cadastro"
                onClick={handleCTA}
                className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
              >
                Criar conta gratuita
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-center">
              <Link
                href={`/regras/${destinoInfo.slug}`}
                className="text-xs text-teal hover:text-teal-dark font-medium"
              >
                Ver todas as regras para {destinoInfo.nome} →
              </Link>
            </p>
          </section>
        )}

        {!resultado && (
          <section className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-navy mb-2">
              Como funciona?
            </h2>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Selecione o país de destino",
                },
                {
                  step: "2",
                  text: "Informe a data prevista de embarque",
                },
                {
                  step: "3",
                  text: "Veja os prazos e descubra se ainda tem tempo",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-navy">
                      {item.step}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="text-center pt-4 border-t border-border">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Prazos calculados com base em regras verificadas. Regras podem mudar
            — consulte sempre a autoridade sanitária do país de destino.
          </p>
          <Link
            href="/regras"
            className="text-xs text-teal hover:text-teal-dark font-medium mt-2 inline-block"
          >
            Ver regras por destino
          </Link>
        </footer>
      </main>
    </div>
  );
}
