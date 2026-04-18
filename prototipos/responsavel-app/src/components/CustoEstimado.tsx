"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pet, Destino } from "@/domain/types";
import {
  calcularEstimativaCusto,
  formatBRL,
  ItemCustoComStatus,
} from "@/services/cost-estimator";
import { REGRAS_DESTINO } from "@/data/destinations";
import { ChevronDown, CheckCircle2, Clock, Info } from "lucide-react";

interface Props {
  pet: Pet;
  destino: Destino;
  /** Modo compacto: mostra só o total e um toggle pra expandir */
  compacto?: boolean;
}

const LABELS_CATEGORIA = {
  obrigatorio: "Obrigatório",
  recomendado: "Recomendado",
  opcional: "Opcional",
} as const;

function ItemLinha({ item }: { item: ItemCustoComStatus }) {
  const [aberto, setAberto] = useState(false);
  const isPago = item.status === "pago";

  return (
    <div>
      <button
        onClick={() => item.nota && setAberto(!aberto)}
        className={`w-full flex items-center gap-3 py-2.5 text-left ${
          item.nota ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {/* Ícone de status */}
        <div className="flex-shrink-0 mt-0.5">
          {isPago ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <Clock className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Título + categoria */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm ${isPago ? "text-gray-500 line-through" : "text-navy"}`}>
              {item.titulo}
            </p>
            {item.porViagem && (
              <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                por viagem
              </span>
            )}
            {item.nota && (
              <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-[10px] text-gray-400 capitalize">
            {LABELS_CATEGORIA[item.categoria]}
          </p>
        </div>

        {/* Faixa de preço */}
        <div className="text-right flex-shrink-0">
          {isPago ? (
            <p className="text-xs text-emerald-600">✓ pago</p>
          ) : (
            <p className="text-xs font-medium text-gray-600">
              {formatBRL(item.minBRL)}
              {item.minBRL !== item.maxBRL && (
                <span className="text-gray-400"> – {formatBRL(item.maxBRL)}</span>
              )}
            </p>
          )}
        </div>
      </button>

      {/* Nota expandível */}
      <AnimatePresence>
        {aberto && item.nota && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-gray-400 leading-relaxed pb-2 pl-7 pr-2">
              {item.nota}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CustoEstimado({ pet, destino, compacto = false }: Props) {
  const [expandido, setExpandido] = useState(!compacto);
  const estimativa = calcularEstimativaCusto(pet, destino);
  const regras = REGRAS_DESTINO[destino];

  const temPagos = estimativa.itensPagos.length > 0;
  const faixaTotal =
    estimativa.totalGeralMin === estimativa.totalGeralMax
      ? formatBRL(estimativa.totalGeralMin)
      : `${formatBRL(estimativa.totalGeralMin)} – ${formatBRL(estimativa.totalGeralMax)}`;

  const faixaPendente =
    estimativa.totalPendenteMin === estimativa.totalPendenteMax
      ? formatBRL(estimativa.totalPendenteMin)
      : `${formatBRL(estimativa.totalPendenteMin)} – ${formatBRL(estimativa.totalPendenteMax)}`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header sempre visível */}
      <button
        onClick={() => compacto && setExpandido(!expandido)}
        className={`w-full flex items-center gap-3 p-4 text-left ${
          compacto ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">💰</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy">Estimativa de custo</p>
          <p className="text-xs text-gray-500">
            {pet.nome.split(" ")[0]} → {regras.bandeira} {regras.nome}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-navy">{faixaTotal}</p>
          {estimativa.totalPendenteMin > 0 && (
            <p className="text-[10px] text-ipet-orange">
              {faixaPendente} pendente
            </p>
          )}
        </div>
        {compacto && (
          <motion.div
            animate={{ rotate: expandido ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
          </motion.div>
        )}
      </button>

      {/* Conteúdo expandível */}
      <AnimatePresence initial={!compacto}>
        {expandido && (
          <motion.div
            initial={compacto ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1 border-t border-gray-200 pt-3">

              {/* Já pago */}
              {temPagos && (
                <div className="mb-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Já pago
                  </p>
                  <div className="divide-y divide-gray-200/50">
                    {estimativa.itensPagos.map((item) => (
                      <ItemLinha key={item.id + "_pago"} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Obrigatórios pendentes */}
              {estimativa.itensPendentes.filter((i) => i.categoria === "obrigatorio").length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    A pagar (obrigatório)
                  </p>
                  <div className="divide-y divide-gray-200/50">
                    {estimativa.itensPendentes
                      .filter((i) => i.categoria === "obrigatorio")
                      .map((item) => (
                        <ItemLinha key={item.id} item={item} />
                      ))}
                  </div>
                </div>
              )}

              {/* Recomendados / opcionais */}
              {estimativa.itensPendentes.filter((i) => i.categoria !== "obrigatorio").length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    A pagar (recomendado)
                  </p>
                  <div className="divide-y divide-gray-200/50">
                    {estimativa.itensPendentes
                      .filter((i) => i.categoria !== "obrigatorio")
                      .map((item) => (
                        <ItemLinha key={item.id} item={item} />
                      ))}
                  </div>
                </div>
              )}

              {/* Totalizadores */}
              <div className="pt-3 mt-2 border-t border-gray-200 space-y-1.5">
                {temPagos && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Já investido</p>
                    <p className="text-xs text-emerald-500 font-medium">
                      {formatBRL(estimativa.totalPagoMin)}
                      {estimativa.totalPagoMin !== estimativa.totalPagoMax && (
                        <span> – {formatBRL(estimativa.totalPagoMax)}</span>
                      )}
                    </p>
                  </div>
                )}
                {estimativa.totalPendenteMin > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Ainda a pagar</p>
                    <p className="text-xs text-ipet-orange font-medium">{faixaPendente}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  <p className="text-sm font-semibold text-navy">Total estimado</p>
                  <p className="text-sm font-bold text-navy">{faixaTotal}</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                * Estimativas de mercado. Valores reais variam por clínica, cia aérea e
                câmbio. Toque nos itens para mais detalhes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
