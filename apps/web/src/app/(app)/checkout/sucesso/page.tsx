"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function SucessoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planoId = searchParams.get("planoId");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg mx-auto flex flex-col items-center text-center py-16 px-6"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-20 h-20 mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-sage-soft" />
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle2 size={32} strokeWidth={1.5} className="text-sage-deep" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <p className="kicker text-terracotta">Pagamento confirmado</p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-[1.05] font-light tracking-tight text-ink mt-3">
          Roadmap{" "}
          <span className="font-display-soft italic text-sage-deep">
            desbloqueado
          </span>
          .
        </h1>
        <p className="text-[13px] text-muted mt-4 leading-relaxed max-w-sm mx-auto">
          O iPet Travel Plan está ativo. Agora você tem o roadmap completo,
          alertas de prazo e o checklist do dia do embarque.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => router.push(planoId ? `/viagens/${planoId}` : "/")}
        className="group inline-flex items-center gap-2 bg-ink text-bone px-7 py-3.5 rounded-full text-[13px] font-semibold hover:bg-sage transition-colors mt-10"
      >
        Ver meu roadmap
        <ArrowRight
          size={14}
          strokeWidth={1.75}
          className="transition-transform group-hover:translate-x-1"
        />
      </motion.button>
    </motion.div>
  );
}

export default function CheckoutSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <p className="text-muted text-[13px]">Carregando…</p>
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  );
}
