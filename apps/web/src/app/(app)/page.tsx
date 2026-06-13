"use client";

import Link from "next/link";
import { useAppStore, useAuthStore, calcularRoadmap } from "@ipet/core";
import { PawPrint, Plus, Map, ArrowRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format, parse, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    APTO: { label: "Apto", className: "bg-green-100 text-green-700" },
    PENDENTE: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
    URGENTE: { label: "Urgente", className: "bg-orange-100 text-orange-700" },
    CRITICO: { label: "Crítico", className: "bg-red-100 text-red-700" },
    INAPTO: { label: "Inapto", className: "bg-red-200 text-red-800" },
  };
  const { label, className } = map[status] ?? { label: status, className: "bg-surface text-navy/60" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>{label}</span>;
}

export default function HomePage() {
  const perfil = useAuthStore((s) => s.perfil);
  const { pets, planosViagem, planosViagemPets } = useAppStore();

  const nome = perfil?.nomeCompleto?.split(" ")[0] ?? "Tutor";

  // Viagens ativas (data de embarque no futuro)
  const hoje = new Date();
  const viagensAtivas = planosViagem
    .filter((p) => {
      const d = parse(p.dataEmbarque, "dd/MM/yyyy", new Date());
      return differenceInDays(d, hoje) >= 0;
    })
    .sort((a, b) => {
      const da = parse(a.dataEmbarque, "dd/MM/yyyy", new Date());
      const db = parse(b.dataEmbarque, "dd/MM/yyyy", new Date());
      return da.getTime() - db.getTime();
    });

  return (
    <div className="space-y-8">
      {/* Saudação */}
      <div>
        <h2 className="text-2xl font-bold text-navy">Olá, {nome} 👋</h2>
        <p className="text-navy/60 mt-1">Bem-vindo ao iPet. Gerencie a saúde e viagens dos seus pets.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Pets cadastrados" value={pets.length} icon="🐾" href="/passaportes" />
        <SummaryCard label="Viagens ativas" value={viagensAtivas.length} icon="✈️" href="/viagens" />
        <SummaryCard label="Compliance" value={pets.length > 0 ? "Ver status" : "—"} icon="📋" href="/passaportes" isText />
        <SummaryCard label="Documentos" value="Ver todos" icon="📄" href="/passaportes" isText />
      </div>

      {/* Seção de pets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Seus Pets</h3>
          <Link href="/passaportes" className="text-sm text-teal font-medium hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        {pets.length === 0 ? (
          <EmptyState
            icon={<PawPrint size={32} className="text-navy/30" />}
            title="Nenhum pet cadastrado"
            desc="Adicione seu primeiro pet para começar."
            action={{ label: "Adicionar pet", href: "/pets/novo" }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
            <Link
              href="/pets/novo"
              className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 py-8 text-navy/40 hover:border-teal hover:text-teal transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Novo pet</span>
            </Link>
          </div>
        )}
      </section>

      {/* Viagens ativas */}
      {viagensAtivas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-navy">Próximas Viagens</h3>
            <Link href="/viagens" className="text-sm text-teal font-medium hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {viagensAtivas.slice(0, 4).map((plano) => {
              const petsDoPlano = planosViagemPets
                .filter((pvp) => pvp.planoViagemId === plano.id)
                .map((pvp) => pets.find((p) => p.id === pvp.petId))
                .filter(Boolean) as typeof pets;
              const dataEmbarque = parse(plano.dataEmbarque, "dd/MM/yyyy", new Date());
              const diasRestantes = differenceInDays(dataEmbarque, hoje);
              return (
                <Link
                  key={plano.id}
                  href={`/viagens/${plano.id}`}
                  className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-navy capitalize">{plano.destino.replace(/_/g, " ").toLowerCase()}</p>
                      <p className="text-sm text-navy/60 mt-0.5">
                        {format(dataEmbarque, "d 'de' MMMM yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${diasRestantes <= 7 ? "bg-red-100 text-red-700" : diasRestantes <= 30 ? "bg-orange-100 text-orange-700" : "bg-teal-light text-teal"}`}>
                      {diasRestantes === 0 ? "Hoje" : `${diasRestantes}d`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {petsDoPlano.map((p) => (
                      <span key={p.id} className="text-xs bg-surface text-navy/70 px-2 py-0.5 rounded-full">{p.nome}</span>
                    ))}
                    {plano.isPremium && <span className="text-xs bg-ipet-orange/10 text-ipet-orange px-2 py-0.5 rounded-full ml-auto">Premium</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTAs rápidos */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction
          icon="🗺️"
          title="Planejar nova viagem"
          desc="Gere o roadmap de compliance para qualquer destino"
          href="/planejar"
          color="teal"
        />
        <QuickAction
          icon="📋"
          title="Regras por país"
          desc="Consulte os requisitos sanitários de mais de 70 destinos"
          href="/regras"
          color="navy"
        />
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon, href, isText }: {
  label: string; value: number | string; icon: string; href: string; isText?: boolean;
}) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
      <span className="text-2xl">{icon}</span>
      <p className={`font-bold mt-2 ${isText ? "text-base text-teal" : "text-2xl text-navy"}`}>{value}</p>
      <p className="text-xs text-navy/50 mt-0.5">{label}</p>
    </Link>
  );
}

function PetCard({ pet }: { pet: ReturnType<typeof useAppStore.getState>["pets"][number] }) {
  const especieEmoji = pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾";
  return (
    <Link href={`/passaporte/${pet.id}`} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{especieEmoji}</span>
        <div className="min-w-0">
          <p className="font-semibold text-navy truncate">{pet.nome}</p>
          <p className="text-xs text-navy/50">{pet.raca}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-navy/50">Peso</span>
          <span className="font-medium text-navy">{pet.peso} kg</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-navy/50">Microchip</span>
          {pet.microchip
            ? <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={11} /> OK</span>
            : <span className="text-navy/30">—</span>
          }
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-navy/50">Vacina</span>
          {pet.vacina
            ? <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={11} /> OK</span>
            : <span className="text-orange-500 font-medium flex items-center gap-1"><AlertTriangle size={11} /> Pendente</span>
          }
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ icon, title, desc, action }: {
  icon: React.ReactNode; title: string; desc: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="bg-white rounded-xl border border-border py-12 flex flex-col items-center gap-3 text-center">
      {icon}
      <p className="font-semibold text-navy">{title}</p>
      <p className="text-sm text-navy/50 max-w-xs">{desc}</p>
      {action && (
        <Link href={action.href} className="mt-2 bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors">
          {action.label}
        </Link>
      )}
    </div>
  );
}

function QuickAction({ icon, title, desc, href, color }: {
  icon: string; title: string; desc: string; href: string; color: "teal" | "navy";
}) {
  const bg = color === "teal" ? "bg-teal hover:bg-teal-dark" : "bg-navy hover:bg-navy-light";
  return (
    <Link href={href} className={`${bg} rounded-xl p-5 text-white transition-colors flex items-start gap-4`}>
      <span className="text-3xl shrink-0">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm opacity-80 mt-0.5">{desc}</p>
      </div>
      <ArrowRight size={18} className="ml-auto self-center opacity-60 shrink-0" />
    </Link>
  );
}
