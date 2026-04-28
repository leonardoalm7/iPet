"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ScanLine, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import {
  extrairMicrochipDeFoto,
  type ResultadoOCRMicrochip,
} from "@/services/ocr-microchip";
import { track } from "@/services/analytics";

type Estado =
  | { fase: "idle" }
  | { fase: "extraindo"; previewUrl: string }
  | { fase: "sucesso"; previewUrl: string; resultado: ResultadoOCRMicrochip; hash: string }
  | { fase: "erro"; mensagem: string; previewUrl?: string };

export function UploadCertificadoMicrochip({
  onAplicar,
}: {
  onAplicar: (numeroChip: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>({ fase: "idle" });

  async function handleFile(file: File) {
    const previewUrl = URL.createObjectURL(file);
    setEstado({ fase: "extraindo", previewUrl });
    track("ocr_microchip_iniciado", { tamanhoBytes: file.size, tipo: file.type });

    const r = await extrairMicrochipDeFoto(file);

    if (!r.ok) {
      track("ocr_microchip_falha", { motivo: r.erro });
      setEstado({ fase: "erro", mensagem: r.erro, previewUrl });
      return;
    }

    if (!r.resultado.encontrouMicrochip || !r.resultado.campos.numeroChip.value) {
      const motivo = r.resultado.observacao ?? "Não localizei um número de 15 dígitos válido.";
      track("ocr_microchip_falha", { motivo });
      setEstado({ fase: "erro", mensagem: motivo, previewUrl });
      return;
    }

    track("ocr_microchip_sucesso", {
      confidence: r.resultado.campos.numeroChip.confidence,
      encontrouMicrochip: true,
    });
    setEstado({ fase: "sucesso", previewUrl, resultado: r.resultado, hash: r.hashDocumento });
  }

  function aplicarNoForm() {
    if (estado.fase !== "sucesso") return;
    const numero = estado.resultado.campos.numeroChip.value;
    if (!numero) return;
    onAplicar(numero);
    track("ocr_microchip_aceito", { numero: `${numero.slice(0, 3)}***${numero.slice(-3)}` });
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
        className="flex items-center gap-3 w-full bg-teal/5 hover:bg-teal/10 border border-teal/30 border-dashed rounded-xl px-3 py-3 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-teal/15 flex items-center justify-center flex-shrink-0">
          <ScanLine className="w-4 h-4 text-teal" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-navy">Tem o certificado do microchip?</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Foto do papel — eu leio os 15 dígitos</p>
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
      <div className="flex items-center gap-3 bg-teal/5 border border-teal/30 rounded-xl px-3 py-3">
        <Image src={estado.previewUrl} alt="Certificado" width={36} height={36} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" unoptimized />
        <div className="flex-1">
          <p className="text-xs font-semibold text-navy flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal" />
            Lendo o certificado…
          </p>
        </div>
      </div>
    );
  }

  if (estado.fase === "erro") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-500">Não consegui ler o número</p>
            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{estado.mensagem}</p>
            <button onClick={reset} className="text-[11px] text-teal font-semibold mt-1.5 inline-flex items-center gap-1 hover:underline">
              <RefreshCw className="w-3 h-3" /> Tentar outra foto ou digitar manual
            </button>
          </div>
        </div>
      </div>
    );
  }

  const numero = estado.resultado.campos.numeroChip.value!;
  const conf = estado.resultado.campos.numeroChip.confidence;
  const corPonto = conf >= 0.85 ? "bg-teal" : conf >= 0.6 ? "bg-ipet-orange" : "bg-red-400";
  const nomeCruzado = estado.resultado.campos.nomePet.value;
  const racaCruzada = estado.resultado.campos.racaPet.value;

  return (
    <div className="bg-white border border-teal/30 rounded-xl p-3 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <Image src={estado.previewUrl} alt="Certificado" width={40} height={40} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" unoptimized />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-navy flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
            Microchip identificado
          </p>
          <p className="text-sm font-mono text-navy mt-1 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${corPonto}`} title={`Confiança: ${(conf * 100).toFixed(0)}%`} />
            {numero}
          </p>
          {(nomeCruzado || racaCruzada) && (
            <p className="text-[11px] text-gray-500 mt-1">
              {nomeCruzado && <>Pet: <span className="text-navy">{nomeCruzado}</span></>}
              {nomeCruzado && racaCruzada && " · "}
              {racaCruzada && <>Raça: <span className="text-navy">{racaCruzada}</span></>}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={aplicarNoForm}
          className="flex-1 bg-teal hover:bg-teal-dark text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          Usar este número
        </button>
        <button
          onClick={reset}
          className="px-3 text-xs text-gray-500 hover:text-gray-700 font-medium"
        >
          Outra foto
        </button>
      </div>

      {conf < 0.85 && (
        <p className="text-[11px] text-ipet-orange leading-relaxed">
          ⚠️ Confiança {(conf * 100).toFixed(0)}% — confira dígito por dígito antes de continuar (chip ID errado = recusa em fronteira).
        </p>
      )}
    </div>
  );
}
