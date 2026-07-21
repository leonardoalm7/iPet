"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { redefinirSenha } from "@ipet/core/services/auth-service";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (senha !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await redefinirSenha(senha);
    setLoading(false);
    if (error) {
      setErro("Não foi possível redefinir a senha. Tente novamente.");
      return;
    }
    setSucesso(true);
    setTimeout(() => router.replace("/auth/entrar"), 2500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <AnimatePresence mode="wait">
        {sucesso ? (
          <motion.div
            key="sucesso"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-7"
          >
            <div className="inline-flex w-14 h-14 rounded-full bg-sage-soft items-center justify-center">
              <CheckCircle2 size={22} strokeWidth={1.5} className="text-sage-deep" />
            </div>
            <div>
              <p className="kicker text-terracotta">Tudo certo</p>
              <h1 className="font-display text-[clamp(2rem,3.4vw,2.5rem)] leading-[1.05] font-light tracking-tight text-ink mt-3">
                Sua senha foi{" "}
                <span className="font-display-soft italic text-sage-deep">redefinida</span>.
              </h1>
              <p className="text-[13px] text-muted mt-3">
                Redirecionando para o login…
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-7"
          >
            <header>
              <p className="kicker text-terracotta">Defina uma nova senha</p>
              <h1 className="font-display text-[clamp(2rem,3.4vw,2.5rem)] leading-[1.05] font-light tracking-tight text-ink mt-3">
                Crie uma{" "}
                <span className="font-display-soft italic text-sage-deep">chave</span>{" "}
                segura.
              </h1>
              <p className="text-[13px] text-muted mt-3 leading-relaxed">
                Mínimo de 8 caracteres. Recomendamos combinar letras,
                números e símbolos.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Field
                label="Nova senha"
                value={senha}
                onChange={setSenha}
                mostrar={mostrar}
                onToggle={() => setMostrar(!mostrar)}
              />
              <Field
                label="Confirmar senha"
                value={confirma}
                onChange={setConfirma}
                mostrar={mostrar}
                onToggle={() => setMostrar(!mostrar)}
              />

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
                Redefinir senha
                {!loading && (
                  <ArrowRight
                    size={14}
                    strokeWidth={1.75}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

              <p className="text-center text-[12px] text-muted">
                <Link
                  href="/auth/entrar"
                  className="link-underline text-ink/80 hover:text-ink"
                >
                  Voltar ao login
                </Link>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  mostrar,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mostrar: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="kicker text-muted block mb-2 flex items-center gap-1.5">
        <Lock size={11} strokeWidth={1.5} /> {label}
      </label>
      <div className="relative">
        <input
          type={mostrar ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-transparent border-0 border-b border-border focus:border-ink py-2.5 pr-10 text-[15px] font-mono text-ink placeholder:text-faint focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors"
        >
          {mostrar ? (
            <EyeOff size={15} strokeWidth={1.5} />
          ) : (
            <Eye size={15} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}
