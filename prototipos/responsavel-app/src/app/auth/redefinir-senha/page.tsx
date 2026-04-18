"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redefinirSenha } from "@/services/auth-service";

const REQUISITOS_SENHA = [
  { label: "Mínimo 8 caracteres", test: (s: string) => s.length >= 8 },
  { label: "Letra maiúscula", test: (s: string) => /[A-Z]/.test(s) },
  { label: "Letra minúscula", test: (s: string) => /[a-z]/.test(s) },
  { label: "Número ou símbolo", test: (s: string) => /[0-9!@#$%^&*]/.test(s) },
];

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const senhaValida = REQUISITOS_SENHA.every((r) => r.test(novaSenha));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senhaValida) return;

    setLoading(true);
    setErro(null);

    const { error } = await redefinirSenha(novaSenha);

    setLoading(false);
    if (error) {
      setErro("Não foi possível redefinir a senha. O link pode ter expirado. Solicite um novo.");
      return;
    }
    setSucesso(true);
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">Senha redefinida!</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
          Sua nova senha foi salva com sucesso. Você já pode entrar com ela.
        </p>
        <button
          onClick={() => router.push("/auth/entrar")}
          className="w-full max-w-xs bg-teal hover:bg-teal-dark text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          Ir para o login
        </button>
      </div>
    );
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

      <h1 className="text-2xl font-bold text-navy mb-2">Crie uma nova senha</h1>
      <p className="text-gray-500 text-sm mb-8">
        Escolha uma senha forte que você não use em outros lugares.
      </p>

      {erro && (
        <div className="flex items-start gap-2.5 bg-red-900/30 border border-red-700/50 rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-500 text-sm">{erro}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => {
                setNovaSenha(e.target.value);
                setMostrarRequisitos(true);
              }}
              required
              autoComplete="new-password"
              className="w-full bg-gray-100 border border-gray-200 focus:border-teal text-navy rounded-2xl pl-11 pr-12 py-3.5 text-sm focus:outline-none transition-colors placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mostrarRequisitos && (
            <div className="mt-2 space-y-1">
              {REQUISITOS_SENHA.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${r.test(novaSenha) ? "text-emerald-600" : "text-gray-400"}`}
                  />
                  <span className={`text-xs ${r.test(novaSenha) ? "text-emerald-600" : "text-gray-400"}`}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !senhaValida}
          className="w-full bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
