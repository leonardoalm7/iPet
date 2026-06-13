"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import {
  extrairVacinaDeFoto,
  confidenceMedia,
  type ResultadoOCRVacina,
} from "@ipet/core/services/ocr-vacina";
import { track } from "@ipet/core/services/analytics";

export interface DadosVacinaPreenchidos {
  dataAplicacao: string;
  nomeComercial: string;
}

type Estado =
  | { fase: "idle" }
  | { fase: "extraindo"; previewUrl: string }
  | { fase: "sucesso"; previewUrl: string; resultado: ResultadoOCRVacina; hash: string }
  | { fase: "erro"; mensagem: string; previewUrl?: string };

export function UploadCarteiraVacina({
  onAplicar,
}: {
  onAplicar: (dados: DadosVacinaPreenchidos) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>({ fase: "idle" });

  async function handleFile(file: File) {
    const previewUrl = URL.createObjectURL(file);
    setEstado({ fase: "extraindo", previewUrl });
    track("ocr_vacina_iniciado", { tamanhoBytes: file.size, tipo: file.type });

    const r = await extrairVacinaDeFoto(file);

    if (!r.ok) {
      track("ocr_vacina_falha", { motivo: r.erro });
      setEstado({ fase: "erro", mensagem: r.erro, previewUrl });
      return;
    }

    if (!r.resultado.encontrouVacinaAntirrabica) {
      const motivo = r.resultado.observacao ?? "Não localizei vacina antirrábica nesta imagem.";
      track("ocr_vacina_falha", { motivo });
      setEstado({ fase: "erro", mensagem: motivo, previewUrl });
      return;
    }

    const camposPreenchidos = Object.values(r.resultado.campos).filter((c) => c.value !== null).length;
    track("ocr_vacina_sucesso", {
      confidenceMedia: confidenceMedia(r.resultado.campos),
      camposPreenchidos,
      encontrouAntirrabica: true,
    });
    setEstado({ fase: "sucesso", previewUrl, resultado: r.resultado, hash: r.hashDocumento });
  }

  function aplicarNoForm() {
    if (estado.fase !== "sucesso") return;
    const c = estado.resultado.campos;
    onAplicar({
      dataAplicacao: isoParaBR(c.dataAplicacao.value),
      nomeComercial: c.nomeComercial.value ?? "",
    });
    track("ocr_vacina_aceito", { camposEditados: 0 });
    setEstado({ fase: "idle" });
  }

  function reset() {
    setEstado({ fase: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  if (estado.fase === "idle") {
    return (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-3 w-full bg-teal/5 hover:bg-teal/10 border border-teal/30 border-dashed rounded-xl px-4 py-4 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-teal/15 flex items-center justify-center flex-shrink-0">
          <Camera className="w-5 h-5 text-teal" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-navy">Tem uma foto da carteira?</p>
          <p className="text-xs text-gray-500 mt-0.5">Envie e preenchemos pra você</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </button>
    );
  }

  if (estado.fase === "extraindo") {
    return (
      <div className="flex items-center gap-3 bg-teal/5 border border-teal/30 rounded-xl px-4 py-4">
        <Image src={estado.previewUrl} alt="Carteira" width={40} height={40} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" unoptimized />
        <div className="flex-1">
          <p className="text-sm font-semibold text-navy flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal" />
            Lendo a carteira…
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Isso leva uns 5 segundos</p>
        </div>
      </div>
    );
  }

  if (estado.fase === "erro") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-500">Não consegui ler</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{estado.mensagem}</p>
            <button onClick={reset} className="text-xs text-teal font-semibold mt-2 inline-flex items-center gap-1 hover:underline">
              <RefreshCw className="w-3 h-3" /> Tentar outra foto ou preencher manual
            </button>
          </div>
        </div>
      </div>
    );
  }

  const c = estado.resultado.campos;
  const cm = confidenceMedia(c);

  return (
    <div className="bg-white border border-teal/30 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Image src={estado.previewUrl} alt="Carteira" width={48} height={48} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" unoptimized />
        <div className="flex-1">
          <p className="text-sm font-semibold text-navy flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal" />
            Dados extraídos
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Confiança média: <span className="text-navy font-medium">{(cm * 100).toFixed(0)}%</span>
          </p>
        </div>
      </div>

      <div className="space-y-1.5 bg-surface rounded-lg px-3 py-2.5">
        <CampoLinha label="Data aplicação" valor={c.dataAplicacao.value} confidence={c.dataAplicacao.confidence} />
        <CampoLinha label="Vacina" valor={c.nomeComercial.value} confidence={c.nomeComercial.confidence} />
        {c.fabricante.value && <CampoLinha label="Fabricante" valor={c.fabricante.value} confidence={c.fabricante.confidence} />}
        {c.lote.value && <CampoLinha label="Lote" valor={c.lote.value} confidence={c.lote.confidence} />}
        {c.dataValidade.value && <CampoLinha label="Validade" valor={c.dataValidade.value} confidence={c.dataValidade.confidence} />}
      </div>

      <div className="flex gap-2">
        <button
          onClick={aplicarNoForm}
          className="flex-1 bg-teal hover:bg-teal-dark text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Usar estes dados
        </button>
        <button
          onClick={reset}
          className="px-3 text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          Outra foto
        </button>
      </div>

      {cm < 0.7 && (
        <p className="text-[11px] text-ipet-orange leading-relaxed">
          ⚠️ Confiança baixa em alguns campos — confira antes de continuar.
        </p>
      )}
    </div>
  );
}

function isoParaBR(iso: string | null): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function CampoLinha({ label, valor, confidence }: { label: string; valor: string | null; confidence: number }) {
  if (valor === null) return null;
  const corPonto = confidence >= 0.85 ? "bg-teal" : confidence >= 0.6 ? "bg-ipet-orange" : "bg-red-400";
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${corPonto}`} title={`Confiança: ${(confidence * 100).toFixed(0)}%`} />
        <span className="text-navy font-medium">{valor}</span>
      </span>
    </div>
  );
}
