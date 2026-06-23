"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, REGRAS_DESTINO } from "@ipet/core";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ planoId: string }>;
}) {
  const { planoId } = use(params);
  const router = useRouter();
  const plano = useAppStore((s) =>
    s.planosViagem.find((p) => p.id === planoId),
  );
  const pet = useAppStore((s) =>
    plano ? s.pets.find((p) => p.id === s.getPrimeiroPetIdDoPlano(plano.id)) : undefined,
  );
  const ativarPremium = useAppStore((s) => s.ativarPremium);

  if (!plano || !pet) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted text-[13px]">Plano não encontrado.</p>
      </div>
    );
  }

  if (plano.isPremium) {
    router.replace(`/viagens/${plano.id}`);
    return null;
  }

  const regras = REGRAS_DESTINO[plano.destino];

  function handlePagar() {
    if (!plano) return;
    ativarPremium(planoId, `sim_${Date.now()}`);
    router.push(`/checkout/sucesso?planoId=${planoId}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg mx-auto space-y-8 pb-8"
    >
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors mb-5"
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Voltar
        </button>
        <p className="kicker text-terracotta">iPet Travel Plan</p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
          Confirme seu{" "}
          <span className="font-display-soft italic text-sage-deep">pedido</span>.
        </h1>
        <p className="text-[13px] text-muted mt-2.5 max-w-md">
          Compra única por viagem. Desbloqueia o roadmap completo, alertas e o
          checklist do embarque.
        </p>
      </div>

      <div className="editorial-rule" />

      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-paper border border-border rounded-2xl p-6 space-y-5"
      >
        <p className="kicker text-muted">Resumo</p>
        <div className="space-y-3">
          <Row label="Pet" value={pet.nome} />
          <Row label="Destino" value={`${regras.bandeira} ${regras.nome}`} />
          <Row label="Embarque" value={plano.dataEmbarque} mono />
          <div className="border-t border-border pt-3">
            <Row label="Produto" value="iPet Travel Plan" />
          </div>
        </div>

        <div className="bg-bone-deep rounded-2xl p-5 flex items-end justify-between">
          <div>
            <p className="kicker text-muted">Total</p>
            <p className="font-display text-[36px] text-ink leading-none mt-1.5">
              R$ 99
              <span className="font-mono text-[14px] text-muted ml-1">,00</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted font-mono uppercase tracking-widest">
              Pagamento
            </p>
            <p className="text-[10px] text-muted font-mono uppercase tracking-widest">
              único · por viagem
            </p>
          </div>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-ink text-bone p-6"
      >
        <div aria-hidden className="absolute inset-0 paper-grain opacity-70" />
        <div
          aria-hidden
          className="absolute -bottom-16 -right-12 w-[260px] h-[260px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(63,92,76,0.35) 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="kicker text-terracotta/85">Você desbloqueia</p>
          <ul className="space-y-2.5 mt-3">
            {[
              "Roadmap com datas retroativas exatas",
              "Alertas de prazo e vencimento",
              "Checklist completo do dia do embarque",
              "Notificações push de deadline",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-[13px] text-bone/85"
              >
                <ShieldCheck
                  size={13}
                  strokeWidth={1.5}
                  className="text-terracotta shrink-0"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.article>

      <div className="space-y-2.5 px-1">
        <div className="flex items-center gap-2 text-[12px] text-muted">
          <Lock size={12} strokeWidth={1.5} className="text-sage" />
          Pagamento seguro via Mercado Pago
        </div>
        <div className="flex items-center gap-2 text-[12px] text-muted">
          <CreditCard size={12} strokeWidth={1.5} className="text-faint" />
          Pix, cartão de crédito ou boleto
        </div>
      </div>

      <button
        onClick={handlePagar}
        className="group w-full flex items-center justify-center gap-2 bg-ink text-bone py-4 rounded-full text-[14px] font-semibold hover:bg-sage transition-colors"
      >
        Pagar com Mercado Pago
        <ArrowRight
          size={15}
          strokeWidth={1.75}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>

      <p className="text-[11px] text-faint text-center leading-relaxed">
        Ao pagar, você concorda com os{" "}
        <a href="/lgpd/termos" className="link-underline text-ink/70">
          Termos de Uso
        </a>{" "}
        do iPet. O pagamento é processado pelo Mercado Pago.
      </p>
    </motion.div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-muted">{label}</span>
      <span
        className={`text-[13px] text-ink ${
          mono ? "font-mono" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
