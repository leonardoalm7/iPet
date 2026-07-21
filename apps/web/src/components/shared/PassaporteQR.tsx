"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Pet } from "@ipet/core";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, QrCode } from "lucide-react";

interface PassaporteQRProps {
  pet: Pet;
  temVacina: boolean;
  temSorologia: boolean;
  temMicrochip: boolean;
}

function buildVerificacaoUrl(petId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/verificar/${petId}`;
  }
  return `/verificar/${petId}`;
}

export function PassaporteQRMini({ pet, temVacina, temSorologia, temMicrochip }: PassaporteQRProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const url = buildVerificacaoUrl(pet.id);

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="flex flex-col items-center gap-1.5 group"
      >
        <div className="bg-white rounded-xl p-2 border border-teal/20 shadow-sm group-hover:border-teal/50 transition-colors">
          <QRCodeSVG
            value={url}
            size={64}
            level="M"
            bgColor="transparent"
            fgColor="#1B3A5C"
          />
        </div>
        <span className="text-[10px] text-gray-400 group-hover:text-teal transition-colors">
          Toque para ampliar
        </span>
      </button>

      <AnimatePresence>
        {modalAberto && (
          <PassaporteQRModal
            pet={pet}
            url={url}
            temVacina={temVacina}
            temSorologia={temSorologia}
            temMicrochip={temMicrochip}
            onClose={() => setModalAberto(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function PassaporteQRModal({
  pet,
  url,
  temVacina,
  temSorologia,
  temMicrochip,
  onClose,
}: {
  pet: Pet;
  url: string;
  temVacina: boolean;
  temSorologia: boolean;
  temMicrochip: boolean;
  onClose: () => void;
}) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const size = 1024;
    canvas.width = size;
    canvas.height = size + 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FAF9F6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const padding = 80;
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

      ctx.fillStyle = "#1B3A5C";
      ctx.font = "bold 36px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${pet.nome} — iPet Pass`, size / 2, size + 60);

      ctx.fillStyle = "#6B7280";
      ctx.font = "24px system-ui";
      ctx.fillText(pet.raca, size / 2, size + 100);

      if (pet.microchip) {
        ctx.font = "20px monospace";
        ctx.fillStyle = "#2E8B9A";
        ctx.fillText(`Microchip: ${pet.microchip}`, size / 2, size + 140);
      }

      const link = document.createElement("a");
      link.download = `ipet-pass-${pet.nome.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  }, [pet]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: `iPet Pass — ${pet.nome}`,
        text: `Passaporte digital de ${pet.nome} (${pet.raca})`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copiado!");
    }
  }, [pet, url]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-cream rounded-3xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal" />
            <h2 className="text-lg font-bold text-navy">iPet Pass</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Pet info */}
        <div className="text-center px-5 pb-3">
          <p className="text-xl font-bold text-navy">{pet.nome}</p>
          <p className="text-sm text-gray-500">{pet.raca} · {pet.peso}kg</p>
        </div>

        {/* QR */}
        <div className="flex justify-center px-5 py-4" ref={qrRef}>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <QRCodeSVG
              value={url}
              size={220}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#1B3A5C"
              imageSettings={{
                src: "",
                height: 0,
                width: 0,
                excavate: false,
              }}
            />
          </div>
        </div>

        {/* Status badges */}
        <div className="flex justify-center gap-2 px-5 pb-4">
          <StatusPill ok={temMicrochip} label="Microchip" />
          <StatusPill ok={temVacina} label="Vacina" />
          <StatusPill ok={temSorologia} label="Sorologia" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-6">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Salvar
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-teal/50 text-navy font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
        ok
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}
