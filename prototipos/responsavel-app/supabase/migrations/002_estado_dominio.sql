-- ============================================================
-- iPet — Migração 002: Estado de domínio (pets, viagens, documentos)
-- Migra useAppStore (zustand+localStorage) para Supabase com RLS.
-- Tarefas/roadmap não são persistidos aqui — são derivados em runtime
-- a partir das regras de compliance + pet + plano de viagem.
-- ============================================================

-- ─── Tabela: pets ─────────────────────────────────────────
-- Pet pertence ao tutor (auth.users via profiles).

create table if not exists public.pets (
  id                 uuid        primary key default gen_random_uuid(),
  owner_id           uuid        not null references public.profiles(id) on delete cascade,
  nome               text        not null,
  especie            text        not null check (especie in ('CAO', 'GATO', 'OUTRO')),
  raca               text        not null,
  data_nascimento    text        not null,         -- DD/MM/YYYY (padrão BR do app)
  peso               numeric(5,2) not null,        -- kg
  tipo_pet           text        not null default 'ESTIMACAO' check (tipo_pet in ('ESTIMACAO', 'CAO_GUIA')),
  microchip          text,                          -- 15 dígitos ISO 11784/11785
  foto               text,
  vacina             jsonb,                         -- RegistroVacina (data, valida, nomeComercial, lote, veterinario)
  sorologia          jsonb,                         -- RegistroSorologia (data, valor, status, laboratorio)
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);

comment on table  public.pets             is 'Pets do tutor — entidade central do domínio iPet.';
comment on column public.pets.microchip   is 'Número do microchip ISO 11784/11785 (15 dígitos).';
comment on column public.pets.vacina      is 'Registro de vacina antirrábica em jsonb (último registro, não histórico).';
comment on column public.pets.sorologia   is 'Resultado de sorologia FAVN em jsonb.';

create trigger trg_pets_atualizado_em
  before update on public.pets
  for each row execute procedure public.set_atualizado_em();

-- ─── Tabela: planos_viagem ────────────────────────────────
-- Cada pet pode ter múltiplos planos de viagem (passado, atual, futuro).

create table if not exists public.planos_viagem (
  id                  uuid        primary key default gen_random_uuid(),
  owner_id            uuid        not null references public.profiles(id) on delete cascade,
  pet_id              uuid        not null references public.pets(id) on delete cascade,
  destino             text        not null,            -- enum Destino — validado no app, não no DB
  data_embarque       text        not null,            -- DD/MM/YYYY
  companhia_aerea_id  text,
  is_premium          boolean     not null default false,
  pagamento_id        text,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

comment on table  public.planos_viagem is 'Plano de viagem do pet — destino + data + status premium do TurboTax R$99.';

create trigger trg_planos_atualizado_em
  before update on public.planos_viagem
  for each row execute procedure public.set_atualizado_em();

create index if not exists idx_planos_viagem_pet on public.planos_viagem(pet_id, criado_em desc);

-- ─── Tabela: documentos_sanitarios ────────────────────────
-- Metadata dos documentos. O arquivo em si vive em Supabase Storage
-- (bucket privado — entrega de outro card P0, https://trello.com/c/IcNrke08).

create table if not exists public.documentos_sanitarios (
  id                    uuid        primary key default gen_random_uuid(),
  owner_id              uuid        not null references public.profiles(id) on delete cascade,
  pet_id                uuid        not null references public.pets(id) on delete cascade,
  tipo                  text        not null check (tipo in (
                                       'VACINA_ANTIRRABICA',
                                       'SOROLOGIA_ANTIRRABICA',
                                       'ATESTADO_SAUDE',
                                       'CVI',
                                       'MICROCHIP_REGISTRO',
                                       'PERMISSAO_IMPORTACAO',
                                       'OUTRO'
                                     )),
  titulo                text        not null,
  data_documento        text        not null,        -- DD/MM/YYYY
  data_upload           timestamptz not null default now(),
  arquivo_url           text        not null,        -- blob URL hoje, signed URL do Storage depois
  arquivo_nome          text        not null,
  arquivo_tipo          text        not null,        -- MIME
  tamanho_bytes         bigint      not null,
  status_autenticacao   text        not null default 'PENDENTE' check (status_autenticacao in (
                                       'PENDENTE', 'VERIFICADO', 'BLOCKCHAIN', 'REJEITADO'
                                     )),
  hash_documento        text,                         -- SHA-256
  blockchain_tx_id      text,
  blockchain_network    text,
  verificado_por        text,
  notas                 text
);

comment on table  public.documentos_sanitarios is 'Metadata dos documentos do pet. Arquivo em si fica no Supabase Storage (card IcNrke08).';

create index if not exists idx_documentos_pet on public.documentos_sanitarios(pet_id, data_upload desc);

-- ─── Row Level Security ───────────────────────────────────

alter table public.pets                  enable row level security;
alter table public.planos_viagem         enable row level security;
alter table public.documentos_sanitarios enable row level security;

create policy "pets: owner gerencia os próprios"
  on public.pets for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "planos_viagem: owner gerencia os próprios"
  on public.planos_viagem for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "documentos_sanitarios: owner gerencia os próprios"
  on public.documentos_sanitarios for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
