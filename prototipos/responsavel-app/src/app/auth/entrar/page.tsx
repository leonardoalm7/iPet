"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
} from "@/services/auth-service";

function EntrarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const oauthError = searchParams.get("error") === "oauth";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);
  const [erro, setErro] = useState<string | null>(oauthError ? "Erro ao autenticar com o provedor. Tente novamente." : null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const { error } = await signInWithEmail(email, senha);

    if (error) {
      setErro(traduzirErroAuth(error.message));
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleGoogle() {
    setLoadingProvider("google");
    setErro(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setErro("Não foi possível iniciar o login com Google.");
      setLoadingProvider(null);
    }
    // Supabase redireciona — não precisa de mais nada aqui
  }

  async function handleApple() {
    setLoadingProvider("apple");
    setErro(null);
    const { error } = await signInWithApple();
    if (error) {
      setErro("Não foi possível iniciar o login com Apple. Verifique se seu domínio está configurado.");
      setLoadingProvider(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-14 pb-8">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 pt-4"
      >
        <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center border border-teal/20">
          <PawPrint className="w-8 h-8 text-teal" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy">
            ✈️ <span className="text-teal">iPet</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pet Pass</p>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-xl font-semibold text-navy text-center">
          Bem-vindo de volta
        </h2>

        {/* Erro */}
        {erro && (
          <div className="flex items-start gap-2.5 bg-red-900/30 border border-red-700/50 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{erro}</p>
          </div>
        )}

        {/* Login Social */}
        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            disabled={!!loadingProvider || loading}
            className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 disabled:opacity-60 text-navy font-medium py-3.5 rounded-2xl transition-colors"
          >
            {loadingProvider === "google" ? (
              <Spinner dark />
            ) : (
              <GoogleIcon />
            )}
            <span>Continuar com Google</span>
          </button>

          <button
            onClick={handleApple}
            disabled={!!loadingProvider || loading}
            className="flex items-center justify-center gap-3 w-full bg-black hover:bg-white disabled:opacity-60 text-navy font-medium py-3.5 rounded-2xl border border-gray-200 transition-colors"
          >
            {loadingProvider === "apple" ? (
              <Spinner />
            ) : (
              <AppleIcon />
            )}
            <span>Continuar com Apple</span>
          </button>
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-400 text-xs">ou use seu e-mail</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Form email */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-gray-100 border border-gray-200 focus:border-teal text-navy rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-colors placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
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

          <div className="flex justify-end">
            <Link
              href="/auth/esqueci-senha"
              className="text-xs text-teal hover:text-teal"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !!loadingProvider}
            className="flex items-center justify-center gap-2 w-full bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-2xl transition-colors"
          >
            {loading ? <Spinner /> : "Entrar"}
          </button>
        </form>
      </motion.div>

      {/* Rodapé */}
      <p className="text-center text-gray-500 text-sm">
        Não tem conta?{" "}
        <Link href="/auth/cadastro" className="text-teal hover:text-teal font-medium">
          Criar conta gratuita
        </Link>
      </p>
    </div>
  );
}

// ─── Ícones e componentes auxiliares ──────────────────────────────────────

function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`w-4 h-4 border-2 rounded-full animate-spin ${
        dark ? "border-gray-300 border-t-navy" : "border-gray-500 border-t-white"
      }`}
    />
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" fill="white">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 389.6 0 228.4 0 168.1c0-20.7 3.9-41.4 10.4-60.7l8.4-32.3C35.1 36 77.7 0 131.3 0c32.3 0 75.5 30.5 107.6 30.5 28 0 81.2-30.5 122-30.5 8.4 0 186.3 8.4 186.3 177.1 0 107.8-60.5 197.5-60.5 197.5 17.5 14.9 77.1 42.8 77.1 42.8C615.7 427.4 788.1 357.1 788.1 340.9z"/>
    </svg>
  );
}

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      }
    >
      <EntrarContent />
    </Suspense>
  );
}

function traduzirErroAuth(message: string): string {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  if (message.includes("Too many requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (message.includes("User already registered")) return "Este e-mail já está cadastrado. Tente entrar.";
  return "Erro ao autenticar. Tente novamente.";
}
