"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@ipet/core";
import { salvarPerfil } from "@ipet/core/services/auth-service";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, perfil, setPerfil } = useAuthStore();
  const [nome, setNome] = useState(perfil?.nomeCompleto ?? "");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !perfil) return;
    setLoading(true);
    try {
      await salvarPerfil(user.id, {
        nomeCompleto: nome.trim(),
        telefone: telefone.trim() || undefined,
        onboardingCompleto: true,
      });
      setPerfil({
        ...perfil,
        nomeCompleto: nome.trim(),
        telefone: telefone.trim() || undefined,
        onboardingCompleto: true,
      });
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full max-w-md"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <p className="kicker text-terracotta">Etapa 01 — Apresente-se</p>
        <h1 className="font-display text-[2.75rem] sm:text-5xl leading-[1.04] font-light tracking-tight text-ink mt-4">
          Vamos preparar o{" "}
          <em className="font-display-soft italic text-sage">passaporte</em> do
          seu pet.
        </h1>
        <p className="text-muted text-[15px] leading-relaxed mt-4 max-w-sm">
          Antes de cadastrar quem voa com você, conte como prefere ser chamado.
          Leva menos de um minuto.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="editorial-rule my-9" />

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="space-y-7"
      >
        <Field
          label="Como prefere ser chamado"
          hint="Usaremos esse nome em mensagens e documentos."
          focused={focused === "nome"}
        >
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onFocus={() => setFocused("nome")}
            onBlur={() => setFocused(null)}
            placeholder="Ex.: Leonardo"
            autoFocus
            className="w-full bg-transparent border-0 border-b border-border focus:border-ink py-3 text-[17px] text-ink placeholder:text-faint focus:outline-none transition-colors"
          />
        </Field>

        <Field
          label="Telefone"
          hint="Opcional — para avisos críticos antes do embarque."
          focused={focused === "tel"}
        >
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            onFocus={() => setFocused("tel")}
            onBlur={() => setFocused(null)}
            placeholder="+55 11 99999-9999"
            className="w-full bg-transparent border-0 border-b border-border focus:border-ink py-3 text-[17px] text-ink placeholder:text-faint focus:outline-none transition-colors font-mono"
          />
        </Field>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !nome.trim()}
            className="group relative w-full overflow-hidden bg-ink text-bone py-4 rounded-full font-medium text-[15px] tracking-tight transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-sage enabled:active:scale-[0.99]"
          >
            <span className="relative flex items-center justify-center gap-2.5">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1"
                  />
                </>
              )}
            </span>
          </button>
          <p className="text-[11px] text-faint mt-4 text-center">
            Ao continuar você concorda com nossa política de privacidade.
          </p>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Field({
  label,
  hint,
  focused,
  children,
}: {
  label: string;
  hint?: string;
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <label
        className={`kicker block mb-1 transition-colors ${
          focused ? "text-ink" : "text-muted"
        }`}
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-faint mt-2">{hint}</p>}
    </div>
  );
}
