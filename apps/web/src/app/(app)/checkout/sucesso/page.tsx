"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppStore } from "@ipet/core";
import { CheckCircle2, ArrowRight, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";

type Estado = "verificando" | "aprovado" | "pendente" | "erro";

function SucessoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planoId = searchParams.get("planoId");
  const isMock = searchParams.get("mock") === "1";
  const statusParam = searchParams.get("status");

  const plano = useAppStore((s) =>
    planoId ? s.planosViagem.find((p) => p.id === planoId) : undefined,
  );
  const ativarPremium = useAppStore((s) => s.ativarPremium);

  const [estado, setEstado] = useState<Estado>(
    statusParam === "pending" ? "pendente" : "verificando",
  );

  useEffect(() => {
    if (!planoId) {
      setEstado("erro");
      return;
    }

    if (plano?.isPremium) {
      setEstado("aprovado");
      return;
    }

    if (isMock) {
      ativarPremium(planoId, `mock_${Date.now()}`);
      setEstado("aprovado");
      return;
    }

    let cancelled = false;
    let tentativas = 0;
    const MAX_TENTATIVAS = 10;

    async function checar() {
      if (cancelled) return;
      tentativas++;
      try {
        const res = await fetch(
          `/api/checkout/status?planoId=${planoId}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.ok && data.isPremium) {
          if (planoId) ativarPremium(planoId, data.pagamentoId ?? "");
          setEstado("aprovado");
          return;
        }
        if (tentativas >= MAX_TENTATIVAS) {
          setEstado("pendente");
          return;
        }
        setTimeout(checar, 3000);
      } catch {
        if (cancelled) return;
        if (tentativas >= MAX_TENTATIVAS) setEstado("pendente");
        else setTimeout(checar, 3000);
      }
    }

    checar();
    return () => {
      cancelled = true;
    };
  }, [planoId, isMock, plano?.isPremium, ativarPremium]);

  if (estado === "verificando") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto flex flex-col items-center text-center py-24 px-6"
      >
        <Loader2
          size={28}
          className="animate-spin text-sage-deep mb-6"
        />
        <p className="kicker text-muted">Confirmando pagamento</p>
        <h1 className="font-display text-[clamp(1.5rem,2.5vw,1.85rem)] leading-tight font-light tracking-tight text-ink mt-3">
          Validando com o{" "}
          <span className="font-display-soft italic text-sage-deep">
            Mercado Pago
          </span>
        </h1>
        <p className="text-[13px] text-muted mt-3 max-w-sm leading-relaxed">
          Isso costuma levar alguns segundos. Não feche esta página.
        </p>
      </motion.div>
    );
  }

  if (estado === "pendente") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto flex flex-col items-center text-center py-20 px-6"
      >
        <div className="w-20 h-20 mb-7 rounded-full bg-terracotta-soft flex items-center justify-center">
          <Clock size={28} strokeWidth={1.5} className="text-terracotta-deep" />
        </div>
        <p className="kicker text-terracotta">Pagamento em análise</p>
        <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-light tracking-tight text-ink mt-3">
          Estamos{" "}
          <span className="font-display-soft italic text-sage-deep">
            confirmando
          </span>
        </h1>
        <p className="text-[13px] text-muted mt-3 max-w-sm leading-relaxed">
          O Mercado Pago ainda está processando seu pagamento. Você receberá
          um e-mail assim que for aprovado, geralmente em até 30 minutos.
        </p>
        <button
          onClick={() => router.push("/viagens")}
          className="inline-flex items-center gap-2 bg-ink text-bone px-6 py-3 rounded-full text-[13px] font-semibold hover:bg-sage transition-colors mt-8"
        >
          Voltar às viagens
        </button>
      </motion.div>
    );
  }

  if (estado === "erro") {
    return (
      <div className="max-w-lg mx-auto text-center py-24 px-6">
        <p className="text-[13px] text-muted">
          Plano não encontrado. Volte para{" "}
          <button
            onClick={() => router.push("/viagens")}
            className="link-underline text-ink"
          >
            suas viagens
          </button>
          .
        </p>
      </div>
    );
  }

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
