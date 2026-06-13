"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@ipet/core";
import { updatePerfil } from "@ipet/core/services/auth-service";
import { PawPrint, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, perfil, setPerfil } = useAuthStore();
  const [nome, setNome] = useState(perfil?.nomeCompleto ?? "");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !perfil) return;
    setLoading(true);
    try {
      await updatePerfil(user.id, {
        nomeCompleto: nome.trim(),
        telefone: telefone.trim() || undefined,
        onboardingCompleto: true,
      });
      setPerfil({ ...perfil, nomeCompleto: nome.trim(), telefone: telefone.trim() || undefined, onboardingCompleto: true });
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="text-5xl">🐾</span>
        <h1 className="text-2xl font-bold text-navy mt-3">Bem-vindo ao iPet!</h1>
        <p className="text-navy/50 text-sm mt-1">Complete seu perfil para começar</p>
      </div>
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-navy/70 block mb-1.5">Como quer ser chamado?</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="Seu primeiro nome" />
          </div>
          <div>
            <label className="text-xs font-medium text-navy/70 block mb-1.5">Telefone (opcional)</label>
            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="+55 11 99999-9999" />
          </div>
          <button type="submit" disabled={loading || !nome.trim()}
            className="w-full bg-teal text-white font-semibold py-2.5 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Começar
          </button>
        </form>
      </div>
    </div>
  );
}
