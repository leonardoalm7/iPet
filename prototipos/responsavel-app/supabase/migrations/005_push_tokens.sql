-- ============================================================
-- iPet — Migração 005: Push tokens FCM
-- Habilita notificações push (Firebase Cloud Messaging) por usuário.
-- Suporta múltiplos devices por usuário (mobile + desktop).
-- ============================================================

create table if not exists public.push_tokens (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references auth.users(id) on delete cascade,
  token       text        not null,
  user_agent  text,
  ativo       boolean     not null default true,
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (owner_id, token)
);

comment on table  public.push_tokens             is 'Tokens FCM por device para notificações push. LGPD: pseudonimização não se aplica (token é pseudônimo).';
comment on column public.push_tokens.token       is 'FCM registration token. Pode rotacionar — atualizar via upsert.';
comment on column public.push_tokens.ativo       is 'Falso quando user desativou notificações ou token foi invalidado por FCM.';

create index if not exists push_tokens_owner_id_idx on public.push_tokens (owner_id) where ativo = true;

-- RLS
alter table public.push_tokens enable row level security;

create policy "Usuário lê próprios tokens"
  on public.push_tokens for select
  using (auth.uid() = owner_id);

create policy "Usuário insere próprios tokens"
  on public.push_tokens for insert
  with check (auth.uid() = owner_id);

create policy "Usuário atualiza próprios tokens"
  on public.push_tokens for update
  using (auth.uid() = owner_id);

create policy "Usuário deleta próprios tokens"
  on public.push_tokens for delete
  using (auth.uid() = owner_id);

-- Trigger atualizado_em
create or replace function public.trg_push_tokens_updated()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.trg_push_tokens_updated();
