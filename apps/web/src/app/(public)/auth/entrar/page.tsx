"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, signInWithGoogle } from "@ipet/core/services/auth-service";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function EntrarPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setLoading(true);
    const { error } = await signInWithEmail(email, senha);
    setLoading(false);
    if (error) { setErro("E-mail ou senha incorretos."); return; }
    router.push(redirect);
  }

  async function handleGoogle() {
    setLoading(true);
    await signInWithGoogle();
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <span className="text-5xl">🐾</span>
        <h1 className="text-2xl font-bold text-navy mt-3">iPet</h1>
        <p className="text-navy/50 text-sm mt-1">Faça login para continuar</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-2.5 text-sm font-medium text-navy hover:bg-surface transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-navy/40">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-navy/70 block mb-1.5">E-mail</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy/70 block mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"} required value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy">
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link href="/auth/esqueci-senha" className="text-xs text-teal hover:underline">Esqueci a senha</Link>
            </div>
          </div>

          {erro && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-teal text-white font-semibold py-2.5 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Entrar
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-navy/50 mt-5">
        Não tem conta?{" "}
        <Link href="/auth/cadastro" className="text-teal font-medium hover:underline">Criar conta</Link>
      </p>
    </div>
  );
}
