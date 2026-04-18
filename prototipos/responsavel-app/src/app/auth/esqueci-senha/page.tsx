"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, AlertCircle, ChevronLeft } from "lucide-react";
import { solicitarRedefinicaoSenha } from "@/services/auth-service";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const { error } = await solicitarRedefinicaoSenha(email);

    setLoading(false);
    if (error) {
      setErro("Não foi possível enviar o e-mail. Verifique o endereço.");
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8">
      <Link
        href="/auth/entrar"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-600 text-sm mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Link>

      {enviado ? (
        <div className="flex flex-col items-center text-center pt-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-navy mb-2">E-mail enviado!</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Verifique sua caixa de entrada em <span className="text-navy font-medium">{email}</span> e siga as instruções para redefinir sua senha.
          </p>
          <Link href="/auth/entrar" className="mt-8 text-teal text-sm">
            Voltar para o login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-navy mb-2">Esqueceu a senha?</h1>
          <p className="text-gray-500 text-sm mb-8">
            Digite seu e-mail e enviaremos um link para criar uma nova senha.
          </p>

          {erro && (
            <div className="flex items-start gap-2.5 bg-red-900/30 border border-red-700/50 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{erro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-100 border border-gray-200 focus:border-teal text-navy rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-colors placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-2xl transition-colors"
            >
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
