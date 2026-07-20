-- ============================================================
-- iPet — Migração 006: Histórico de alertas push enviados
-- Tabela de idempotência pro cron de prazos.
-- Garante que cada alerta (owner, plano, tarefa, janela) só dispara uma vez.
-- ============================================================

create table if not exists public.push_alerts_enviados (
  id             uuid        primary key default gen_random_uuid(),
  owner_id       uuid        not null references auth.users(id) on delete cascade,
  plano_id       uuid        not null references public.planos_viagem(id) on delete cascade,
  tarefa_id      text        not null,
  dias_restantes integer     not null,
  criado_em      timestamptz not null default now(),
  unique (owner_id, plano_id, tarefa_id, dias_restantes)
);

comment on table  public.push_alerts_enviados                is 'Idempotência do cron de prazos: garante 1 push por (plano, tarefa, janela).';
comment on column public.push_alerts_enviados.tarefa_id      is 'ID lógico da tarefa do roadmap (vacina, sorologia, cvi, etc.).';
comment on column public.push_alerts_enviados.dias_restantes is 'Janela de alerta disparada (7, 3, 1).';

create index if not exists push_alerts_owner_plano_idx
  on public.push_alerts_enviados (owner_id, plano_id);

-- RLS: somente service role escreve. Usuários podem ler o próprio histórico.
alter table public.push_alerts_enviados enable row level security;

create policy "Usuário lê próprio histórico"
  on public.push_alerts_enviados for select
  using (auth.uid() = owner_id);
