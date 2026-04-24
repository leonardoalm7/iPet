"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

function SucessoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planoId = searchParams.get("planoId");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-20 h-20 rounded-full bg-teal-light flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-teal" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h1 className="text-2xl font-bold text-navy">Roadmap Desbloqueado!</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Seu iPet Travel Plan está ativo. Agora você tem acesso ao roadmap
          completo com datas, alertas e checklist de embarque.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => router.push(planoId ? `/viagens/${planoId}` : "/")}
        className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-8 py-3.5 rounded-2xl transition-colors mt-8"
      >
        Ver meu roadmap
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

export default function CheckoutSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  );
}
