-- ============================================================
-- iPet — Migração 007: Eventos de analytics (BML)
-- Centraliza o funil Build-Measure-Learn: eventos deixam de viver
-- só no localStorage do tutor e passam a agregar no Supabase.
-- Escrita e leitura exclusivamente via service role (API /api/events
-- e dashboard /admin/metricas) — RLS habilitado sem policies nega
-- qualquer acesso com anon key.
-- ============================================================

create table if not exists public.events (
  id          uuid        primary key,
  evento      text        not null,
  props       jsonb       not null default '{}'::jsonb,
  session_id  text        not null,
  owner_id    uuid        references auth.users(id) on delete set null,
  criado_em   timestamptz not null,
  recebido_em timestamptz not null default now()
);

comment on table  public.events            is 'Eventos do funil BML. id vem do cliente (uuid) — reenvio de lote é idempotente.';
comment on column public.events.evento     is 'Nome tipado do evento — whitelist validada em /api/events contra NOMES_EVENTOS do @ipet/core.';
comment on column public.events.session_id is 'Sessão anônima do browser (sessionStorage). Não é PII.';
comment on column public.events.owner_id   is 'Preenchido quando havia sessão Supabase no envio. Null em páginas públicas (LLMO/calculadora).';
comment on column public.events.criado_em  is 'Timestamp do cliente (momento do track). recebido_em é o do servidor.';

create index if not exists events_evento_criado_idx on public.events (evento, criado_em desc);
create index if not exists events_session_idx       on public.events (session_id);
create index if not exists events_criado_idx        on public.events (criado_em desc);

-- RLS sem policies: anon/authenticated não leem nem escrevem.
-- Só a service role (bypassa RLS) acessa, sempre server-side.
alter table public.events enable row level security;
