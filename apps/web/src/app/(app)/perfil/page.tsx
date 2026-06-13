"use client";

import { useState } from "react";
import { useAuthStore } from "@ipet/core";
import { updatePerfil } from "@ipet/core/services/auth-service";
import { User, Mail, Phone, Calendar, Loader2, CheckCircle2 } from "lucide-react";

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
      await updatePerfil(perfil.id, {
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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Meu Perfil</h2>
        <p className="text-navy/50 text-sm mt-0.5">Informações pessoais da conta</p>
      </div>

      {sucesso && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={16} /> Perfil atualizado com sucesso.
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* Avatar header */}
        <div className="bg-gradient-to-r from-navy to-navy-light px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
            {perfil?.nomeCompleto?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{perfil?.nomeCompleto ?? "—"}</p>
            <p className="text-white/60 text-sm">{perfil?.email}</p>
            <p className="text-white/40 text-xs mt-1 capitalize">{perfil?.provedorAuth?.toLowerCase()} · conta verificada</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSalvar} className="p-6 space-y-4">
          <Field icon={<User size={16} />} label="Nome completo"
            value={editando ? form.nomeCompleto : (perfil?.nomeCompleto ?? "—")}
            onChange={(v) => setForm((f) => ({ ...f, nomeCompleto: v }))}
            disabled={!editando} />
          <Field icon={<Mail size={16} />} label="E-mail"
            value={perfil?.email ?? ""} disabled type="email" />
          <Field icon={<Phone size={16} />} label="Telefone"
            value={editando ? form.telefone : (perfil?.telefone ?? "Não informado")}
            onChange={(v) => setForm((f) => ({ ...f, telefone: v }))}
            placeholder="+55 11 99999-9999" disabled={!editando} />
          <Field icon={<Calendar size={16} />} label="Data de nascimento"
            value={editando ? form.dataNascimento : (perfil?.dataNascimento ?? "Não informado")}
            onChange={(v) => setForm((f) => ({ ...f, dataNascimento: v }))}
            type="date" disabled={!editando} />

          <div className="flex gap-3 pt-2">
            {editando ? (
              <>
                <button type="button" onClick={() => setEditando(false)}
                  className="flex-1 border border-border py-2.5 rounded-xl text-sm font-medium text-navy hover:bg-surface transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="flex-1 bg-teal text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {salvando && <Loader2 size={15} className="animate-spin" />} Salvar
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditando(true)}
                className="bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-light transition-colors">
                Editar perfil
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LGPD */}
      <div className="bg-white rounded-xl border border-border p-5">
        <p className="font-medium text-navy mb-3">Privacidade e dados</p>
        <div className="space-y-2 text-sm">
          <a href="/lgpd/privacidade" className="flex items-center justify-between py-2 border-b border-border hover:text-teal transition-colors">
            <span className="text-navy/70">Política de Privacidade</span>
            <span className="text-navy/30">→</span>
          </a>
          <a href="/lgpd/termos" className="flex items-center justify-between py-2 border-b border-border hover:text-teal transition-colors">
            <span className="text-navy/70">Termos de Uso</span>
            <span className="text-navy/30">→</span>
          </a>
          <a href="mailto:privacidade@ipet.com.br?subject=Solicitação LGPD"
            className="flex items-center justify-between py-2 hover:text-teal transition-colors">
            <span className="text-navy/70">Solicitação de dados (LGPD)</span>
            <span className="text-navy/30">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value, onChange, disabled, type = "text", placeholder }: {
  icon: React.ReactNode; label: string; value: string;
  onChange?: (v: string) => void; disabled?: boolean;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-navy/50 block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30">{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled} placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal disabled:bg-surface disabled:text-navy/50 disabled:cursor-default" />
      </div>
    </div>
  );
}
