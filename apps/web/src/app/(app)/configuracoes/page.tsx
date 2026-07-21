"use client";

import { Settings, Bell, Shield, Smartphone, ChevronRight } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Configurações</h2>
        <p className="text-navy/50 text-sm mt-0.5">Preferências do aplicativo</p>
      </div>

      <Section title="Notificações" icon={<Bell size={18} className="text-teal" />}>
        <ToggleRow label="Alertas de compliance" desc="Avisos sobre prazos vencendo" defaultOn />
        <ToggleRow label="Atualizações de regras" desc="Novas regras por destino" defaultOn />
        <ToggleRow label="Promoções e novidades" desc="Ofertas de parceiros iPet" />
      </Section>

      <Section title="Privacidade" icon={<Shield size={18} className="text-teal" />}>
        <LinkRow label="Exportar meus dados" desc="Baixar todos os seus dados (LGPD Art. 18)" href="mailto:privacidade@ipet.com.br?subject=Exportação de dados" />
        <LinkRow label="Excluir conta" desc="Solicitar exclusão permanente" href="mailto:privacidade@ipet.com.br?subject=Exclusão de conta" danger />
      </Section>

      <Section title="Sobre" icon={<Smartphone size={18} className="text-teal" />}>
        <InfoRow label="Versão" value="Web 1.0.0" />
        <InfoRow label="Plano" value="Gratuito" />
        <LinkRow label="Termos de Uso" href="/lgpd/termos" />
        <LinkRow label="Política de Privacidade" href="/lgpd/privacidade" />
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-navy text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn }: { label: string; desc?: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        {desc && <p className="text-xs text-navy/50 mt-0.5">{desc}</p>}
      </div>
      <div className={`w-11 h-6 rounded-full ${defaultOn ? "bg-teal" : "bg-navy/20"} relative cursor-pointer`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${defaultOn ? "translate-x-6" : "translate-x-1"}`} />
      </div>
    </div>
  );
}

function LinkRow({ label, desc, href, danger }: { label: string; desc?: string; href: string; danger?: boolean }) {
  return (
    <a href={href} className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors">
      <div>
        <p className={`text-sm font-medium ${danger ? "text-red-500" : "text-navy"}`}>{label}</p>
        {desc && <p className="text-xs text-navy/50 mt-0.5">{desc}</p>}
      </div>
      <ChevronRight size={16} className="text-navy/30" />
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm text-navy/70">{label}</p>
      <p className="text-sm font-medium text-navy">{value}</p>
    </div>
  );
}
