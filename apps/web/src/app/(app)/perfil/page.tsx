"use client";

import { useState } from "react";
import { useAuthStore } from "@ipet/core";
import { salvarPerfil } from "@ipet/core/services/auth-service";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PerfilPage() {
  const { perfil, setPerfil } = useAuthStore();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    nomeCompleto: perfil?.nomeCompleto ?? "",
    telefone: perfil?.telefone ?? "",
    dataNascimento: perfil?.dataNascimento ?? "",
  });

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true);
    try {
      await salvarPerfil(perfil.id, {
        nomeCompleto: form.nomeCompleto.trim(),
        telefone: form.telefone.trim() || undefined,
        dataNascimento: form.dataNascimento || undefined,
      });
      setPerfil({ ...perfil, ...form });
      setEditando(false);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } finally {
      setSalvando(false);
    }
  }

  const initial = perfil?.nomeCompleto?.[0]?.toUpperCase() ?? "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl space-y-8 pb-8"
    >
      <header>
        <p className="kicker text-terracotta">Sua conta</p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
          Meu perfil
        </h1>
        <p className="text-[13px] text-muted mt-2.5">
          Mantenha seus dados atualizados — usamos para emitir documentos e
          notificar antes das viagens.
        </p>
      </header>

      <AnimatePresence>
        {sucesso && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2.5 bg-sage-soft border border-sage/20 text-sage-deep rounded-2xl px-5 py-3 text-[13px]"
          >
            <CheckCircle2 size={15} strokeWidth={1.5} /> Perfil atualizado com sucesso.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero / avatar card */}
      <article className="relative overflow-hidden rounded-3xl bg-ink text-bone">
        <div aria-hidden className="absolute inset-0 paper-grain opacity-70" />
        <div
          aria-hidden
          className="absolute -top-24 -right-16 w-[360px] h-[360px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(63,92,76,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-8 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-bone/8 ring-1 ring-bone/15 flex items-center justify-center">
            <span className="font-display text-3xl text-bone">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="kicker text-terracotta/85">Tutor</p>
            <p className="font-display text-2xl text-bone leading-tight tracking-tight mt-1 truncate">
              {perfil?.nomeCompleto ?? "—"}
            </p>
            <p className="text-bone/55 text-[13px] mt-1 truncate font-mono">
              {perfil?.email}
            </p>
            <p className="kicker text-bone/40 mt-2 flex items-center gap-1.5">
              <ShieldCheck size={11} strokeWidth={1.5} />
              {perfil?.provedorAuth?.toLowerCase()} · verificado
            </p>
          </div>
        </div>
      </article>

      {/* Form */}
      <form
        onSubmit={handleSalvar}
        className="bg-paper rounded-2xl border border-border p-6 space-y-5"
      >
        <Field
          Icon={User}
          label="Nome completo"
          value={editando ? form.nomeCompleto : perfil?.nomeCompleto ?? "—"}
          onChange={(v) => setForm((f) => ({ ...f, nomeCompleto: v }))}
          disabled={!editando}
        />
        <Field
          Icon={Mail}
          label="E-mail"
          value={perfil?.email ?? ""}
          disabled
          type="email"
          mono
        />
        <Field
          Icon={Phone}
          label="Telefone"
          value={editando ? form.telefone : perfil?.telefone ?? "Não informado"}
          onChange={(v) => setForm((f) => ({ ...f, telefone: v }))}
          placeholder="+55 11 99999-9999"
          disabled={!editando}
          mono
        />
        <Field
          Icon={Calendar}
          label="Data de nascimento"
          value={editando ? form.dataNascimento : perfil?.dataNascimento ?? "Não informado"}
          onChange={(v) => setForm((f) => ({ ...f, dataNascimento: v }))}
          type="date"
          disabled={!editando}
          mono
        />

        <div className="flex gap-3 pt-2">
          {editando ? (
            <>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="flex-1 border border-border py-3 rounded-full text-[13px] font-medium text-ink hover:bg-bone-deep transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-ink text-bone py-3 rounded-full text-[13px] font-semibold hover:bg-sage disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {salvando && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="bg-ink text-bone px-6 py-3 rounded-full text-[13px] font-medium hover:bg-sage transition-colors"
            >
              Editar perfil
            </button>
          )}
        </div>
      </form>

      {/* LGPD */}
      <section className="bg-paper rounded-2xl border border-border p-6">
        <p className="kicker text-muted mb-4">Privacidade e dados</p>
        <div className="divide-y divide-border">
          <PrivacyLink href="/lgpd/privacidade" label="Política de privacidade" />
          <PrivacyLink href="/lgpd/termos" label="Termos de uso" />
          <PrivacyLink
            href="mailto:privacidade@ipet.com.br?subject=Solicitação LGPD"
            label="Solicitação de dados (LGPD)"
          />
        </div>
      </section>
    </motion.div>
  );
}

function Field({
  Icon,
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
  mono,
}: {
  Icon: typeof User;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="kicker text-muted block mb-2 flex items-center gap-1.5">
        <Icon size={11} strokeWidth={1.5} /> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-transparent border-0 border-b border-border focus:border-ink py-2.5 text-[15px] text-ink placeholder:text-faint focus:outline-none disabled:text-ink/60 transition-colors ${
          mono ? "font-mono text-[14px]" : ""
        }`}
      />
    </div>
  );
}

function PrivacyLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between py-3.5 text-[13px] text-ink/75 hover:text-ink transition-colors"
    >
      <span>{label}</span>
      <ArrowRight
        size={13}
        strokeWidth={1.5}
        className="text-faint group-hover:text-ink group-hover:translate-x-1 transition-all"
      />
    </a>
  );
}
