/**
 * Serviço de Documentos Sanitários
 *
 * Responsável por:
 * 1. Calcular hash SHA-256 do arquivo (fingerprint imutável)
 * 2. Armazenar metadados + URL do arquivo
 * 3. Preparar estrutura para registro em blockchain (feature futura)
 *
 * BLOCKCHAIN-READY:
 * Quando ativarmos Polygon, o fluxo será:
 *   hashDocumento → assinar com wallet veterinário → submeter tx → salvar blockchainTxId
 * O hash já é calculado hoje, garantindo que o documento não será alterado após registro.
 */

import { DocumentoSanitario, TipoDocumento } from "@/domain/types";
import { v4 as uuidv4 } from "uuid";

// Calcula SHA-256 do arquivo no browser (Web Crypto API)
export async function calcularHashDocumento(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Converte arquivo para URL base64 para armazenamento local (MVP)
// No produto final: upload para S3/GCS e retorna a URL remota
export function criarUrlLocalDocumento(file: File): string {
  return URL.createObjectURL(file);
}

export interface CriarDocumentoInput {
  petId: string;
  tipo: TipoDocumento;
  titulo: string;
  dataDocumento: string; // DD/MM/YYYY
  file: File;
  hash: string;
}

export function criarDocumento(input: CriarDocumentoInput): DocumentoSanitario {
  return {
    id: uuidv4(),
    petId: input.petId,
    tipo: input.tipo,
    titulo: input.titulo,
    dataDocumento: input.dataDocumento,
    dataUpload: new Date().toISOString(),
    arquivoUrl: criarUrlLocalDocumento(input.file),
    arquivoNome: input.file.name,
    arquivoTipo: input.file.type,
    tamanhoBytes: input.file.size,
    statusAutenticacao: "PENDENTE",
    hashDocumento: input.hash,
    // blockchainTxId e blockchainNetwork: undefined até ativação do Polygon
  };
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
