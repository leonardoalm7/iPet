"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VerificarEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [reenviado, setReenviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function reenviarEmail() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    setReenviado(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mb-6 border border-sky-500/20">
        <Mail className="w-9 h-9 text-sky-400" />
      </div>

      <h1 className="text-xl font-bold text-white mb-2">Confirme seu e-mail</h1>
      <p className="text-gray-400 text-sm leading-relaxed mb-2">
        Enviamos um link de confirmação para
      </p>
      <p className="text-sky-400 font-semibold text-sm mb-6 break-all">{email}</p>

      <p className="text-gray-500 text-xs leading-relaxed mb-8 max-w-xs">
        Abra o e-mail e clique no link para ativar sua conta. Verifique também a pasta de spam.
      </p>

      {reenviado ? (
        <p className="text-emerald-400 text-sm">✓ E-mail reenviado com sucesso!</p>
      ) : (
        <button
          onClick={reenviarEmail}
          disabled={loading}
          className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Reenviar e-mail de confirmação
        </button>
      )}

      <Link
        href="/auth/entrar"
        className="mt-8 text-gray-500 hover:text-gray-400 text-sm"
      >
        Voltar para o login
      </Link>
    </div>
  );
}
