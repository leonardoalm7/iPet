"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@ipet/core/services/auth-service";
import { Loader2, ArrowLeft } from "lucide-react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { setErro("Não foi possível enviar o link. Verifique o e-mail."); return; }
    setEnviado(true);
  }

  if (enviado) return (
    <div className="w-full max-w-sm text-center bg-white rounded-2xl border border-border p-8">
      <span className="text-4xl">✉️</span>
      <h2 className="font-bold text-navy text-lg mt-3">Link enviado!</h2>
      <p className="text-navy/60 text-sm mt-2">Verifique sua caixa de entrada e spam.</p>
      <Link href="/auth/entrar" className="mt-4 inline-block text-sm text-teal font-medium hover:underline">Voltar ao login</Link>
    </div>
  );

  return (
    <div className="w-full max-w-sm">
      <Link href="/auth/entrar" className="flex items-center gap-1 text-sm text-navy/60 hover:text-navy mb-6">
        <ArrowLeft size={14} /> Voltar
      </Link>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-navy mb-1">Recuperar senha</h1>
        <p className="text-sm text-navy/50 mb-5">Enviaremos um link de redefinição para seu e-mail.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="seu@email.com" />
          {erro && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-teal text-white font-semibold py-2.5 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Enviar link
          </button>
        </form>
      </div>
    </div>
  );
}
