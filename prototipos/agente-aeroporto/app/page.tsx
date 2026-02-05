"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bluetooth, Radio, Plane } from "lucide-react";
import { pets } from "@/MockPets";
import { PetCard } from "@/components/PetCard";
import { verificarCompliance } from "@/utils/compliance";
import { Destino, ComplianceResult } from "@/types/compliance";
import { Pet } from "@/MockPets";

export default function Home() {
  const [destino, setDestino] = useState<Destino>("BRASIL");
  const [petParaLer, setPetParaLer] = useState<Pet | null>(null);
  const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const destinos = [
    { value: "BRASIL" as Destino, label: "🇧🇷 Brasil", flag: "🇧🇷" },
    {
      value: "UNIAO_EUROPEIA" as Destino,
      label: "🇪🇺 União Europeia",
      flag: "🇪🇺",
    },
    { value: "JAPAO" as Destino, label: "🇯🇵 Japão", flag: "🇯🇵" },
  ];

  const simularLeitura = () => {
    if (!petParaLer) return;
    
    setIsScanning(true);
    
    // Simular delay de leitura
    setTimeout(() => {
      setPetSelecionado(petParaLer);
      const resultado = verificarCompliance(petParaLer, destino);
      setCompliance(resultado);
      setIsScanning(false);
    }, 1500);
  };

  const handleDestinoChange = (novoDestino: Destino) => {
    setDestino(novoDestino);
    if (petSelecionado) {
      const resultado = verificarCompliance(petSelecionado, novoDestino);
      setCompliance(resultado);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">
              Agente de Aeroporto
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Origem: 🇧🇷 BRASIL | Data do Sistema: 20 de Janeiro de 2026
          </div>
        </div>

        {/* Controles */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Seletor de Pet */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <label className="block text-sm text-gray-400 mb-2">
              Selecionar Pet:
            </label>
            <select
              value={petParaLer?.microchip || ""}
              onChange={(e) => {
                const pet = pets.find((p) => p.microchip === e.target.value);
                setPetParaLer(pet || null);
                setPetSelecionado(null);
                setCompliance(null);
              }}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">-- Selecione um pet --</option>
              {pets.map((pet) => (
                <option key={pet.microchip} value={pet.microchip}>
                  {pet.nome.split(" ")[0]} ({pet.microchip.slice(0, 6)}...)
                </option>
              ))}
            </select>
          </div>

          {/* Botão Bluetooth */}
          <motion.button
            onClick={simularLeitura}
            disabled={isScanning || !petParaLer}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Radio className="w-5 h-5" />
                </motion.div>
                <span>Lendo microchip...</span>
              </>
            ) : (
              <>
                <Bluetooth className="w-5 h-5" />
                <span>Simular Leitura Bluetooth</span>
              </>
            )}
            {isScanning && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(6, 182, 212, 0.7)",
                    "0 0 0 10px rgba(6, 182, 212, 0)",
                    "0 0 0 0 rgba(6, 182, 212, 0)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
          </motion.button>

          {/* Dropdown Destino */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <label className="block text-sm text-gray-400 mb-2">
              Destino:
            </label>
            <select
              value={destino}
              onChange={(e) => handleDestinoChange(e.target.value as Destino)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {destinos.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card do Pet */}
        <AnimatePresence mode="wait">
          {petSelecionado && compliance && (
            <motion.div
              key={`${petSelecionado.microchip}-${destino}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <PetCard pet={petSelecionado} compliance={compliance} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instruções */}
        {!petSelecionado && (
          <div className="mt-12 text-center text-gray-500">
            <p className="text-lg mb-2">
              Selecione um pet e clique em &quot;Simular Leitura Bluetooth&quot; para iniciar
            </p>
            <p className="text-sm">
              O sistema verificará automaticamente a compliance do pet com base
              no destino selecionado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
