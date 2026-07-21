"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { REGRAS_DESTINO } from "@/data/destinations";
import { ArrowLeft, Lock, CreditCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { track } from "@/services/analytics";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ planoId: string }>;
}) {
  const { planoId } = use(params);
  const router = useRouter();
  const plano = useAppStore((s) => s.planosViagem.find((p) => p.id === planoId));
  const pet = useAppStore((s) =>
    plano ? s.pets.find((p) => p.id === s.getPrimeiroPetIdDoPlano(plano.id)) : undefined,
  );
  const ativarPremium = useAppStore((s) => s.ativarPremium);

  if (!plano || !pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Plano não encontrado.</p>
      </div>
    );
  }

  if (plano.isPremium) {
    router.replace(`/viagens/${plano.id}`);
    return null;
  }

  const regras = REGRAS_DESTINO[plano.destino];

  function handlePagar() {
    track("checkout_iniciado", { planoId, destino: plano!.destino });
    // TODO: Integrar Mercado Pago Checkout Pro (US-1.2)
    // Por enquanto, simula pagamento aprovado para validar o fluxo
    ativarPremium(planoId, `sim_${Date.now()}`);
    track("pagamento_aprovado", { planoId, destino: plano!.destino, metodo: "simulado" });
    router.push(`/checkout/sucesso?planoId=${planoId}`);
  }

  return (
    <div className="flex flex-col min-h-screen pb-8 bg-white">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <h1 className="text-lg font-semibold text-navy">Checkout</h1>
      </header>

      <main className="px-5 space-y-5 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-border rounded-2xl p-5 space-y-4"
        >
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Resumo do pedido
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Pet</span>
              <span className="text-sm font-medium text-navy">{pet.nome}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Destino</span>
              <span className="text-sm font-medium text-navy">
                {regras.bandeira} {regras.nome}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Embarque</span>
              <span className="text-sm font-medium text-navy">{plano.dataEmbarque}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Produto</span>
                <span className="text-sm font-medium text-navy">iPet Travel Plan</span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-2xl font-bold text-navy">
                R$ 99<span className="text-sm font-normal text-gray-400">,00</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Pagamento único</p>
              <p className="text-[10px] text-gray-400">por viagem</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-teal" />
            Pagamento seguro via Mercado Pago
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CreditCard className="w-4 h-4 text-gray-400" />
            Pix, cartão de crédito ou boleto
          </div>
        </div>

        <div className="bg-navy/5 border border-navy/10 rounded-2xl p-4">
          <p className="text-xs text-navy font-semibold mb-1">O que você desbloqueia:</p>
          <ul className="space-y-1.5">
            {[
              "Roadmap com datas retroativas exatas",
              "Alertas de prazo e vencimento",
              "Checklist completo do dia do embarque",
              "Notificações push de deadline",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handlePagar}
          className="flex items-center justify-center gap-2 w-full bg-navy hover:bg-navy-light text-white font-semibold py-4 rounded-2xl transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          Pagar com Mercado Pago
        </button>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Ao pagar, você concorda com os Termos de Uso do iPet Pass.
          O pagamento é processado pelo Mercado Pago.
        </p>
      </main>
    </div>
  );
}
