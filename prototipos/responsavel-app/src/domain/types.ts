// ============================================================
// iPet — Domínio Core (alinhado ao DDD modelado em docs/architecture)
// ============================================================

// ---------- Value Objects ----------

export type Especie = "CAO" | "GATO" | "OUTRO";

export type StatusSorologia = "OK" | "PENDENTE" | "REPROVADA";

export type Destino =
  // América do Sul
  | "BRASIL"
  | "ARGENTINA"
  | "CHILE"
  | "URUGUAI"
  // América Central
  | "MEXICO"
  // América do Norte
  | "EUA"
  | "CANADA"
  // Europa — países EU (herdam regras base do Reg. UE 576/2013)
  | "PORTUGAL"
  | "ESPANHA"
  | "FRANCA"
  | "ALEMANHA"
  | "ITALIA"
  | "HOLANDA"
  | "AUSTRIA"
  | "BELGICA"
  | "BULGARIA"
  | "CHIPRE"
  | "CROACIA"
  | "DINAMARCA"
  | "ESLOVAQUIA"
  | "ESLOVENIA"
  | "ESTONIA"
  | "FINLANDIA"
  | "GRECIA"
  | "HUNGRIA"
  | "IRLANDA"
  | "LETONIA"
  | "LITUANIA"
  | "LUXEMBURGO"
  | "MALTA"
  | "POLONIA"
  | "REPUBLICA_TCHECA"
  | "ROMENIA"
  | "SUECIA"
  // Europa — não-EU
  | "REINO_UNIDO"
  // Ásia
  | "JAPAO"
  // Oceania
  | "AUSTRALIA";

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
  tipoPet: TipoPet;
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
  isPremium: boolean;
  pagamentoId?: string;
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

export type TipoPet = "ESTIMACAO" | "CAO_GUIA";

export interface RegrasCompanhiaAerea {
  id: string;
  nome: string;
  codigo: string; // IATA
  pesoMaxCabine: number; // kg (animal + caixa)
  pesoMaxPorао: number;
  dimensoesMaxCabine: { comprimento: number; largura: number; altura: number }; // cm
  idadeMinimaAnimal: number; // semanas
  braquicefalicoCabine: boolean;
  braquicefalicoPorao: boolean;
  racasPerigosasBanidas: boolean;
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

// ---------- Sugestões de Destino Pet-Friendly (Travel Planner) ----------

export type RegiaoBrasil =
  | "SUL"
  | "SUDESTE"
  | "NORDESTE"
  | "CENTRO_OESTE"
  | "NORTE";

export type TipoViagem =
  | "PRAIA"
  | "SERRA"
  | "CIDADE"
  | "CAMPO"
  | "AVENTURA"
  | "CULTURAL";

export interface SugestaoDestino {
  id: string;
  nome: string;               // ex: "Gramado, RS"
  pais: string;               // ex: "Brasil"
  bandeira: string;
  tiposViagem: TipoViagem[];
  descricaoCurta: string;     // 1 linha para o card
  descricaoCompleta: string;  // parágrafo para a página de detalhes
  dicas: string[];            // lista de dicas pet-friendly
  melhorEpoca?: string;
  imagemEmoji: string;        // emoji representativo
  destacado: boolean;         // aparece em destaque na home
  destinoCompliance?: Destino; // link com o motor de compliance se internacional
}

// ---------- Hotéis Pet-Friendly (Accommodation) ----------

export type TipoHotelPet =
  | "PETHOTEL"      // hotel exclusivo para pets (dono deixa o pet)
  | "PETFRIENDLY"   // hotel que aceita pets junto com o dono
  | "PETHOTEL_DAY"  // creche / day care para pets
  | "PETHOTEL_VET"; // hotel com suporte veterinário

export interface HotelPet {
  id: string;
  nome: string;
  tipo: TipoHotelPet;
  cidade: string;
  estado?: string;
  pais: string;
  bandeira: string;
  descricaoCurta: string;
  servicos: string[];         // ex: ["Passeio diário", "Câmeras 24h", "Vet on call"]
  especiesAceitas: Especie[];
  pesoMaxKg?: number;         // null = sem limite
  precoApartir?: string;      // ex: "R$ 80/dia"
  avaliacao?: number;         // 0-5
  telefone?: string;
  site?: string;
  imagemEmoji: string;
  verificado: boolean;        // parceiro verificado pelo iPet
}

// ---------- Autenticação e Perfil do Usuário (KYC) ----------

export type ProvedorAuth = "EMAIL" | "GOOGLE" | "APPLE";

/**
 * Perfil do responsável — dados pessoais coletados no onboarding.
 * Base legal LGPD: execução de contrato (Art. 7º, V) para CPF;
 * consentimento (Art. 7º, I) para marketing.
 */
export interface PerfilUsuario {
  id: string;                     // UUID — mesmo ID do auth.users (Supabase)
  nomeCompleto: string;
  email: string;
  telefone?: string;              // formato E.164: +55 11 99999-9999
  dataNascimento?: string;        // ISO date: YYYY-MM-DD
  fotoPerfil?: string;            // URL (Supabase Storage)
  cpfHash?: string;               // SHA-256 do CPF — nunca em texto claro
  onboardingCompleto: boolean;
  provedorAuth: ProvedorAuth;
  criadoEm: string;               // ISO timestamp
  atualizadoEm: string;
}

// ---------- LGPD — Gestão de Consentimento ----------

export type TipoConsentimento = "TERMOS" | "PRIVACIDADE" | "MARKETING";

/**
 * Registro imutável de consentimento — nunca deletado, apenas adicionado.
 * Exigido pelo Art. 8º §5º da LGPD para prova de consentimento.
 */
export interface ConsentimentoLGPD {
  id: string;
  userId: string;
  tipo: TipoConsentimento;
  versao: string;                 // ex: "1.0.0" — versão do documento
  aceito: boolean;                // false = revogação
  dataDecisao: string;            // ISO timestamp
  ipHash?: string;                // SHA-256 do IP — anonimizado
  userAgentHash?: string;         // SHA-256 do user agent — anonimizado
}

export type TipoSolicitacaoLGPD =
  | "EXPORTACAO"       // Art. 18, II — direito de acesso
  | "EXCLUSAO"         // Art. 18, VI — direito de eliminação
  | "RETIFICACAO"      // Art. 18, III — direito de correção
  | "PORTABILIDADE"    // Art. 18, V — portabilidade de dados
  | "REVOGACAO_CONSENTIMENTO"; // Art. 8º §5º — revogação

export type StatusSolicitacaoLGPD =
  | "PENDENTE"
  | "EM_PROCESSAMENTO"
  | "CONCLUIDA"
  | "CANCELADA";

export interface SolicitacaoLGPD {
  id: string;
  userId: string;
  tipo: TipoSolicitacaoLGPD;
  status: StatusSolicitacaoLGPD;
  observacoes?: string;
  criadoEm: string;
  processadoEm?: string;
}

// ---------- Estado do App ----------

export interface Responsavel {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}
