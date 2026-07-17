-- ============================================================
-- iPet — Migração 001: Perfis de usuário + tabelas LGPD
-- Conformidade: Lei nº 13.709/2018 (LGPD)
-- ============================================================

-- ─── Extensões necessárias ────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Tabela: profiles ─────────────────────────────────────
-- Dados pessoais do responsável pelo pet (titular dos dados)
-- Base legal: Art. 7º, V LGPD (execução de contrato)

create table if not exists public.profiles (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  nome_completo       text        not null,
  email               text        not null,
  telefone            text,
  data_nascimento     date,
  foto_perfil         text,                     -- URL pública (Supabase Storage)
  cpf_hash            text,                     -- SHA-256 do CPF sem formatação — NUNCA texto simples
  onboarding_completo boolean     not null default false,
  provedor_auth       text        not null default 'EMAIL', -- EMAIL | GOOGLE | APPLE
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

comment on table  public.profiles               is 'Perfis de usuários — dados pessoais do titular. LGPD Art. 7º, V.';
comment on column public.profiles.cpf_hash      is 'SHA-256 do CPF sem formatação. Nunca armazenar o CPF em texto simples.';
comment on column public.profiles.provedor_auth is 'Provedor de autenticação original: EMAIL, GOOGLE ou APPLE.';

-- Trigger: mantém atualizado_em sincronizado
create or replace function public.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_profiles_atualizado_em
  before update on public.profiles
  for each row execute procedure public.set_atualizado_em();

-- Trigger: cria profile automaticamente ao criar usuário no Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome_completo, email, provedor_auth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    case
      when new.raw_app_meta_data->>'provider' = 'google' then 'GOOGLE'
      when new.raw_app_meta_data->>'provider' = 'apple'  then 'APPLE'
      else 'EMAIL'
    end
  );
  return new;
end;
$$;

create trigger trg_auth_new_user
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Tabela: consentimentos ───────────────────────────────
-- Registro imutável de consentimentos (Art. 8º §5º LGPD)
-- O ônus da prova do consentimento é do controlador.
-- Revogação = novo registro com aceito = false.

create table if not exists public.consentimentos (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  tipo            text        not null check (tipo in ('TERMOS', 'PRIVACIDADE', 'MARKETING')),
  versao          text        not null,          -- versão do documento no momento da decisão
  aceito          boolean     not null,
  data_decisao    timestamptz not null default now(),
  ip_hash         text,                          -- SHA-256 do IP — nunca o IP real
  user_agent_hash text                           -- SHA-256 do user agent
);

comment on table  public.consentimentos              is 'Registro append-only de consentimentos LGPD. Art. 8º §5º — prova de consentimento.';
comment on column public.consentimentos.tipo         is 'Tipo: TERMOS | PRIVACIDADE | MARKETING';
comment on column public.consentimentos.versao       is 'Versão semântica do documento legal na época da decisão.';
comment on column public.consentimentos.ip_hash      is 'SHA-256 do endereço IP. Nunca armazenar o IP real.';

-- Impede UPDATE e DELETE na tabela de consentimentos (append-only)
create or replace rule consentimentos_no_update as
  on update to public.consentimentos do instead nothing;

create or replace rule consentimentos_no_delete as
  on delete to public.consentimentos do instead nothing;

-- ─── Tabela: solicitacoes_lgpd ────────────────────────────
-- Solicitações de direitos do titular (Art. 18 LGPD)
-- Prazo de resposta: 15 dias corridos (Art. 18 §3º)

create table if not exists public.solicitacoes_lgpd (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete set null,
  tipo         text        not null check (tipo in (
                             'EXPORTACAO',
                             'EXCLUSAO',
                             'RETIFICACAO',
                             'PORTABILIDADE',
                             'REVOGACAO_CONSENTIMENTO'
                           )),
  status       text        not null default 'PENDENTE' check (status in (
                             'PENDENTE',
                             'EM_PROCESSAMENTO',
                             'CONCLUIDA',
                             'CANCELADA'
                           )),
  observacoes  text,
  criado_em    timestamptz not null default now(),
  processado_em timestamptz
);

comment on table public.solicitacoes_lgpd is 'Solicitações de direitos do titular — Art. 18 LGPD. Prazo: 15 dias.';

-- ─── Row Level Security (RLS) ─────────────────────────────
-- Cada usuário acessa apenas seus próprios dados.

alter table public.profiles         enable row level security;
alter table public.consentimentos   enable row level security;
alter table public.solicitacoes_lgpd enable row level security;

-- profiles
create policy "profiles: titular lê e edita apenas o próprio registro"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- consentimentos
create policy "consentimentos: titular lê os próprios registros"
  on public.consentimentos for select
  using (auth.uid() = user_id);

create policy "consentimentos: titular insere apenas nos próprios registros"
  on public.consentimentos for insert
  with check (auth.uid() = user_id);

-- solicitacoes_lgpd
create policy "solicitacoes: titular lê e insere as próprias"
  on public.solicitacoes_lgpd for select
  using (auth.uid() = user_id);

create policy "solicitacoes: titular insere as próprias"
  on public.solicitacoes_lgpd for insert
  with check (auth.uid() = user_id);

-- ─── Índices ──────────────────────────────────────────────

create index if not exists idx_consentimentos_user_tipo
  on public.consentimentos(user_id, tipo, data_decisao desc);

create index if not exists idx_solicitacoes_user
  on public.solicitacoes_lgpd(user_id, criado_em desc);

create index if not exists idx_profiles_email
  on public.profiles(email);
