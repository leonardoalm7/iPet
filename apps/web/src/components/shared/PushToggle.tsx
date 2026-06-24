"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, AlertCircle } from "lucide-react";
import {
  pedirPermissaoEObterToken,
  statusAtual,
  type StatusPush,
} from "@/lib/firebase/messaging";

export function PushToggle() {
  const [status, setStatus] = useState<StatusPush>("inativo");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tokenAtual, setTokenAtual] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setStatus(await statusAtual());
    })();
  }, []);

  async function ativar() {
    setErro(null);
    setCarregando(true);
    try {
      const resultado = await pedirPermissaoEObterToken();
      if (!resultado) {
        const novo = await statusAtual();
        setStatus(novo);
        if (novo === "negado") {
          setErro("Permissão negada. Habilite nas configurações do navegador.");
        } else if (novo === "nao-configurado") {
          setErro("Push não configurado pelo servidor.");
        }
        return;
      }

      const res = await fetch("/api/push/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultado),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.erro ?? "Falha ao registrar");
      setTokenAtual(resultado.token);
      setStatus("ativo");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao ativar.");
    } finally {
      setCarregando(false);
    }
  }

  async function testar() {
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/push/testar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "iPet",
          corpo: "Tudo certo. Seu device está conectado.",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.erro ?? "Falha ao testar");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar teste.");
    } finally {
      setCarregando(false);
    }
  }

  async function desativar() {
    if (!tokenAtual) return;
    setCarregando(true);
    try {
      await fetch(
        `/api/push/registrar?token=${encodeURIComponent(tokenAtual)}`,
        { method: "DELETE" },
      );
      setTokenAtual(null);
      setStatus("inativo");
    } finally {
      setCarregando(false);
    }
  }

  if (status === "nao-suportado") {
    return (
      <div className="flex items-start gap-3 text-[12px] text-muted bg-bone-deep rounded-2xl px-4 py-3.5">
        <AlertCircle size={13} strokeWidth={1.5} className="mt-0.5 text-faint shrink-0" />
        Seu navegador não suporta notificações push.
      </div>
    );
  }

  if (status === "nao-configurado") {
    return (
      <div className="flex items-start gap-3 text-[12px] text-muted bg-bone-deep rounded-2xl px-4 py-3.5">
        <AlertCircle size={13} strokeWidth={1.5} className="mt-0.5 text-faint shrink-0" />
        Notificações estarão disponíveis em breve.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            status === "ativo" ? "bg-sage-soft" : "bg-bone-deep"
          }`}>
            {status === "ativo" ? (
              <Bell size={14} strokeWidth={1.5} className="text-sage-deep" />
            ) : (
              <BellOff size={14} strokeWidth={1.5} className="text-faint" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-ink">
              {status === "ativo" ? "Notificações ativas" : "Avisos de prazo"}
            </p>
            <p className="text-[11px] text-muted leading-relaxed mt-0.5">
              {status === "ativo"
                ? "Vamos avisar quando uma etapa do roadmap estiver próxima."
                : "Receba alertas de carência, sorologia e embarque."}
            </p>
          </div>
        </div>

        {status === "ativo" ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={testar}
              disabled={carregando}
              className="text-[11px] text-muted hover:text-ink underline underline-offset-2 disabled:opacity-50"
            >
              Testar
            </button>
            <button
              onClick={desativar}
              disabled={carregando}
              className="text-[11px] text-muted hover:text-status-crit underline underline-offset-2 disabled:opacity-50"
            >
              Desativar
            </button>
          </div>
        ) : (
          <button
            onClick={ativar}
            disabled={carregando || status === "negado"}
            className="bg-ink text-bone px-4 py-2 rounded-full text-[12px] font-medium hover:bg-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            {carregando && <Loader2 size={11} className="animate-spin" />}
            Ativar
          </button>
        )}
      </div>

      {status === "negado" && (
        <p className="text-[11px] text-muted bg-bone-deep rounded-xl px-3 py-2.5">
          Permissão negada no navegador. Habilite manualmente em
          Configurações → Privacidade → Notificações.
        </p>
      )}

      {erro && (
        <p className="text-[11px] text-status-crit bg-[#FBEBE8] border border-[#F2C8C0] rounded-xl px-3 py-2.5">
          {erro}
        </p>
      )}
    </div>
  );
}
