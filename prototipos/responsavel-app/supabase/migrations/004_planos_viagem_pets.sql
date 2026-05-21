-- ============================================================
-- iPet — Migração 004: planos_viagem_pets (join entity / OrderLine)
-- Suporta múltiplos pets por viagem com estado per-pet
-- (modo de transporte, pagamento individual, acompanhante humano).
--
-- Atómica: cria tabela + RLS + backfill + drop coluna antiga
-- (planos_viagem.pet_id) num único deploy. Card Trello:
-- [F1C] Múltiplos pets por viagem.
-- ============================================================

-- ─── Tabela: planos_viagem_pets ──────────────────────────
create table if not exists public.planos_viagem_pets (
  id                       uuid        primary key default gen_random_uuid(),
  owner_id                 uuid        not null references public.profiles(id) on delete cascade,
  plano_viagem_id          uuid        not null references public.planos_viagem(id) on delete cascade,
  pet_id                   uuid        not null references public.pets(id) on delete cascade,
  modo_transporte          text                 check (modo_transporte in ('CABINE','PORAO','CARGA')),
  pagamento_individual_id  text,
  acompanhante_humano_id   uuid                 references public.profiles(id) on delete set null,
  observacoes              text,
  criado_em                timestamptz not null default now(),
  atualizado_em            timestamptz not null default now(),
  unique (plano_viagem_id, pet_id)
);

comment on table  public.planos_viagem_pets is
  'Join entity (OrderLine pattern) — múltiplos pets por viagem com estado per-pet (transporte, pagamento, acompanhante).';
comment on column public.planos_viagem_pets.modo_transporte         is 'CABINE | PORAO | CARGA — definido por pet conforme regras da cia aérea.';
comment on column public.planos_viagem_pets.acompanhante_humano_id  is 'Hipótese 1:1 humano-pet (Trello card e29QxR3z em pesquisa).';

create trigger trg_planos_viagem_pets_atualizado_em
  before update on public.planos_viagem_pets
  for each row execute procedure public.set_atualizado_em();

create index if not exists idx_planos_viagem_pets_plano on public.planos_viagem_pets(plano_viagem_id, criado_em);
create index if not exists idx_planos_viagem_pets_pet   on public.planos_viagem_pets(pet_id, criado_em desc);

-- ─── Row Level Security ───────────────────────────────────
alter table public.planos_viagem_pets enable row level security;

create policy "planos_viagem_pets: owner gerencia os próprios"
  on public.planos_viagem_pets for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ─── Backfill: 1 row por planos_viagem existente ──────────
insert into public.planos_viagem_pets (owner_id, plano_viagem_id, pet_id, criado_em)
select owner_id, id, pet_id, criado_em
from public.planos_viagem
where pet_id is not null;

-- ─── Drop coluna antiga (após backfill, atómico) ──────────
drop index if exists public.idx_planos_viagem_pet;
alter table public.planos_viagem drop column if exists pet_id;
