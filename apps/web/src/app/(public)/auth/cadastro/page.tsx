"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signUpWithEmail,
  signInWithGoogle,
} from "@ipet/core/services/auth-service";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setErro("");
    setLoading(true);
    const { error } = await signUpWithEmail(email, senha, nome);
    setLoading(false);
    if (error) {
      setErro("Não foi possível criar a conta. Tente outro e-mail.");
      return;
    }
    router.push("/auth/verificar-email");
  }

  async function handleGoogle() {
    setLoading(true);
    await signInWithGoogle();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md space-y-7"
    >
      <header>
        <p className="kicker text-terracotta">Criar conta</p>
        <h1 className="font-display text-[clamp(2rem,3.4vw,2.5rem)] leading-[1.05] font-light tracking-tight text-ink mt-3">
          Comece a{" "}
          <span className="font-display-soft italic text-sage-deep">
            planejar
          </span>{" "}
          viagens com o seu pet.
        </h1>
        <p className="text-[13px] text-muted mt-3 leading-relaxed">
          Cadastro gratuito. Você só paga ao desbloquear o roadmap completo de
          uma viagem.
        </p>
      </header>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-border rounded-full py-3 text-[13px] font-medium text-ink hover:bg-bone-deep transition-colors disabled:opacity-50"
      >
        <GoogleGlyph />
        Continuar com Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-faint">
          ou
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="kicker text-muted block mb-2 flex items-center gap-1.5">
            <User size={11} strokeWidth={1.5} /> Nome completo
          </label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="w-full bg-transparent border-0 border-b border-border focus:border-ink py-2.5 text-[15px] text-ink placeholder:text-faint focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="kicker text-muted block mb-2 flex items-center gap-1.5">
            <Mail size={11} strokeWidth={1.5} /> E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full bg-transparent border-0 border-b border-border focus:border-ink py-2.5 text-[15px] font-mono text-ink placeholder:text-faint focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="kicker text-muted block mb-2 flex items-center gap-1.5">
            <Lock size={11} strokeWidth={1.5} /> Senha
          </label>
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-transparent border-0 border-b border-border focus:border-ink py-2.5 pr-10 text-[15px] font-mono text-ink placeholder:text-faint focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors"
            >
              {mostrarSenha ? (
                <EyeOff size={15} strokeWidth={1.5} />
              ) : (
                <Eye size={15} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {erro && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-status-crit bg-[#FBEBE8] border border-[#F2C8C0] rounded-xl px-3 py-2.5"
          >
            {erro}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group w-full bg-ink text-bone py-3.5 rounded-full text-[13px] font-semibold hover:bg-sage disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Criar conta
          {!loading && (
            <ArrowRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-1"
            />
          )}
        </button>

        <p className="text-[11px] text-faint text-center leading-relaxed">
          Ao criar conta você concorda com os{" "}
          <Link href="/lgpd/termos" className="link-underline text-ink/70">
            Termos
          </Link>{" "}
          e a{" "}
          <Link href="/lgpd/privacidade" className="link-underline text-ink/70">
            Política de Privacidade
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-[12px] text-muted">
        Já tem conta?{" "}
        <Link
          href="/auth/entrar"
          className="link-underline text-ink/80 hover:text-ink font-medium"
        >
          Entrar
        </Link>
      </p>
    </motion.div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
