"use client";

import { Lock, ChevronRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { track } from "@/services/analytics";

interface Props {
  planoId: string;
  destino: string;
  onDesbloquear: () => void;
}

export function PaywallBanner({ planoId, destino, onDesbloquear }: Props) {
  function handleClick() {
    track("paywall_clicado", { planoId, destino });
    onDesbloquear();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-navy/20 bg-navy/5 p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-navy" />
        </div>
        <div className="flex-1">
          <p className="text-navy font-semibold text-sm">
            Desbloqueie o Roadmap Completo
          </p>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Datas retroativas exatas, alertas de prazo, checklist de embarque e
            notificações push para não perder nenhum deadline.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-border">
        <ShieldCheck className="w-5 h-5 text-teal flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-gray-400">
            Despachantes cobram <span className="line-through">R$ 5.000+</span>
          </p>
          <p className="text-navy font-bold text-lg">
            R$ 99<span className="text-xs font-normal text-gray-400">,00 /viagem</span>
          </p>
        </div>
      </div>

      <button
        onClick={handleClick}
        className="flex items-center justify-center gap-2 w-full bg-navy hover:bg-navy-light text-white font-semibold py-3.5 rounded-2xl transition-colors"
      >
        Desbloquear iPet Travel Plan
        <ChevronRight className="w-4 h-4" />
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        Pagamento único por viagem · Pix, cartão ou boleto · Mercado Pago
      </p>
    </motion.div>
  );
}
