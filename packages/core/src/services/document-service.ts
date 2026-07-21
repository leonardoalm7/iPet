/**
 * Serviço de Documentos Sanitários
 *
 * Responsável por:
 * 1. Calcular hash SHA-256 do arquivo (fingerprint imutável)
 * 2. Upload para Supabase Storage (bucket privado `documentos`)
 * 3. Emitir signed URLs on-demand quando o tutor abre o passaporte
 * 4. Preparar estrutura para registro em blockchain (feature futura)
 *
 * BLOCKCHAIN-READY:
 * Quando ativarmos Polygon, o fluxo será:
 *   hashDocumento → assinar com wallet veterinário → submeter tx → salvar blockchainTxId
 * O hash já é calculado hoje, garantindo que o documento não será alterado após registro.
 *
 * Fecha o gap P0 https://trello.com/c/IcNrke08.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { DocumentoSanitario, TipoDocumento } from "../domain/types";
import { v4 as uuidv4 } from "uuid";

const BUCKET = "documentos";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1h — gerado on-demand

// Calcula SHA-256 do arquivo no browser (Web Crypto API)
export async function calcularHashDocumento(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Sanitiza nome do arquivo pro path do Storage (sem espaços, acentos, etc)
function slugifyArquivoNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
}

// Path no bucket: {owner_id}/{pet_id}/{doc_id}-{nome-slug}
// O primeiro segmento é o owner_id — Storage RLS valida via foldername(name)[1].
function montarStoragePath(params: {
  ownerId: string;
  petId: string;
  docId: string;
  nomeArquivo: string;
}): string {
  return `${params.ownerId}/${params.petId}/${params.docId}-${slugifyArquivoNome(params.nomeArquivo)}`;
}

export interface CriarDocumentoInput {
  petId: string;
  ownerId: string;
  tipo: TipoDocumento;
  titulo: string;
  dataDocumento: string; // DD/MM/YYYY
  file: File;
  hash: string;
  supabase: SupabaseClient;
}

/**
 * Faz upload do arquivo pro bucket privado e devolve o DocumentoSanitario
 * com `storagePath` preenchido. `arquivoUrl` fica vazio — a UI pede signed
 * URL on-demand via `obterSignedUrlDocumento` quando precisa exibir.
 */
export async function criarDocumento(input: CriarDocumentoInput): Promise<DocumentoSanitario> {
  const docId = uuidv4();
  const storagePath = montarStoragePath({
    ownerId: input.ownerId,
    petId: input.petId,
    docId,
    nomeArquivo: input.file.name,
  });

  const { error } = await input.supabase.storage
    .from(BUCKET)
    .upload(storagePath, input.file, {
      contentType: input.file.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Falha ao enviar documento: ${error.message}`);
  }

  return {
    id: docId,
    petId: input.petId,
    tipo: input.tipo,
    titulo: input.titulo,
    dataDocumento: input.dataDocumento,
    dataUpload: new Date().toISOString(),
    arquivoUrl: "",
    storagePath,
    arquivoNome: input.file.name,
    arquivoTipo: input.file.type,
    tamanhoBytes: input.file.size,
    statusAutenticacao: "PENDENTE",
    hashDocumento: input.hash,
    // blockchainTxId e blockchainNetwork: undefined até ativação do Polygon
  };
}

/**
 * Retorna URL assinada (TTL curto) para o tutor abrir o documento.
 * Para documentos legados que ainda têm `arquivoUrl` (blob:URL local),
 * devolve o próprio arquivoUrl como fallback.
 */
export async function obterSignedUrlDocumento(
  doc: DocumentoSanitario,
  supabase: SupabaseClient,
): Promise<string | null> {
  if (doc.storagePath) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storagePath, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }
  // Legado: blob:URL local. Só funciona na sessão original do browser.
  return doc.arquivoUrl || null;
}

/**
 * Remove arquivo do Storage. A linha em `documentos_sanitarios` continua
 * sendo apagada via cascade pelo store/sync — esta função cuida só do blob.
 */
export async function removerArquivoDocumento(
  doc: DocumentoSanitario,
  supabase: SupabaseClient,
): Promise<void> {
  if (!doc.storagePath) return;
  await supabase.storage.from(BUCKET).remove([doc.storagePath]);
}

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  VACINA_ANTIRRABICA: "Vacina Antirrábica",
  SOROLOGIA_ANTIRRABICA: "Sorologia Antirrábica",
  ATESTADO_SAUDE: "Atestado de Saúde",
  CVI: "Certificado Veterinário Internacional (CVI)",
  MICROCHIP_REGISTRO: "Registro de Microchip",
  PERMISSAO_IMPORTACAO: "Permissão de Importação",
  OUTRO: "Outro Documento",
};

export const TIPO_DOCUMENTO_ICONES: Record<TipoDocumento, string> = {
  VACINA_ANTIRRABICA: "💉",
  SOROLOGIA_ANTIRRABICA: "🧪",
  ATESTADO_SAUDE: "🩺",
  CVI: "📋",
  MICROCHIP_REGISTRO: "📡",
  PERMISSAO_IMPORTACAO: "✈️",
  OUTRO: "📄",
};
