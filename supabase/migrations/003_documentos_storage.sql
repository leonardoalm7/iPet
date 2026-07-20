-- ============================================================
-- iPet — Migração 003: Documentos no Supabase Storage
-- Fecha o gap P0 https://trello.com/c/IcNrke08:
-- arquivo do documento sai do URL.createObjectURL (sessão do
-- browser) e passa a viver em bucket privado, com signed URLs
-- emitidas on-demand quando o tutor abre o passaporte.
-- ============================================================

-- ─── Bucket privado `documentos` ──────────────────────────
-- Convenção de path: {owner_id}/{pet_id}/{doc_id}-{filename}
-- RLS abaixo usa foldername(name)[1] = auth.uid() para isolar tutores.

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

-- ─── Schema: adiciona storage_path em documentos_sanitarios ──
-- arquivo_url vira opcional: novos uploads gravam só storage_path,
-- signed URL é gerada on-demand. Documentos antigos com blob:URL
-- mantêm arquivo_url até serem migrados (não há dados em produção
-- ainda, mas a migração é idempotente).

alter table public.documentos_sanitarios
  add column if not exists storage_path text;

alter table public.documentos_sanitarios
  alter column arquivo_url drop not null;

comment on column public.documentos_sanitarios.storage_path
  is 'Caminho dentro do bucket documentos: {owner_id}/{pet_id}/{doc_id}-{nome}.';
comment on column public.documentos_sanitarios.arquivo_url
  is 'Legado de blob:URL local. Novos uploads usam storage_path + signed URL.';

-- ─── Storage RLS — bucket documentos ─────────────────────
-- Owner é identificado pelo primeiro segmento do path.

create policy "documentos: tutor lê os próprios"
  on storage.objects for select
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documentos: tutor envia para a própria pasta"
  on storage.objects for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documentos: tutor atualiza os próprios"
  on storage.objects for update
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documentos: tutor remove os próprios"
  on storage.objects for delete
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
