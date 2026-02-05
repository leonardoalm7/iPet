"use client";

import { useState } from "react";
import { Pet } from "@/MockPets";
import { ComplianceResult } from "@/types/compliance";
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface PetCardProps {
  pet: Pet;
  compliance: ComplianceResult;
}

export function PetCard({ pet, compliance }: PetCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Formatar microchip para exibição: 963 003 100 418 164
  const formatMicrochip = (chip: string): string => {
    return chip.match(/.{1,3}/g)?.join(" ") || chip;
  };

  // URL de fallback para imagens que não carregam
  const fallbackUrl = "https://via.placeholder.com/400x400/4B5563/9CA3AF?text=Pet";
  const imageUrl = imageError ? fallbackUrl : pet.foto;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-2xl"
    >
      {/* Microchip - DESTAQUE MÁXIMO */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          Número do Microchip
        </div>
        <div className="font-mono text-3xl font-bold text-cyan-400 tracking-wider leading-tight">
          {formatMicrochip(pet.microchip)}
        </div>
      </div>

      {/* Foto e Nome */}
      <div className="flex gap-4 mb-6">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-700 flex-shrink-0 bg-gray-800">
          <img
            src={imageUrl}
            alt={pet.nome}
            className="w-full h-full object-cover"
            onError={() => {
              if (!imageError) {
                setImageError(true);
              }
            }}
            onLoad={() => setImageError(false)}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{pet.nome}</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <div>Data de Nascimento: {pet.dataNascimento}</div>
            <div>Proprietário: {pet.proprietario}</div>
            <div>Raça: {pet.raca}</div>
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="space-y-3 mb-6">
        {/* Vacina */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            {pet.vacina.valida ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <div className="text-sm text-gray-300 font-medium">Vacina Antirrábica</div>
              <div className="text-xs text-gray-400">{pet.vacina.data}</div>
            </div>
          </div>
          {pet.vacina.valida && (
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
          )}
        </div>

        {/* Sorologia */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            {pet.sorologia ? (
              pet.sorologia.status === "OK" ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <div className="text-sm text-gray-300 font-medium">Sorologia Antirrábica</div>
              {pet.sorologia ? (
                <div className="text-xs text-gray-400">
                  {pet.sorologia.data} - {pet.sorologia.valor} ({pet.sorologia.status})
                </div>
              ) : (
                <div className="text-xs text-red-400">Pendente</div>
              )}
            </div>
          </div>
          {pet.sorologia?.status === "OK" && (
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
          )}
        </div>
      </div>

      {/* Status Compliance */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`p-4 rounded-lg border-2 ${
          compliance.apto
            ? "bg-green-900/20 border-green-500"
            : "bg-red-900/20 border-red-500"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {compliance.apto ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400" />
          )}
          <span
            className={`font-bold text-lg ${
              compliance.apto ? "text-green-400" : "text-red-400"
            }`}
          >
            {compliance.apto ? "✅ APTO" : "❌ BLOQUEADO"}
          </span>
        </div>
        {compliance.motivo && (
          <p className="text-sm text-gray-300 mt-2">{compliance.motivo}</p>
        )}
        {compliance.dataLiberacao && (
          <p className="text-xs text-yellow-400 mt-1">
            Data de liberação: {compliance.dataLiberacao}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
