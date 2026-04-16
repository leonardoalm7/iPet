// ============================================================
// iPet — Domínio Core (alinhado ao DDD modelado em docs/architecture)
// ============================================================

// ---------- Value Objects ----------

export type Especie = "CAO" | "GATO" | "OUTRO";

export type StatusSorologia = "OK" | "PENDENTE" | "REPROVADA";

export type Destino = "BRASIL" | "UNIAO_EUROPEIA" | "JAPAO" | "EUA";

export type StatusCompliance =
  | "APTO"
  | "PENDENTE"
  | "URGENTE"
  | "CRITICO"
  | "INAPTO";

export type StatusTarefa =
  | "CONCLUIDA"
  | "PENDENTE"
  | "URGENTE"   // <= 7 dias para o prazo
  | "CRITICO"   // <= 2 dias ou prazo já passou mas ainda há tempo
  | "VENCIDA"   // prazo passou e viagem impossível neste prazo
  | "BLOQUEADA" // depende de outra tarefa pendente
  | "NAO_APLICAVEL";

// ---------- Entidades ----------

export interface RegistroVacina {
  data: string; // DD/MM/YYYY
  valida: boolean;
  nomeComercial?: string;
  lote?: string;
  veterinario?: string;
}

export interface RegistroSorologia {
  data: string; // DD/MM/YYYY
  valor: string; // ex: "1.0 UI/mL"
  status: StatusSorologia;
  laboratorio?: string;
}

export interface Pet {
  id: string;
  nome: string;
  especie: Especie;
  raca: string;
  dataNascimento: string; // DD/MM/YYYY
  peso: number; // kg
  microchip?: string; // 15 dígitos ISO 11784/11785
  foto?: string;
  // Saúde
  vacina?: RegistroVacina;
  sorologia?: RegistroSorologia;
  // Metadata
  responsavelId: string;
  criadoEm: string; // ISO
}

export interface PlanoViagem {
  id: string;
  petId: string;
  destino: Destino;
  dataEmbarque: string; // DD/MM/YYYY
  companhiaAereaId?: string;
  criadoEm: string;
}

// ---------- Roadmap de Compliance ----------

export interface TarefaRoadmap {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusTarefa;
  prazo: string | null; // DD/MM/YYYY
  diasParaPrazo: number | null;
  nota: string | null;
  precisaClinica: boolean;
  bloqueadaPor: string[]; // IDs de tarefas que devem ser concluídas antes
  concluida: boolean;
}

export interface RoadmapCompliance {
  petId: string;
  planoViagemId: string;
  destino: Destino;
  dataEmbarque: string;
  statusGeral: StatusCompliance;
  dataLiberacao: string | null; // data mais cedo que o pet pode viajar
  tarefas: TarefaRoadmap[];
  geradoEm: string;
}

// ---------- Companhias Aéreas ----------

export interface RegrasCompanhiaAerea {
  id: string;
  nome: string;
  codigo: string; // IATA
  pesoMaxCabine: number; // kg (animal + caixa)
  pesoMaxPorао: number;
  dimensoesMaxCabine: { comprimento: number; largura: number; altura: number }; // cm
  idadeMinimaAnimal: number; // semanas
  racasBraquisefálicasPermitidas: boolean;
  anotacoes: string;
}

// ---------- Regras por Destino ----------

export interface RegrasDestino {
  destino: Destino;
  nome: string;
  bandeira: string;
  exigeMicrochip: boolean;
  exigeVacina: boolean;
  diasCarenciaVacina: number;
  exigeSorologia: boolean;
  diasCarenciaSorologia: number;
  exigeCVI: boolean; // Certificado Veterinário Internacional
  diasAntesCVI: number; // emitir X dias antes do embarque
  exigePermissaoImportacao: boolean;
  observacoes: string;
}

// ---------- Documentos Sanitários ----------

export type TipoDocumento =
  | "VACINA_ANTIRRABICA"
  | "SOROLOGIA_ANTIRRABICA"
  | "ATESTADO_SAUDE"
  | "CVI" // Certificado Veterinário Internacional
  | "MICROCHIP_REGISTRO"
  | "PERMISSAO_IMPORTACAO"
  | "OUTRO";

export type StatusAutenticacao =
  | "PENDENTE"       // aguardando análise
  | "VERIFICADO"     // verificado manualmente pela plataforma
  | "BLOCKCHAIN"     // registrado em blockchain (feature futura)
  | "REJEITADO";     // documento inválido ou inelegível

export interface DocumentoSanitario {
  id: string;
  petId: string;
  tipo: TipoDocumento;
  titulo: string;
  dataDocumento: string;     // DD/MM/YYYY (data constante no documento)
  dataUpload: string;        // ISO — quando foi enviado
  arquivoUrl: string;        // URL do arquivo (local blob ou S3 futuramente)
  arquivoNome: string;
  arquivoTipo: string;       // MIME type
  tamanhoBytes: number;
  // Autenticação
  statusAutenticacao: StatusAutenticacao;
  hashDocumento?: string;    // SHA-256 do arquivo — calculado no cliente
  blockchainTxId?: string;   // ID da transação Polygon (feature futura)
  blockchainNetwork?: string; // ex: "polygon-mainnet"
  verificadoPor?: string;    // ID do veterinário ou da plataforma
  notas?: string;
}

// ---------- Passaporte Pet (view principal do produto) ----------

export interface PassaportePet {
  pet: Pet;
  documentos: DocumentoSanitario[];
  ultimaAtualizacao: string; // ISO
  // Compliance por destino (calculado em tempo real)
  complianceResumido?: {
    destino: Destino;
    statusGeral: StatusCompliance;
    dataLiberacao: string | null;
  }[];
}

// ---------- Estado do App ----------

export interface Responsavel {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}
