/**
 * Sync layer — espelha o useAppStore (zustand+localStorage) em Supabase.
 *
 * Estratégia:
 * - localStorage continua como cache otimista (UI permanece síncrona).
 * - Ao logar: `loadFromSupabase` hidrata o store; se Supabase vier vazio mas
 *   localStorage tiver dados, `migrateLocalToSupabase` faz upload one-shot.
 * - Após hidratar: `startSync` registra subscribe que detecta deltas e
 *   despacha upsert/delete diferenciais com debounce de 500ms.
 *
 * Fecha o gap P0 https://trello.com/c/Xj2MbGGs.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { useAppStore } from "@/store/app-store";
import type { Pet, PlanoViagem, PlanoViagemPet, DocumentoSanitario } from "@/domain/types";

// ── DTOs (snake_case do banco) ───────────────────────────────

interface PetRow {
  id: string;
  owner_id: string;
  nome: string;
  especie: Pet["especie"];
  raca: string;
  data_nascimento: string;
  peso: number;
  tipo_pet: Pet["tipoPet"];
  microchip: string | null;
  foto: string | null;
  vacina: Pet["vacina"] | null;
  sorologia: Pet["sorologia"] | null;
  criado_em: string;
}

interface PlanoRow {
  id: string;
  owner_id: string;
  destino: string;
  data_embarque: string;
  companhia_aerea_id: string | null;
  is_premium: boolean;
  pagamento_id: string | null;
  criado_em: string;
}

interface PlanoViagemPetRow {
  id: string;
  owner_id: string;
  plano_viagem_id: string;
  pet_id: string;
  modo_transporte: PlanoViagemPet["modoTransporte"] | null;
  pagamento_individual_id: string | null;
  acompanhante_humano_id: string | null;
  observacoes: string | null;
  criado_em: string;
}

interface DocRow {
  id: string;
  owner_id: string;
  pet_id: string;
  tipo: DocumentoSanitario["tipo"];
  titulo: string;
  data_documento: string;
  data_upload: string;
  arquivo_url: string | null;
  storage_path: string | null;
  arquivo_nome: string;
  arquivo_tipo: string;
  tamanho_bytes: number;
  status_autenticacao: DocumentoSanitario["statusAutenticacao"];
  hash_documento: string | null;
  blockchain_tx_id: string | null;
  blockchain_network: string | null;
  verificado_por: string | null;
  notas: string | null;
}

// ── Mappers ──────────────────────────────────────────────────

function petToRow(pet: Pet, ownerId: string): Omit<PetRow, "criado_em"> {
  return {
    id: pet.id,
    owner_id: ownerId,
    nome: pet.nome,
    especie: pet.especie,
    raca: pet.raca,
    data_nascimento: pet.dataNascimento,
    peso: pet.peso,
    tipo_pet: pet.tipoPet,
    microchip: pet.microchip ?? null,
    foto: pet.foto ?? null,
    vacina: pet.vacina ?? null,
    sorologia: pet.sorologia ?? null,
  };
}

function rowToPet(row: PetRow): Pet {
  return {
    id: row.id,
    nome: row.nome,
    especie: row.especie,
    raca: row.raca,
    dataNascimento: row.data_nascimento,
    peso: Number(row.peso),
    tipoPet: row.tipo_pet,
    microchip: row.microchip ?? undefined,
    foto: row.foto ?? undefined,
    vacina: row.vacina ?? undefined,
    sorologia: row.sorologia ?? undefined,
    responsavelId: row.owner_id,
    criadoEm: row.criado_em,
  };
}

function planoToRow(plano: PlanoViagem, ownerId: string): Omit<PlanoRow, "criado_em"> {
  return {
    id: plano.id,
    owner_id: ownerId,
    destino: plano.destino,
    data_embarque: plano.dataEmbarque,
    companhia_aerea_id: plano.companhiaAereaId ?? null,
    is_premium: plano.isPremium,
    pagamento_id: plano.pagamentoId ?? null,
  };
}

function rowToPlano(row: PlanoRow): PlanoViagem {
  return {
    id: row.id,
    destino: row.destino as PlanoViagem["destino"],
    dataEmbarque: row.data_embarque,
    companhiaAereaId: row.companhia_aerea_id ?? undefined,
    isPremium: row.is_premium,
    pagamentoId: row.pagamento_id ?? undefined,
    criadoEm: row.criado_em,
  };
}

function planoViagemPetToRow(pvp: PlanoViagemPet, ownerId: string): Omit<PlanoViagemPetRow, "criado_em"> {
  return {
    id: pvp.id,
    owner_id: ownerId,
    plano_viagem_id: pvp.planoViagemId,
    pet_id: pvp.petId,
    modo_transporte: pvp.modoTransporte ?? null,
    pagamento_individual_id: pvp.pagamentoIndividualId ?? null,
    acompanhante_humano_id: pvp.acompanhanteHumanoId ?? null,
    observacoes: pvp.observacoes ?? null,
  };
}

function rowToPlanoViagemPet(row: PlanoViagemPetRow): PlanoViagemPet {
  return {
    id: row.id,
    planoViagemId: row.plano_viagem_id,
    petId: row.pet_id,
    modoTransporte: row.modo_transporte ?? undefined,
    pagamentoIndividualId: row.pagamento_individual_id ?? undefined,
    acompanhanteHumanoId: row.acompanhante_humano_id ?? undefined,
    observacoes: row.observacoes ?? undefined,
    criadoEm: row.criado_em,
  };
}

function docToRow(doc: DocumentoSanitario, ownerId: string): Omit<DocRow, "data_upload"> {
  return {
    id: doc.id,
    owner_id: ownerId,
    pet_id: doc.petId,
    tipo: doc.tipo,
    titulo: doc.titulo,
    data_documento: doc.dataDocumento,
    arquivo_url: doc.arquivoUrl || null,
    storage_path: doc.storagePath ?? null,
    arquivo_nome: doc.arquivoNome,
    arquivo_tipo: doc.arquivoTipo,
    tamanho_bytes: doc.tamanhoBytes,
    status_autenticacao: doc.statusAutenticacao,
    hash_documento: doc.hashDocumento ?? null,
    blockchain_tx_id: doc.blockchainTxId ?? null,
    blockchain_network: doc.blockchainNetwork ?? null,
    verificado_por: doc.verificadoPor ?? null,
    notas: doc.notas ?? null,
  };
}

function rowToDoc(row: DocRow): DocumentoSanitario {
  return {
    id: row.id,
    petId: row.pet_id,
    tipo: row.tipo,
    titulo: row.titulo,
    dataDocumento: row.data_documento,
    dataUpload: row.data_upload,
    arquivoUrl: row.arquivo_url ?? "",
    storagePath: row.storage_path ?? undefined,
    arquivoNome: row.arquivo_nome,
    arquivoTipo: row.arquivo_tipo,
    tamanhoBytes: Number(row.tamanho_bytes),
    statusAutenticacao: row.status_autenticacao,
    hashDocumento: row.hash_documento ?? undefined,
    blockchainTxId: row.blockchain_tx_id ?? undefined,
    blockchainNetwork: row.blockchain_network ?? undefined,
    verificadoPor: row.verificado_por ?? undefined,
    notas: row.notas ?? undefined,
  };
}

// ── Estado interno do sync ───────────────────────────────────

let hidratando = false;
let unsubscribe: (() => void) | null = null;
let timerDebounce: ReturnType<typeof setTimeout> | null = null;

// ── Carregar do Supabase pra hidratação inicial ──────────────

export async function loadFromSupabase(
  userId: string,
  supabase: SupabaseClient,
): Promise<{ vazio: boolean }> {
  hidratando = true;
  try {
    const [{ data: pets }, { data: planos }, { data: pvps }, { data: docs }] = await Promise.all([
      supabase.from("pets").select("*").eq("owner_id", userId),
      supabase.from("planos_viagem").select("*").eq("owner_id", userId),
      supabase.from("planos_viagem_pets").select("*").eq("owner_id", userId),
      supabase.from("documentos_sanitarios").select("*").eq("owner_id", userId),
    ]);

    const vazio =
      (pets?.length ?? 0) === 0 &&
      (planos?.length ?? 0) === 0 &&
      (pvps?.length ?? 0) === 0 &&
      (docs?.length ?? 0) === 0;

    useAppStore.setState({
      pets: (pets ?? []).map((r) => rowToPet(r as PetRow)),
      planosViagem: (planos ?? []).map((r) => rowToPlano(r as PlanoRow)),
      planosViagemPets: (pvps ?? []).map((r) => rowToPlanoViagemPet(r as PlanoViagemPetRow)),
      documentos: (docs ?? []).map((r) => rowToDoc(r as DocRow)),
    });

    return { vazio };
  } finally {
    hidratando = false;
  }
}

// ── First-time migration: localStorage → Supabase ────────────

export async function migrateLocalToSupabase(
  userId: string,
  supabase: SupabaseClient,
): Promise<void> {
  hidratando = true;
  try {
    const { pets, planosViagem, planosViagemPets, documentos } = useAppStore.getState();

    if (pets.length > 0) {
      await supabase.from("pets").upsert(pets.map((p) => petToRow(p, userId)));
    }
    if (planosViagem.length > 0) {
      await supabase.from("planos_viagem").upsert(planosViagem.map((p) => planoToRow(p, userId)));
    }
    // PlanoViagemPet vai depois de planos_viagem (FK) e antes de documentos
    if (planosViagemPets.length > 0) {
      await supabase
        .from("planos_viagem_pets")
        .upsert(planosViagemPets.map((pvp) => planoViagemPetToRow(pvp, userId)));
    }
    if (documentos.length > 0) {
      await supabase.from("documentos_sanitarios").upsert(documentos.map((d) => docToRow(d, userId)));
    }

    // Normaliza responsavelId nos pets locais para o user real (pode estar como "local-user")
    if (pets.some((p) => p.responsavelId !== userId)) {
      useAppStore.setState({
        pets: pets.map((p) => ({ ...p, responsavelId: userId })),
      });
    }
  } finally {
    hidratando = false;
  }
}

// ── Subscribe diferencial com debounce ───────────────────────

interface Snapshot {
  pets: Map<string, Pet>;
  planos: Map<string, PlanoViagem>;
  pvps: Map<string, PlanoViagemPet>;
  docs: Map<string, DocumentoSanitario>;
}

function snapshot(): Snapshot {
  const s = useAppStore.getState();
  return {
    pets: new Map(s.pets.map((p) => [p.id, p])),
    planos: new Map(s.planosViagem.map((p) => [p.id, p])),
    pvps: new Map(s.planosViagemPets.map((pv) => [pv.id, pv])),
    docs: new Map(s.documentos.map((d) => [d.id, d])),
  };
}

function diff<T extends { id: string }>(prev: Map<string, T>, next: Map<string, T>) {
  const upserts: T[] = [];
  const deletes: string[] = [];
  for (const [id, item] of next) {
    const old = prev.get(id);
    if (!old || JSON.stringify(old) !== JSON.stringify(item)) upserts.push(item);
  }
  for (const id of prev.keys()) if (!next.has(id)) deletes.push(id);
  return { upserts, deletes };
}

export function startSync(userId: string, supabase: SupabaseClient): () => void {
  let prev = snapshot();

  unsubscribe = useAppStore.subscribe((state) => {
    if (hidratando) {
      prev = snapshot();
      return;
    }
    if (timerDebounce) clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => void flush(state), 500);
  });

  async function flush(state: ReturnType<typeof useAppStore.getState>) {
    const next: Snapshot = {
      pets: new Map(state.pets.map((p) => [p.id, p])),
      planos: new Map(state.planosViagem.map((p) => [p.id, p])),
      pvps: new Map(state.planosViagemPets.map((pv) => [pv.id, pv])),
      docs: new Map(state.documentos.map((d) => [d.id, d])),
    };

    const dPets = diff(prev.pets, next.pets);
    const dPlanos = diff(prev.planos, next.planos);
    const dPvps = diff(prev.pvps, next.pvps);
    const dDocs = diff(prev.docs, next.docs);

    const ops: PromiseLike<unknown>[] = [];
    if (dPets.upserts.length > 0) {
      ops.push(supabase.from("pets").upsert(dPets.upserts.map((p) => petToRow(p, userId))));
    }
    if (dPets.deletes.length > 0) {
      ops.push(supabase.from("pets").delete().in("id", dPets.deletes));
    }
    if (dPlanos.upserts.length > 0) {
      ops.push(supabase.from("planos_viagem").upsert(dPlanos.upserts.map((p) => planoToRow(p, userId))));
    }
    if (dPlanos.deletes.length > 0) {
      ops.push(supabase.from("planos_viagem").delete().in("id", dPlanos.deletes));
    }
    if (dPvps.upserts.length > 0) {
      ops.push(
        supabase
          .from("planos_viagem_pets")
          .upsert(dPvps.upserts.map((pv) => planoViagemPetToRow(pv, userId))),
      );
    }
    if (dPvps.deletes.length > 0) {
      ops.push(supabase.from("planos_viagem_pets").delete().in("id", dPvps.deletes));
    }
    if (dDocs.upserts.length > 0) {
      ops.push(supabase.from("documentos_sanitarios").upsert(dDocs.upserts.map((d) => docToRow(d, userId))));
    }
    if (dDocs.deletes.length > 0) {
      ops.push(supabase.from("documentos_sanitarios").delete().in("id", dDocs.deletes));
    }

    await Promise.allSettled(ops);
    prev = next;
  }

  const unsub = unsubscribe;
  return () => {
    unsub();
    if (timerDebounce) clearTimeout(timerDebounce);
    unsubscribe = null;
    timerDebounce = null;
  };
}

export function stopSync(): void {
  if (unsubscribe) unsubscribe();
  if (timerDebounce) clearTimeout(timerDebounce);
  unsubscribe = null;
  timerDebounce = null;
}
