"use client";

import { useState } from "react";
import Link from "next/link";
import { solicitarRedefinicaoSenha } from "@ipet/core/services/auth-service";
import { Loader2, ArrowLeft, ArrowRight, MailCheck, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const { error } = await solicitarRedefinicaoSenha(email);
    setLoading(false);
    if (error) {
      setErro("Não foi possível enviar o link. Verifique o e-mail.");
      return;
    }
    setEnviado(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <AnimatePresence mode="wait">
        {enviado ? (
          <motion.div
            key="enviado"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-7"
          >
            <div className="inline-flex w-14 h-14 rounded-full bg-sage-soft items-center justify-center">
              <MailCheck size={22} strokeWidth={1.5} className="text-sage-deep" />
            </div>
            <div>
              <p className="kicker text-terracotta">Mensagem enviada</p>
              <h1 className="font-display text-[clamp(2rem,3.4vw,2.5rem)] leading-[1.05] font-light tracking-tight text-ink mt-3">
                Verifique sua{" "}
                <span className="font-display-soft italic text-sage-deep">caixa de entrada</span>.
              </h1>
              <p className="text-[13px] text-muted mt-3 leading-relaxed">
                Enviamos um link de redefinição para <span className="font-mono text-ink">{email}</span>.
                Se não encontrar, confira a pasta de spam.
              </p>
            </div>
            <Link
              href="/auth/entrar"
              className="group inline-flex items-center gap-2 bg-ink text-bone text-[13px] font-medium px-6 py-3 rounded-full hover:bg-sage transition-colors"
            >
              Voltar ao login
              <ArrowRight
                size={14}
                strokeWidth={1.75}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-7"
          >
            <Link
              href="/auth/entrar"
              className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              Voltar
            </Link>

            <header>
              <p className="kicker text-terracotta">Recuperar acesso</p>
              <h1 className="font-display text-[clamp(2rem,3.4vw,2.5rem)] leading-[1.05] font-light tracking-tight text-ink mt-3">
                Vamos{" "}
                <span className="font-display-soft italic text-sage-deep">redefinir</span>{" "}
                sua senha.
              </h1>
              <p className="text-[13px] text-muted mt-3 max-w-md leading-relaxed">
                Informe o e-mail da sua conta. Enviaremos um link seguro para
                criação de uma nova senha.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={loading || !email}
                className="group w-full bg-ink text-bone py-3.5 rounded-full text-[13px] font-semibold hover:bg-sage disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enviar link
                {!loading && (
                  <ArrowRight
                    size={14}
                    strokeWidth={1.75}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
